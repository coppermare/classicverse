'use client';

import { useEffect, useRef } from 'react';
import PixelFolder from './PixelFolder';
import type { F1Team } from '@/types/f1';

interface F1TeamsScreenProps {
  teams: F1Team[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

// Ferrari's real-world mark is a yellow shield, black prancing horse, and a
// green/white/red top stripe — the generic monochrome brand icon in f1Teams.ts
// doesn't read as "Ferrari" at a glance, so it's drawn here instead: an
// original, simplified badge (not a trace of the trademarked artwork).
function FerrariShield({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size * (28 / 22)} viewBox="0 0 22 28" role="img" aria-label="Ferrari">
      <path
        d="M1 1 H21 V15.5 C21 21.5 16.5 25.5 11 27 C5.5 25.5 1 21.5 1 15.5 Z"
        fill="#FFD200" stroke="#0a0a0a" strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d="M1.6 1.6 H20.4 V4.6 H1.6 Z" fill="#008C45" />
      <path d="M1.6 4.6 H20.4 V6.4 H1.6 Z" fill="#F4F5F0" />
      <path d="M1.6 6.4 H20.4 V8.2 H1.6 Z" fill="#CD212A" />
      {/* Horse mark — a chess-knight glyph reads unambiguously as a horse head/neck
          in profile at this size, which a hand-drawn silhouette did not. */}
      <text
        x="11" y="20.5" textAnchor="middle"
        fontSize="15" fontWeight="700" fill="#0a0a0a"
        style={{ fontFamily: 'Georgia, "Noto Sans Symbols2", serif' }}
      >
        ♞
      </text>
    </svg>
  );
}

// Folders are large, matching HomeScreen's channel folders, so the two feel
// like the same set of controls rather than two different densities.
const FOLDER_SCALE = 3;

// A team tile — the shared pixel folder (same muted yellow for every team, no
// per-team tinting), stamped directly with the team's mark on the body (no
// background chip, so each emblem reads on its own rather than boxed in a
// generic white panel).
function TeamTile({ team, scale = 3 }: { team: F1Team; scale?: number }) {
  const { id, enabled, name, logo } = team;
  const emblem = 34 * (scale / 3);
  return (
    <PixelFolder enabled={enabled} scale={scale}>
      {id === 'ferrari' ? (
        <FerrariShield size={32 * (scale / 3)} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo}
          alt={`${name} logo`}
          style={{ width: emblem, height: emblem, objectFit: 'contain', display: 'block' }}
        />
      )}
    </PixelFolder>
  );
}

export default function F1TeamsScreen({ teams, selectedId, onSelect, onOpen }: F1TeamsScreenProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // The row is wider than the screen and clipped by it, so selection needs to
  // actively pan the strip — matches HomeScreen's channel row.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedId]);

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 30, margin: '0 auto', padding: '0 24px' }}>
          {teams.map((team) => {
            const active = team.id === selectedId;
            return (
              <button
                key={team.id}
                ref={active ? activeRef : undefined}
                type="button"
                onMouseEnter={() => onSelect(team.id)}
                onClick={() => { onSelect(team.id); if (team.enabled) onOpen(team.id); }}
                aria-label={`${team.name}${team.enabled ? '' : ' (coming soon)'}`}
                aria-current={active ? 'true' : undefined}
                disabled={!team.enabled}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  flexShrink: 0,
                  padding: '12px 10px 10px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: team.enabled ? 'pointer' : 'default',
                  background: active ? 'rgba(74,110,158,0.16)' : 'transparent',
                  width: 176,
                }}
              >
                <TeamTile team={team} scale={FOLDER_SCALE} />
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                  color: team.enabled ? '#2c2620' : '#8a8274',
                  letterSpacing: '0.01em', textAlign: 'center',
                }}>
                  {team.name}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#8a8274', textAlign: 'center' }}>
                  {team.enabled ? team.tagline : 'Coming soon'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
