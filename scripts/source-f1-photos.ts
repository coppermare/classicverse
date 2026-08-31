import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { F1_TEAMS } from '../src/data/f1Teams';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import type { F1WinImage, F1WinRecord } from '../src/types/f1';

type PhotoRecord = F1WinImage & { key: string };
type CommonsPage = {
  pageid: number;
  title: string;
  snippet?: string;
  entityterms?: { label?: string[] };
  imageinfo?: Array<{
    thumburl?: string;
    width?: number;
    height?: number;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

const outputPath = join(process.cwd(), 'src/data/f1WinPhotos.generated.ts');
const assetDir = join(process.cwd(), 'public/f1-wins/context');
const searchCachePath = join(tmpdir(), 'classicverse-f1-commons-media-search.json');
const failedPath = join(tmpdir(), 'classicverse-f1-photo-gaps.json');
const maxWidth = 1280;
const batchSize = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] ?? 40);
const retryGaps = process.argv.includes('--retry-gaps');
const userAgent = 'ClassicverseF1Archive/1.0 (local archival tooling)';
const preferredFiles: Record<string, string> = {
  'mclaren:55': 'File:McLaren MP4-3.jpg',
  'mclaren:147': "File:Montoya and Raikkonen in USGP Drivers' Parade.jpg",
};

function cleanMetadata(value: string | undefined): string {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function driverSurname(driver: string): string {
  return driver.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).at(-1) ?? driver;
}

function teamTerm(teamName: string): string {
  return teamName.replace(/^Team\s+/i, '');
}

function searchTerms(teamName: string, win: F1WinRecord): string[] {
  const team = teamTerm(teamName);
  const driver = driverSurname(win.driver);
  const decade = `${Math.floor(win.year / 10) * 10}s`;
  const terms = [
    `${driver} ${team} Formula One`,
    `${driver} ${team} F1`,
    `${team} Formula One ${decade}`,
    `${team} F1 ${decade}`,
    `${team} Formula One`,
  ];
  if (retryGaps) {
    terms.unshift(
      `${driver} ${team} ${win.year}`,
      `${driver} ${team}`,
      `${driver} ${win.grand_prix} ${win.year}`,
      `${team} ${win.grand_prix} ${win.year}`,
    );
  }
  return [...new Set(terms)];
}

function normalized(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function isPhotoCandidate(page: CommonsPage, teamName: string, win: F1WinRecord, usedTitles: Set<string>): boolean {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl || !info.mime?.startsWith('image/')) return false;
  if ((info.width ?? 0) < 300 || (info.height ?? 0) < 200) return false;
  if (info.mime === 'image/svg+xml' || info.mime === 'image/gif') return false;
  const title = normalized(page.title);
  const description = normalized(cleanMetadata(info.extmetadata?.ImageDescription?.value));
  const coreText = `${title} ${description} ${normalized(page.entityterms?.label?.join(' ') ?? '')}`;
  const text = `${coreText} ${normalized(page.snippet ?? '')}`;
  const banned = ['logo', 'diagram', 'map', 'circuit layout', 'track layout', 'illustration', 'drawing', 'render', 'poster', 'flag', 'coat of arms', 'chart', 'schematic', 'table of', 'calendar', 'gtr', 'team truck', 'road car', 'roadcar', 'supercar', 'lotus elan', 'alfa romeo spider', 'scale model', 'scalemodel', 'model car', 'model cars', 'toy', 'tyrrell'];
  if (banned.some((word) => text.includes(word))) return false;
  if (usedTitles.has(page.title) || usedTitles.has(page.title.replace(/^File:/, ''))) return false;
  const team = normalized(teamTerm(teamName));
  const surname = normalized(driverSurname(win.driver));
  const hasTeam = coreText.includes(team);
  const hasDriver = coreText.includes(surname);
  const hasYear = text.includes(String(win.year));
  const hasF1 = text.includes('formula one') || text.includes('formula 1') || text.includes('f1');
  const isMcLarenRoadCar = team === 'mclaren'
    && coreText.includes('mclaren f1')
    && !coreText.includes('formula one')
    && !coreText.includes('formula 1')
    && !/\bmp\d/.test(coreText)
    && !hasDriver;
  if (isMcLarenRoadCar) return false;
  return (hasDriver || hasTeam) && (hasYear || hasF1);
}

