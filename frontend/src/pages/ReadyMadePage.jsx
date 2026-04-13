import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBear } from '../context/BearContext';
import { READY_MADE } from '../data/catalog';
import { toast } from 'react-hot-toast';

const TAG_COLORS = {
  Graduation: { bg: '#1a3fb5', text: '#fff' },
  Animal:     { bg: '#16a34a', text: '#fff' },
  Licensed:   { bg: '#9333ea', text: '#fff' },
  Bunny:      { bg: '#ec4899', text: '#fff' },
  Special:    { bg: '#d01c1c', text: '#fff' },
};

export default function ReadyMadePage() {
  const navigate = useNavigate();
  const { cart, setCart } = useBear();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  const tags = ['All', ...new Set(READY_MADE.map(b => b.tag))];
  const filtered = filter === 'All' ? READY_MADE : READY_MADE.filter(b => b.tag === filter);

  const handleAddToCart = (bear) => {
    setCart([...cart, { ...bear, bear_type: 'Ready-Made', total_price: bear.price, quantity: 1, id: bear.id + '_' + Date.now(), image: bear.image }]);
    setAddedIds(prev => new Set([...prev, bear.id]));
    toast.success(`🐻 ${bear.name} added to cart!`);
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(bear.id); return n; }), 2000);
  };

  return (
    <div className="ready-page">
      {/* Header */}
      <div className="ready-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ready-eyebrow">🐻 Ready to Love</div>
            <h1>Ready-Made Bears</h1>
            <p>No building required — pick your favorite and take it home today</p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Filter Tags */}
        <div className="ready-filters">
          {tags.map(tag => (
            <motion.button key={tag} className={`ready-filter-btn ${filter === tag ? 'active' : ''}`}
              onClick={() => setFilter(tag)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {tag}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <motion.div className="ready-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((bear, i) => (
              <motion.div key={bear.id} className="ready-card"
                layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -8 }}>

                {/* Image */}
                <div className="ready-card-img" onClick={() => setSelected(bear)}>
                  <img src={bear.image} alt={bear.name} />
                  <div className="ready-card-overlay">
                    <span>Quick View</span>
                  </div>
                  <span className="ready-tag" style={{ background: TAG_COLORS[bear.tag]?.bg, color: TAG_COLORS[bear.tag]?.text }}>
                    {bear.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="ready-card-body">
                  <h3>{bear.name}</h3>
                  <p>{bear.description}</p>
                  <div className="ready-card-footer">
                    <span className="ready-price">${bear.price}</span>
                    <div className="ready-card-actions">
                      <motion.button className="btn-card" onClick={() => handleAddToCart(bear)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ background: addedIds.has(bear.id) ? '#16a34a' : undefined }}>
                        {addedIds.has(bear.id) ? '✓ Added' : '🛒 Add to Cart'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 60, padding: '48px', background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2rem', letterSpacing: '0.04em', marginBottom: 12 }}>
            Want Something More Personal?
          </h2>
          <p style={{ color: '#666', marginBottom: 28, fontSize: '1rem' }}>
            Build your own custom bear from scratch — choose every detail.
          </p>
          <motion.button className="btn-primary" onClick={() => navigate('/build')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            🐾 Build Your Own Bear
          </motion.button>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="modal-overlay" onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="ready-modal" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button className="ready-modal-close" onClick={() => setSelected(null)}>✕</button>
              <div className="ready-modal-img">
                <img src={selected.image} alt={selected.name} />
              </div>
              <div className="ready-modal-info">
                <span className="ready-tag" style={{ background: TAG_COLORS[selected.tag]?.bg, color: TAG_COLORS[selected.tag]?.text, display: 'inline-block', marginBottom: 12 }}>
                  {selected.tag}
                </span>
                <h2>{selected.name}</h2>
                <p>{selected.description}</p>
                <div className="ready-modal-price">${selected.price}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <motion.button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { handleAddToCart(selected); setSelected(null); }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    🛒 Add to Cart
                  </motion.button>
                  <motion.button className="btn-primary blue" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => navigate('/cart')} whileHover={{ scale: 1.03 }}>
                    View Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
