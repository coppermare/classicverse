import {
  blit, disc, fillRect, hLine, line, makeGrid, plot, ring, strokeRect, vLine, type Grid,
} from './pixel';

/**
 * The icon set, drawn on a 90s palette.
 *
 * Emblems are 32×32 — the actual Windows 95/98 large-icon grid — and the folder
 * is 64×52, so an emblem stamped on a folder lands on the same lattice at the
 * same pixel size. Everything is flat-shaded with a hard keyline and a two-tone
 * light/shadow, which is what makes a period icon read as a period icon rather
 * than a small illustration.
 *
 * The palette is deliberately a half-step off true VGA: authentic Win95 folders
 * are #FFFF00 with pure black outlines, which is punishing next to the set's warm
 * cream desktop. These are the same values pulled slightly toward the cabinet.
 */

export const P = {
  ink: '#241c0a',      // keyline
  shadow: '#8f6415',   // underside / right face
  base: '#e8c455',     // folder body
  light: '#f7e08c',    // lit top face
  hi: '#fff6cd',       // specular edge
  paper: '#f6f1e2',
  paperShade: '#cfc7b2',
  red: '#b3282d',
  redDark: '#7a1a1e',
  blue: '#2a4a8a',
  blueLight: '#5b7fc0',
  green: '#1f6f3e',
  wood: '#8a5a2b',
  woodDark: '#5c3a18',
  steel: '#9aa0a8',
  steelDark: '#5c626a',
  white: '#ffffff',
  black: '#141008',
} as const;

/* ── Emblems (32×32) ───────────────────────────────────────── */

/** A saloon in profile: cabin, bonnet, two wheels. */
function carsIcon(): Grid {
  const g = makeGrid(32, 32);
  // body
  fillRect(g, 3, 17, 26, 6, P.red);
  fillRect(g, 3, 21, 26, 2, P.redDark);
  // bonnet slope + roof
  fillRect(g, 9, 12, 14, 5, P.red);
  fillRect(g, 10, 11, 12, 1, P.red);
  // glasshouse
  fillRect(g, 11, 13, 4, 3, P.paper);
  fillRect(g, 16, 13, 5, 3, P.paper);
  // keyline
  hLine(g, 10, 10, 12, P.ink);
  hLine(g, 3, 16, 6, P.ink);
  hLine(g, 23, 16, 6, P.ink);
  hLine(g, 3, 23, 26, P.ink);
  vLine(g, 2, 17, 6, P.ink);
  vLine(g, 29, 17, 6, P.ink);
  vLine(g, 9, 11, 5, P.ink);
  vLine(g, 22, 11, 5, P.ink);
  plot(g, 9, 10, P.ink); plot(g, 22, 10, P.ink);
  // wheels
  disc(g, 9, 24, 3.4, P.ink);
  disc(g, 23, 24, 3.4, P.ink);
  disc(g, 9, 24, 1.4, P.steel);
  disc(g, 23, 24, 1.4, P.steel);
  // lamp
  fillRect(g, 3, 18, 2, 2, P.light);
  return g;
}

/** A chequered flag on a pole. */
function f1Icon(): Grid {
  const g = makeGrid(32, 32);
  vLine(g, 6, 3, 27, P.ink);
  vLine(g, 7, 3, 27, P.steelDark);
  // flag field 8..29 x 5..20, 4px chequers
  fillRect(g, 8, 5, 21, 16, P.paper);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      if ((r + c) % 2 === 0) fillRect(g, 8 + c * 4, 5 + r * 4, 4, 4, P.ink);
    }
  }
  strokeRect(g, 8, 5, 21, 16, P.ink);
  // a little wave on the free edge
  vLine(g, 29, 7, 12, P.ink);
  return g;
}

/** A period receiver: cabinet, tuning dial, grille, antenna. */
function radioIcon(): Grid {
  const g = makeGrid(32, 32);
  line(g, 22, 11, 28, 3, P.ink);
  disc(g, 28, 3, 1.6, P.red);
  // cabinet
  fillRect(g, 2, 11, 28, 17, P.wood);
  fillRect(g, 2, 24, 28, 4, P.woodDark);
  hLine(g, 3, 12, 26, P.light);
  strokeRect(g, 2, 11, 28, 17, P.ink);
  // dial
  disc(g, 9, 19, 5, P.ink);
  disc(g, 9, 19, 4, P.paper);
  vLine(g, 9, 15, 4, P.red);
  // grille
  fillRect(g, 17, 14, 10, 10, P.black);
  strokeRect(g, 17, 14, 10, 10, P.ink);
  for (let i = 0; i < 4; i++) hLine(g, 18, 16 + i * 2, 8, P.steel);
  // feet
  fillRect(g, 4, 28, 3, 2, P.ink);
  fillRect(g, 25, 28, 3, 2, P.ink);
  return g;
}

/** A listings page: red masthead over ruled rows. */
function guideIcon(): Grid {
  const g = makeGrid(32, 32);
  fillRect(g, 5, 3, 22, 26, P.paper);
  fillRect(g, 5, 3, 22, 6, P.red);
  hLine(g, 6, 4, 20, '#d8595c');
  strokeRect(g, 5, 3, 22, 26, P.ink);
  hLine(g, 5, 9, 22, P.ink);
  for (let i = 0; i < 5; i++) hLine(g, 8, 13 + i * 3, i === 4 ? 10 : 16, P.ink);
  for (let i = 0; i < 5; i++) hLine(g, 8, 14 + i * 3, i === 4 ? 10 : 16, P.paperShade);
  return g;
}

