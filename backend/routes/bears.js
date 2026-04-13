const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, param, validationResult } = require('express-validator');
const { getPool, sql } = require('../db');

// POST /bears - Save a new bear configuration
router.post(
  '/',
  [
    body('name').optional().isLength({ max: 100 }).trim(),
    body('bearType').notEmpty().withMessage('Bear type is required'),
    body('bearColor').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('config').isObject().withMessage('Config must be an object'),
    body('totalPrice').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name = 'My Bear', bearType, bearColor, config, audioFile, imageFile, totalPrice } = req.body;
      const id = uuidv4();
      const pool = await getPool();

      await pool.request()
        .input('id', sql.VarChar(36), id)
        .input('name', sql.NVarChar(100), name)
        .input('bear_type', sql.NVarChar(50), bearType)
        .input('bear_color', sql.NVarChar(20), bearColor)
        .input('config', sql.NVarChar(sql.MAX), JSON.stringify(config))
        .input('audio_file', sql.NVarChar(500), audioFile || null)
        .input('image_file', sql.NVarChar(500), imageFile || null)
        .input('total_price', sql.Decimal(10, 2), totalPrice)
        .query(`
          INSERT INTO Bears (id, name, bear_type, bear_color, config, audio_file, image_file, total_price)
          VALUES (@id, @name, @bear_type, @bear_color, @config, @audio_file, @image_file, @total_price)
        `);

      res.status(201).json({
        success: true,
        bear: { id, name, bearType, bearColor, config, audioFile, imageFile, totalPrice },
      });
    } catch (err) {
      console.error('Error saving bear:', err);
      res.status(500).json({ error: 'Failed to save bear configuration' });
    }
  }
);

// GET /bears - List all saved bears
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, name, bear_type, bear_color, audio_file, image_file, total_price, created_at
      FROM Bears
      ORDER BY created_at DESC
    `);

    res.json({ bears: result.recordset });
  } catch (err) {
    console.error('Error fetching bears:', err);
    res.status(500).json({ error: 'Failed to fetch bears' });
  }
});

// GET /bears/:id - Load a specific bear configuration
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid bear ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.VarChar(36), req.params.id)
        .query('SELECT * FROM Bears WHERE id = @id');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Bear not found' });
      }

      const bear = result.recordset[0];
      bear.config = JSON.parse(bear.config);

      res.json({ bear });
    } catch (err) {
      console.error('Error fetching bear:', err);
      res.status(500).json({ error: 'Failed to fetch bear configuration' });
    }
  }
);

// PUT /bears/:id - Update a bear configuration
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid bear ID'),
    body('config').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, bearType, bearColor, config, audioFile, imageFile, totalPrice } = req.body;
      const pool = await getPool();

      await pool.request()
        .input('id', sql.VarChar(36), req.params.id)
        .input('name', sql.NVarChar(100), name)
        .input('bear_type', sql.NVarChar(50), bearType)
        .input('bear_color', sql.NVarChar(20), bearColor)
        .input('config', sql.NVarChar(sql.MAX), JSON.stringify(config))
        .input('audio_file', sql.NVarChar(500), audioFile || null)
        .input('image_file', sql.NVarChar(500), imageFile || null)
        .input('total_price', sql.Decimal(10, 2), totalPrice)
        .query(`
          UPDATE Bears SET
            name = @name,
            bear_type = @bear_type,
            bear_color = @bear_color,
            config = @config,
            audio_file = @audio_file,
            image_file = @image_file,
            total_price = @total_price,
            updated_at = GETDATE()
          WHERE id = @id
        `);

      res.json({ success: true, message: 'Bear updated successfully' });
    } catch (err) {
      console.error('Error updating bear:', err);
      res.status(500).json({ error: 'Failed to update bear' });
    }
  }
);

// DELETE /bears/:id
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid bear ID')],
  async (req, res) => {
    try {
      const pool = await getPool();
      await pool.request()
        .input('id', sql.VarChar(36), req.params.id)
        .query('DELETE FROM Bears WHERE id = @id');

      res.json({ success: true, message: 'Bear deleted' });
    } catch (err) {
      console.error('Error deleting bear:', err);
      res.status(500).json({ error: 'Failed to delete bear' });
    }
  }
);

// POST /bears/:id/cart - Add bear to cart
router.post('/:id/cart', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const pool = await getPool();
    const cartId = uuidv4();

    await pool.request()
      .input('id', sql.VarChar(36), cartId)
      .input('bear_id', sql.VarChar(36), req.params.id)
      .input('quantity', sql.Int, quantity)
      .query('INSERT INTO CartItems (id, bear_id, quantity) VALUES (@id, @bear_id, @quantity)');

    res.status(201).json({ success: true, cartItemId: cartId });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// GET /bears/cart/all - Get cart
router.get('/cart/all', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT ci.id as cart_id, ci.quantity, ci.added_at,
             b.id as bear_id, b.name, b.bear_type, b.bear_color,
             b.image_file, b.audio_file, b.total_price, b.config
      FROM CartItems ci
      JOIN Bears b ON ci.bear_id = b.id
      ORDER BY ci.added_at DESC
    `);

    const items = result.recordset.map(r => ({ ...r, config: JSON.parse(r.config) }));
    const total = items.reduce((sum, item) => sum + (item.total_price * item.quantity), 0);

    res.json({ items, total });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

module.exports = router;
