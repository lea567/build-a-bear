import React, { useState, useEffect, useRef } from 'react';
import { getBears } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [bears, setBears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [search, setSearch] = useState('');
  const audioRefs = useRef({});

  useEffect(() => {
    getBears()
      .then(res => setBears(res.bears || []))
      .catch(() => setBears([]))
      .finally(() => setLoading(false));
  }, []);

  const togglePlay = (bearId, audioFile) => {
    // Stop any currently playing audio
    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== bearId && el) { el.pause(); el.currentTime = 0; }
    });

    const audio = audioRefs.current[bearId];
    if (!audio) return;

    if (playing === bearId) {
      audio.pause();
      setPlaying(null);
    } else {
      audio.play();
      setPlaying(bearId);
    }
  };

  const withAudio = bears.filter(b => b.audio_file);
  const filtered = withAudio.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.bear_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#fff9f4', minHeight: '100vh', paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3d1a06, #6b3a1f)', padding: '40px 0', textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '2.2rem', color: 'white', margin: 0 }}>
          🎤 Admin — Voice Recordings
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
          {withAudio.length} bear{withAudio.length !== 1 ? 's' : ''} with voice messages
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bears by name..."
            style={{ flex: 1, padding: '12px 18px', borderRadius: 50, border: '2px solid #ffe4cc', outline: 'none', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif' }}
          />
          <div style={{ padding: '12px 20px', background: '#fff3e8', borderRadius: 50, border: '2px solid #ffe4cc', color: '#a07850', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {filtered.length} results
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#a07850', fontSize: '1rem' }}>
            Loading recordings...
          </div>
        )}

        {/* No recordings */}
        {!loading && withAudio.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔇</div>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', color: '#2d1a0a', marginBottom: 8 }}>No recordings yet</h2>
            <p style={{ color: '#a07850' }}>Voice messages will appear here once bears are built with recordings.</p>
          </div>
        )}

        {/* Bear cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(bear => (
            <div key={bear.id} style={{
              background: 'white', borderRadius: 18, padding: '20px 24px',
              boxShadow: '0 4px 20px rgba(104,58,31,0.1)',
              border: playing === bear.id ? '2px solid #e8521a' : '2px solid transparent',
              transition: 'border-color 0.2s',
              display: 'flex', alignItems: 'center', gap: 20
            }}>
              {/* Bear icon */}
              <div style={{ width: 60, height: 60, borderRadius: 14, background: `${bear.bear_color || '#C4956A'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
                🐻
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2d1a0a', marginBottom: 2 }}>{bear.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#a07850', textTransform: 'capitalize', marginBottom: 4 }}>
                  {bear.bear_type} bear · ${bear.total_price?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#c4956a', fontFamily: 'monospace', background: '#fff3e8', padding: '3px 10px', borderRadius: 6, display: 'inline-block', wordBreak: 'break-all' }}>
                  {bear.audio_file}
                </div>
              </div>

              {/* Date */}
              <div style={{ fontSize: '0.75rem', color: '#a07850', textAlign: 'right', flexShrink: 0 }}>
                {bear.created_at ? new Date(bear.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </div>

              {/* Play button */}
              <button
                onClick={() => togglePlay(bear.id, bear.audio_file)}
                style={{
                  width: 52, height: 52, borderRadius: '50%', border: 'none',
                  background: playing === bear.id ? '#e8521a' : 'linear-gradient(135deg, #e8521a, #ff7043)',
                  color: 'white', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 4px 14px rgba(232,82,26,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {playing === bear.id ? '⏸' : '▶'}
              </button>

              {/* Hidden audio element */}
              <audio
                ref={el => audioRefs.current[bear.id] = el}
                src={`${API_URL}/uploads/audio/${bear.audio_file}`}
                onEnded={() => setPlaying(null)}
                preload="none"
              />
            </div>
          ))}
        </div>

        {/* All bears without audio */}
        {!loading && bears.filter(b => !b.audio_file).length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: '0.75rem', color: '#a07850', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: 16 }}>
              Bears without recordings ({bears.filter(b => !b.audio_file).length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {bears.filter(b => !b.audio_file).map(bear => (
                <div key={bear.id} style={{ background: 'white', borderRadius: 12, padding: '10px 16px', border: '1px solid #ffe4cc', fontSize: '0.85rem', color: '#6b4c30', fontWeight: 600 }}>
                  🐻 {bear.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
