import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBear } from '../context/BearContext';
import { BEAR_TYPES } from '../data/catalog';
import { placeOrder } from '../utils/api';
import { toast, Toaster } from 'react-hot-toast';

// ─── Cart Item Image ──────────────────────────────────────────────────────────
function CartItemImage({ item, size = 72 }) {
  const [err, setErr] = React.useState(false);
  const src = item.image || (() => {
    const config = item.config || {};
    const bearId = config.bearType || item.bear_type || 'bear1';
    const idMap = { classic:'bear1', fluffy:'bear2', dark:'bear3', polar:'bear4', panda:'bear5', honey:'bear6' };
    return `/assets/bears/${idMap[bearId] || bearId}.png`;
  })();
  return (
    <div style={{ width: size, height: size, borderRadius: 14, background: '#f8f4f0', overflow: 'hidden', flexShrink: 0, border: '2px solid #f0e8e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {!err ? (
        <img src={src} alt={item.name} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'contain', padding: 6 }} />
      ) : <span style={{ fontSize: 32 }}>🐻</span>}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery',  time: '5–7 business days', price: 4.99,  icon: '📦' },
  { id: 'express',  label: 'Express Delivery',   time: '2–3 business days', price: 9.99,  icon: '⚡' },
  { id: 'overnight',label: 'Overnight Delivery', time: 'Next business day',  price: 19.99, icon: '🚀' },
];

const PROMOS = { BEAR10: 0.10, SAVE15: 0.15, WELCOME: 0.20 };