/** An info disc. */
function infoIcon(): Grid {
  const g = makeGrid(32, 32);
  disc(g, 16, 16, 13, P.ink);
  disc(g, 16, 16, 12, P.blue);
  disc(g, 13, 12, 5, P.blueLight);
  ring(g, 16, 16, 12, P.ink);
  fillRect(g, 14, 8, 4, 4, P.white);
  fillRect(g, 14, 14, 4, 10, P.white);
  fillRect(g, 12, 22, 8, 2, P.white);
  fillRect(g, 12, 14, 3, 2, P.white);
  return g;
}

/** A decade folder's stamp: two big numerals, e.g. "60s". */
function labelIcon(text: string): Grid {
  const g = makeGrid(32, 32);
  const D: Record<string, string[]> = {
    '0': ['0110', '1001', '1001', '1001', '1001', '1001', '0110'],
    '1': ['0010', '0110', '0010', '0010', '0010', '0010', '0111'],
    '2': ['0110', '1001', '0001', '0010', '0100', '1000', '1111'],
    '3': ['1110', '0001', '0001', '0110', '0001', '0001', '1110'],
    '4': ['0010', '0110', '1010', '1010', '1111', '0010', '0010'],
    '5': ['1111', '1000', '1110', '0001', '0001', '1001', '0110'],
    '6': ['0110', '1000', '1000', '1110', '1001', '1001', '0110'],
    '7': ['1111', '0001', '0010', '0010', '0100', '0100', '0100'],
    '8': ['0110', '1001', '1001', '0110', '1001', '1001', '0110'],
    '9': ['0110', '1001', '1001', '0111', '0001', '0001', '0110'],
    s: ['0000', '0111', '1000', '0110', '0001', '1110', '0000'],
  };
  const chars = text.split('');
  const cw = 5, sc = 2; // 4px glyph + 1 gap, doubled
  const totalW = chars.length * cw * sc - sc;
  let x = Math.floor((32 - totalW) / 2);
  const y = 8;
  for (const ch of chars) {
    const rows = D[ch];
    if (rows) {
      for (let j = 0; j < rows.length; j++) {
        for (let i = 0; i < rows[j].length; i++) {
          if (rows[j][i] === '1') {
            fillRect(g, x + i * sc, y + j * sc, sc, sc, P.ink);
            fillRect(g, x + i * sc, y + j * sc, sc, 1, P.shadow);
          }
        }
      }
    }
    x += cw * sc;
  }
  return g;
}

export const EMBLEMS: Record<string, () => Grid> = {
  cars: carsIcon,
  f1: f1Icon,
  radio: radioIcon,
  guide: guideIcon,
  info: infoIcon,
};

export function emblemFor(id: string): Grid | null {
  return EMBLEMS[id] ? EMBLEMS[id]() : null;
}

export function labelEmblem(text: string): Grid {
  return labelIcon(text);
}

/* ── The folder ────────────────────────────────────────────── */

export const FOLDER_W = 64;
export const FOLDER_H = 58;

/**
 * A closed folder: a cut manila tab behind a full-width body.
 *
 * The tab is a trapezoid — vertical on the left, slanting out to the right —
 * because that's how a real file tab is cut, and it's what separates a folder
 * from a plain box at a glance. An earlier pass had a square tab plus a white
 * "paper" sliver peeking out beside it; the sliver read as a disconnected second
 * tab, and no closed folder of the era had one. Gone.
 *
 * Flat faces, one hard keyline, one lit edge, one shaded edge. No gradients — a
 * 90s icon didn't have any.
 */
export function folderGrid(emblem?: Grid | null, enabled = true): Grid {
  const g = makeGrid(FOLDER_W, FOLDER_H);

  const TAB_TOP = 3, TAB_BOT = 12;
  const tabRight = (y: number) =>
    24 + Math.round(((y - TAB_TOP) / (TAB_BOT - TAB_TOP)) * 6);

  // Tab, drawn behind the body
  for (let y = TAB_TOP; y <= TAB_BOT; y++) {
    hLine(g, 3, y, tabRight(y) - 3, P.base);
  }
  hLine(g, 4, TAB_TOP + 1, 19, P.light);          // lit top face
  hLine(g, 3, TAB_TOP, tabRight(TAB_TOP) - 3, P.ink);
  vLine(g, 2, TAB_TOP, TAB_BOT - TAB_TOP + 1, P.ink);
  for (let y = TAB_TOP; y <= TAB_BOT; y++) plot(g, tabRight(y), y, P.ink);

  // Body — deep enough to carry a 32px emblem with air above and below it.
  fillRect(g, 2, 11, 60, 45, P.base);
  hLine(g, 3, 12, 58, P.hi);                      // specular
  hLine(g, 3, 13, 58, P.light);
  vLine(g, 3, 13, 41, P.light);                   // lit left edge
  // Shaded underside + right face — one row of each. Any thicker and the
  // underside reads as a painted stripe instead of a lit edge.
  hLine(g, 3, 53, 58, P.base);
  hLine(g, 3, 54, 58, P.shadow);
  vLine(g, 60, 13, 42, P.shadow);
  strokeRect(g, 2, 11, 60, 45, P.ink);

  if (emblem) {
    // Centred on the body, below the tab line.
    blit(g, emblem, 16, 17);
  }

  if (!enabled) {
    // Greyed the period way: drop the colour, keep the shape.
    for (let y = 0; y < g.length; y++) {
      for (let x = 0; x < g[y].length; x++) {
        const c = g[y][x];
        if (!c) continue;
        g[y][x] = c === P.ink ? '#9a958c' : (x + y) % 2 === 0 ? '#d6d1c6' : '#c4bfb4';
      }
    }
  }
  return g;
}
