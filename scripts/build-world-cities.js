#!/usr/bin/env node
/**
 * build-world-cities.js — snapshot the world's cities into src/data/worldCities.ts
 *
 * Run: node scripts/build-world-cities.js
 *
 * The Weather channel's dial needs somewhere to sweep. Twelve hand-picked
 * cities was a demo; this fills the dial from GeoNames — the canonical open
 * geographic database (CC-BY 4.0, geonames.org) — so turning the knob is a tour
 * of the actual world rather than of one person's shortlist.
 *
 * Anywhere on Earth is still reachable: the search box queries Open-Meteo's live
 * geocoder (also GeoNames) and covers every populated place, down to villages.
 * What this builds is only the *default* set — the stops already on the dial
 * before you search — so it is deliberately curated, not exhaustive:
 *
 *   - `cities15000` (population ≥ 15,000, ~26k cities) is the source.
 *   - At most PER_COUNTRY cities per country, so the list is a world tour and
 *     not a ranking of China and India.
 *   - From that pool, the TARGET most populous, so every stop is a city a
 *     visitor is likely to recognise.
 *   - Sorted west-to-east by longitude, so sweeping the knob spins the globe.
 *
 * A ~150-city snapshot is a few KB of TypeScript, imported directly — no runtime
 * fetch, no loading state, the interface unchanged. Re-run to refresh; cities do
 * not move, so rarely.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const CITIES_URL = 'https://download.geonames.org/export/dump/cities15000.zip';
const COUNTRY_URL = 'https://download.geonames.org/export/dump/countryInfo.txt';
const OUT = path.join(__dirname, '..', 'src', 'data', 'worldCities.ts');

/** How many cities land on the dial, and how many any one country may claim. */
const TARGET = 150;
const PER_COUNTRY = 3;

/** cities15000.txt is tab-separated; these are the columns this reads. */
const COL = { name: 1, lat: 4, lon: 5, countryCode: 8, population: 14 };

function download(url, dest) {
  execSync(`curl -sSL -o "${dest}" "${url}"`, { stdio: ['ignore', 'ignore', 'inherit'] });
}

/** ISO2 → country name, from GeoNames' own countryInfo table. */
function loadCountryNames(tmp) {
  const txt = path.join(tmp, 'countryInfo.txt');
  download(COUNTRY_URL, txt);
  const names = new Map();
  for (const line of fs.readFileSync(txt, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const c = line.split('\t');
    // ISO code in column 0, country name in column 4.
    if (c[0] && c[4]) names.set(c[0], c[4]);
  }
  return names;
}

function loadCities(tmp) {
  const zip = path.join(tmp, 'cities15000.zip');
  download(CITIES_URL, zip);
  execSync(`unzip -o -q "${zip}" -d "${tmp}"`);
  const txt = path.join(tmp, 'cities15000.txt');

  const cities = [];
  for (const line of fs.readFileSync(txt, 'utf8').split('\n')) {
    if (!line) continue;
    const c = line.split('\t');
    const population = Number(c[COL.population]) || 0;
    if (!population) continue;
    cities.push({
      name: c[COL.name],
      countryCode: c[COL.countryCode],
      latitude: Number(c[COL.lat]),
      longitude: Number(c[COL.lon]),
      population,
    });
  }
  return cities;
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-cities-'));

  const countryNames = loadCountryNames(tmp);
  const all = loadCities(tmp);

  // Keep each country's most populous few, so the dial spreads across the globe
  // instead of stacking up wherever the biggest cities happen to cluster.
  const perCountry = new Map();
  for (const city of all) {
    const list = perCountry.get(city.countryCode) ?? [];
    list.push(city);
    perCountry.set(city.countryCode, list);
  }
  const pool = [];
  for (const list of perCountry.values()) {
    list.sort((a, b) => b.population - a.population);
    pool.push(...list.slice(0, PER_COUNTRY));
  }

  // The most populous of that spread, then arranged W→E for the sweep.
  const chosen = pool
    .sort((a, b) => b.population - a.population)
    .slice(0, TARGET)
    .sort((a, b) => a.longitude - b.longitude);

  const rows = chosen.map((c) => {
    const country = countryNames.get(c.countryCode) ?? c.countryCode;
    // A stable id from name+country — no GeoNames id is carried, so nothing here
    // depends on that table staying put between builds.
    const slug = `${c.name}-${c.countryCode}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const q = (s) => `'${String(s).replace(/'/g, "\\'")}'`;
    return `  { id: ${q(`p-${slug}`)}, name: ${q(c.name)}, country: ${q(country)}, `
      + `latitude: ${c.latitude}, longitude: ${c.longitude} },`;
  });

  const banner = `/**
 * The dial's default stops — generated, do not edit by hand.
 *
 * Built by scripts/build-world-cities.js from GeoNames cities15000 (CC-BY 4.0,
 * https://www.geonames.org/). ${chosen.length} cities, at most ${PER_COUNTRY} per country,
 * ordered west-to-east so the tuning knob spins the globe.
 *
 * This is only what is on the dial before you search. The search box reaches
 * every populated place on Earth through Open-Meteo's live geocoder.
 */
import type { Place } from './weather';

export const WORLD_CITIES: Place[] = [
${rows.join('\n')}
];
`;

  fs.writeFileSync(OUT, banner);
  fs.rmSync(tmp, { recursive: true, force: true });

  const countries = new Set(chosen.map((c) => c.countryCode)).size;
  console.log(`Scanned ${all.length} cities. Chose ${chosen.length} across ${countries} countries.`);
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${(fs.statSync(OUT).size / 1024).toFixed(1)}KB.`);
}

main();
