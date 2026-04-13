import React, { useState } from 'react';
import { BEAR_TYPES, TOPS, BOTTOMS, DRESSES, OVERALLS, HATS, ACCESSORIES, SHOES } from '../data/catalog';

/**
 * TRUE PNG LAYER SYSTEM
 * Now that all images are transparent PNGs we can overlay them properly.
 *
 * Bear:       ~315×593px portrait
 * Clothes:    ~593×593px square (needs offset to align with bear body)
 * Hats:       ~593×593px square
 * Shoes:      ~442×312px landscape
 * Glasses:    ~1185×577px landscape
 *
 * We render everything inside a fixed-ratio container.
 * Each layer uses absolute positioning with carefully tuned values per category.
 */

function Layer({ src, alt, style, onErr }) {
  const [err, setErr] = useState(false);
  if (!src || err) return null;
  return (
    <img
      src={src} alt={alt}
      onError={() => { setErr(true); onErr && onErr(); }}
      draggable={false}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
    />
  );
}

export default function BearSVG({ config }) {
  const bearType  = BEAR_TYPES.find(b => b.id === config.bearType)    || BEAR_TYPES[0];
  const top       = TOPS.find(t => t.id === config.top);
  const bottom    = BOTTOMS.find(b => b.id === config.bottom);
  const dress     = DRESSES.find(d => d.id === config.dress);
  const overall   = OVERALLS.find(o => o.id === config.overall);
  const hat       = HATS.find(h => h.id === config.hat);
  const accessory = ACCESSORIES.find(a => a.id === config.accessories);
  const shoes     = SHOES.find(s => s.id === config.shoes);

  const hasTop       = top       && top.id       !== 'none_top';
  const hasBottom    = bottom    && bottom.id    !== 'none_bottom';
  const hasDress     = dress     && dress.id     !== 'none_dress';
  const hasOverall   = overall   && overall.id   !== 'none_overall';
  const hasHat       = hat       && hat.id       !== 'none_hat';
  const hasAccessory = accessory && accessory.id !== 'none_acc';
  const hasShoes     = shoes     && shoes.id     !== 'none_shoe';

  // Dress/overall takes priority over separate top+bottom
  const showTop    = hasTop    && !hasDress && !hasOverall;
  const showBottom = hasBottom && !hasDress && !hasOverall;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/*
        Inner container — fixed aspect ratio matching bear portrait (315:593 ≈ 1:1.88)
        All layers are absolutely positioned inside this.
      */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: 240,
        maxHeight: 'calc(240px * 1.88)',
      }}>

        {/* ── LAYER 1: BASE BEAR ── */}
        <Layer
          src={bearType.image} alt={bearType.name}
          style={{
            top: 0, left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
            width: 'auto',
            zIndex: 2,
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))',
          }}
        />

        {/* ── LAYER 2.5: SHOES — rendered AFTER bear so they sit ON TOP of feet ── */}
        {hasShoes && (
          <Layer
            src={shoes.image} alt={shoes.name}
            style={{
              bottom: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              height: 'auto',
              zIndex: 7,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))',
            }}
          />
        )}

        {/* ── LAYER 3: DRESS (full body, covers chest+legs area) ── */}
        {hasDress && (
          <Layer
            src={dress.image} alt={dress.name}
            style={{
              top: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '95%',
              height: 'auto',
              zIndex: 3,
            }}
          />
        )}

        {/* ── LAYER 3: OVERALL ── */}
        {hasOverall && (
          <Layer
            src={overall.image} alt={overall.name}
            style={{
              top: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '95%',
              height: 'auto',
              zIndex: 3,
            }}
          />
        )}

        {/* ── LAYER 3a: BOTTOM (jeans/skirt/shorts) ── */}
        {showBottom && (
          <Layer
            src={bottom.image} alt={bottom.name}
            style={{
              top: '48%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              height: 'auto',
              zIndex: 3,
            }}
          />
        )}

        {/* ── LAYER 3b: TOP (shirt) ── */}
        {showTop && (
          <Layer
            src={top.image} alt={top.name}
            style={{
              top: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              height: 'auto',
              zIndex: 4,
            }}
          />
        )}

        {/* ── LAYER 5: ACCESSORIES (sunglasses on face) ── */}
        {hasAccessory && (
          <Layer
            src={accessory.image} alt={accessory.name}
            style={{
              top: '17%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '65%',
              height: 'auto',
              zIndex: 5,
            }}
          />
        )}

        {/* ── LAYER 6: HAT (on head, top of stack) ── */}
        {hasHat && (
          <Layer
            src={hat.image} alt={hat.name}
            style={{
              top: '-8%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: 'auto',
              zIndex: 6,
            }}
          />
        )}

      </div>
    </div>
  );
}
