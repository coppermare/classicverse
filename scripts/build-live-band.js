#!/usr/bin/env node
/**
 * build-live-band.js — snapshot the FM band into public/live-band.json
 *
 * Run: node scripts/build-live-band.js
 *
 * The Radio plays real broadcast stations on the frequencies they really
 * transmit on. The station list comes from the Radio Browser community index
 * (radio-browser.info), which has no frequency field — the frequency is read
 * out of each station's own name ("Radio Globo 88.5 HN") or its tags.
 *
 * Why a build-time snapshot rather than a fetch from the browser:
 *
 *   The index has ~36,000 playable stations and no way to ask for "only the
 *   ones with a frequency in the name", so finding them all means pulling the
 *   whole index — 43MB. Fine once, here, on a build machine; absurd to send to
 *   every visitor. Filtered down it is ~800KB of JSON, served from our own
 *   origin, compressed, and fetched once when the set is switched on.
 *
 * The streams stay live — only the directory is frozen. Re-run this whenever the
 * band feels thin; stations do go off the air.
 */

const fs = require('fs');
const path = require('path');

const API = 'https://de1.api.radio-browser.info/json/stations/search';
const UA = 'classicverse/1.0 (+https://github.com/coppermare/classicverse)';
const OUT = path.join(__dirname, '..', 'public', 'live-band.json');

/** The FM broadcast band, and the grid the dial is drawn on. */
const BAND_MIN = 87;
const BAND_MAX = 108;

/** A frequency in a station name: "88.5", "101,7", "Radio 4 92.0 MHz". */
const FREQ_IN_NAME = /(?<![\d.,])(\d{2,3}[.,]\d)(?![\d])/;
/** A tag that is nothing but a frequency — useless as a genre, good as a fallback. */
const FREQ_TAG = /^(\d{2,3}[.,]\d)\s*(fm|mhz)?$/i;

const GENRES = new Set([
  'news', 'talk', 'sport', 'sports', 'music', 'pop', 'rock', 'jazz', 'blues', 'soul', 'funk',
  'classical', 'opera', 'country', 'folk', 'metal', 'punk', 'indie', 'dance', 'electronic',
  'house', 'techno', 'trance', 'hiphop', 'hip hop', 'rap', 'rnb', 'reggae', 'ska', 'latin',
  'salsa', 'bachata', 'merengue', 'cumbia', 'ranchera', 'oldies', 'classic hits', 'top 40',
  'adult contemporary', 'gospel', 'christian', 'religious', 'chillout', 'ambient', 'world',
  'community', 'college', 'public radio', 'varied', 'variety',
]);

function frequencyOf(station) {
  const m = FREQ_IN_NAME.exec(station.name);
  if (m) return Number(m[1].replace(',', '.'));
  for (const tag of station.tags.split(',')) {
    const t = FREQ_TAG.exec(tag.trim());
    if (t) return Number(t[1].replace(',', '.'));
  }
  return null;
}

function genreOf(tags) {
  const clean = tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t && !FREQ_TAG.test(t));
  const tag = clean.find((t) => GENRES.has(t)) ?? clean[0];
  return tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : null;
}

/** "Radio Globo 88.5 HN - XHRED-FM - Grupo ACIR" -> "Radio Globo" */
function cleanName(name) {
  const head = name.split(/\s+[-–]\s+/)[0];
  return head
    .replace(FREQ_IN_NAME, '')
    .replace(/\b(FM|MHz)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim() || name.trim();
}

async function main() {
  const params = new URLSearchParams({
    limit: '100000',
    hidebroken: 'true',
    is_https: 'true',
    order: 'votes',
    reverse: 'true',
  });

  process.stdout.write('Fetching the station index (this is the 40MB part)… ');
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Radio Browser returned ${res.status}`);
  const raw = await res.json();
  console.log(`${raw.length} rows.`);

  // Only what a bare <audio> element can play on an https page: https streams,
  // no HLS (that needs a JS demuxer), and passing the index's own health check.
  const playable = raw.filter(
    (s) => s.url_resolved?.startsWith('https://') && !s.hls && s.lastcheckok,
  );

  const byFrequency = new Map();
  for (const s of playable) {
    const freq = frequencyOf(s);
    if (freq === null || freq < BAND_MIN || freq > BAND_MAX) continue;
    // One tenth of a MHz: the real spacing of the FM band, so a station keeps
    // the frequency it actually broadcasts on instead of being rounded onto a
    // coarser dial.
    const stop = (Math.round(freq * 10) / 10).toFixed(1);
    const list = byFrequency.get(stop) ?? [];
    // Ordered by votes upstream, so the most-listened station on a frequency is
    // the one the needle finds first.
    list.push({
      i: s.stationuuid.slice(0, 8),
      f: stop,
      n: cleanName(s.name).slice(0, 48),
      u: s.url_resolved,
      c: s.country || s.countrycode,
      g: genreOf(s.tags),
    });
    byFrequency.set(stop, list);
  }

  const stations = [...byFrequency.keys()]
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((k) => byFrequency.get(k));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(stations));

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  const busiest = [...byFrequency.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  console.log(`Playable: ${playable.length}. On the FM band: ${stations.length}.`);
  console.log(`Frequencies filled: ${byFrequency.size} (busiest ${busiest[0]} with ${busiest[1].length}).`);
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${kb}KB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
