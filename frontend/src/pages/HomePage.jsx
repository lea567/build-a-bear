import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAR_TYPES, READY_MADE } from '../data/catalog';

const TAGS       = ['Bestseller', 'New', 'Fan Fave', 'Popular', 'Special', 'Limited'];
const TAG_COLORS = ['',           'blue','',          'blue',    '',        'blue'   ];

const STEPS = [
  { step:'01', title:'Choose Your Bear',    desc:'Pick from 6 unique bear types and customize the fur color.',    emoji:'🐾' },
  { step:'02', title:'Stuff With Love',     desc:'Your bear gets filled and you place a heart inside with a wish.',emoji:'❤️' },
  { step:'03', title:'Dress & Accessorize', desc:'Outfits, hats, shoes and accessories from hundreds of options.',emoji:'👗' },
  { step:'04', title:'Record a Message',    desc:'Give your bear a voice — record a personal audio message.',     emoji:'🎤' },
  { step:'05', title:'Name Your Bear',      desc:'Give your best friend a name and make it truly yours.',         emoji:'✏️' },
  { step:'06', title:'Delivered To You',    desc:'Your bear ships right to your door in a special gift box.',      emoji:'📦' },
];

const CATEGORIES = [
  { label:'Bears',       emoji:'🐻', color:'#fff0f0', count:'6 types'  },
  { label:'Clothing',    emoji:'👕', color:'#f0f4ff', count:'22 items' },
  { label:'Hats',        emoji:'🎩', color:'#fff8f0', count:'11 items' },
  { label:'Accessories', emoji:'👓', color:'#f5f0ff', count:'3 items'  },
  { label:'Shoes',       emoji:'👟', color:'#f0fff4', count:'9 items'  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeT, setActiveT] = useState(0);

  const testimonials = [
    { text: "My daughter cried happy tears. Nothing beats watching her name her bear and put the heart in!", author: "Sarah M.", loc: "New York" },
    { text: "Ordered three for my grandchildren. The quality is incredible and the voice message feature made Christmas magical.", author: "Robert K.", loc: "Texas" },
    { text: "Best gift I've ever given. My best friend got the bear with our inside jokes recorded — she still carries it.", author: "Priya L.", loc: "California" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="homepage">

      {/* ── HERO ── */}
      <section className="hero">
        <motion.div className="hero-content"
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            ✨ The Stuff You Love
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
            BUILD YOUR<br />
            <span className="hero-title-line2">PERFECT</span><br />
            BEAR
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Create a one-of-a-kind furry friend — choose every detail, record a voice message, and fill it with love.
          </motion.p>
          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <motion.button className="btn-hero-white" onClick={() => navigate('/build')} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              🐾 Start Building
            </motion.button>
            <motion.button className="btn-hero-outline" onClick={() => navigate('/shop')} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              Shop All Bears
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div className="hero-bears" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <div className="hero-bear-showcase">
            <div className="hero-bear-ring" />
            <div className="hero-bear-ring-2" />
            <motion.img
              src="/assets/bears/bear1.png"
              alt="Classic Teddy Bear"
              className="hero-bear-main"
            />
          </div>
        </motion.div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
            <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section categories-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="container">
          <motion.div className="section-header" style={{ marginBottom: 32 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Shop by Category</h2>
            <p>Everything your bear could ever need</p>
          </motion.div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.label} className="category-card" style={{ '--cat-bg': cat.color }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} onClick={() => navigate('/shop')}>
                <span className="cat-emoji-fallback">{cat.emoji}</span>
                <strong>{cat.label}</strong>
                <span className="cat-count">{cat.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BEARS ── */}
      <section className="section featured-section">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Most Loved Bears</h2>
            <p>Start with a fan favorite, then make it uniquely yours</p>
          </motion.div>
          <div className="featured-grid">
            {BEAR_TYPES.slice(0, 4).map((bear, i) => (
              <motion.div key={bear.id} className="bear-card"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}>
                <div className="bear-card-img" style={{ background: '#fef6ee' }}>
                  <img
                    src={bear.image}
                    alt={bear.name}
                    style={{ width: '72%', height: '88%', objectFit: 'contain' }}
                  />
                  <span className={`bear-card-tag ${TAG_COLORS[i]}`}>{TAGS[i]}</span>
                </div>
                <div className="bear-card-body">
                  <h3>{bear.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: 10, lineHeight: 1.5 }}>{bear.description}</p>
                  <div className="bear-card-footer">
                    <span className="bear-card-price">From ${bear.price}</span>
                    <motion.button className="btn-card" onClick={() => navigate('/build')}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      Customize →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="section-cta">
            <motion.button className="btn-outline-red" onClick={() => navigate('/shop')} whileHover={{ scale: 1.03 }}>
              View All Bears
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── READY-MADE PREVIEW ── */}
      <section className="section" style={{ background: 'white', paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Ready-Made Friends</h2>
            <p>No building required — take one home today</p>
          </motion.div>
          <div className="featured-grid">
            {READY_MADE.slice(0, 4).map((item, i) => (
              <motion.div key={item.id} className="bear-card"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}>
                <div className="bear-card-img" style={{ background: '#f5f8ff' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '80%', height: '90%', objectFit: 'contain' }}
                  />
                  <span className="bear-card-tag blue">{item.tag}</span>
                </div>
                <div className="bear-card-body">
                  <h3>{item.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: 10, lineHeight: 1.5 }}>{item.description}</p>
                  <div className="bear-card-footer">
                    <span className="bear-card-price">${item.price}</span>
                    <motion.button className="btn-card" onClick={() => navigate('/ready-made')}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      View →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="section-cta">
            <motion.button className="btn-primary blue" onClick={() => navigate('/ready-made')} whileHover={{ scale: 1.03 }}>
              See All Ready-Made Bears
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section">
        <div className="container">
          <motion.div className="section-header light"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>How It Works</h2>
            <p>Six magical steps to your perfect bear</p>
          </motion.div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <motion.div key={s.step} className="step-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <div className="step-num">{s.step}</div>
                <span className="step-icon">{s.emoji}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="section-cta">
            <motion.button className="btn-hero-white" onClick={() => navigate('/build')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Start Building Now →
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="promo-banner">
        <div className="container">
          <motion.div className="promo-inner"
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="promo-text">
              <span className="promo-tag">Limited Time</span>
              <h2>Free Shipping Over $50</h2>
              <p>Plus free gift wrapping on all orders this week.</p>
              <div className="promo-badges">
                {['🚚 Free Shipping', '🎁 Gift Wrap', '↩️ Free Returns', '🔒 Secure Checkout'].map(b => (
                  <span key={b} className="promo-badge">{b}</span>
                ))}
              </div>
            </div>
            <motion.button className="btn-hero-white" onClick={() => navigate('/build')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Build Now 🐻
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials-section">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Made With Love ❤️</h2>
            <p>What our customers say</p>
          </motion.div>
          <div className="testimonials-wrapper">
            <AnimatePresence mode="wait">
              <motion.div key={activeT} className="testimonial-card"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                <div className="testimonial-stars">★★★★★</div>
                <blockquote>"{testimonials[activeT].text}"</blockquote>
                <cite>— {testimonials[activeT].author}, {testimonials[activeT].loc}</cite>
              </motion.div>
            </AnimatePresence>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`t-dot ${i === activeT ? 'active' : ''}`} onClick={() => setActiveT(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="container">
          <motion.div className="newsletter-inner"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3>🐾 Join The Bear Family</h3>
            <p>Get exclusive deals, new arrivals, and bear-building tips.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email..." className="newsletter-input" />
              <button className="btn-newsletter">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
