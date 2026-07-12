'use client';

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

function ChannelGlyph({ id }: { id: string }) {
  const stroke = 'rgba(255,255,255,0.92)';
  const common = { stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (id) {
    case 'cars':
      return (
        <svg width="26" height="26" viewBox="0 0 26 26">
          <path d="M4 17 L5.5 11.5 Q6.3 9.5 8.5 9.5 H17.5 Q19.7 9.5 20.5 11.5 L22 17" {...common} />
          <rect x="3.5" y="17" width="19" height="4" rx="1.6" {...common} />
          <circle cx="8" cy="21.2" r="1.6" fill={stroke} stroke="none" />
          <circle cx="18" cy="21.2" r="1.6" fill={stroke} stroke="none" />
        </svg>
      );
    case 'guide':
      return (
        <svg width="26" height="26" viewBox="0 0 26 26">
          <rect x="4" y="5" width="18" height="16" rx="2" {...common} />
          <line x1="7" y1="10" x2="19" y2="10" {...common} />
          <line x1="7" y1="14" x2="19" y2="14" {...common} />
          <line x1="7" y1="18" x2="14" y2="18" {...common} />
        </svg>
      );
    case 'radio':
      return (
        <svg width="26" height="26" viewBox="0 0 26 26">
          <rect x="4" y="9" width="18" height="12" rx="2" {...common} />
          <circle cx="9" cy="15" r="2.6" {...common} />
          <line x1="15" y1="13" x2="19" y2="13" {...common} />
          <line x1="15" y1="16.5" x2="19" y2="16.5" {...common} />
          <path d="M8 9 L12 4 L14 9" {...common} />
        </svg>
      );
    case 'about':
      return (
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="9" {...common} />
          <line x1="13" y1="12" x2="13" y2="18" {...common} />
          <circle cx="13" cy="8.3" r="1.3" fill={stroke} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function FolderIcon({ channel }: { channel: Channel }) {
  const { accent, enabled } = channel;
  return (
    <div style={{ position: 'relative', width: 64, height: 54, opacity: enabled ? 1 : 0.55 }}>
      <div style={{
        position: 'absolute', top: 0, left: 6, width: 26, height: 10,
        borderRadius: '5px 5px 0 0',
        background: accent,
        filter: 'brightness(1.12)',
      }} />
      <div style={{
        position: 'absolute', top: 7, left: 0, width: 64, height: 47,
        borderRadius: 8,
        background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 88%, white 12%) 0%, ${accent} 55%, color-mix(in srgb, ${accent} 82%, black 18%) 100%)`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ChannelGlyph id={channel.id} />
      </div>
    </div>
  );
}

export default function HomeScreen({ rows, selectedId, onSelect, onOpen }: HomeScreenProps) {
  return (
    <div
      className="cv-home cv-home--grid"
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Icon grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: '10px 24px' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 34 }}>
            {row.map((ch) => {
              const active = ch.id === selectedId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onMouseEnter={() => onSelect(ch.id)}
                  onClick={() => { onSelect(ch.id); if (ch.enabled) onOpen(ch.id); }}
                  aria-label={`${ch.name}${ch.enabled ? '' : ' (coming soon)'}`}
                  aria-current={active ? 'true' : undefined}
                  disabled={!ch.enabled}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '8px 6px 6px',
                    borderRadius: 10,
                    cursor: ch.enabled ? 'pointer' : 'default',
                    background: active ? 'rgba(74,110,158,0.14)' : 'transparent',
                    border: active ? '1px solid rgba(74,110,158,0.55)' : '1px solid transparent',
                    width: 96,
                  }}
                >
                  <FolderIcon channel={ch} />
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600,
                    color: ch.enabled ? '#2c2620' : '#8a8274',
                    letterSpacing: '0.01em',
                  }}>
                    {ch.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: '#8a8274' }}>
                    {ch.enabled ? ch.tagline : 'Coming soon'}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
