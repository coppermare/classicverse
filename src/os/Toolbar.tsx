'use client';

import { RetroButton, Divider, RADIUS, FACE, WELL } from './ui';
import type { OSNode } from './types';
import * as sfx from './sound';

/**
 * The system toolbar: the same controls on every screen, in the same place.
 *
 * It carries the address trail as well as the buttons, because in a system built
 * from nested folders "where am I" is a question the shell has to answer — and
 * every crumb is clickable, which makes climbing out of a deep path one press
 * rather than repeated Back.
 */
export default function Toolbar({
  trail, canGoBack, canGoForward, canGoUp,
  onBack, onForward, onUp, onHome, onSearch, onCrumb,
  muted, onToggleMute, searchOpen,
}: {
  trail: OSNode[];
  canGoBack: boolean; canGoForward: boolean; canGoUp: boolean;
  onBack: () => void; onForward: () => void; onUp: () => void;
  onHome: () => void; onSearch: () => void;
  onCrumb: (index: number) => void;
  muted: boolean; onToggleMute: () => void; searchOpen: boolean;
}) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 12,
      display: 'flex', alignItems: 'center', gap: 4,
      // Generous at the sides: the bar runs the full width of a tube with 16px
      // rounded corners, so anything tight to the edge sits in the curve.
      padding: '5px 16px',
      background: FACE,
      // Deliberately NOT the RAISED bevel. That wraps an outer ring around all
      // four sides and casts a drop shadow, which turned the bar into a discrete
      // panel sitting on the glass — and its own corner radius left the screen
      // showing through at the top corners, where the tube's radius is far
      // larger. Running edge to edge with only a lit top and a shaded bottom
      // makes it part of the picture; the screen's own corners clip it.
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.7)',
        '0 1px 0 #6f6b64',
        '0 2px 4px rgba(0,0,0,0.22)',
      ].join(', '),
    }}>
      <RetroButton icon label="Back" disabled={!canGoBack} onClick={onBack} title="Back">
        <Arrow dir="left" muted={!canGoBack} />
      </RetroButton>
      <RetroButton icon label="Forward" disabled={!canGoForward} onClick={onForward} title="Forward">
        <Arrow dir="right" muted={!canGoForward} />
      </RetroButton>
      <RetroButton icon label="Up one level" disabled={!canGoUp} onClick={onUp} title="Up">
        <Arrow dir="up" muted={!canGoUp} />
      </RetroButton>

      <Divider vertical />

      <RetroButton icon label="Home" onClick={onHome} title="Home">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2.5 8.5 L9 3 L15.5 8.5" stroke="#1c1a17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 7.5 V15 H13.5 V7.5" stroke="#1c1a17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </RetroButton>

      {/* Address trail */}
      <div style={{
        flex: 1, minWidth: 0, height: 26, marginLeft: 2,
        background: '#fff', borderRadius: RADIUS, boxShadow: WELL,
        display: 'flex', alignItems: 'center', gap: 2, padding: '0 7px', overflow: 'hidden',
      }}>
        {trail.map((n, i) => {
          const last = i === trail.length - 1;
          return (
            <span key={n.id + i} style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              {i > 0 && <span aria-hidden="true" style={{ color: '#9a958c', fontSize: 12 }}>/</span>}
              <button
                type="button"
                disabled={last}
                onPointerEnter={() => !last && sfx.hover()}
                onClick={() => onCrumb(i)}
                title={n.name}
                style={{
                  border: 'none', background: 'none', padding: '2px 2px', borderRadius: 2,
                  cursor: last ? 'default' : 'pointer',
                  font: `${last ? 700 : 500} 12px/1 var(--font-sans)`,
                  /* Weight, not colour, marks the current crumb: the parents are
                     a lighter ink rather than link blue. */
                  color: last ? '#1c1a17' : '#6b665e',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150,
                }}
              >
                {i === 0 ? 'Classicverse' : n.name}
              </button>
            </span>
          );
        })}
      </div>

      <RetroButton icon label={searchOpen ? 'Close search' : 'Search'} active={searchOpen} onClick={onSearch} title="Search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#1c1a17" strokeWidth="2.6" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#1c1a17" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </RetroButton>
      <RetroButton icon label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={onToggleMute} title={muted ? 'Unmute' : 'Mute'} silent>
        <svg width="15" height="13" viewBox="0 0 16 14" aria-hidden="true">
          <path d="M1 5 H4 L8 1.5 V12.5 L4 9 H1 Z" fill="#1c1a17" />
          {muted ? (
            <path d="M10.5 5 L14.5 9 M14.5 5 L10.5 9" stroke="#1c1a17" strokeWidth="1.4" strokeLinecap="round" />
          ) : (
            <>
              <path d="M11 4.2 Q12.6 7 11 9.8" stroke="#1c1a17" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M12.6 2.4 Q15.2 7 12.6 11.6" stroke="#1c1a17" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </>
          )}
        </svg>
      </RetroButton>
    </div>
  );
}

function Arrow({ dir, muted }: { dir: 'left' | 'right' | 'up'; muted: boolean }) {
  const c = muted ? '#87837c' : '#1c1a17';
  const d = dir === 'left' ? 'M8 2 L3 6 L8 10 Z' : dir === 'right' ? 'M4 2 L9 6 L4 10 Z' : 'M6 2.5 L10 7.5 L2 7.5 Z';
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d={d} fill={c} /></svg>;
}
