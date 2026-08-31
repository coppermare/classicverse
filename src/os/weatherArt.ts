import { disc, fillRect, hLine, keyline, line, makeGrid, plot, vLine, type Grid } from './pixel';
import type { SkySymbol } from '@/data/weather';

/**
 * The weather symbols, drawn on the same lattice as the rest of the icon set.
 *
 * 32×32, flat faces, one hard keyline — a forecast symbol from the era when a
 * weather map was a presenter sticking magnets to a board. They are authored the
 * same way the desktop emblems are so that a sun on the outlook strip and a
 * folder on the desktop look like they came out of the same box of crayons.
 *
 * The one departure from icons.ts: shapes here are drawn as flat silhouettes and
 * the keyline is added afterwards by `keyline()`. A cloud is three overlapping
 * discs, and hand-drawing an outline around a union of discs means computing the
 * union — which is exactly what an outline pass does for free, and it stays
 * right when a shape is nudged.
 */

/**
 * The keyline, matching `P.ink` in the icon set.
 *
 * Declared here rather than imported from icons.ts so this module depends on
 * nothing but the pixel primitives. That keeps the arrow pointing one way —
 * icons.ts builds the desktop emblem *from* these symbols, so a import back the
 * other way would be a cycle, and the alternative was drawing the same cloud
 * twice and watching the two drift apart.
 */
const INK = '#241c0a';

const SUN = '#f2b33a';
const SUN_LIT = '#ffd978';
/**
 * White, not the paper cream it started as.
 *
 * A cloud drawn in #f2eee2 is within a shade of both the channel's paper and
 * the desktop's cream, so on the desktop the emblem lost its body entirely and
 * read as a bare outline with a sun stuck to it. A cloud is the one thing on
 * this palette that should be *brighter* than the page behind it.
 */
const CLOUD = '#ffffff';
const CLOUD_SHADE = '#c9c3b1';
const CLOUD_DARK = '#b9b3a3';
const CLOUD_DARK_SHADE = '#8f897b';
const WET = '#3f6fb5';
const WET_LIT = '#6f9ada';
/** Cool enough to read as ice, dark enough on paper to need no keyline. */
const FLAKE = '#7b93b8';
const BOLT = '#f5c518';
const MOON = '#f1ead6';

/** Outline in the icon set's keyline colour. */
const ink = (g: Grid) => keyline(g, INK);

/**
 * Lay `top` over `base`, keyline and all.
 *
 * Each element is outlined on its own grid before being stamped, so the cloud's
 * keyline cuts across the sun behind it. Outlining the pair together would
 * trace one silhouette around both and they would fuse into a single blob.
 */
function stamp(base: Grid, top: Grid) {
  for (let y = 0; y < top.length; y++) {
    for (let x = 0; x < top[y].length; x++) if (top[y][x]) base[y][x] = top[y][x];
  }
}

/** A fresh 32×32 layer. */
const layer = () => makeGrid(32, 32);

/**
 * A lumpy cumulus: three discs over a flat base, lit along the top.
 *
 * The trailing disc sits at `x + 22`, not `x + 23`. One pixel further right and
 * a cloud drawn at x = 3 — which is most of them — put its edge exactly on the
 * 32nd column, so the keyline that belongs a pixel beyond it had nowhere to go
 * and the cloud came out with its right side sliced flat.
 */
function cloud(g: Grid, x: number, y: number, scale: 'full' | 'small', dark = false) {
  const body = dark ? CLOUD_DARK : CLOUD;
  const shade = dark ? CLOUD_DARK_SHADE : CLOUD_SHADE;

  if (scale === 'full') {
    disc(g, x + 9, y + 7, 6, body);
    disc(g, x + 17, y + 5, 7.5, body);
    disc(g, x + 22, y + 8, 5, body);
    fillRect(g, x + 3, y + 7, 21, 7, body);
    // Underside, one row of shade — a lit edge, not a painted stripe.
    hLine(g, x + 4, y + 13, 19, shade);
    hLine(g, x + 5, y + 12, 17, shade);
  } else {
    disc(g, x + 6, y + 5, 4, body);
    disc(g, x + 11, y + 3.5, 5, body);
    disc(g, x + 15, y + 6, 3.5, body);
    fillRect(g, x + 2, y + 5, 14, 5, body);
    hLine(g, x + 3, y + 9, 12, shade);
  }
}

