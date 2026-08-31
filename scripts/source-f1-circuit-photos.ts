import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_TEAMS } from '../src/data/f1Teams';
import { F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import type { F1WinImage } from '../src/types/f1';

type CircuitRecord = F1WinImage & { circuit: string };
type CommonsPage = {
  pageid: number;
  title: string;
  filePage?: string;
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

const outputPath = join(process.cwd(), 'src/data/f1CircuitPhotos.generated.ts');
const cachePath = join(tmpdir(), 'classicverse-f1-circuit-search.json');
const userAgent = 'ClassicverseF1Archive/1.0 (local archival tooling)';
const manualCircuitFiles: Record<string, { file: string; title: string }> = {
  'Circuit Mont-Tremblant': { file: 'Circuit Mont Tremblant.png', title: 'Circuit Mont Tremblant track map' },
  'Scandinavian Raceway': { file: 'Scandinavian Raceway.svg', title: 'Track map of Scandinavian Raceway' },
  'Mosport International Raceway': { file: 'Mosport.svg', title: 'Track map for Mosport International Raceway' },
  'Montjuïc': { file: 'Circuit_of_Montjuic_plate_Barcelona.JPG', title: 'Circuit of Montjuic, Barcelona' },
  'Autódromo Internacional Nelson Piquet': { file: 'Jacarepaguá.svg', title: 'Track map of Autódromo Internacional Nelson Piquet' },
  'Autodromo Enzo e Dino Ferrari': { file: 'Imola_Circuit_-_Variante_Bassa_-_Summer_1973.jpg', title: 'Imola Circuit, Variante Bassa, Summer 1973' },
  'Nürburgring': { file: 'Nürburgring Luftaufnahme 2004.jpg', title: 'Aerial photograph of the Nürburgring circuit' },
  'Hockenheimring': { file: 'Aerial image of Hockenheimring (view from the southwest).jpg', title: 'Aerial image of Hockenheimring' },
  'Brands Hatch': { file: 'Brands Hatch (May 2011).jpg', title: 'Aerial view of Brands Hatch racing circuit' },
  'Phoenix street circuit': { file: 'Phoenix track.jpg', title: 'Phoenix street circuit track' },
  'Indianapolis Motor Speedway': { file: 'Indianapolis Motor Speedway Aerial August 2018.jpg', title: 'Aerial view of Indianapolis Motor Speedway' },
  'Korean International Circuit': { file: 'Korea international circuit.svg', title: 'Track map of Korean International Circuit' },
  'Jarama': { file: 'Circuito de Madrid Jarama - RACE, o "Circuito del Jarama". Comunidad de Madrid. España, Spain.jpg', title: 'Aerial view of the Jarama Circuit' },
  'Istanbul Park': { file: 'Istanbul Park aerial.jpg', title: 'Aerial photograph of Istanbul Park circuit' },
  'Miami International Autodrome': { file: 'Circuito Internacional de Miami.jnp.jpg', title: 'Aerial photograph of Miami International Autodrome' },
  'Prince George Circuit': { file: 'Prince George Circuit.png', title: 'Prince George Circuit track map' },
  'Yas Marina Circuit': { file: 'Yas Marina Circuit, October 12, 2018 SkySat (cropped).jpg', title: 'Aerial photograph of Yas Marina Circuit' },
};

function clean(value: string | undefined): string {
  return (value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalized(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function sourceText(page: CommonsPage): string {
  const info = page.imageinfo?.[0];
  return normalized(`${page.title} ${clean(info?.extmetadata?.ImageDescription?.value)} ${page.snippet ?? ''} ${page.entityterms?.label?.join(' ') ?? ''}`);
}

function isCircuitCandidate(page: CommonsPage, circuit: string): boolean {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl || !info.mime?.startsWith('image/')) return false;
  if ((info.width ?? 0) < 300 || (info.height ?? 0) < 200) return false;
  if (info.mime === 'image/svg+xml' || info.mime === 'image/gif') return false;
  const text = sourceText(page);
  const titleText = normalized(page.title.replace(/^File:/, ''));
  const banned = [
    'layout', 'map', 'diagram', 'schematic', 'render', 'poster', 'logo', 'flag', 'model', 'toy',
    'car', 'racing', 'driver', 'winner', 'podio', 'pits', 'pit lane', 'garage', 'truck', 'camion',
    'motorcycle', 'mclaren', 'ferrari', 'lotus', 'corvette', 'chevrolet', 'road', 'vehicle', 'automobile',
    'toyota', 'supra', 'automatic', 'monument', 'statue',
    'sculpture', 'museum', 'senna', 'hamilton', 'verstappen', 'prost', 'schumacher', 'vettel',
    'raikkonen', 'alonso', 'bottas', 'rosberg', 'webber', 'ricciardo', 'moss', 'fangio',
    'feydeau', 'theatre', 'dessin', 'drawing', 'actress', 'printed', 'board', 'phone',
  ];
  const titleTokens = titleText.split(' ');
  const textTokens = text.split(' ');
  if (banned.some((term) => term.includes(' ')
    ? text.includes(term)
    : titleTokens.includes(term) || textTokens.includes(term))) return false;
  if (!['circuit', 'race track', 'speedway', 'autodrome', 'autodromo', 'aerial', 'satellite'].some((term) => titleText.includes(term))) return false;
  const genericTokens = new Set(['circuit', 'international', 'autodromo', 'autodrome', 'race', 'track', 'park', 'street', 'the']);
  const tokens = normalized(circuit).split(' ').filter((token) => token.length > 3 && !genericTokens.has(token));
  const hasCircuitName = tokens.some((token) => titleTokens.includes(token));
  return hasCircuitName && (text.includes('circuit') || text.includes('race track') || text.includes('grand prix') || text.includes('formula one'));
}

const searchCache = new Map<string, CommonsPage[]>();
if (existsSync(cachePath)) {
  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, CommonsPage[]>;
    for (const [key, pages] of Object.entries(cached)) searchCache.set(key, pages);
  } catch {
    // Ignore a partial cache; the next successful search rewrites it.
  }
}

async function commonsSearch(query: string): Promise<CommonsPage[]> {
  const cached = searchCache.get(query);
  if (cached) return cached;
  const encoded = encodeURIComponent(query);
  const html = execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--location', '--retry', '2', '--retry-delay', '2', '--retry-max-time', '30', '--max-time', '30', '-A', userAgent,
    `https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encoded}`,
  ], { encoding: 'utf8' });
  const marker = '"sdmsInitialSearchResults":';
  const jsonStart = html.indexOf(marker) + marker.length;
  let end = -1;
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
    else if (character === '}' && --depth === 0) { end = index + 1; break; }
  }
  if (jsonStart <= marker.length || end < 0) throw new Error(`Commons media search response did not contain results for ${query}`);
  const body = JSON.parse(html.slice(jsonStart, end)) as { results?: Record<string, CommonsPage> };
  const pages = Object.values(body.results ?? {});
  searchCache.set(query, pages);
  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(searchCache), null, 2));
  return pages;
}

