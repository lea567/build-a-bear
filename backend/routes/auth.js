const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getPool, sql } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'bearcreator-secret-2025';

// ─── Middleware: verify JWT token ─────────────────────────────────────────────
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Middleware: admin only ───────────────────────────────────────────────────
function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password, name, phone, address } = req.body;
      const pool = await getPool();

      // Check if email already exists
      const existing = await pool.request()
        .input('email', sql.NVarChar(200), email)
        .query('SELECT id FROM Users WHERE email = @email');

      if (existing.recordset.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      // Insert user
      const id = require('uuid').v4();
      await pool.request()
        .input('id', sql.VarChar(36), id)
        .input('email', sql.NVarChar(200), email)
        .input('password', sql.NVarChar(500), hashed)
        .input('name', sql.NVarChar(100), name || null)
        .input('phone', sql.NVarChar(30), phone || null)
        .input('address', sql.NVarChar(500), address || null)
        .input('role', sql.NVarChar(10), 'user')
        .input('is_admin', sql.Bit, 0)
        .query(`
          INSERT INTO Users (id, email, password, name, phone, address, role, is_admin)
          VALUES (@id, @email, @password, @name, @phone, @address, @role, @is_admin)
        `);

      // Sign token
      const token = jwt.sign(
        { id, email, name, role: 'user', isAdmin: false },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: { id, email, name, role: 'user', isAdmin: false },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const pool = await getPool();

      const result = await pool.request()
        .input('email', sql.NVarChar(200), email)
        .query('SELECT * FROM Users WHERE email = @email');

      if (result.recordset.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.recordset[0];

      // Check password — handle demo placeholder hashes
      let valid = false;
      if (user.password.startsWith('$2b$')) {
        valid = await bcrypt.compare(password, user.password);
      } else {
        // Demo accounts — direct compare until re-registered
        valid = password === 'admin123' || password === 'password123';
      }

      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, isAdmin: !!user.is_admin },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: !!user.is_admin,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// ─── GET /auth/me — verify token & return user ───────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.VarChar(36), req.user.id)
      .query('SELECT id, email, name, phone, address, role, is_admin, created_at FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.recordset[0];
    res.json({ user: { ...user, isAdmin: !!user.is_admin } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── GET /auth/users — admin only ────────────────────────────────────────────
router.get('/users', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id, email, name, phone, role, is_admin, created_at FROM Users ORDER BY created_at DESC');
    res.json({ users: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── DELETE /auth/users/:id — admin only ─────────────────────────────────────
router.delete('/users/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.VarChar(36), req.params.id)
      .query('DELETE FROM Users WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.adminOnly = adminOnly;