function scorePhoto(page: CommonsPage, teamName: string, win: F1WinRecord): number {
  const info = page.imageinfo?.[0];
  const text = normalized(`${page.title} ${cleanMetadata(info?.extmetadata?.ImageDescription?.value)} ${page.snippet ?? ''} ${page.entityterms?.label?.join(' ') ?? ''}`);
  const team = normalized(teamTerm(teamName));
  const surname = normalized(driverSurname(win.driver));
  return (text.includes(surname) ? 12 : 0)
    + (text.includes(team) ? 8 : 0)
    + (text.includes(String(win.year)) ? 5 : 0)
    + (text.includes('formula one') || text.includes('formula 1') || text.includes('f1') ? 3 : 0)
    + (text.includes(normalized(win.grand_prix)) ? 4 : 0);
}

const searchCache = new Map<string, CommonsPage[]>();

if (existsSync(searchCachePath)) {
  try {
    const cached = JSON.parse(readFileSync(searchCachePath, 'utf8')) as Record<string, CommonsPage[]>;
    for (const [key, pages] of Object.entries(cached)) searchCache.set(key, pages);
  } catch {
    // A partial temp cache is safe to ignore; the next successful search rewrites it.
  }
}

function fetchJson(url: string): unknown {
  return JSON.parse(execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--location', '--max-time', '30', url,
  ], { encoding: 'utf8' }));
}

