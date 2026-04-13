import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#111"/>
        </svg>
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <span style={{ fontSize: 36 }}>🐻</span>
          <h3>Build-A-Bear</h3>
          <p>Build, dress, name, and love a one-of-a-kind furry friend. Every bear is uniquely yours.</p>
          <div className="footer-social">
            {['📘','📸','🎵','🐦'].map((s,i) => (
              <button key={i} className="social-btn">{s}</button>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <button onClick={() => navigate('/shop')}>All Bears</button>
          <button onClick={() => navigate('/shop')}>Clothing</button>
          <button onClick={() => navigate('/shop')}>Accessories</button>
          <button onClick={() => navigate('/shop')}>Gift Sets</button>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <button>Shipping Info</button>
          <button>Returns</button>
          <button>FAQ</button>
          <button>Contact Us</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Build-A-Bear Workshop. All rights reserved.</span>
        <div className="footer-bottom-links">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
        </div>
      </div>
    </footer>
  );
}
