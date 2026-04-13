import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBear } from '../context/BearContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useBear();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setMobileOpen(false), [location]);

  const links = [
    { path: '/',           label: 'Home' },
    { path: '/shop',       label: 'Shop' },
    { path: '/build',      label: 'Build a Bear' },
    { path: '/ready-made', label: 'Ready-Made' },
  ];

  return (
    <motion.nav className={`navbar ${scrolled ? 'scrolled' : ''}`} initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
      <div className="nav-inner">
        <motion.div className="nav-logo" onClick={() => navigate('/')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <img src="/assets/bears/bear1.png" alt="logo" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(208,28,28,0.3))' }} />
          <div>
            <span className="nav-logo-name">Build-A-Bear</span>
            <span className="nav-logo-tag">Workshop</span>
          </div>
        </motion.div>

        <div className="nav-links">
          {links.map(link => (
            <motion.button key={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              {link.label}
              {location.pathname === link.path && <motion.div className="nav-active-dot" layoutId="navDot" />}
            </motion.button>
          ))}
          <motion.button className="nav-cart-btn" onClick={() => navigate('/cart')} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
            🛒
            {cart.length > 0 && (
              <motion.span className="nav-cart-count" initial={{ scale: 0 }} animate={{ scale: 1 }} key={cart.length}>
                {cart.length}
              </motion.span>
            )}
          </motion.button>
        </div>

        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className={mobileOpen ? 'open' : ''} />
          <span className={mobileOpen ? 'open' : ''} />
          <span className={mobileOpen ? 'open' : ''} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {links.map(link => (
              <button key={link.path} className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`} onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
            <button className="mobile-link" onClick={() => navigate('/cart')}>
              🛒 Cart {cart.length > 0 ? `(${cart.length})` : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