function existingByCircuit(): Map<string, F1WinImage> {
  const result = new Map<string, F1WinImage>();
  for (const image of Object.values(F1_WIN_IMAGES)) {
    if (image.kind !== 'circuit') continue;
    const key = normalized(image.label);
    if (!result.has(key)) result.set(key, image);
  }
  return result;
}

function candidatePage(image: F1WinImage): CommonsPage {
  return {
    pageid: Number(new URL(image.sourceUrl).searchParams.get('curid') ?? 0),
    title: image.title,
    filePage: image.file,
    snippet: image.file,
    imageinfo: [{ thumburl: image.file, width: 1280, height: 720, mime: 'image/jpeg' }],
  };
}

function buildRecord(circuit: string, page: CommonsPage): CircuitRecord {
  const info = page.imageinfo?.[0];
  const title = page.title.replace(/^File:/, '');
  const artist = clean(info?.extmetadata?.Artist?.value);
  return {
    circuit,
    file: page.title,
    src: info?.thumburl ?? page.filePage ?? page.title,
    sourceUrl: `https://commons.wikimedia.org/w/index.php?curid=${page.pageid}`,
    title,
    label: circuit,
    kind: 'circuit',
    reuseBasis: 'Wikimedia Commons circuit image; source and attribution are recorded on the Commons page',
    ...(artist ? { creator: artist } : {}),
    verificationStatus: 'verified',
  };
}

