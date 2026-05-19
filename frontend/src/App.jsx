import React, { useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { BearProvider, useBear } from './context/BearContext';
import BearSVG from './components/BearSVG';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import ReadyMadePage from './pages/ReadyMadePage';
import AdminPage from './pages/AdminPage';
import { BEAR_TYPES, TOPS, BOTTOMS, DRESSES, OVERALLS, HATS, ACCESSORIES, SHOES } from './data/catalog';
import { saveBear, getBears, uploadAudio, uploadImage, addToCart } from './utils/api';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import './App.css';

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'bear',        label: 'Bear',        emoji: '🐻', desc: 'Choose your bear' },
  { id: 'tops',        label: 'Tops',        emoji: '👕', desc: 'T-shirts & shirts' },
  { id: 'bottoms',     label: 'Bottoms',     emoji: '👖', desc: 'Jeans, skirts & shorts' },
  { id: 'dresses',     label: 'Dresses',     emoji: '👗', desc: 'Full dresses' },
  { id: 'overalls',    label: 'Overalls',    emoji: '🧥', desc: 'Denim overalls' },
  { id: 'hats',        label: 'Hats',        emoji: '🎩', desc: 'Caps, beanies & crowns' },
  { id: 'accessories', label: 'Accessories', emoji: '👓', desc: 'Sunglasses & extras' },
  { id: 'shoes',       label: 'Shoes',       emoji: '👟', desc: 'Sneakers, boots & more' },
];

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, selected, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.button
      className={`item-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      layout
    >
      {item.image && !imgErr ? (
        <div className="item-card-img">
          <img src={item.image} alt={item.name} onError={() => setImgErr(true)} />
        </div>
      ) : (
        <div className="item-card-img item-card-img-empty">
          <span>{item.id.includes('none') ? '✕' : '📦'}</span>
        </div>
      )}
      <span className="item-name">{item.name}</span>
      {item.price > 0 && <span className="item-price">${item.price}</span>}
      {selected && <div className="item-selected-ring" />}
    </motion.button>
  );
}

// ─── Voice Recorder ───────────────────────────────────────────────────────────
function VoicePanel({ onSaved }) {
  const { isRecording, formattedDuration, audioBlob, audioUrl, volume, error, startRecording, stopRecording, clearRecording } = useVoiceRecorder();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bars = Array.from({ length: 24 }, (_, i) => i);

  const handleSave = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const result = await uploadAudio(audioBlob);
      onSaved(result.filename);
      toast.success('Voice message saved! 🎤');
    } catch { toast.error('Failed to save recording'); }
    finally { setUploading(false); }
  };

  return (
    <div className="voice-panel">
      <div className="voice-header">
        <span>🎤</span>
        <strong>Voice Message</strong>
      </div>
      <p className="voice-subtitle">Record a personal message for your bear</p>
      {error && <div className="voice-error">{error}</div>}
      <div className="waveform-container">
        {bars.map(i => {
          const h = isRecording
            ? 0.15 + Math.abs(Math.sin((Date.now() / 150 + i) * 0.8)) * volume * 0.85
            : audioBlob ? 0.25 + Math.abs(Math.sin(i * 0.65)) * 0.45 : 0.12;
          return <motion.div key={i} className="waveform-bar" animate={{ scaleY: h }} transition={{ duration: 0.1 }} />;
        })}
      </div>
      <div className={`timer ${isRecording ? 'recording' : ''}`}>
        {isRecording && <span className="rec-dot" />}
        <span>{formattedDuration}</span>
      </div>
      <div className="voice-controls">
        {!isRecording && !audioBlob && (
          <motion.button className="btn-record" onClick={startRecording} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            🎤 Start Recording
          </motion.button>
        )}
        {isRecording && (
          <motion.button className="btn-stop" onClick={stopRecording} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            ⏹ Stop
          </motion.button>
        )}
        {audioBlob && !isRecording && (
          <>
            <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
            <motion.button className="btn-play" onClick={() => isPlaying ? audioRef.current.pause() : audioRef.current.play()} whileHover={{ scale: 1.04 }}>
              {isPlaying ? '⏸ Pause' : '▶ Preview'}
            </motion.button>
            <motion.button className="btn-upload" onClick={handleSave} disabled={uploading} whileHover={{ scale: 1.04 }}>
              {uploading ? '...' : '💾 Save'}
            </motion.button>
            <motion.button className="btn-clear" onClick={clearRecording} whileHover={{ scale: 1.04 }}>🗑</motion.button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Saved Bears Modal ────────────────────────────────────────────────────────
function SavedBearsModal({ onClose, onLoad }) {
  const { savedBears, setSavedBears } = useBear();
  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    setLoading(true);
    getBears().then(r => setSavedBears(r.bears || [])).catch(() => setSavedBears([])).finally(() => setLoading(false));
  }, []);
  return (
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal-saved" onClick={e => e.stopPropagation()} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
        <div className="modal-header">
          <h2>Saved Bears</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {loading ? <div className="loading-spinner">Loading...</div>
          : savedBears.length === 0 ? <div className="cart-empty"><span style={{ fontSize: 56 }}>🐻</span><p>No saved bears yet!</p></div>
          : (
            <div className="saved-grid">
              {savedBears.map(bear => (
                <motion.div key={bear.id} className="saved-bear-card" whileHover={{ y: -3 }}>
                  <div className="saved-bear-preview">
                    <span style={{ fontSize: 40 }}>🐻</span>
                  </div>
                  <div className="saved-bear-info">
                    <strong>{bear.name}</strong>
                    <span>${bear.total_price?.toFixed(2)}</span>
                  </div>
                  <button className="btn-load" onClick={() => { onLoad(bear); onClose(); }}>Load</button>
                </motion.div>
              ))}
            </div>
          )}
      </motion.div>
    </motion.div>
  );
}


// ─── Bear Customizer ──────────────────────────────────────────────────────────
function BearCustomizer() {
  const { config, totalPrice, activeTab, cart, setConfig, setActiveTab, loadBear, reset, setCart, setSavedAudio, savedAudioFilename } = useBear();
  const [showSaved, setShowSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const bearPreviewRef = useRef(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rotateX.set(((e.clientY - rect.top - rect.height / 2) / rect.height) * -10);
    rotateY.set(((e.clientX - rect.left - rect.width / 2) / rect.width) * 10);
  }, []);
  const handleMouseLeave = useCallback(() => { rotateX.set(0); rotateY.set(0); }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBear({ name: config.name || 'My Bear', bearType: config.bearType, bearColor: '#C4956A', config, audioFile: savedAudioFilename, totalPrice });
      toast.success(`🐻 "${config.name || 'My Bear'}" saved!`);
    } catch { toast.error('Failed to save — check connection'); }
    finally { setIsSaving(false); }
  };

  const handleAddToCart = async () => {
    setIsSaving(true);
    try {
      const res = await saveBear({ name: config.name || 'My Bear', bearType: config.bearType, bearColor: '#C4956A', config, audioFile: savedAudioFilename, totalPrice });
      await addToCart(res.bear.id);
      setCart([...cart, { ...res.bear, total_price: totalPrice, quantity: 1 }]);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Could not add to cart'); }
    finally { setIsSaving(false); }
  };

  const handleExport = async () => {
    if (!bearPreviewRef.current) return;
    try {
      const canvas = await html2canvas(bearPreviewRef.current, { backgroundColor: null, scale: 3 });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${config.name || 'my-bear'}.png`;
      a.click();
      toast.success('Exported! 📸');
    } catch { toast.error('Export failed'); }
  };

  const renderItems = (items, configKey) => (
    <div className="items-grid-lg">
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          selected={config[configKey] === item.id}
          onClick={() => setConfig({ [configKey]: item.id })}
        />
      ))}
    </div>
  );

  const CAT_MAP = [
    { id: 'bear',        title: 'Choose Your Bear',  items: BEAR_TYPES, key: 'bearType'     },
    { id: 'tops',        title: 'Tops',              items: TOPS,       key: 'top'          },
    { id: 'bottoms',     title: 'Bottoms',           items: BOTTOMS,    key: 'bottom'       },
    { id: 'dresses',     title: 'Dresses',           items: DRESSES,    key: 'dress'        },
    { id: 'overalls',    title: 'Overalls',          items: OVERALLS,   key: 'overall'      },
    { id: 'hats',        title: 'Hats & Headwear',   items: HATS,       key: 'hat'          },
    { id: 'accessories', title: 'Accessories',       items: ACCESSORIES,key: 'accessories'  },
    { id: 'shoes',       title: 'Shoes',             items: SHOES,      key: 'shoes'        },
  ];

  const renderTabContent = () => {
    const cat = CAT_MAP.find(c => c.id === activeTab);
    if (!cat) return null;
    return (
      <div className="tab-content">
        <div className="section-title">{cat.title}</div>
        {renderItems(cat.items, cat.key)}
      </div>
    );
  };

  // Price breakdown items
  const priceItems = [
    { label: 'Bear',        items: BEAR_TYPES, key: 'bearType' },
    { label: 'Top',         items: TOPS,       key: 'top' },
    { label: 'Bottom',      items: BOTTOMS,    key: 'bottom' },
    { label: 'Dress',       items: DRESSES,    key: 'dress' },
    { label: 'Overall',     items: OVERALLS,   key: 'overall' },
    { label: 'Hat',         items: HATS,       key: 'hat' },
    { label: 'Accessories', items: ACCESSORIES,key: 'accessories' },
    { label: 'Shoes',       items: SHOES,      key: 'shoes' },
  ];

  return (
    <div className="app-root">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(208,28,28,0.4)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 } }} />
      <div className="app-main">

        {/* ── LEFT PANEL ── */}
        <aside className="customizer-panel">
          {/* Category Dropdown */}
          <div className="category-dropdown-wrap">
            <div className="category-dropdown-header">
              <span className="category-dropdown-emoji">
                {CATEGORIES.find(c => c.id === activeTab)?.emoji}
              </span>
              <div>
                <div className="category-dropdown-label">
                  {CATEGORIES.find(c => c.id === activeTab)?.label}
                </div>
                <div className="category-dropdown-desc">
                  {CATEGORIES.find(c => c.id === activeTab)?.desc}
                </div>
              </div>
              <span className="category-dropdown-arrow">▾</span>
            </div>
            <div className="category-dropdown-list">
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  className={`category-dropdown-item ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}>
                  <span>{cat.emoji}</span>
                  <div>
                    <strong>{cat.label}</strong>
                    <span>{cat.desc}</span>
                  </div>
                  {activeTab === cat.id && <span className="cat-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Items grid — scrollable */}
          <div className="panel-scroll">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>

        {/* ── CENTER PREVIEW ── */}
        <main className="preview-area">
          {/* Bear name */}
          <div className="bear-name-wrap">
            <input className="bear-name-input" value={config.name || ''} onChange={e => setConfig({ name: e.target.value })}
              placeholder="Name your bear..." maxLength={30} />
          </div>

          {/* Bear preview with true PNG layering */}
          <motion.div className="bear-stage" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div className="bear-3d-wrapper" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
              <div ref={bearPreviewRef} className="bear-preview">
                <BearSVG config={config} />
              </div>
            </motion.div>
          </motion.div>

          {/* Controls */}
          <div className="preview-controls">
            <motion.button className="btn-ctrl" onClick={handleExport} title="Export PNG" whileHover={{ scale: 1.1 }}>📥</motion.button>
            <motion.button className="btn-ctrl" onClick={() => setShowSaved(true)} title="Saved Bears" whileHover={{ scale: 1.1 }}>📂</motion.button>
            <motion.button className="btn-ctrl danger" onClick={reset} title="Reset" whileHover={{ scale: 1.1 }}>🗑</motion.button>
          </div>

          {/* Price */}
          <div className="price-tag">
            <span className="price-label">Total</span>
            <motion.span className="price-value" key={totalPrice} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }}>
              ${totalPrice.toFixed(2)}
            </motion.span>
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <motion.button className="btn-save" onClick={handleSave} disabled={isSaving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {isSaving ? 'Saving...' : '💾 Save Bear'}
            </motion.button>
            <motion.button className="btn-cart-add" onClick={handleAddToCart} disabled={isSaving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              🛒 Add to Cart
            </motion.button>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside className="right-panel">
          <VoicePanel onSaved={setSavedAudio} />
          <div className="price-breakdown">
            <h4>Price Breakdown</h4>
            {priceItems.map(({ label, items, key }) => {
              const found = items.find(i => i.id === config[key]);
              if (!found || found.price === 0) return null;
              return (
                <div key={key} className="breakdown-row">
                  <span>{label}: {found.name}</span>
                  <span>${found.price}</span>
                </div>
              );
            })}
            <div className="breakdown-total"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showSaved && <SavedBearsModal onClose={() => setShowSaved(false)} onLoad={bear => { loadBear(bear.config || bear); toast.success('Bear loaded!'); }} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Build Page ───────────────────────────────────────────────────────────────
function BuildPage() {
  return (
    <div className="build-page">
      <div className="build-page-header">
        <h1>🐾 Build Your Bear</h1>
        <p>Choose your bear, dress it up, and record a voice message</p>
      </div>
      <BearCustomizer />
    </div>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────
function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/shop"      element={<ShopPage />} />
        <Route path="/build"     element={<BuildPage />} />
        <Route path="/cart"      element={<CartPage />} />
        <Route path="/ready-made" element={<ReadyMadePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BearProvider>
        <AppLayout />
      </BearProvider>
    </BrowserRouter>
  );
}
