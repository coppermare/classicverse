'use client';

import { useEffect, useRef } from 'react';
import PixelFolder from './PixelFolder';

export interface Channel {
  id: string;
  name: string;
  tagline: string;
  mark: string;
  accent: string;
  enabled: boolean;
}

interface HomeScreenProps {
  rows: Channel[][];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

// Clean white emblem stamped on the folder body — smooth, so the icon doesn't
// read as over-pixelated. One per channel. `size` scales with the folder.
function ChannelGlyph({ id, size = 24 }: { id: string; size?: number }) {
  const stroke = 'rgba(255,255,255,0.95)';
  const common = { stroke, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (id) {
    case 'cars':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26">
          <path d="M4 17 L5.5 11.5 Q6.3 9.5 8.5 9.5 H17.5 Q19.7 9.5 20.5 11.5 L22 17" {...common} />
          <rect x="3.5" y="17" width="19" height="4" rx="1.6" {...common} />
          <circle cx="8" cy="21.2" r="1.6" fill={stroke} stroke="none" />
          <circle cx="18" cy="21.2" r="1.6" fill={stroke} stroke="none" />
        </svg>
      );
    case 'guide':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26">
          <rect x="4" y="5" width="18" height="16" rx="2" {...common} />
          <line x1="7" y1="10" x2="19" y2="10" {...common} />
          <line x1="7" y1="14" x2="19" y2="14" {...common} />
          <line x1="7" y1="18" x2="14" y2="18" {...common} />
        </svg>
      );
    case 'radio':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26">
          <rect x="4" y="9" width="18" height="12" rx="2" {...common} />
          <circle cx="9" cy="15" r="2.6" {...common} />
          <line x1="15" y1="13" x2="19" y2="13" {...common} />
          <line x1="15" y1="16.5" x2="19" y2="16.5" {...common} />
          <path d="M8 9 L12 4 L14 9" {...common} />
        </svg>
      );
    case 'about':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="9" {...common} />
          <line x1="13" y1="12" x2="13" y2="18" {...common} />
          <circle cx="13" cy="8.3" r="1.3" fill={stroke} stroke="none" />
        </svg>
      );
    case 'f1':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26">
          <line x1="6" y1="4" x2="6" y2="22" {...common} />
          <path d="M6 5 H20 V14 H6" {...common} />
          <rect x="6" y="5" width="3.5" height="3" fill={stroke} stroke="none" />
          <rect x="13" y="5" width="3.5" height="3" fill={stroke} stroke="none" />
          <rect x="9.5" y="8" width="3.5" height="3" fill={stroke} stroke="none" />
          <rect x="16.5" y="8" width="3.5" height="3" fill={stroke} stroke="none" />
          <rect x="6" y="11" width="3.5" height="3" fill={stroke} stroke="none" />
          <rect x="13" y="11" width="3.5" height="3" fill={stroke} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function FolderIcon({ channel, scale = 3 }: { channel: Channel; scale?: number }) {
  return (
    <PixelFolder enabled={channel.enabled} scale={scale}>
      <ChannelGlyph id={channel.id} size={24 * (scale / 3)} />
    </PixelFolder>
  );
}

// Folders are large and laid out in a single horizontal row that's free to run
// past the screen's edges — the row itself doesn't wrap or shrink to fit; the
// CRT screen's own overflow:hidden clips whatever spills past the glass,
// like tuning across a physical channel strip rather than browsing a menu.
const FOLDER_SCALE = 3;

export default function HomeScreen({ rows, selectedId, onSelect, onOpen }: HomeScreenProps) {
  const channels = rows.flat();
  const activeRef = useRef<HTMLButtonElement>(null);

  // The row is wider than the screen and clipped by it, so selection needs to
  // actively pan the strip — otherwise moving the roller/keyboard selection
  // off the visible edge just leaves it clipped with nothing to show for it.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedId]);

  return (
    <div
      className="cv-home cv-home--grid"
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 30, margin: '0 auto', padding: '0 24px' }}>
          {channels.map((ch) => {
            const active = ch.id === selectedId;
            return (
              <button
                key={ch.id}
                ref={active ? activeRef : undefined}
                type="button"
                onMouseEnter={() => onSelect(ch.id)}
                onClick={() => { onSelect(ch.id); if (ch.enabled) onOpen(ch.id); }}
                aria-label={`${ch.name}${ch.enabled ? '' : ' (coming soon)'}`}
                aria-current={active ? 'true' : undefined}
                disabled={!ch.enabled}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  flexShrink: 0,
                  padding: '12px 10px 10px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: ch.enabled ? 'pointer' : 'default',
                  background: active ? 'rgba(74,110,158,0.16)' : 'transparent',
                  width: 176,
                }}
              >
                <FolderIcon channel={ch} scale={FOLDER_SCALE} />
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                  color: ch.enabled ? '#2c2620' : '#8a8274',
                  letterSpacing: '0.01em', textAlign: 'center',
                }}>
                  {ch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
