'use client';

import { useMemo } from 'react';
import { gridH, gridW, toRuns, type Grid } from './pixel';

/**
 * Draws a pixel grid as crisp SVG.
 *
 * shape-rendering=crispEdges plus integer coordinates means no anti-aliasing:
 * a pixel is a hard square, which is the whole point. `scale` sets how many CSS
 * pixels one grid cell occupies — the icons are authored at the real Win95 sizes
 * (32×32 emblems, 64×52 folders) and rendered around 1.8×, so they read as fine
 * pixel art rather than a handful of chunky blocks.
 */
export default function PixelArt({ grid, scale, style }: { grid: Grid; scale: number; style?: React.CSSProperties }) {
  const w = gridW(grid);
  const h = gridH(grid);
  const runs = useMemo(() => toRuns(grid), [grid]);

  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ display: 'block', imageRendering: 'pixelated', ...style }}
    >
      {runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </svg>
  );
}