/**
 * The sun, with eight rays. `rays` off tucks it behind a cloud.
 *
 * Rays reach `r + 4`, not further. They used to run to `r + 5`, which put the
 * north and west tips of the partly-cloudy sun outside the 32×32 grid — and
 * because the keyline sits a pixel beyond the shape, the rays lost their
 * outlines a pixel before that. Half the symbols had a sun that looked snapped
 * off against the edge of its own tile.
 */
function sun(g: Grid, cx: number, cy: number, r: number, rays = true) {
  if (rays) {
    const inner = r + 2;
    const reach = r + 4;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      line(
        g,
        Math.round(cx + Math.cos(a) * inner), Math.round(cy + Math.sin(a) * inner),
        Math.round(cx + Math.cos(a) * reach), Math.round(cy + Math.sin(a) * reach),
        SUN,
      );
    }
  }
  disc(g, cx, cy, r, SUN);
  disc(g, cx - r * 0.3, cy - r * 0.3, r * 0.45, SUN_LIT);
}

/**
 * A crescent — a disc with a bite taken out of it.
 *
 * `biteBelow` moves the bite from the upper right to the lower right, which
 * puts the crescent's thick end at the top instead of the bottom. That is what
 * the partly-cloudy moon needs: the cloud covers everything below it, so a
 * crescent fattest at the bottom shows only its thin tip and reads as a hook.
 * The full moon has no such problem and keeps the bite high, where the shadow
 * on a real waning crescent falls.
 */
function moon(g: Grid, cx: number, cy: number, r: number, biteBelow = false) {
  disc(g, cx, cy, r, MOON);
  // Carve rather than overpaint: the icon sits on whatever the screen is, so a
  // background-coloured bite would show as a coloured wedge on anything else.
  const bx = cx + r * 0.62;
  const by = cy + (biteBelow ? r * 0.42 : -r * 0.42);
  const br = r * 0.95;
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[y].length; x++) {
      if ((x - bx) ** 2 + (y - by) ** 2 <= br * br) g[y][x] = null;
    }
  }
}

/** Falling rain: slanted strokes, staggered so they don't read as a comb. */
function rain(g: Grid, y: number, heavy: boolean) {
  const cols = heavy ? [7, 13, 19, 25] : [9, 16, 23];
  cols.forEach((x, i) => {
    const top = y + (i % 2 === 0 ? 0 : 2);
    line(g, x, top, x - 2, top + 5, WET);
    plot(g, x - 2, top + 5, WET_LIT);
  });
}

/** Drizzle: short dashes, lighter and shorter than rain. */
function drizzle(g: Grid, y: number) {
  [9, 16, 23].forEach((x, i) => {
    const top = y + (i % 2 === 0 ? 0 : 2);
    vLine(g, x, top, 2, WET_LIT);
    vLine(g, x, top + 3, 2, WET_LIT);
  });
}

/**
 * Snow: six-point stars, drawn in slate and left un-outlined.
 *
 * The keyline is what makes every other shape here read, and it is exactly what
 * a snowflake cannot survive. A flake is mostly negative space; wrap each arm in
 * ink and the gaps between the arms fill with outline, so thin arms came out as
 * hollow diamonds and fat ones fused into solid blobs. Neither looked like snow.
 *
 * So the flakes carry their own contrast instead — a cool slate that sits dark
 * enough against the paper to need no outline at all, and reads as ice rather
 * than as the blue used for rain.
 */
function snow(g: Grid, y: number) {
  ([[8, 0], [16, 3], [24, 1]] as const).forEach(([x, drop]) => {
    const cy = y + drop;
    vLine(g, x, cy - 3, 7, FLAKE);
    for (let d = -2; d <= 2; d++) {
      // The two diagonals of a six-point star. Skipping the centre keeps the
      // arms from thickening into a blob where all three cross.
      if (d === 0) continue;
      plot(g, x + d, cy + d, FLAKE);
      plot(g, x + d, cy - d, FLAKE);
    }
  });
}

/* ── The nine symbols ───────────────────────────────────────── */