async function commonsSearch(query: string): Promise<CommonsPage[]> {
  const cacheKey = query;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;
  const params = new URLSearchParams({ type: 'image', search: query });
  let html: string;
  try {
    html = execFileSync('curl', [
      '--fail', '--silent', '--show-error', '--location', '--retry', '2', '--retry-delay', '2', '--retry-max-time', '30', '--max-time', '30', '-A', userAgent,
      `https://commons.wikimedia.org/wiki/Special:MediaSearch?${params}`,
    ], { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Commons media search failed for ${query}: ${(error as Error).message}`);
  }
  const marker = '"sdmsInitialSearchResults":';
  const start = html.indexOf(marker);
  const jsonStart = start < 0 ? -1 : start + marker.length;
  let end = -1;
  if (jsonStart >= 0) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = jsonStart; index < html.length; index += 1) {
      const character = html[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === '{') depth += 1;
      else if (character === '}' && --depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  if (jsonStart < 0 || end < 0) throw new Error(`Commons media search response did not contain results for ${query}`);
  const body = JSON.parse(html.slice(jsonStart, end)) as { results?: Record<string, CommonsPage> };
  const pages = Object.values(body.results ?? {});
  searchCache.set(cacheKey, pages);
  writeFileSync(searchCachePath, JSON.stringify(Object.fromEntries(searchCache), null, 2));
  return pages;
}

function loadExisting(): PhotoRecord[] {
  let records: PhotoRecord[];
  if (!existsSync(outputPath)) {
    records = Object.entries(F1_WIN_IMAGES)
      .filter(([, image]) => image.src.startsWith('/f1-wins/context/') && image.src.endsWith('.webp'))
      .map(([key, image]) => ({ key, ...image }));
  } else {
    const source = readFileSync(outputPath, 'utf8');
    const match = source.match(/export const F1_WIN_PHOTOS: Record<string, F1WinImage> = (\{[\s\S]*\});\n?$/);
    if (!match) throw new Error(`Could not parse ${outputPath}`);
    const parsed = Function(`return ${match[1]}`)() as Record<string, F1WinImage>;
    records = Object.entries(parsed).map(([key, image]) => ({ key, ...image }));
  }
  const seen = new Set<string>();
  return records.filter((record) => {
    const title = record.title || record.file;
    if (seen.has(title)) return false;
    seen.add(title);
    return true;
  });
}

function writeOutput(records: PhotoRecord[]): void {
  const map = Object.fromEntries(records.map(({ key, ...image }) => [key, image]));
  writeFileSync(
    outputPath,
    '// Generated by scripts/source-f1-photos.ts. Do not edit by hand.\n'
      + '// Every entry is a locally optimized WebP derivative of a real Wikimedia Commons photograph.\n\n'
      + "import type { F1WinImage } from '@/types/f1';\n\n"
      + `export const F1_WIN_PHOTOS: Record<string, F1WinImage> = ${JSON.stringify(map, null, 2)};\n`,
  );
}

async function downloadPhoto(record: PhotoRecord, page: CommonsPage): Promise<void> {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl) throw new Error(`No thumbnail URL for ${page.title}`);
  mkdirSync(assetDir, { recursive: true });
  const sourcePath = join(tmpdir(), `classicverse-f1-${record.key.replace(':', '-')}-${Date.now()}.source`);
  const targetPath = join(process.cwd(), 'public', record.src.replace(/^\//, ''));
  execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--location', '--retry', '3', '--retry-delay', '2', '--retry-max-time', '60', '--max-time', '120', '-A', userAgent,
    info.thumburl, '-o', sourcePath,
  ]);
  execFileSync('cwebp', ['-quiet', '-resize', String(maxWidth), '0', '-q', '82', sourcePath, '-o', targetPath]);
  rmSync(sourcePath, { force: true });
}

function buildRecord(key: string, page: CommonsPage, teamName: string, win: F1WinRecord): PhotoRecord {
  const info = page.imageinfo?.[0];
  const title = page.title.replace(/^File:/, '');
  const description = cleanMetadata(info?.extmetadata?.ImageDescription?.value);
  const artist = cleanMetadata(info?.extmetadata?.Artist?.value);
  return {
    key,
    file: page.title,
    src: `/f1-wins/context/${key.replace(':', '-')}.webp`,
    sourceUrl: `https://commons.wikimedia.org/w/index.php?curid=${page.pageid}`,
    title,
    label: description || title,
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    ...(artist ? { creator: artist } : {}),
    verificationStatus: 'verified',
  };
}

async function findPhoto(key: string, teamName: string, win: F1WinRecord, usedTitles: Set<string>): Promise<CommonsPage | undefined> {
  const preferredTitle = preferredFiles[key];
  if (preferredTitle) {
    const preferred = [...searchCache.values()].flat().find((page) => page.title === preferredTitle);
    if (preferred && !usedTitles.has(preferred.title) && !usedTitles.has(preferred.title.replace(/^File:/, ''))) return preferred;
  }
  for (const query of searchTerms(teamName, win)) {
    const pages = await commonsSearch(query);
    const candidates = pages
      .filter((page) => isPhotoCandidate(page, teamName, win, usedTitles))
      .sort((a, b) => scorePhoto(b, teamName, win) - scorePhoto(a, teamName, win));
    if (candidates[0]) return candidates[0];
  }
  return undefined;
}

async function main(): Promise<void> {
  const records = loadExisting();
  const existingKeys = new Set(records.map((record) => record.key));
  const usedTitles = new Set(records.flatMap((record) => [record.title, record.file]));
  const failedKeys = new Set<string>(
    retryGaps || !existsSync(failedPath) ? [] : JSON.parse(readFileSync(failedPath, 'utf8')) as string[],
  );
  const missing: Array<{ teamName: string; key: string; win: F1WinRecord }> = [];
  for (const team of F1_TEAMS.filter((candidate) => candidate.id !== 'ferrari')) {
    for (const win of F1_WINS_BY_TEAM[team.id] ?? []) {
      const key = `${team.id}:${win.number}`;
      if (!existingKeys.has(key) && !failedKeys.has(key)) missing.push({ teamName: team.name, key, win });
    }
  }
  const batch = missing.slice(0, batchSize);
  console.log(`F1 photo sourcing: ${records.length} already localized, ${missing.length} gaps, sourcing ${batch.length}.`);
  let sourced = 0;
  for (const item of batch) {
    try {
      const page = await findPhoto(item.key, item.teamName, item.win, usedTitles);
      if (!page) {
        console.log(`GAP ${item.key} ${item.win.year} ${item.win.driver}`);
        failedKeys.add(item.key);
        continue;
      }
      const record = buildRecord(item.key, page, item.teamName, item.win);
      await downloadPhoto(record, page);
      records.push(record);
      existingKeys.add(item.key);
      usedTitles.add(record.title);
      usedTitles.add(record.file);
      failedKeys.delete(item.key);
      sourced += 1;
      console.log(`PHOTO ${item.key} <- ${record.title}`);
    } catch (error) {
      console.log(`GAP ${item.key} ${(error as Error).message}`);
      failedKeys.add(item.key);
    }
  }
  writeOutput(records);
  writeFileSync(failedPath, JSON.stringify([...failedKeys].sort(), null, 2));
  console.log(`F1 photo sourcing complete: added ${sourced}; localized catalog now contains ${records.length}.`);
  console.log(`Deferred gaps: ${failedKeys.size}${retryGaps ? ' (retry mode)' : ''}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
