'use client';

import { useEffect, useRef } from 'react';
import { getWinImage } from '@/data/ferrariChassisImages';
import type { FerrariWin } from '@/types/f1';

interface WinGalleryProps {
  wins: FerrariWin[];
  selectedNumber: number;
  onOpen: (number: number) => void;
  onHighlight?: (number: number) => void;
}

// Full image gallery for a team's wins — a scrollable grid of every win's chassis
// photo. Clicking a tile opens that win full-screen (the f1-archive view, which
// has its own prev/next navigation). Mirrors CarGallery for the century of cars.
export default function WinGallery({ wins, selectedNumber, onOpen, onHighlight }: WinGalleryProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedNumber]);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, overflowY: 'auto',
        background: '#14110d', paddingTop: 44,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0, padding: 0,
        }}
      >
        {wins.map((win) => {
          const active = win.number === selectedNumber;
          const img = getWinImage(win);
          return (
            <button
              key={win.number}
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onOpen(win.number)}
              onMouseEnter={() => onHighlight?.(win.number)}
              aria-label={`Win ${win.number} — ${win.grand_prix} Grand Prix ${win.year}`}
              aria-current={active ? 'true' : undefined}
              style={{
                position: 'relative', display: 'block', padding: 0, cursor: 'pointer',
                border: 'none', borderRadius: 0, overflow: 'hidden', aspectRatio: '4 / 3',
                background: '#1a1612',
                boxShadow: active
                  ? 'inset 0 0 0 2px #d4a017'
                  : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {img?.src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img.src}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6a6258', fontSize: 13 }}>
                  {win.chassis}
                </div>
              )}

              <div
                style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  padding: '14px 8px 5px', textAlign: 'left',
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.82))',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Win {win.number} · {win.grand_prix}
                </div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>
                  {win.year} · {win.driver}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
