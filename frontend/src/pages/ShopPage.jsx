import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAR_TYPES, TOPS, BOTTOMS, DRESSES, OVERALLS, HATS, ACCESSORIES, SHOES } from '../data/catalog';

// Build flat product list from all real assets
const ALL_PRODUCTS = [
  ...BEAR_TYPES.map(b => ({ ...b, category: 'Bears', displayImg: b.image })),
  ...TOPS.filter(t => t.id !== 'none_top').map(t => ({ ...t, category: 'Tops', displayImg: t.image })),
  ...BOTTOMS.filter(b => b.id !== 'none_bottom').map(b => ({ ...b, category: 'Bottoms', displayImg: b.image })),
  ...DRESSES.filter(d => d.id !== 'none_dress').map(d => ({ ...d, category: 'Dresses', displayImg: d.image })),
  ...OVERALLS.filter(o => o.id !== 'none_overall').map(o => ({ ...o, category: 'Overalls', displayImg: o.image })),
  ...HATS.filter(h => h.id !== 'none_hat').map(h => ({ ...h, category: 'Hats', displayImg: h.image })),
  ...ACCESSORIES.filter(a => a.id !== 'none_acc').map(a => ({ ...a, category: 'Accessories', displayImg: a.image })),
  ...SHOES.filter(s => s.id !== 'none_shoe').map(s => ({ ...s, category: 'Shoes', displayImg: s.image })),
];

const FILTERS = ['All', 'Bears', 'Tops', 'Bottoms', 'Dresses', 'Overalls', 'Hats', 'Accessories', 'Shoes'];
const SORTS   = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Name A–Z'];

// Card background per category
const CAT_BG = {
  Bears:       '#fef3e8',
  Tops:        '#f0f4ff',
  Bottoms:     '#f0fff4',
  Dresses:     '#fff0f8',
  Overalls:    '#f5f0ff',
  Hats:        '#fffbf0',
  Accessories: '#f0f8ff',
  Shoes:       '#f0fff8',
};

function ProductCard({ item, onBuild }) {
  const [imgErr, setImgErr] = useState(false);
  const [wish, setWish]     = useState(false);
  const bg = CAT_BG[item.category] || '#f8f8f8';

  return (
    <motion.div className="shop-card" whileHover={{ y: -6 }} layout>
      {/* Image area */}
      <div className="shop-card-img" style={{ background: bg }}>
        {item.displayImg && !imgErr ? (
          <img
            src={item.displayImg}
            alt={item.name}
            onError={() => setImgErr(true)}
            style={{
              width: item.category === 'Bears' ? '70%' : '85%',
              height: '85%',
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        ) : (
          <div style={{ fontSize: 52, opacity: 0.25 }}>📦</div>
        )}

        {/* Category badge */}
        <span className="shop-category-badge">{item.category}</span>

        {/* Wishlist */}
        <button
          className={`wishlist-btn ${wish ? 'active' : ''}`}
          onClick={() => setWish(w => !w)}
          style={{ fontSize: 16 }}
        >
          {wish ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body */}
      <div className="shop-card-body">
        <h3>{item.name}</h3>
        {item.description && <p className="shop-card-desc">{item.description}</p>}
        <div className="shop-card-footer">
          <span className="shop-price">${item.price}</span>
          {item.category === 'Bears' ? (
            <motion.button className="btn-build" onClick={() => onBuild()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Build →
            </motion.button>
          ) : (
            <motion.button className="btn-add-shop" onClick={() => onBuild()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              + Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sort,   setSort]   = useState('Featured');
  const [search, setSearch] = useState('');

  const filtered = ALL_PRODUCTS
    .filter(p => activeFilter === 'All' || p.category === activeFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'Price: Low to High')  return a.price - b.price;
      if (sort === 'Price: High to Low')  return b.price - a.price;
      if (sort === 'Name A–Z')            return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Shop All The Stuff You Love</h1>
            <p>{ALL_PRODUCTS.length} products — bears, clothes, hats, shoes & more</p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className="shop-toolbar">
          <div className="shop-filters">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                {f}
              </motion.button>
            ))}
          </div>
          <div className="shop-controls">
            <div className="search-box">
              <span>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
              />
            </div>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="results-count">
          Showing <strong>{filtered.length}</strong> {activeFilter === 'All' ? 'products' : activeFilter.toLowerCase()}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div className="shop-grid" layout>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 0.025 }}
              >
                <ProductCard item={item} onBuild={() => navigate('/build')} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="no-results">
            <span>🐾</span>
            <p>No products found for "{search}"</p>
            <button onClick={() => { setSearch(''); setActiveFilter('All'); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
