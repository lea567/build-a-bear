const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getPool, sql } = require('../db');

function generateOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `BAB-${yy}${mm}-${rand}`;
}

// POST /orders — Place a new order
// Maps to your existing Orders table columns
router.post('/', async (req, res) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity, shippingZip, shippingCountry = 'Lebanon',
      shippingMethod = 'standard', shippingPrice = 4.99,
      subtotal, discount = 0, total, promoCode,
      items = []
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const pool = await getPool();
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    // Extract bear_id and voice from items
    const firstItem = items[0] || {};
    const customItems = items.filter(i => i.itemType !== 'ready-made');
    const mainBearId = customItems[0]?.bearId || firstItem?.bearId || null;
    const voiceItem = items.find(i => i.audioFile);
    const voiceUrl = voiceItem?.audioFile || null;

    // Use your actual column names from the DB screenshot
    await pool.request()
      .input('id',               sql.VarChar(36),     orderId)
      .input('order_number',     sql.NVarChar(50),    orderNumber)
      .input('customer_name',    sql.NVarChar(200),   customerName)
      .input('customer_email',   sql.NVarChar(200),   customerEmail)
      .input('customer_phone',   sql.NVarChar(50),    customerPhone || null)
      .input('shipping_address', sql.NVarChar(500),   shippingAddress)
      .input('shipping_addr',    sql.NVarChar(500),   shippingAddress)
      .input('shipping_city',    sql.NVarChar(100),   shippingCity   || '')
      .input('shipping_zip',     sql.NVarChar(20),    shippingZip    || null)
      .input('shipping_country', sql.NVarChar(100),   shippingCountry)
      .input('shipping_method',  sql.NVarChar(50),    shippingMethod)
      .input('shipping_price',   sql.Decimal(10,2),   parseFloat(shippingPrice)  || 4.99)
      .input('subtotal',         sql.Decimal(10,2),   parseFloat(subtotal)       || 0)
      .input('discount',         sql.Decimal(10,2),   parseFloat(discount)       || 0)
      .input('total',            sql.Decimal(10,2),   parseFloat(total)          || 0)
      .input('total_amount',     sql.Decimal(10,2),   parseFloat(total)          || 0)
      .input('price',            sql.Decimal(10,2),   parseFloat(total)          || 0)
      .input('promo_code',       sql.NVarChar(50),    promoCode || null)
      .input('voice_url',        sql.NVarChar(500),   voiceUrl)
      .input('bear_id',          sql.VarChar(36),     mainBearId)
      .input('status',           sql.NVarChar(50),    'pending')
      .query(`
        INSERT INTO Orders (
          id, order_number, customer_name, customer_email, customer_phone,
          shipping_address, shipping_addr, shipping_city, shipping_zip, shipping_country,
          shipping_method, shipping_price, subtotal, discount, total, total_amount, price,
          promo_code, voice_url, bear_id, status
        ) VALUES (
          @id, @order_number, @customer_name, @customer_email, @customer_phone,
          @shipping_address, @shipping_addr, @shipping_city, @shipping_zip, @shipping_country,
          @shipping_method, @shipping_price, @subtotal, @discount, @total, @total_amount, @price,
          @promo_code, @voice_url, @bear_id, @status
        )
      `);

    // Insert order items into OrderItems if table exists
    try {
      const tableCheck = await pool.request().query(
        `SELECT 1 FROM sysobjects WHERE name='OrderItems' AND xtype='U'`
      );

      if (tableCheck.recordset.length > 0) {
        for (const item of items) {
          const itemId = uuidv4();
          await pool.request()
            .input('id',          sql.VarChar(36),      itemId)
            .input('order_id',    sql.VarChar(36),      orderId)
            .input('item_type',   sql.NVarChar(20),     item.itemType  || 'custom')
            .input('bear_id',     sql.VarChar(36),      item.bearId    || null)
            .input('item_name',   sql.NVarChar(200),    item.itemName  || 'Bear')
            .input('item_image',  sql.NVarChar(500),    item.itemImage || null)
            .input('item_config', sql.NVarChar(sql.MAX),item.itemConfig ? JSON.stringify(item.itemConfig) : null)
            .input('audio_file',  sql.NVarChar(500),    item.audioFile || null)
            .input('quantity',    sql.Int,              item.quantity  || 1)
            .input('unit_price',  sql.Decimal(10,2),    parseFloat(item.unitPrice) || 0)
            .query(`
              INSERT INTO OrderItems
                (id, order_id, item_type, bear_id, item_name, item_image, item_config, audio_file, quantity, unit_price)
              VALUES
                (@id, @order_id, @item_type, @bear_id, @item_name, @item_image, @item_config, @audio_file, @quantity, @unit_price)
            `);
        }
      }
    } catch (itemErr) {
      // OrderItems table might not exist — order still succeeds
      console.warn('OrderItems insert skipped:', itemErr.message);
    }

    res.status(201).json({ success: true, orderId, orderNumber });

  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
});