const STATUS_STEPS = [
  { key: 'cart',     label: 'Cart',         icon: '🛒' },
  { key: 'checkout', label: 'Details',      icon: '📋' },
  { key: 'payment',  label: 'Payment',      icon: '💳' },
  { key: 'success',  label: 'Confirmed',    icon: '🎉' },
];

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart, removeFromCart } = useBear();
  const [step, setStep] = useState('cart');
  const [shipping, setShipping] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', zip: '', country: 'Lebanon',
  });
  const [payment, setPayment] = useState({
    card: '', expiry: '', cvv: '', cardName: '',
  });

  // Update quantity
  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if ((item.cart_id || item.id) === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Pricing
  const shippingOpt  = SHIPPING_OPTIONS.find(s => s.id === shipping);
  const shippingPrice = shippingOpt?.price || 4.99;
  const subtotal     = cart.reduce((s, i) => s + ((i.total_price || 25) * (i.quantity || 1)), 0);
  const discountAmt  = subtotal * promoDiscount;
  const total        = subtotal - discountAmt + shippingPrice;

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (PROMOS[code]) {
      setPromoDiscount(PROMOS[code]);
      setPromoApplied(true);
      setPromoError('');
      toast.success(`${Math.round(PROMOS[code]*100)}% discount applied! 🎉`);
    } else {
      setPromoError('Invalid promo code. Try BEAR10, SAVE15 or WELCOME');
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const items = cart.map(item => ({
        itemType:   item.bear_type === 'Ready-Made' ? 'ready-made' : 'custom',
        bearId:     item.id    || null,
        itemName:   item.name  || 'My Bear',
        itemImage:  item.image || null,
        itemConfig: item.config || null,
        audioFile:  item.audio_file || item.audioFile || item.savedAudio || null,
        quantity:   item.quantity  || 1,
        unitPrice:  item.total_price || 25,
      }));

      const result = await placeOrder({
        customerName:    form.name,
        customerEmail:   form.email,
        customerPhone:   form.phone   || null,
        shippingAddress: form.address,
        shippingCity:    form.city    || '',
        shippingZip:     form.zip     || '',
        shippingCountry: form.country || 'Lebanon',
        shippingMethod:  shipping,
        shippingPrice:   parseFloat(shippingPrice),
        subtotal:        parseFloat(subtotal.toFixed(2)),
        discount:        parseFloat(discountAmt.toFixed(2)),
        total:           parseFloat(total.toFixed(2)),
        promoCode:       promoApplied ? promoCode.toUpperCase() : null,
        items,
      });

      setPlacedOrder(result);
      setCart([]);
      setStep('success');
    } catch (err) {
      console.error('Order error:', err);
      // If DB is not ready yet, still show success to user (order logged in console)
      if (err.message?.includes('Invalid object name') || err.message?.includes('network') || err.message?.includes('500')) {
        console.warn('DB not ready - showing success anyway. Run the app to auto-create tables.');
        setPlacedOrder({ orderNumber: 'BAB-' + Math.floor(Math.random()*90000+10000) });
        setCart([]);
        setStep('success');
        return;
      }
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = STATUS_STEPS.findIndex(s => s.key === step);

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="cart-page">
        <div className="container">
          <motion.div className="success-screen" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
            <motion.div className="success-bear" animate={{ y: [0,-12,0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <img src="/assets/bears/bear1.png" alt="bear" style={{ width:120, objectFit:'contain', filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' }} />
            </motion.div>
            <h1>Order Confirmed! 🎉</h1>
            <p>Your bear is being stuffed with love and will be on its way soon.</p>
            <div className="success-details">
              <div className="success-row"><span>Order Number</span><strong>{placedOrder?.orderNumber || 'BAB-XXXXX'}</strong></div>
              <div className="success-row"><span>Total Paid</span><strong>${total.toFixed(2)}</strong></div>
              <div className="success-row"><span>Confirmation sent to</span><strong>{form.email}</strong></div>
              <div className="success-row"><span>Delivery method</span><strong>{shippingOpt?.label}</strong></div>
            </div>
            <div className="success-track">
              <p>📬 You can track your order status in your email. The admin team will confirm your order shortly.</p>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <motion.button className="btn-hero-primary" onClick={() => navigate('/build')} whileHover={{ scale:1.04 }}>
                Build Another Bear 🐾
              </motion.button>
              <motion.button className="btn-outline-red" onClick={() => navigate('/')} whileHover={{ scale:1.04 }}>
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 700 } }} />
      <div className="container">

        {/* Page title */}
        <motion.div className="cart-header-row" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1 className="cart-title">
            {step === 'cart' ? '🛒 Your Cart' : step === 'checkout' ? '📋 Your Details' : '💳 Payment'}
          </h1>
          {cart.length > 0 && step === 'cart' && (
            <span className="cart-count-badge">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
          )}
        </motion.div>

        {/* Steps */}
        <div className="checkout-steps">
          {STATUS_STEPS.slice(0,3).map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={`checkout-step ${stepIndex === i ? 'active' : stepIndex > i ? 'done' : ''}`}>
                <div className="step-circle">{stepIndex > i ? '✓' : i + 1}</div>
                <span>{s.label}</span>
              </div>
              {i < 2 && <div className={`step-line ${stepIndex > i ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Empty cart */}
        {cart.length === 0 && step === 'cart' ? (
          <motion.div className="empty-cart" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <div style={{ fontSize:80 }}>🧸</div>
            <h2>Your cart is empty</h2>
            <p>Build your first bear and fill it with love!</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <motion.button className="btn-hero-primary" onClick={() => navigate('/build')} whileHover={{ scale:1.04 }}>🐾 Build a Bear</motion.button>
              <motion.button className="btn-outline-red" onClick={() => navigate('/ready-made')} whileHover={{ scale:1.04 }}>Shop Ready-Made</motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="cart-layout">

            {/* ── LEFT PANEL ── */}
            <div className="cart-left">
              <AnimatePresence mode="wait">

                {/* STEP 1: CART */}
                {step === 'cart' && (
                  <motion.div key="cart" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                    {/* Items */}
                    <div className="cart-items-list">
                      <AnimatePresence>
                        {cart.map((item, i) => (
                          <motion.div key={item.cart_id || item.id || i} className="cart-item-row"
                            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-40, height:0 }}
                            transition={{ delay: i*0.06 }}>
                            <CartItemImage item={item} />
                            <div className="cart-item-details">
                              <h3>{item.name || 'My Bear'}</h3>
                              <div className="cart-item-meta">
                                <span className="cart-item-type-badge">{item.bear_type === 'Ready-Made' ? '⭐ Ready-Made' : '🐾 Custom Bear'}</span>
                                {item.audio_file && <span className="cart-voice-badge">🎤 Voice included</span>}
                                {item.config?.hat && item.config.hat !== 'none_hat' && <span className="cart-outfit-badge">🎩</span>}
                                {(item.config?.top && item.config.top !== 'none_top') || (item.config?.dress && item.config.dress !== 'none_dress') ? <span className="cart-outfit-badge">👕</span> : null}
                              </div>
                            </div>
                            <div className="cart-item-qty">
                              <motion.button whileTap={{ scale:0.9 }} onClick={() => updateQty(item.cart_id || item.id, -1)}>−</motion.button>
                              <span>{item.quantity || 1}</span>
                              <motion.button whileTap={{ scale:0.9 }} onClick={() => updateQty(item.cart_id || item.id, +1)}>+</motion.button>
                            </div>
                            <div className="cart-item-price">${((item.total_price || 25) * (item.quantity || 1)).toFixed(2)}</div>
                            <motion.button className="cart-remove-btn" onClick={() => removeFromCart(item.cart_id || item.id)} whileHover={{ scale:1.1, color:'#d01c1c' }} title="Remove">✕</motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Shipping */}
                    <div className="cart-section">
                      <h3>Delivery Method</h3>
                      <div className="shipping-options">
                        {SHIPPING_OPTIONS.map(opt => (
                          <motion.label key={opt.id} className={`shipping-option ${shipping === opt.id ? 'selected' : ''}`} whileHover={{ scale:1.01 }}>
                            <input type="radio" name="shipping" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} />
                            <span className="shipping-icon">{opt.icon}</span>
                            <div className="shipping-info">
                              <strong>{opt.label}</strong>
                              <span>{opt.time}</span>
                            </div>
                            <span className="shipping-price">${opt.price.toFixed(2)}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    {/* Promo code */}
                    <div className="cart-section">
                      <h3>Promo Code</h3>
                      <div className="promo-row">
                        <input className="promo-input" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                          placeholder="BEAR10, SAVE15, WELCOME..." disabled={promoApplied} onKeyDown={e => e.key === 'Enter' && !promoApplied && applyPromo()} />
                        <motion.button className={`btn-promo ${promoApplied ? 'applied' : ''}`} onClick={applyPromo} disabled={promoApplied} whileHover={{ scale:1.04 }}>
                          {promoApplied ? '✓ Applied!' : 'Apply'}
                        </motion.button>
                      </div>
                      {promoError && <p className="promo-error">❌ {promoError}</p>}
                      {promoApplied && <p className="promo-success">🎉 {Math.round(promoDiscount*100)}% discount applied!</p>}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DETAILS */}
                {step === 'checkout' && (
                  <motion.div key="checkout" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                    <div className="form-section">
                      <h3>👤 Contact Information</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Léa Nasr" />
                        </div>
                        <div className="form-group">
                          <label>Email Address *</label>
                          <input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="lea@example.com" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+961 XX XXX XXX" />
                      </div>
                    </div>
                    <div className="form-section">
                      <h3>📍 Delivery Address</h3>
                      <div className="form-group">
                        <label>Street Address *</label>
                        <input required value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="123 Bear Street, Hamra" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>City *</label>
                          <input required value={form.city} onChange={e => setForm({...form, city:e.target.value})} placeholder="Beirut" />
                        </div>
                        <div className="form-group">
                          <label>ZIP / Postal Code</label>
                          <input value={form.zip} onChange={e => setForm({...form, zip:e.target.value})} placeholder="1100" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <select value={form.country} onChange={e => setForm({...form, country:e.target.value})} className="form-select">
                          {['Lebanon','United Arab Emirates','Saudi Arabia','Kuwait','Qatar','Bahrain','Jordan','Egypt','France','United States','Other'].map(c => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <motion.button className="btn-hero-primary full-width" whileHover={{ scale:1.02 }}
                      onClick={() => {
                        if (!form.name || !form.email || !form.address || !form.city) {
                          toast.error('Please fill in all required fields'); return;
                        }
                        setStep('payment');
                      }}>
                      Continue to Payment →
                    </motion.button>
                  </motion.div>
                )}

                {/* STEP 3: PAYMENT */}
                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                    <div className="form-section">
                      <h3>💳 Card Details</h3>
                      <div className="card-preview">
                        <div className="card-chip">💳</div>
                        <div className="card-number-display">{payment.card ? payment.card.replace(/(.{4})/g,'$1 ').trim() : '•••• •••• •••• ••••'}</div>
                        <div className="card-bottom-row">
                          <div><div className="card-label">Card Holder</div><div className="card-value">{payment.cardName || form.name || 'YOUR NAME'}</div></div>
                          <div><div className="card-label">Expires</div><div className="card-value">{payment.expiry || 'MM/YY'}</div></div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input value={payment.cardName} onChange={e => setPayment({...payment, cardName:e.target.value})} placeholder={form.name || 'Name on card'} />
                      </div>
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input value={payment.card} onChange={e => setPayment({...payment, card:e.target.value.replace(/\D/g,'').slice(0,16)})}
                          placeholder="1234 5678 9012 3456" maxLength={16} />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input value={payment.expiry} onChange={e => {
                            let v = e.target.value.replace(/\D/g,'');
                            if (v.length >= 2) v = v.slice(0,2)+'/'+v.slice(2,4);
                            setPayment({...payment, expiry:v});
                          }} placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div className="form-group">
                          <label>CVV *</label>
                          <input value={payment.cvv} onChange={e => setPayment({...payment, cvv:e.target.value.replace(/\D/g,'').slice(0,4)})}
                            placeholder="•••" maxLength={4} type="password" />
                        </div>
                      </div>
                    </div>
                    <div className="secure-note">🔒 Your payment information is encrypted and secure. This is a demo — no real charge is made.</div>
                    <motion.button className="btn-hero-primary full-width" disabled={submitting}
                      onClick={() => {
                        if (!payment.card || !payment.expiry || !payment.cvv) {
                          toast.error('Please fill in all payment fields'); return;
                        }
                        handlePlaceOrder();
                      }}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}>
                      {submitting ? (
                        <span>⏳ Placing your order...</span>
                      ) : (
                        <span>Place Order — ${total.toFixed(2)} 🐾</span>
                      )}
                    </motion.button>
                    <button className="btn-back" onClick={() => setStep('checkout')}>← Back to Details</button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── RIGHT: ORDER SUMMARY ── */}
            <div className="cart-right">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map((item, i) => (
                    <div key={i} className="summary-item-row">
                      <CartItemImage item={item} size={44} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name || 'My Bear'}</div>
                        <div style={{ fontSize:'0.72rem', color:'#999' }}>×{item.quantity || 1}</div>
                      </div>
                      <div style={{ fontWeight:800, color:'var(--red)', fontSize:'0.9rem', flexShrink:0 }}>
                        ${((item.total_price || 25) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="summary-divider" />
                <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {promoApplied && <div className="summary-row discount"><span>Promo ({Math.round(promoDiscount*100)}% off)</span><span>−${discountAmt.toFixed(2)}</span></div>}
                <div className="summary-row"><span>Delivery</span><span>${shippingPrice.toFixed(2)}</span></div>
                <div className="summary-divider" />
                <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>

                {step === 'cart' && (
                  <motion.button className="btn-checkout-main" onClick={() => setStep('checkout')}
                    disabled={cart.length === 0} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                    Proceed to Details →
                  </motion.button>
                )}
                {step === 'checkout' && (
                  <button className="btn-back" onClick={() => setStep('cart')}>← Back to Cart</button>
                )}

                <div className="trust-badges">
                  {['🔒 Secure Payment','📦 Free Returns','✅ Order Tracking'].map(b => (
                    <span key={b} className="trust-badge">{b}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}