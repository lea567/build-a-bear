require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/bears', require('./routes/bears'));
app.use('/upload', require('./routes/upload'));
app.use('/auth', require('./routes/auth'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => console.log(`🐻 BearCreator API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err.message);
    app.listen(PORT, () => console.log(`🐻 BearCreator API running on http://localhost:${PORT} (no DB)`));
  }
}
start();
