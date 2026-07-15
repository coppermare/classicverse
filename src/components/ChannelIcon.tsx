'use client';

// The emblem stamped on each channel folder. Every icon is drawn in colour on a
// dark outline so it reads against the folder's manila body — flat white strokes
// disappeared into the yellow and told you nothing about the channel.
//
// All icons share one 26×26 grid, one outline colour, and one stroke weight, so
// a row of folders reads as a single set rather than five unrelated drawings.

const OUTLINE = '#2b2013';
const CREAM = '#f4ecd8';

export type ChannelIconId = 'cars' | 'f1' | 'guide' | 'radio' | 'info';

export default function ChannelIcon({ id, size = 24 }: { id: string; size?: number }) {
  const frame = { width: size, height: size, viewBox: '0 0 26 26' };
  const line = { stroke: OUTLINE, strokeWidth: 1.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

  switch (id) {
    // A classic saloon in profile — the archive's subject, in its own deep red.
    case 'cars':
      return (
        <svg {...frame} aria-hidden="true">
          <path
            d="M2.6 17.6 Q2.6 13.8 6.2 13.1 L9.4 13.1 L12.1 9.6 Q12.9 8.7 14.3 8.7 L16.9 8.7 Q18.5 8.7 19.3 10.1 L20.9 13.1 Q23.4 13.7 23.4 16.2 L23.4 17.6 Z"
            fill="#9a2a2a" {...line}
          />
          <path d="M12.9 13.1 L14.9 10.4 L16.7 10.4 Q17.6 10.4 18 11.2 L19 13.1 Z" fill={CREAM} {...line} />
          <circle cx="8.2" cy="17.9" r="2.9" fill="#241a10" {...line} />
          <circle cx="18.6" cy="17.9" r="2.9" fill="#241a10" {...line} />
          <circle cx="8.2" cy="17.9" r="1.05" fill={CREAM} />
          <circle cx="18.6" cy="17.9" r="1.05" fill={CREAM} />
        </svg>
      );

    // A chequered flag — reads as motorsport instantly, unlike an abstract grid.
    case 'f1':
      return (
        <svg {...frame} aria-hidden="true">
          <g>
            <rect x="6" y="4.5" width="14.5" height="10.5" fill={CREAM} {...line} />
            <rect x="6" y="4.5" width="3.6" height="3.5" fill="#241a10" />
            <rect x="13.2" y="4.5" width="3.6" height="3.5" fill="#241a10" />
            <rect x="9.6" y="8" width="3.6" height="3.5" fill="#241a10" />
            <rect x="16.8" y="8" width="3.7" height="3.5" fill="#241a10" />
            <rect x="6" y="11.5" width="3.6" height="3.5" fill="#241a10" />
            <rect x="13.2" y="11.5" width="3.6" height="3.5" fill="#241a10" />
            <rect x="6" y="4.5" width="14.5" height="10.5" fill="none" {...line} />
          </g>
          <line x1="5.2" y1="3.4" x2="5.2" y2="22.6" stroke={OUTLINE} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );

    // A period radio set — wooden cabinet, tuning dial, grille, antenna.
    case 'radio':
      return (
        <svg {...frame} aria-hidden="true">
          <line x1="17.5" y1="9.5" x2="20.8" y2="3.8" stroke={OUTLINE} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="21.1" cy="3.4" r="1.15" fill="#9a2a2a" {...line} />
          <rect x="2.8" y="9.5" width="20.4" height="11.8" rx="1.8" fill="#8a5a2b" {...line} />
          <circle cx="8" cy="15.4" r="3.5" fill={CREAM} {...line} />
          <line x1="8" y1="15.4" x2="8" y2="12.8" stroke="#9a2a2a" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="13.6" y="12.2" width="7.4" height="6.4" rx="1" fill="#3d2a16" {...line} />
          <line x1="15.1" y1="13.9" x2="19.5" y2="13.9" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
          <line x1="15.1" y1="15.5" x2="19.5" y2="15.5" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
          <line x1="15.1" y1="17.1" x2="19.5" y2="17.1" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
        </svg>
      );

    // A listings page — red masthead over ruled rows.
    case 'guide':
      return (
        <svg {...frame} aria-hidden="true">
          <rect x="4.2" y="3.8" width="17.6" height="18.4" rx="1.4" fill={CREAM} {...line} />
          <path d="M4.2 5.2 A1.4 1.4 0 0 1 5.6 3.8 H20.4 A1.4 1.4 0 0 1 21.8 5.2 V8.2 H4.2 Z" fill="#9a2a2a" {...line} />
          <line x1="7" y1="11.4" x2="19" y2="11.4" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="14.6" x2="19" y2="14.6" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="17.8" x2="14.5" y2="17.8" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    // The project's own page — a blue info disc.
    case 'info':
      return (
        <svg {...frame} aria-hidden="true">
          <circle cx="13" cy="13" r="9.2" fill="#2a4a8a" {...line} />
          <circle cx="13" cy="8.6" r="1.35" fill={CREAM} />
          <line x1="13" y1="11.8" x2="13" y2="18.2" stroke={CREAM} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