// GET /orders — All orders for admin
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { status, search } = req.query;

    let where = '1=1';
    if (status && status !== 'all') where += ` AND o.status = '${status.replace(/'/g,"''")}'`;
    if (search) {
      const s = search.replace(/'/g, "''");
      where += ` AND (o.customer_name LIKE '%${s}%' OR o.order_number LIKE '%${s}%' OR o.customer_email LIKE '%${s}%')`;
    }

    const result = await pool.request().query(`
      SELECT
        o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_address, o.shipping_city, o.shipping_zip, o.shipping_country,
        o.shipping_method, o.shipping_price, o.subtotal, o.discount,
        o.total, o.total_amount, o.promo_code, o.status,
        o.admin_note, o.tracking_number, o.created_at, o.updated_at,
        o.voice_url, o.bear_id,
        -- Pull bear info directly from Bears table
        b.name        as bear_name,
        b.bear_type   as bear_type_name,
        b.audio_file  as bear_audio_file,
        b.total_price as bear_price,
        b.config      as bear_config,
        -- Voice: prefer order voice_url, fall back to bear's audio_file
        COALESCE(o.voice_url, b.audio_file) as has_audio,
        ISNULL(o.total, o.total_amount) as display_total
      FROM Orders o
      LEFT JOIN Bears b ON o.bear_id = b.id
      WHERE ${where}
      ORDER BY o.created_at DESC
    `);

    let orders = result.recordset.map(o => ({
      ...o,
      item_count: o.bear_name ? 1 : 0,
      item_names: o.bear_name ? `${o.bear_name} (${o.bear_type_name || 'custom'})` : '',
      has_audio:  o.has_audio || null,
    }));

    // For orders with no bear_id match, find bears by time proximity (within 10 min)
    const needsMatch = orders.filter(o => !o.bear_name);
    if (needsMatch.length > 0) {
      try {
        const allBears = await pool.request().query(
          'SELECT id, name, bear_type, audio_file, created_at FROM Bears ORDER BY created_at DESC'
        );
        orders = orders.map(o => {
          if (o.bear_name) return o;
          const t = new Date(o.created_at).getTime();
          const match = allBears.recordset.find(b =>
            Math.abs(new Date(b.created_at).getTime() - t) < 10 * 60 * 1000
          );
          if (match) return {
            ...o,
            item_count: 1,
            item_names: `${match.name} (${match.bear_type})`,
            has_audio:  o.has_audio || match.audio_file || null,
          };
          return { ...o, item_count: 1, item_names: 'Custom Bear' };
        });
      } catch (e) { console.warn('Bear time-match:', e.message); }
    }

    // Enrich from OrderItems if table exists
    try {
      const tc = await pool.request().query(
        `SELECT 1 FROM sysobjects WHERE name='OrderItems' AND xtype='U'`
      );
      if (tc.recordset.length > 0) {
        const counts = await pool.request().query(`
          SELECT order_id, COUNT(*) as item_count,
            STRING_AGG(item_name, ', ') as item_names,
            MAX(CASE WHEN audio_file IS NOT NULL THEN audio_file ELSE NULL END) as oi_audio
          FROM OrderItems GROUP BY order_id
        `);
        const cm = {};
        counts.recordset.forEach(r => { cm[r.order_id] = r; });
        orders = orders.map(o => {
          const oi = cm[o.id];
          if (!oi) return o;
          return { ...o,
            item_count: oi.item_count || o.item_count,
            item_names: oi.item_names || o.item_names,
            has_audio:  oi.oi_audio  || o.has_audio,
          };
        });
      }
    } catch {}

    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/stats — Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const pool = await getPool();
    const stats = await pool.request().query(`
      SELECT
        COUNT(*)                                                             as total_orders,
        SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END)                as pending,
        SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END)                as confirmed,
        SUM(CASE WHEN status='preparing' THEN 1 ELSE 0 END)                as preparing,
        SUM(CASE WHEN status='shipped'   THEN 1 ELSE 0 END)                as shipped,
        SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)                as delivered,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)                as cancelled,
        ISNULL(SUM(ISNULL(total, total_amount)), 0)                        as total_revenue,
        ISNULL(SUM(CASE WHEN CAST(created_at AS DATE)=CAST(GETDATE() AS DATE)
                        THEN ISNULL(total, total_amount) ELSE 0 END), 0)   as today_revenue,
        SUM(CASE WHEN CAST(created_at AS DATE)=CAST(GETDATE() AS DATE)
                 THEN 1 ELSE 0 END)                                        as today_orders
      FROM Orders
    `);
    res.json({ ...stats.recordset[0], orders_with_voice: 0 });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /orders/:id — Single order detail
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const orderRes = await pool.request()
      .input('id', sql.VarChar(36), req.params.id)
      .query(`
        SELECT o.*,
          b.name       as bear_name,
          b.bear_type  as bear_type_val,
          b.audio_file as bear_audio_file,
          b.total_price as bear_price,
          b.config     as bear_config,
          COALESCE(o.voice_url, b.audio_file) as resolved_audio
        FROM Orders o
        LEFT JOIN Bears b ON o.bear_id = b.id
        WHERE o.id = @id
      `);

    if (!orderRes.recordset.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderRes.recordset[0];

    // Build items array — from Bears join, or time-proximity fallback
    let items = [];
    if (order.bear_name) {
      items.push({
        id:          order.bear_id,
        item_type:   'custom',
        bear_id:     order.bear_id,
        item_name:   order.bear_name,
        audio_file:  order.bear_audio_file,
        unit_price:  order.bear_price,
        quantity:    1,
        item_config: order.bear_config ? (() => { try { return JSON.parse(order.bear_config); } catch { return null; } })() : null,
      });
    } else {
      // No bear_id in order — find bear by time proximity (within 10 min)
      try {
        const t = new Date(order.created_at).getTime();
        const bears = await pool.request().query(
          'SELECT TOP 5 id, name, bear_type, audio_file, total_price, config, created_at FROM Bears ORDER BY created_at DESC'
        );
        const match = bears.recordset.find(b =>
          Math.abs(new Date(b.created_at).getTime() - t) < 10 * 60 * 1000
        );
        if (match) {
          items.push({
            id:          match.id,
            item_type:   'custom',
            bear_id:     match.id,
            item_name:   match.name,
            audio_file:  match.audio_file,
            unit_price:  match.total_price,
            quantity:    1,
            item_config: match.config ? (() => { try { return JSON.parse(match.config); } catch { return null; } })() : null,
          });
          // Also update resolved_audio from this bear
          order.resolved_audio = order.resolved_audio || match.audio_file;
        }
      } catch (e) { console.warn('Time-match detail:', e.message); }
    }

    // Also check OrderItems if table exists
    try {
      const tc = await pool.request().query(`SELECT 1 FROM sysobjects WHERE name='OrderItems' AND xtype='U'`);
      if (tc.recordset.length > 0) {
        const itemsRes = await pool.request()
          .input('order_id', sql.VarChar(36), req.params.id)
          .query('SELECT * FROM OrderItems WHERE order_id = @order_id ORDER BY created_at ASC');
        if (itemsRes.recordset.length > 0) {
          items = itemsRes.recordset.map(i => ({
            ...i,
            item_config: i.item_config ? (() => { try { return JSON.parse(i.item_config); } catch { return null; } })() : null
          }));
        }
      }
    } catch {}

    res.json({ order, items });
  } catch (err) {
    console.error('Order detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /orders/:id/status — Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNote, trackingNumber } = req.body;
    const valid = ['pending','confirmed','preparing','shipped','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const pool = await getPool();

    // Build dynamic SET clause based on which columns exist
    const cols = await pool.request().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Orders'`
    );
    const colNames = cols.recordset.map(r => r.COLUMN_NAME.toLowerCase());

    let setClause = 'status = @status';
    const req2 = pool.request()
      .input('id',     sql.VarChar(36),   req.params.id)
      .input('status', sql.NVarChar(50),  status);

    if (adminNote && colNames.includes('admin_note')) {
      setClause += ', admin_note = @admin_note';
      req2.input('admin_note', sql.NVarChar(1000), adminNote);
    }
    if (trackingNumber && colNames.includes('tracking_number')) {
      setClause += ', tracking_number = @tracking_number';
      req2.input('tracking_number', sql.NVarChar(200), trackingNumber);
    }
    if (colNames.includes('updated_at')) {
      setClause += ', updated_at = GETDATE()';
    }

    await req2.query(`UPDATE Orders SET ${setClause} WHERE id = @id`);
    res.json({ success: true, status });
  } catch (err) {
    console.error('Status update error:', err.message);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /orders/:id
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