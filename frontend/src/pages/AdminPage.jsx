import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, getOrderStats, updateOrderStatus, deleteOrder } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: 'Pending',    color: '#f59e0b', bg: '#fffbeb', icon: '⏳', next: 'confirmed'  },
  confirmed: { label: 'Confirmed',  color: '#3b82f6', bg: '#eff6ff', icon: '✅', next: 'preparing'  },
  preparing: { label: 'Preparing',  color: '#8b5cf6', bg: '#f5f3ff', icon: '🧸', next: 'shipped'    },
  shipped:   { label: 'Shipped',    color: '#06b6d4', bg: '#ecfeff', icon: '🚚', next: 'delivered'  },
  delivered: { label: 'Delivered',  color: '#10b981', bg: '#ecfdf5', icon: '🎉', next: null         },
  cancelled: { label: 'Cancelled',  color: '#ef4444', bg: '#fef2f2', icon: '❌', next: null         },
};

const WORKFLOW = ['pending','confirmed','preparing','shipped','delivered'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <motion.div className="admin-stat-card" whileHover={{ y:-3 }} style={{ borderTop: `3px solid ${color}` }}>
      <div className="admin-stat-icon" style={{ background: color + '18' }}>{icon}</div>
      <div className="admin-stat-info">
        <div className="admin-stat-value" style={{ color }}>{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44` }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioPlayer({ src, label }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} onTimeUpdate={() => setProgress(audioRef.current?.currentTime||0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration||0)}
        onEnded={() => { setPlaying(false); setProgress(0); }} />
      <motion.button className="audio-play-btn" onClick={toggle} whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}>
        {playing ? '⏸' : '▶'}
      </motion.button>
      <div className="audio-track">
        <div className="audio-waveform">
          {Array.from({length:28}).map((_,i) => (
            <div key={i} className="audio-bar"
              style={{ height: `${20 + Math.abs(Math.sin(i*0.7))*26}px`, background: progress > 0 && (i/28) < (progress/Math.max(duration,1)) ? '#d01c1c' : '#ddd' }} />
          ))}
        </div>
        <div className="audio-time">{fmt(progress)} / {fmt(duration)}</div>
      </div>
      <span className="audio-label">{label}</span>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  const [trackingNum, setTrackingNum] = useState(order.tracking_number || '');
  const [adminNote, setAdminNote] = useState(order.admin_note || '');
  const [updating, setUpdating] = useState(false);

  const advance = async () => {
    const next = STATUS[order.status]?.next;
    if (!next) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, next, adminNote || undefined, trackingNum || undefined);
      onStatusChange(order.id, next, adminNote, trackingNum);
    } finally { setUpdating(false); }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'cancelled', 'Cancelled by admin', undefined);
      onStatusChange(order.id, 'cancelled', 'Cancelled by admin', undefined);
      onClose();
    } finally { setUpdating(false); }
  };

  const s = STATUS[order.status] || STATUS.pending;
  const nextStatus = s.next;
  const workflowIdx = WORKFLOW.indexOf(order.status);

  return (
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="admin-modal" onClick={e => e.stopPropagation()}
        initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}>

        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <h2>{order.order_number}</h2>
            <StatusBadge status={order.status} />
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Workflow progress */}
          <div className="workflow-bar">
            {WORKFLOW.map((st, i) => (
              <React.Fragment key={st}>
                <div className={`workflow-step ${i <= workflowIdx ? 'done' : ''} ${st === order.status ? 'current' : ''}`}>
                  <div className="workflow-dot">{STATUS[st].icon}</div>
                  <span>{STATUS[st].label}</span>
                </div>
                {i < WORKFLOW.length-1 && <div className={`workflow-line ${i < workflowIdx ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="admin-modal-grid">
            {/* Customer info */}
            <div className="admin-info-card">
              <h4>👤 Customer</h4>
              <div className="info-row"><span>Name</span><strong>{order.customer_name}</strong></div>
              <div className="info-row"><span>Email</span><strong>{order.customer_email}</strong></div>
              {order.customer_phone && <div className="info-row"><span>Phone</span><strong>{order.customer_phone}</strong></div>}
            </div>

            {/* Delivery info */}
            <div className="admin-info-card">
              <h4>📍 Delivery</h4>
              <div className="info-row"><span>Address</span><strong>{order.shipping_address}</strong></div>
              <div className="info-row"><span>City</span><strong>{order.shipping_city}, {order.shipping_zip}</strong></div>
              <div className="info-row"><span>Country</span><strong>{order.shipping_country}</strong></div>
              <div className="info-row"><span>Method</span><strong>{order.shipping_method}</strong></div>
            </div>

            {/* Order financials */}
            <div className="admin-info-card">
              <h4>💰 Financials</h4>
              <div className="info-row"><span>Subtotal</span><strong>${Number(order.subtotal).toFixed(2)}</strong></div>
              {Number(order.discount) > 0 && <div className="info-row discount"><span>Discount</span><strong>−${Number(order.discount).toFixed(2)}</strong></div>}
              <div className="info-row"><span>Shipping</span><strong>${Number(order.shipping_price).toFixed(2)}</strong></div>
              <div className="info-row total"><span>Total</span><strong>${Number(order.total).toFixed(2)}</strong></div>
              {order.promo_code && <div className="info-row"><span>Promo</span><strong>{order.promo_code}</strong></div>}
            </div>

            {/* Items */}
            <div className="admin-info-card wide">
              <h4>🧸 Items ({order.item_count || '?'})</h4>
              <p style={{ fontSize:'0.85rem', color:'#666' }}>{order.item_names || 'Items listed below'}</p>
              {order.has_audio && (
                <div style={{ marginTop:12 }}>
                  <AudioPlayer src={`${API_URL}/uploads/audio/${order.has_audio}`} label="Voice message" />
                </div>
              )}
              {order.gift_message && (
                <div className="gift-message-display">
                  <span>🎁</span>
                  <em>"{order.gift_message}"</em>
                </div>
              )}
            </div>
          </div>

          {/* Admin actions */}
          <div className="admin-actions-panel">
            <h4>🛠 Admin Actions</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Tracking Number</label>
                <input value={trackingNum} onChange={e => setTrackingNum(e.target.value)} placeholder="e.g. LB1234567890" />
              </div>
              <div className="form-group">
                <label>Internal Note</label>
                <input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Note visible to admin only..." />
              </div>
            </div>

            <div className="admin-btn-row">
              {nextStatus && (
                <motion.button className="btn-advance" onClick={advance} disabled={updating} whileHover={{ scale:1.03 }}>
                  {updating ? '...' : `${STATUS[nextStatus].icon} Mark as ${STATUS[nextStatus].label}`}
                </motion.button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <motion.button className="btn-cancel-order" onClick={cancel} disabled={updating} whileHover={{ scale:1.03 }}>
                  ❌ Cancel Order
                </motion.button>
              )}
            </div>

            {order.admin_note && (
              <div className="admin-note-display">💬 {order.admin_note}</div>
            )}
            {order.tracking_number && (
              <div className="tracking-display">🚚 Tracking: <strong>{order.tracking_number}</strong></div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // orders | stats

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        getOrders({ status: statusFilter, search }),
        getOrderStats(),
      ]);
      setOrders(ordersRes.orders || []);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusChange = (orderId, newStatus, note, tracking) => {
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, status: newStatus, admin_note: note || o.admin_note, tracking_number: tracking || o.tracking_number }
      : o
    ));
    if (stats) {
      setStats(prev => ({ ...prev, [newStatus]: (prev[newStatus]||0)+1 }));
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    await deleteOrder(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <div className="admin-page">

      {/* Top bar */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <span style={{ fontSize:28 }}>🐻</span>
            <div>
              <div className="admin-brand-name">Build-A-Bear</div>
              <div className="admin-brand-sub">Admin Dashboard</div>
            </div>
          </div>
          <div className="admin-tabs">
            {[['orders','📋 Orders'],['stats','📊 Analytics']].map(([id,label]) => (
              <button key={id} className={`admin-tab ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>
          <motion.button className="admin-refresh-btn" onClick={fetchAll} whileHover={{ scale:1.05 }} whileTap={{ rotate:180 }}>
            🔄 Refresh
          </motion.button>
        </div>
      </div>

      <div className="admin-content">

        {/* Stats row */}
        {stats && (
          <div className="admin-stats-row">
            <StatCard label="Total Orders" value={stats.total_orders||0} icon="📦" color="#1a3fb5" />
            <StatCard label="Pending" value={stats.pending||0} icon="⏳" color="#f59e0b" sub="Need attention" />
            <StatCard label="In Progress" value={(stats.confirmed||0)+(stats.preparing||0)} icon="🧸" color="#8b5cf6" />
            <StatCard label="Shipped" value={stats.shipped||0} icon="🚚" color="#06b6d4" />
            <StatCard label="Delivered" value={stats.delivered||0} icon="🎉" color="#10b981" />
            <StatCard label="Revenue" value={`$${Number(stats.total_revenue||0).toFixed(0)}`} icon="💰" color="#d01c1c" sub={`$${Number(stats.today_revenue||0).toFixed(0)} today`} />
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            {/* Filters */}
            <div className="admin-filters-bar">
              <div className="admin-search-box">
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, order #..." onKeyDown={e => e.key==='Enter' && fetchAll()} />
              </div>
              <div className="admin-status-filters">
                {['all','pending','confirmed','preparing','shipped','delivered','cancelled'].map(s => (
                  <motion.button key={s} className={`admin-filter-btn ${statusFilter===s?'active':''}`}
                    style={statusFilter===s && s!=='all' ? { background: STATUS[s]?.color, color:'white' } : {}}
                    onClick={() => setStatusFilter(s)} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
                    {s === 'all' ? 'All Orders' : `${STATUS[s]?.icon} ${STATUS[s]?.label}`}
                    {stats && s !== 'all' && stats[s] > 0 && (
                      <span className="filter-count">{stats[s]}</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Orders table */}
            {loading ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">
                <span>📭</span>
                <h3>No orders yet</h3>
                <p>Orders will appear here once customers complete checkout.</p>
              </div>
            ) : (
              <div className="admin-orders-table">
                <div className="admin-table-header">
                  <span>Order</span>
                  <span>Customer</span>
                  <span>Items</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span>Actions</span>
                </div>
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.div key={order.id} className="admin-table-row"
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                      transition={{ delay: i*0.03 }}>
                      <div className="order-number-cell">
                        <strong>{order.order_number}</strong>
                        {order.has_audio && <span className="voice-indicator" title="Has voice message">🎤</span>}
                        {order.gift_message && <span className="voice-indicator" title="Gift order">🎁</span>}
                      </div>
                      <div className="order-customer-cell">
                        <div>{order.customer_name}</div>
                        <div className="cell-sub">{order.customer_email}</div>
                      </div>
                      <div className="order-items-cell">
                        <div>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</div>
                        <div className="cell-sub" style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {order.item_names}
                        </div>
                      </div>
                      <div className="order-total-cell">
                        <strong>${Number(order.total).toFixed(2)}</strong>
                      </div>
                      <div><StatusBadge status={order.status} /></div>
                      <div className="order-date-cell">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </div>
                      <div className="order-actions-cell">
                        <motion.button className="btn-view-order" onClick={() => setSelectedOrder(order)} whileHover={{ scale:1.06 }}>
                          View
                        </motion.button>
                        {STATUS[order.status]?.next && (
                          <motion.button className="btn-quick-advance" title={`Move to ${STATUS[order.status].next}`}
                            onClick={async () => {
                              const next = STATUS[order.status].next;
                              await updateOrderStatus(order.id, next);
                              handleStatusChange(order.id, next);
                            }} whileHover={{ scale:1.06 }}>
                            {STATUS[STATUS[order.status].next]?.icon}
                          </motion.button>
                        )}
                        <motion.button className="btn-delete-order" onClick={() => handleDelete(order.id)} whileHover={{ scale:1.06 }} title="Delete">🗑</motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && stats && (
          <div className="admin-analytics">
            <div className="analytics-grid">
              {/* Status breakdown */}
              <div className="analytics-card">
                <h3>📊 Orders by Status</h3>
                <div className="status-breakdown">
                  {Object.entries(STATUS).map(([key, val]) => {
                    const count = stats[key] || 0;
                    const pct = stats.total_orders > 0 ? (count / stats.total_orders * 100) : 0;
                    return (
                      <div key={key} className="breakdown-bar-row">
                        <div style={{ width:90, display:'flex', alignItems:'center', gap:6 }}>
                          <span>{val.icon}</span>
                          <span style={{ fontSize:'0.78rem', fontWeight:700 }}>{val.label}</span>
                        </div>
                        <div className="breakdown-bar-track">
                          <motion.div className="breakdown-bar-fill" initial={{ width:0 }} animate={{ width:`${pct}%` }}
                            style={{ background: val.color }} transition={{ delay:0.2 }} />
                        </div>
                        <span style={{ width:32, textAlign:'right', fontSize:'0.85rem', fontWeight:800 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue card */}
              <div className="analytics-card">
                <h3>💰 Revenue Summary</h3>
                <div className="revenue-big">${Number(stats.total_revenue||0).toFixed(2)}</div>
                <div className="revenue-sub">Total revenue all time</div>
                <div className="revenue-today">
                  <span>Today</span>
                  <strong>${Number(stats.today_revenue||0).toFixed(2)}</strong>
                </div>
                <div className="revenue-today">
                  <span>Today's orders</span>
                  <strong>{stats.today_orders||0}</strong>
                </div>
                <div className="revenue-today">
                  <span>Orders with voice</span>
                  <strong>🎤 {stats.orders_with_voice||0}</strong>
                </div>
                <div className="revenue-today">
                  <span>Avg order value</span>
                  <strong>{stats.total_orders > 0 ? `$${(stats.total_revenue/stats.total_orders).toFixed(2)}` : '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={(id, status, note, tracking) => {
              handleStatusChange(id, status, note, tracking);
              setSelectedOrder(prev => prev ? { ...prev, status, admin_note: note||prev.admin_note, tracking_number: tracking||prev.tracking_number } : null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