function clearSky(night: boolean): Grid {
  const g = layer();
  if (night) moon(g, 16, 15, 9);
  else sun(g, 16, 15, 8);
  ink(g);
  return g;
}

function partly(night: boolean): Grid {
  const g = layer();
  // Behind the cloud and clear of its top edge, so both read at a glance.
  //
  // The moon sits higher and further left than the sun does. A disc peeking
  // over a cloud still reads as a sun from any sliver of it, but a crescent
  // has a thin end, and half-hidden it stopped reading as a moon at all — it
  // came out as a stray hook snagged on the cloud's shoulder.
  if (night) moon(g, 10, 7, 5.5, true);
  else sun(g, 12, 10, 5);
  ink(g);

  const front = layer();
  cloud(front, 3, 13, 'full');
  ink(front);
  stamp(g, front);
  return g;
}

/**
 * Two clouds, one behind the other — the sky with nothing else in it.
 *
 * The back cloud is offset up and to the *right*. Centred above the front one
 * it read as a dark hump growing out of a single cloud rather than as a second
 * cloud behind it, which left overcast and partly-cloudy near-identical in the
 * strip.
 */
function overcast(): Grid {
  const g = layer();
  cloud(g, 11, 3, 'small', true);
  ink(g);

  const front = layer();
  cloud(front, 1, 11, 'full');
  ink(front);
  stamp(g, front);
  return g;
}

function fog(): Grid {
  const g = layer();
  cloud(g, 3, 6, 'full');
  ink(g);
  // Layers of haze under it — offset ends, so it reads as drifting banks
  // rather than as a barcode.
  const bars: [number, number, number][] = [[5, 24, 22], [8, 27, 18], [4, 30, 20]];
  for (const [x, y, w] of bars) {
    hLine(g, x, y, w, CLOUD_DARK_SHADE);
    hLine(g, x + 2, y + 1, w - 4, INK);
  }
  return g;
}

function precip(kind: 'rain' | 'drizzle' | 'showers' | 'snow'): Grid {
  const g = layer();
  // Showers keep a patch of sun: that is the difference between rain and a
  // shower, and the strip is unreadable if the two share a symbol. No rays —
  // the cloud has to sit high enough to leave room for the rain beneath it,
  // and a rayed sun above that would run off the top of the grid.
  if (kind === 'showers') {
    sun(g, 9, 8, 5, false);
    ink(g);
  }

  const front = layer();
  cloud(front, 3, kind === 'showers' ? 10 : 5, 'full');
  ink(front);
  stamp(g, front);

  const below = layer();
  if (kind === 'rain') rain(below, 23, true);
  else if (kind === 'showers') rain(below, 23, false);
  else if (kind === 'drizzle') drizzle(below, 23);
  else snow(below, 25);
  // Snow is the one thing here that draws its own contrast — see snow().
  if (kind !== 'snow') ink(below);
  stamp(g, below);
  return g;
}

function storm(): Grid {
  const g = layer();
  cloud(g, 3, 4, 'full', true);
  ink(g);

  const bolt = layer();
  // A zigzag, drawn as three widening bars rather than a polygon — a diagonal
  // bolt at this size turns to mush without hand-placed steps.
  fillRect(bolt, 17, 21, 5, 2, BOLT);
  fillRect(bolt, 15, 23, 5, 2, BOLT);
  fillRect(bolt, 13, 25, 7, 2, BOLT);
  fillRect(bolt, 15, 27, 4, 2, BOLT);
  fillRect(bolt, 13, 29, 3, 2, BOLT);
  ink(bolt);
  stamp(g, bolt);
  return g;
}

/**
 * The symbol for a condition.
 *
 * `night` only changes the two symbols that have a sun in them; a rain cloud at
 * midnight is the same rain cloud.
 */
export function skyGrid(symbol: SkySymbol, night = false): Grid {
  switch (symbol) {
    case 'clear': return clearSky(night);
    case 'partly': return partly(night);
    case 'overcast': return overcast();
    case 'fog': return fog();
    case 'rain': return precip('rain');
    case 'drizzle': return precip('drizzle');
    case 'showers': return precip('showers');
    case 'snow': return precip('snow');
    case 'storm': return storm();
  }
}
