import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { F1_TEAMS } from '../src/data/f1Teams';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_REJECTED_WIN_IMAGE_KEYS } from '../src/data/f1RejectedWinImageKeys';
import { isF1CarImage } from '../src/data/f1WinImagePolicy';
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
const carOnly = process.argv.includes('--car-only');
const userAgent = 'ClassicverseF1Archive/1.0 (local archival tooling)';
const preferredFiles: Record<string, string> = {
  'mclaren:55': 'File:McLaren MP4-3.jpg',
  'mclaren:147': "File:Montoya and Raikkonen in USGP Drivers' Parade.jpg",
};

const replacementPhotos: Record<string, F1WinImage> = {
  'mclaren:20': {
    file: 'File:James Hunt - McLaren M23 - 1976 Race of Champions, Brands Hatch.jpg',
    src: '/f1-wins/context/mclaren-20.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:James_Hunt_-_McLaren_M23_-_1976_Race_of_Champions,_Brands_Hatch.jpg',
    title: 'James Hunt - McLaren M23 - 1976 Race of Champions, Brands Hatch.jpg',
    label: 'James Hunt driving the 1976 McLaren M23 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'mclaren:31': {
    file: 'File:McLaren MP4-2.jpg',
    src: '/f1-wins/context/mclaren-31.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:McLaren_MP4-2.jpg',
    title: 'McLaren MP4-2.jpg',
    label: "Alain Prost's 1984 McLaren MP4/2 Formula One car",
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'mclaren:43': {
    file: 'File:ProstAlain McLarenMP4-2B 1985.jpg',
    src: '/f1-wins/context/mclaren-43.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ProstAlain_McLarenMP4-2B_1985.jpg',
    title: 'ProstAlain McLarenMP4-2B 1985.jpg',
    label: 'Alain Prost driving the 1985 McLaren MP4/2B Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'mclaren:56': {
    file: 'File:Alain Prost (McLaren Honda), 1988.jpg',
    src: '/f1-wins/context/mclaren-56.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alain_Prost_(McLaren_Honda),_1988.jpg',
    title: 'Alain Prost (McLaren Honda), 1988.jpg',
    label: 'Alain Prost driving the 1988 McLaren MP4/4 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'mclaren:74': {
    file: 'File:Alain Prost 1989 Belgian GP.jpg',
    src: '/f1-wins/context/mclaren-74.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alain_Prost_1989_Belgian_GP.jpg',
    title: 'Alain Prost 1989 Belgian GP.jpg',
    label: 'Alain Prost driving the 1989 McLaren MP4/5 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'mclaren:81': {
    file: 'File:McLaren MP4-5B front-left1 Honda Collection Hall.jpg',
    src: '/f1-wins/context/mclaren-81.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:McLaren_MP4-5B_front-left1_Honda_Collection_Hall.jpg',
    title: 'McLaren MP4-5B front-left1 Honda Collection Hall.jpg',
    label: 'Ayrton Senna\'s 1990 McLaren MP4/5B Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'williams:15': {
    file: 'File:Williams FW07-C at Formula 1 Exhibition, London 01.jpg',
    src: '/f1-wins/context/williams-15.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Williams_FW07-C_at_Formula_1_Exhibition,_London_01.jpg',
    title: 'Williams FW07-C at Formula 1 Exhibition, London 01.jpg',
    label: "Alan Jones' 1981 Williams FW07C that won the Las Vegas Grand Prix",
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'williams:23': {
    file: 'File:Williams F1 FW11.jpg',
    src: '/f1-wins/context/williams-23.webp',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=1704539',
    title: 'Williams F1 FW11.jpg',
    label: 'Nelson Piquet 1986 Williams FW11 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'williams:13': {
    file: 'File:Williams FW07-C at Formula 1 Exhibition, London 01.jpg',
    src: '/f1-wins/context/williams-13.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Williams_FW07-C_at_Formula_1_Exhibition,_London_01.jpg',
    title: 'Williams FW07-C at Formula 1 Exhibition, London 01.jpg',
    label: '1981 Williams FW07C Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'lotus:2': {
    file: 'File:Lotus 18 at the Musée National de lAutomobile.jpg',
    src: '/f1-wins/context/lotus-2.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lotus_18_at_the_Mus%C3%A9e_National_de_lAutomobile.jpg',
    title: 'Lotus 18 at the Musée National de lAutomobile.jpg',
    label: 'Lotus 18 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'renault:9': {
    file: 'File:1982 Renault RE30 formula 1.jpg',
    src: '/f1-wins/context/renault-9.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:1982_Renault_RE30_formula_1.jpg',
    title: '1982 Renault RE30 formula 1.jpg',
    label: "Alain Prost's 1982 Renault RE30B Formula One car",
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
  'brabham:29': {
    file: 'File:Historic F1-Cars Spielberg 2022 Brabham BT52 (1).jpg',
    src: '/f1-wins/context/brabham-29.webp',
    sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=121028440',
    title: 'Historic F1-Cars Spielberg 2022 Brabham BT52 (1).jpg',
    label: '1983 Brabham BT52 Formula One car',
    kind: 'race',
    reuseBasis: 'Wikimedia Commons photograph; locally optimized WebP derivative',
    verificationStatus: 'verified',
  },
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
    && !coreText.includes('f1 car')
    && !/\bmp\d/.test(coreText)
    && !/\bmcl\d/.test(coreText)
    && !hasDriver;
  if (isMcLarenRoadCar) return false;
  if (carOnly && !isF1CarImage({
    title: page.title.replace(/^File:/, ''),
    label: cleanMetadata(info.extmetadata?.ImageDescription?.value) || page.title,
    file: page.title,
  })) return false;
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
  const replacements = new Map(Object.entries(replacementPhotos));
  records = records
    .filter((record) => !F1_REJECTED_WIN_IMAGE_KEYS.has(record.key))
    .map((record) => ({ key: record.key, ...(replacements.get(record.key) ?? record) }));
  for (const [key, image] of replacements) {
    if (!records.some((record) => record.key === key)) records.push({ key, ...image });
  }

  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.key)) return false;
    seen.add(record.key);
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
  const records = loadExisting().filter((record) => !carOnly || isF1CarImage(record));
  const existingKeys = new Set(records.map((record) => record.key));
  const usedTitles = new Set(records.flatMap((record) => [record.title, record.file]));
  const failedKeys = new Set<string>(
    retryGaps || !existsSync(failedPath) ? [] : JSON.parse(readFileSync(failedPath, 'utf8')) as string[],
  );
  const missing: Array<{ teamName: string; key: string; win: F1WinRecord }> = [];
  for (const team of F1_TEAMS.filter((candidate) => candidate.id !== 'ferrari')) {
    for (const win of F1_WINS_BY_TEAM[team.id] ?? []) {
      const key = `${team.id}:${win.number}`;
      if (F1_REJECTED_WIN_IMAGE_KEYS.has(key)) continue;
      if (!existingKeys.has(key) && !failedKeys.has(key)) missing.push({ teamName: team.name, key, win });
    }
  }
  const batch = missing.slice(0, batchSize);
  console.log(`F1 photo sourcing: ${records.length} already localized${carOnly ? ' car photos' : ''}, ${missing.length} gaps, sourcing ${batch.length}.`);
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
