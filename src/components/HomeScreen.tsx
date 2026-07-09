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
  layout: 'grid' | 'list';
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
    case 'display':
      return (
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="8.5" {...common} />
          <path d="M13 4.5 A8.5 8.5 0 0 1 13 21.5 Z" fill={stroke} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

function FolderIcon({ channel }: { channel: Channel }) {
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

function GridHome({ rows, selectedId, onSelect, onOpen }: Omit<HomeScreenProps, 'layout'>) {
  return (
    <div
      className="cv-home cv-home--grid"
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Menu bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        borderBottom: '1px solid rgba(44,40,32,0.14)',
        background: 'rgba(255,255,255,0.35)',
      }}>
        <div style={{ display: 'inline-flex', gap: 2.5 }}>
          <span style={{ width: 5, height: 12, background: '#9a2a2a', borderRadius: 1 }} />
          <span style={{ width: 5, height: 12, background: '#d4a017', borderRadius: 1 }} />
          <span style={{ width: 5, height: 12, background: '#1f6f3e', borderRadius: 1 }} />
          <span style={{ width: 5, height: 12, background: '#2a4a8a', borderRadius: 1 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-crt)', fontSize: 17, letterSpacing: '0.1em', color: '#2c2620' }}>
          CLASSICVERSE
        </span>
      </div>

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

      <div style={{
        textAlign: 'center', padding: '6px 0 9px',
        fontFamily: 'var(--font-sans)', fontSize: 9.5, letterSpacing: '0.08em',
        color: '#8a8274',
      }}>
        ROLLERS MOVE · INFO OPENS · MODE = LIST VIEW
      </div>
    </div>
  );
}

function ListHome({ rows, selectedId, onSelect, onOpen }: Omit<HomeScreenProps, 'layout'>) {
  const channels = rows.flat();
  return (
    <div className="cv-home cv-home--list" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 120% at 50% 0%, #1b1813 0%, #0d0c0a 70%)', display: 'flex', flexDirection: 'column', padding: '22px 26px 18px' }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', gap: 3, verticalAlign: 'middle', marginRight: 8 }}>
          <span style={{ display: 'inline-block', width: 6, height: 14, background: '#9a2a2a' }} />
          <span style={{ display: 'inline-block', width: 6, height: 14, background: '#d4a017' }} />
          <span style={{ display: 'inline-block', width: 6, height: 14, background: '#1f6f3e' }} />
          <span style={{ display: 'inline-block', width: 6, height: 14, background: '#2a4a8a' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-crt)', fontSize: 22, letterSpacing: '0.14em', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          CLASSICVERSE
        </span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: 10, alignContent: 'center' }}>
        {channels.map((ch) => {
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
                position: 'relative',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 10,
                cursor: ch.enabled ? 'pointer' : 'default',
                background: active ? 'rgba(212,160,23,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? 'rgba(212,160,23,0.75)' : 'rgba(255,255,255,0.10)'}`,
                boxShadow: active ? '0 0 18px rgba(212,160,23,0.28), inset 0 0 12px rgba(212,160,23,0.10)' : 'none',
                opacity: ch.enabled ? 1 : 0.5,
                display: 'flex', alignItems: 'baseline', gap: 12,
                transition: 'background 160ms, border-color 160ms, box-shadow 160ms',
              }}
            >
              <span style={{ fontFamily: 'var(--font-crt)', fontSize: 18, color: active ? '#ffe08a' : '#e8e4dc', minWidth: 30 }}>{ch.mark}</span>
              <span style={{ fontFamily: 'var(--font-crt)', fontSize: 20, color: '#fff', letterSpacing: '0.03em' }}>{ch.name}</span>
              <span style={{ fontFamily: 'var(--font-crt)', fontSize: 14, color: 'rgba(255,255,255,0.55)', marginLeft: 'auto' }}>
                {ch.enabled ? ch.tagline : 'SOON'}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'var(--font-crt)', fontSize: 15, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>
        SCROLL TO BROWSE · INFO TO OPEN · MODE = GRID VIEW
      </div>
    </div>
  );
}

export default function HomeScreen({ rows, selectedId, layout, onSelect, onOpen }: HomeScreenProps) {
  return layout === 'grid'
    ? <GridHome rows={rows} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} />
    : <ListHome rows={rows} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} />;
}
