'use client';

import type { ReactElement, ReactNode } from 'react';

/**
 * Tiny pixel-art renderer. Each row of `map` is a string of single-char keys;
 * every char that exists in `palette` becomes one crisp 1×1 cell.
 * shape-rendering=crispEdges + integer coords give the deliberately blocky,
 * low-resolution retro look (no anti-aliasing, no smoothing).
 */
function PixelArt({ map, palette, scale }: { map: string[]; palette: Record<string, string>; scale: number }) {
  const rows = map.length;
  const cols = Math.max(...map.map((r) => r.length));
  const cells: ReactElement[] = [];
  for (let y = 0; y < rows; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const fill = palette[row[x]];
      if (fill) cells.push(<rect key={`${x},${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  }
  return (
    <svg
      width={cols * scale}
      height={rows * scale}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

// Document folder — Windows-98-style icon silhouette: a back tab peeking up,
// a sliver of "paper" visible behind it, and a front flap. Flat-shaded (thin
// highlight/shadow lines, not bevel bands) to match the plain, low-key look
// of genuine Win98 folder icons, drawn taller (44×36) than square.
const FOLDER_MAP = [
  '..oooooooooooooooo..........................',
  '..ohhhhhhhhhhhhhho..........................',
  '..obbbbbbbbbbbbbbo......ooooooooooooooo.....',
  '..obbbbbbbbbbbbbbo......opppppppppppppo.....',
  '..obbbbbbbbbbbbbbo......opppppppppppppo.....',
  '..obbbbbbbbbbbbbbo......ooooooooooooooo.....',
  '..obbbbbbbbbbbbbbooooooooooooooooooooooooo..',
  '..ohhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhho..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo..',
  '..osssssssssssssssssssssssssssssssssssssso..',
  '...oooooooooooooooooooooooooooooooooooooo...',
];
const FOLDER_COLS = 44;
const FOLDER_ROWS = 36;

// Every folder is the same light, muted yellow — real Windows 98 folders
// aren't per-app colour-coded, they're all this one manila tone.
const FOLDER_YELLOW = '#d9bd6e';

const FOLDER_PALETTE: Record<string, string> = {
  o: `color-mix(in srgb, ${FOLDER_YELLOW} 42%, #140d04)`,
  b: FOLDER_YELLOW,
  h: `color-mix(in srgb, ${FOLDER_YELLOW} 74%, #ffffff)`,
  s: `color-mix(in srgb, ${FOLDER_YELLOW} 66%, #000000)`,
  p: '#f4ecd8',
};

/**
 * The one folder used everywhere (Home channels, F1 teams, …). Renders a
 * pixel-art retro folder in the same muted yellow every time, with `children`
 * stamped as the emblem on the body — a white glyph, a logo chip, whatever
 * the caller passes.
 */
export default function PixelFolder({
  enabled = true,
  scale = 1.5,
  children,
}: {
  enabled?: boolean;
  /** Pixel-grid scale — the folder is 44×36 units. */
  scale?: number;
  children?: ReactNode;
}) {
  const width = FOLDER_COLS * scale;
  const height = FOLDER_ROWS * scale;
  const emblemTop = 8 * scale;
  return (
    <div style={{ position: 'relative', width, height, opacity: enabled ? 1 : 0.55 }}>
      <PixelArt map={FOLDER_MAP} palette={FOLDER_PALETTE} scale={scale} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: emblemTop, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))',
        }}
      >
        {children}
      </div>
    </div>
  );
}
