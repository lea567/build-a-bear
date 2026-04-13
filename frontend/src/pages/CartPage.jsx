import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBear } from '../context/BearContext';
import { BEAR_TYPES, READY_MADE } from '../data/catalog';

// Resolve the correct image for a cart item
function CartItemImage({ item }) {
  const [err, setErr] = React.useState(false);

  // Ready-made bears have an image directly
  if (item.image && !err) {
    return (
      <div className="cart-item-bear" style={{ background: '#f5f5f5', overflow: 'hidden' }}>
        <img src={item.image} alt={item.name} onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
      </div>
    );
  }

  // Custom-built bear — show the bear type PNG
  const bearConfig = item.config || {};
  const bearId = bearConfig.bearType || item.bear_type || 'bear1';
  // Map old IDs to new ones
  const idMap = { classic:'bear1', fluffy:'bear2', dark:'bear3', polar:'bear4', panda:'bear5', honey:'bear6' };
  const resolvedId = idMap[bearId] || bearId;
  const bearImg = `/assets/bears/${resolvedId}.png`;

  return (
    <div className="cart-item-bear" style={{ background: `${item.bear_color || '#f5f5f5'}22`, overflow: 'hidden' }}>
      {!err ? (
        <img src={bearImg} alt={item.name || 'Bear'} onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
      ) : (
        <span style={{ fontSize: 32 }}>🐻</span>
      )}
    </div>
  );
}

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping', time: '5–7 business days', price: 4.99 },
  { id: 'express', label: 'Express Shipping', time: '2–3 business days', price: 9.99 },
  { id: 'overnight', label: 'Overnight', time: 'Next business day', price: 19.99 },
];

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useBear();
  const [shipping, setShipping] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart | checkout | success
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '', expiry: '', cvv: '' });

  const shippingPrice = SHIPPING_OPTIONS.find(s => s.id === shipping)?.price || 4.99;
  const subtotal = cart.reduce((s, item) => s + ((item.total_price || 25) * (item.quantity || 1)), 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shippingPrice;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'BEAR10') {
      setPromoApplied(true);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setCheckoutStep('success');
  };

  if (checkoutStep === 'success') {
    return (
      <div className="cart-page">
        <div className="container">
          <motion.div className="success-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="success-icon" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
              🎉
            </motion.div>
            <h1>Order Placed!</h1>
            <p>Your bear is being stuffed with love and will ship soon.</p>
            <div className="success-details">
              <div className="success-row"><span>Order #</span><strong>BAB-{Math.floor(Math.random() * 90000) + 10000}</strong></div>
              <div className="success-row"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
              <div className="success-row"><span>Email</span><strong>{form.email}</strong></div>
            </div>
            <motion.button className="btn-hero-primary" onClick={() => navigate('/')} whileHover={{ scale: 1.04 }}>
              Back to Home 🐾
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <motion.h1 className="cart-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {checkoutStep === 'cart' ? '🛒 Your Bear Cart' : '📦 Checkout'}
        </motion.h1>

        {/* Steps indicator */}
        <div className="checkout-steps">
          {['Cart', 'Checkout', 'Confirmation'].map((step, i) => (
            <div key={step} className={`checkout-step ${i === (checkoutStep === 'cart' ? 0 : checkoutStep === 'checkout' ? 1 : 2) ? 'active' : i < (checkoutStep === 'cart' ? 0 : 1) ? 'done' : ''}`}>
              <div className="step-circle">{i < (checkoutStep === 'cart' ? 0 : 1) ? '✓' : i + 1}</div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {cart.length === 0 && checkoutStep === 'cart' ? (
          <motion.div className="empty-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="empty-cart-icon">🧸</span>
            <h2>Your cart is empty</h2>
            <p>Build your first bear and add it to your cart!</p>
            <motion.button className="btn-hero-primary" onClick={() => navigate('/build')} whileHover={{ scale: 1.04 }}>
              Start Building 🐾
            </motion.button>
          </motion.div>
        ) : (
          <div className="cart-layout">
            {/* Left */}
            <div className="cart-left">
              {checkoutStep === 'cart' ? (
                <>
                  <AnimatePresence>
                    {cart.map((item, i) => (
                      <motion.div key={item.cart_id || i} className="cart-item-row"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ delay: i * 0.05 }}>
                        <CartItemImage item={item} />
                        <div className="cart-item-details">
                          <h3>{item.name || 'My Bear'}</h3>
                          <span className="cart-item-type">{item.bear_type || 'classic'} bear</span>
                          {item.audio_file && <span className="cart-voice-badge">🎤 Voice message included</span>}
                        </div>
                        <div className="cart-item-qty">
                          <button>−</button>
                          <span>{item.quantity || 1}</span>
                          <button>+</button>
                        </div>
                        <div className="cart-item-price">${(item.total_price || 25).toFixed(2)}</div>
                        <button className="cart-remove-btn" onClick={() => removeFromCart(item.cart_id || item.id)}>✕</button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Shipping */}
                  <div className="cart-section">
                    <h3>Shipping Method</h3>
                    {SHIPPING_OPTIONS.map(opt => (
                      <label key={opt.id} className={`shipping-option ${shipping === opt.id ? 'selected' : ''}`}>
                        <input type="radio" name="shipping" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} />
                        <div className="shipping-info">
                          <strong>{opt.label}</strong>
                          <span>{opt.time}</span>
                        </div>
                        <span className="shipping-price">${opt.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>

                  {/* Promo */}
                  <div className="cart-section">
                    <h3>Promo Code</h3>
                    <div className="promo-row">
                      <input className="promo-input" value={promoCode} onChange={e => setPromoCode(e.target.value)}
                        placeholder="Enter code (try BEAR10)" disabled={promoApplied} />
                      <button className="btn-promo" onClick={applyPromo} disabled={promoApplied}>
                        {promoApplied ? '✓ Applied' : 'Apply'}
                      </button>
                    </div>
                    {promoApplied && <p className="promo-success">🎉 10% discount applied!</p>}
                  </div>
                </>
              ) : (
                <form className="checkout-form" onSubmit={handleCheckout}>
                  <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3>Shipping Address</h3>
                    <div className="form-group">
                      <label>Street Address</label>
                      <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Bear Street" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="New York" />
                      </div>
                      <div className="form-group">
                        <label>ZIP Code</label>
                        <input required value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder="10001" />
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3>Payment Details</h3>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input required value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry</label>
                        <input required value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input required value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} placeholder="123" maxLength={3} />
                      </div>
                    </div>
                  </div>
                  <motion.button type="submit" className="btn-hero-primary full-width" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Place Order — ${total.toFixed(2)} 🐾
                  </motion.button>
                </form>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="cart-right">
              <div className="order-summary">
                <h3>Order Summary</h3>
                {cart.map((item, i) => (
                  <div key={i} className="summary-row">
                    <span>{item.name || 'My Bear'} ×{item.quantity || 1}</span>
                    <span>${((item.total_price || 25) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="summary-divider" />
                <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {promoApplied && <div className="summary-row discount"><span>Discount (10%)</span><span>−${discount.toFixed(2)}</span></div>}
                <div className="summary-row"><span>Shipping</span><span>${shippingPrice.toFixed(2)}</span></div>
                <div className="summary-divider" />
                <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>

                {checkoutStep === 'cart' ? (
                  <motion.button className="btn-checkout-main" onClick={() => setCheckoutStep('checkout')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={cart.length === 0}>
                    Proceed to Checkout →
                  </motion.button>
                ) : (
                  <button className="btn-back" onClick={() => setCheckoutStep('cart')}>← Back to Cart</button>
                )}

                <div className="trust-badges">
                  {['🔒 Secure Payment', '📦 Free Returns', '💝 Gift Wrapping'].map(b => (
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
