/**
 * A tiny pixel-art engine.
 *
 * Icons are composed on an integer grid and rendered as crisp SVG rects, the way
 * a 90s icon editor worked. Drawing with primitives rather than ASCII maps keeps
 * the shapes editable — a wheel is a disc at a coordinate, not 32 lines of
 * characters nobody will ever re-align.
 *
 * A folder and the emblem stamped on it are composited into ONE grid before
 * rendering, so every pixel in the finished icon is the same size and sits on
 * the same lattice. Previously the folder was pixel art with a smooth vector
 * glyph laid over it, which read as two different drawings in one icon.
 *
 * Rows are run-length encoded at render time: a 60-pixel run of folder body
 * becomes one rect instead of 60. The home screen draws five icons at roughly
 * 3,300 cells each — without this it would be ~14,000 DOM nodes.
 */

export type Grid = (string | null)[][];

export function makeGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array<string | null>(w).fill(null));
}

export const gridW = (g: Grid) => g[0]?.length ?? 0;
export const gridH = (g: Grid) => g.length;

export function plot(g: Grid, x: number, y: number, c: string | null) {
  if (y < 0 || y >= g.length) return;
  if (x < 0 || x >= g[y].length) return;
  g[y][x] = c;
}

export function fillRect(g: Grid, x: number, y: number, w: number, h: number, c: string) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) plot(g, i, j, c);
}

export function hLine(g: Grid, x: number, y: number, w: number, c: string) {
  for (let i = x; i < x + w; i++) plot(g, i, y, c);
}

export function vLine(g: Grid, x: number, y: number, h: number, c: string) {
  for (let j = y; j < y + h; j++) plot(g, x, j, c);
}

/** Outline only — the 1px black keyline every Win95 icon has. */
export function strokeRect(g: Grid, x: number, y: number, w: number, h: number, c: string) {
  hLine(g, x, y, w, c);
  hLine(g, x, y + h - 1, w, c);
  vLine(g, x, y, h, c);
  vLine(g, x + w - 1, y, h, c);
}

/** A filled circle, rasterised so the edge steps cleanly instead of blurring. */
export function disc(g: Grid, cx: number, cy: number, r: number, c: string) {
  for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) {
    for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
      const dx = i - cx, dy = j - cy;
      if (dx * dx + dy * dy <= r * r) plot(g, i, j, c);
    }
  }
}

/** A circle outline of 1px. */
export function ring(g: Grid, cx: number, cy: number, r: number, c: string) {
  for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) {
    for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
      const dx = i - cx, dy = j - cy;
      const d = dx * dx + dy * dy;
      if (d <= r * r && d > (r - 1) * (r - 1)) plot(g, i, j, c);
    }
  }
}

/** A 1px diagonal, Bresenham — for antennae, flag poles, needles. */
export function line(g: Grid, x0: number, y0: number, x1: number, y1: number, c: string) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    plot(g, x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** Copy `src` onto `dst` at (x, y). Transparent cells don't overwrite. */
export function blit(dst: Grid, src: Grid, x: number, y: number) {
  for (let j = 0; j < src.length; j++) {
    for (let i = 0; i < src[j].length; i++) {
      const c = src[j][i];
      if (c) plot(dst, x + i, y + j, c);
    }
  }
}

export interface Run { x: number; y: number; w: number; c: string }

/** Merge each row's identical neighbours into single spans. */
export function toRuns(g: Grid): Run[] {
  const runs: Run[] = [];
  for (let y = 0; y < g.length; y++) {
    let x = 0;
    while (x < g[y].length) {
      const c = g[y][x];
      if (!c) { x++; continue; }
      let w = 1;
      while (x + w < g[y].length && g[y][x + w] === c) w++;
      runs.push({ x, y, w, c });
      x += w;
    }
  }
  return runs;
}
