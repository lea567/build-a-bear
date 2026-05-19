const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'BearCreatorDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool = null;

async function getPool() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

async function initializeDatabase() {
  const p = await getPool();

  // Bears table
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bears' AND xtype='U')
    CREATE TABLE Bears (
      id VARCHAR(36) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL DEFAULT 'My Bear',
      bear_type NVARCHAR(50) NOT NULL DEFAULT 'classic',
      bear_color NVARCHAR(20) NOT NULL DEFAULT '#C4956A',
      config NVARCHAR(MAX) NOT NULL,
      audio_file NVARCHAR(500) NULL,
      image_file NVARCHAR(500) NULL,
      total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  // CartItems table
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CartItems' AND xtype='U')
    CREATE TABLE CartItems (
      id VARCHAR(36) PRIMARY KEY,
      bear_id VARCHAR(36) FOREIGN KEY REFERENCES Bears(id) ON DELETE CASCADE,
      quantity INT NOT NULL DEFAULT 1,
      added_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  // Orders table — full order lifecycle
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
    CREATE TABLE Orders (
      id VARCHAR(36) PRIMARY KEY,
      order_number NVARCHAR(20) NOT NULL,
      customer_name NVARCHAR(200) NOT NULL,
      customer_email NVARCHAR(200) NOT NULL,
      customer_phone NVARCHAR(50) NULL,
      shipping_address NVARCHAR(500) NOT NULL,
      shipping_city NVARCHAR(100) NOT NULL,
      shipping_zip NVARCHAR(20) NOT NULL,
      shipping_country NVARCHAR(100) NOT NULL DEFAULT 'Lebanon',
      shipping_method NVARCHAR(50) NOT NULL DEFAULT 'standard',
      shipping_price DECIMAL(10,2) NOT NULL DEFAULT 4.99,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
      discount DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      promo_code NVARCHAR(50) NULL,
      gift_message NVARCHAR(500) NULL,
      status NVARCHAR(50) NOT NULL DEFAULT 'pending',
      admin_note NVARCHAR(1000) NULL,
      tracking_number NVARCHAR(200) NULL,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  // OrderItems — each bear in an order
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
    CREATE TABLE OrderItems (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES Orders(id) ON DELETE CASCADE,
      item_type NVARCHAR(20) NOT NULL DEFAULT 'custom',
      bear_id VARCHAR(36) NULL FOREIGN KEY REFERENCES Bears(id),
      item_name NVARCHAR(200) NOT NULL,
      item_image NVARCHAR(500) NULL,
      item_config NVARCHAR(MAX) NULL,
      audio_file NVARCHAR(500) NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  console.log('✅ Database initialized successfully');
}

module.exports = { getPool, initializeDatabase, sql };
