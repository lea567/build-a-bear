const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getPool, sql } = require('../db');

// Generate readable order number
function generateOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `BAB-${yy}${mm}-${rand}`;
}

// POST /orders — Place a new order
router.post('/', async (req, res) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity, shippingZip, shippingCountry = 'Lebanon',
      shippingMethod = 'standard', shippingPrice = 4.99,
      subtotal, discount = 0, total, promoCode, giftMessage,
      items // array of { itemType, bearId, itemName, itemImage, itemConfig, audioFile, quantity, unitPrice }
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !items?.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const pool = await getPool();
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    // Insert order
    await pool.request()
      .input('id', sql.VarChar(36), orderId)
      .input('order_number', sql.NVarChar(20), orderNumber)
      .input('customer_name', sql.NVarChar(200), customerName)
      .input('customer_email', sql.NVarChar(200), customerEmail)
      .input('customer_phone', sql.NVarChar(50), customerPhone || null)
      .input('shipping_address', sql.NVarChar(500), shippingAddress)
      .input('shipping_city', sql.NVarChar(100), shippingCity)
      .input('shipping_zip', sql.NVarChar(20), shippingZip)
      .input('shipping_country', sql.NVarChar(100), shippingCountry)
      .input('shipping_method', sql.NVarChar(50), shippingMethod)
      .input('shipping_price', sql.Decimal(10, 2), shippingPrice)
      .input('subtotal', sql.Decimal(10, 2), subtotal)
      .input('discount', sql.Decimal(10, 2), discount)
      .input('total', sql.Decimal(10, 2), total)
      .input('promo_code', sql.NVarChar(50), promoCode || null)
      .input('gift_message', sql.NVarChar(500), giftMessage || null)
      .input('status', sql.NVarChar(50), 'pending')
      .query(`
        INSERT INTO Orders (
          id, order_number, customer_name, customer_email, customer_phone,
          shipping_address, shipping_city, shipping_zip, shipping_country,
          shipping_method, shipping_price, subtotal, discount, total,
          promo_code, gift_message, status
        ) VALUES (
          @id, @order_number, @customer_name, @customer_email, @customer_phone,
          @shipping_address, @shipping_city, @shipping_zip, @shipping_country,
          @shipping_method, @shipping_price, @subtotal, @discount, @total,
          @promo_code, @gift_message, @status
        )
      `);

    // Insert order items
    for (const item of items) {
      const itemId = uuidv4();
      await pool.request()
        .input('id', sql.VarChar(36), itemId)
        .input('order_id', sql.VarChar(36), orderId)
        .input('item_type', sql.NVarChar(20), item.itemType || 'custom')
        .input('bear_id', sql.VarChar(36), item.bearId || null)
        .input('item_name', sql.NVarChar(200), item.itemName)
        .input('item_image', sql.NVarChar(500), item.itemImage || null)
        .input('item_config', sql.NVarChar(sql.MAX), item.itemConfig ? JSON.stringify(item.itemConfig) : null)
        .input('audio_file', sql.NVarChar(500), item.audioFile || null)
        .input('quantity', sql.Int, item.quantity || 1)
        .input('unit_price', sql.Decimal(10, 2), item.unitPrice)
        .query(`
          INSERT INTO OrderItems (id, order_id, item_type, bear_id, item_name, item_image, item_config, audio_file, quantity, unit_price)
          VALUES (@id, @order_id, @item_type, @bear_id, @item_name, @item_image, @item_config, @audio_file, @quantity, @unit_price)
        `);
    }

    res.status(201).json({ success: true, orderId, orderNumber });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /orders — Admin: all orders with items
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { status, search } = req.query;

    let whereClause = '1=1';
    if (status && status !== 'all') whereClause += ` AND o.status = '${status}'`;
    if (search) whereClause += ` AND (o.customer_name LIKE '%${search}%' OR o.order_number LIKE '%${search}%' OR o.customer_email LIKE '%${search}%')`;

    const result = await pool.request().query(`
      SELECT o.*,
        (SELECT COUNT(*) FROM OrderItems oi WHERE oi.order_id = o.id) as item_count,
        (SELECT STRING_AGG(oi.item_name, ', ') FROM OrderItems oi WHERE oi.order_id = o.id) as item_names,
        (SELECT TOP 1 oi.audio_file FROM OrderItems oi WHERE oi.order_id = o.id AND oi.audio_file IS NOT NULL) as has_audio
      FROM Orders o
      WHERE ${whereClause}
      ORDER BY o.created_at DESC
    `);

    res.json({ orders: result.recordset });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/stats — Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const pool = await getPool();

    const stats = await pool.request().query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        ISNULL(SUM(total), 0) as total_revenue,
        ISNULL(SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN total ELSE 0 END), 0) as today_revenue,
        SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as today_orders
      FROM Orders
    `);

    const audioStats = await pool.request().query(`
      SELECT COUNT(DISTINCT order_id) as orders_with_voice
      FROM OrderItems WHERE audio_file IS NOT NULL
    `);

    res.json({
      ...stats.recordset[0],
      orders_with_voice: audioStats.recordset[0].orders_with_voice
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /orders/:id — Single order with all items
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const orderResult = await pool.request()
      .input('id', sql.VarChar(36), req.params.id)
      .query('SELECT * FROM Orders WHERE id = @id');

    if (!orderResult.recordset.length) return res.status(404).json({ error: 'Order not found' });

    const itemsResult = await pool.request()
      .input('order_id', sql.VarChar(36), req.params.id)
      .query('SELECT * FROM OrderItems WHERE order_id = @order_id ORDER BY created_at ASC');

    const items = itemsResult.recordset.map(i => ({
      ...i,
      item_config: i.item_config ? JSON.parse(i.item_config) : null
    }));

    res.json({ order: orderResult.recordset[0], items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /orders/:id/status — Admin: update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNote, trackingNumber } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const pool = await getPool();
    await pool.request()
      .input('id', sql.VarChar(36), req.params.id)
      .input('status', sql.NVarChar(50), status)
      .input('admin_note', sql.NVarChar(1000), adminNote || null)
      .input('tracking_number', sql.NVarChar(200), trackingNumber || null)
      .query(`
        UPDATE Orders SET
          status = @status,
          admin_note = COALESCE(@admin_note, admin_note),
          tracking_number = COALESCE(@tracking_number, tracking_number),
          updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /orders/:id — Admin: cancel/delete order
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.VarChar(36), req.params.id)
      .query('DELETE FROM Orders WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