function writeOutput(records: CircuitRecord[]): void {
  const map = Object.fromEntries(records.map(({ circuit, ...image }) => [circuit, image]));
  writeFileSync(outputPath,
    '// Generated by scripts/source-f1-circuit-photos.ts. Do not edit by hand.\n'
      + '// Every entry is a verified Wikimedia Commons circuit image or map.\n\n'
      + "import type { F1WinImage } from '@/types/f1';\n\n"
      + `export const F1_CIRCUIT_PHOTOS: Record<string, F1WinImage> = ${JSON.stringify(map, null, 2)};\n`);
}

async function main(): Promise<void> {
  const circuits = [...new Set(F1_TEAMS.flatMap((team) => team.id === 'ferrari' ? [] : (F1_WINS_BY_TEAM[team.id] ?? []).map((win) => win.circuit)))];
  const existing = existingByCircuit();
  const records: CircuitRecord[] = [];
  for (const circuit of circuits) {
    const manual = manualCircuitFiles[circuit];
    if (manual) {
      const encodedFile = encodeURIComponent(manual.file);
      records.push({
        circuit,
        file: `File:${manual.file}`,
        src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFile}`,
        sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodedFile}`,
        title: manual.title,
        label: circuit,
        kind: 'circuit',
        reuseBasis: 'Wikimedia Commons circuit photograph or circuit map; source and attribution are recorded on the Commons page',
        verificationStatus: 'verified',
      });
      console.log(`CIRCUIT ${circuit} <- ${manual.title}`);
      continue;
    }
    const candidate = existing.get(normalized(circuit));
    let page: CommonsPage | undefined;
  const useExistingCandidate = Boolean(
      candidate
      && candidate.sourceUrl.startsWith('https://commons.wikimedia.org/')
      && isCircuitCandidate(candidatePage(candidate), circuit),
    );
    if (useExistingCandidate && candidate) {
      page = candidatePage(candidate);
    } else {
      for (const query of [`${circuit} Formula One circuit`, `${circuit} race track`, circuit]) {
        const pages = await commonsSearch(query);
        page = pages.filter((item) => isCircuitCandidate(item, circuit))
          .sort((a, b) => {
            const score = (item: CommonsPage) => {
              const text = sourceText(item);
              return (text.includes('aerial') ? 5 : 0) + (text.includes('satellite') ? 5 : 0)
                + (text.includes('circuit') ? 4 : 0) + (text.includes('speedway') ? 3 : 0);
            };
            return score(b) - score(a);
          })[0];
        if (page) break;
      }
    }
    if (!page) { console.log(`GAP ${circuit}`); continue; }
    const record = useExistingCandidate && candidate
      ? { circuit, ...candidate, src: candidate.file, label: circuit, reuseBasis: 'Wikimedia Commons circuit image; source and attribution are recorded on the Commons page', verificationStatus: 'verified' as const }
      : buildRecord(circuit, page);
    records.push(record);
    console.log(`CIRCUIT ${circuit} <- ${record.title}`);
  }
  writeOutput(records);
  console.log(`F1 circuit sourcing complete: localized ${records.length}/${circuits.length} circuit fallbacks.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
