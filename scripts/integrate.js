#!/usr/bin/env node
/**
 * integrate.js — merge car-research/*.json into src/data/cars.ts
 *
 * Run: node scripts/integrate.js
 *
 * Reads every *.json file in car-research/, skips years already defined in
 * SKIP_YEARS (those are the original 10 vertical-slice records with richer
 * prose that live directly in cars.ts), converts the rest to TypeScript
 * CarRecord objects, and appends them to the CARS array in cars.ts.
 *
 * Safe to re-run — it looks at which years are already in CARS and only adds
 * records that are genuinely missing, so duplicates never appear.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RESEARCH_DIR = path.join(ROOT, 'car-research');
const CARS_FILE = path.join(ROOT, 'src', 'data', 'cars.ts');

// ─── helpers ────────────────────────────────────────────────────────────────

function readCarsTs() {
  return fs.readFileSync(CARS_FILE, 'utf-8');
}

/** Extract the set of years already present in cars.ts (only the hero year field, not production_start_year etc.) */
function existingYears(src) {
  const years = new Set();
  // Match 'year: NNNN' or '"year": NNNN' but NOT preceded by '_' (production_start_year, production_end_year)
  for (const m of src.matchAll(/(?<![_a-z])"?year"?\s*:\s*(\d{4})/g)) years.add(Number(m[1]));
  return years;
}

/** Convert a research JSON object into a formatted TypeScript object literal */
function toTsLiteral(obj) {
  // JSON.stringify produces valid TS; we just indent it as a block element
  const json = JSON.stringify(obj, null, 2);
  // indent every line by 2 spaces (for inside the CARS array)
  return json
    .split('\n')
    .map((line, i) => (i === 0 ? '  ' + line : '  ' + line))
    .join('\n');
}

// ─── main ────────────────────────────────────────────────────────────────────

const src = readCarsTs();
const already = existingYears(src);

const jsonFiles = fs.readdirSync(RESEARCH_DIR)
  .filter(f => /^\d{4}\.json$/.test(f))
  .map(f => ({ year: parseInt(f, 10), filePath: path.join(RESEARCH_DIR, f) }))
  .filter(({ year }) => !already.has(year))
  .sort((a, b) => a.year - b.year);

if (jsonFiles.length === 0) {
  console.log('Nothing to add — all researched years are already in cars.ts.');
  process.exit(0);
}

const errors = [];
const newLiterals = [];

for (const { year, filePath } of jsonFiles) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const obj = JSON.parse(raw);

    // Minimal validation
    const required = ['year', 'hero_car_name', 'manufacturer', 'country', 'era',
      'short_description', 'long_description', 'verified_facts', 'confidence_level'];
    const missing = required.filter(k => obj[k] === undefined || obj[k] === null || obj[k] === '');
    if (missing.length > 0) {
      // Warn but still include — incomplete records show "Record in progress"
      console.warn(`  ⚠  ${year}: missing fields [${missing.join(', ')}] — included anyway`);
    }

    newLiterals.push(toTsLiteral(obj));
  } catch (e) {
    errors.push(`  ✗  ${year}: ${e.message}`);
  }
}

if (errors.length > 0) {
  console.error('Parse errors (skipped):');
  errors.forEach(e => console.error(e));
}

if (newLiterals.length === 0) {
  console.log('No valid new records to add after filtering errors.');
  process.exit(errors.length > 0 ? 1 : 0);
}

// Insert before the closing `\n];` of the CARS array
const CLOSE = '\n];';
const closeIdx = src.lastIndexOf(CLOSE);
if (closeIdx === -1) {
  console.error('Could not locate the closing `];` of the CARS array in cars.ts. Aborting.');
  process.exit(1);
}

// Don't double-comma if the last record already has a trailing comma
const trailingComma = src[closeIdx - 1] === ',';
const insertion = (trailingComma ? '' : ',') + '\n' + newLiterals.join(',\n');
const newSrc = src.slice(0, closeIdx) + insertion + '\n' + src.slice(closeIdx);

fs.writeFileSync(CARS_FILE, newSrc, 'utf-8');
console.log(`\n✓ Added ${newLiterals.length} car records to src/data/cars.ts`);
console.log(`  Years: ${jsonFiles.filter(f => !errors.some(e => e.includes(String(f.year)))).map(f => f.year).join(', ')}`);
