'use client';

export interface Channel {
  id: string;
  name: string;
  tagline: string;
  mark: string;
  enabled: boolean;
}

interface HomeScreenProps {
  channels: Channel[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function HomeScreen({ channels, selectedId, onSelect, onOpen }: HomeScreenProps) {
  return (
    <div className="cv-home" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 120% at 50% 0%, #1b1813 0%, #0d0c0a 70%)', display: 'flex', flexDirection: 'column', padding: '22px 26px 18px' }}>
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

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'center' }}>
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
                padding: '14px 16px',
                borderRadius: 10,
                cursor: ch.enabled ? 'pointer' : 'default',
                background: active ? 'rgba(212,160,23,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? 'rgba(212,160,23,0.75)' : 'rgba(255,255,255,0.10)'}`,
                boxShadow: active ? '0 0 18px rgba(212,160,23,0.28), inset 0 0 12px rgba(212,160,23,0.10)' : 'none',
                opacity: ch.enabled ? 1 : 0.5,
                transition: 'background 160ms, border-color 160ms, box-shadow 160ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-crt)', fontSize: 20, color: active ? '#ffe08a' : '#e8e4dc', minWidth: 34 }}>{ch.mark}</span>
                <span style={{ fontFamily: 'var(--font-crt)', fontSize: 22, color: '#fff', letterSpacing: '0.03em' }}>{ch.name}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-crt)', fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.04em' }}>{ch.tagline}</div>
              {!ch.enabled && (
                <span style={{ position: 'absolute', top: 10, right: 12, fontFamily: 'var(--font-crt)', fontSize: 13, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)' }}>SOON</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'var(--font-crt)', fontSize: 15, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>
        SCROLL TO BROWSE · INFO TO OPEN
      </div>
    </div>
  );
}
