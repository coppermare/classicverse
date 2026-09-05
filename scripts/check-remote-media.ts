import { CARS } from '../src/data/cars';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { getWinImage } from '../src/data/ferrariChassisImages';
import { F1_ARCHIVE_TEAMS } from '../src/data/f1Teams';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_WIN_PHOTOS } from '../src/data/f1WinPhotos.generated';
import { verifiedF1WinImage } from '../src/data/f1WinImagePolicy';
import { getF1WinRepresentativePhoto } from '../src/data/f1WinRepresentativePhotos';
import { F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '../src/data/mclarenHistoricWinImages';
import { MCLAREN_RECENT_WIN_IMAGES } from '../src/data/mclarenRecentWinImages';
import { THUMB_DETAIL, THUMB_TILE, toThumb } from '../src/lib/wikimedia';
import type { F1WinRecord, FerrariWin } from '../src/types/f1';

interface MediaReference {
  context: string;
  url: string;
}

function f1WinsFor(teamId: string): readonly F1WinRecord[] {
  return teamId === 'ferrari' ? FERRARI_WINS : (F1_WINS_BY_TEAM[teamId] ?? []);
}

function displayedF1Media(): MediaReference[] {
  return F1_ARCHIVE_TEAMS.flatMap((team) => f1WinsFor(team.id).map((win) => {
    if (team.id === 'ferrari') {
      return { context: `${team.name} win ${win.number}`, url: getWinImage(win as FerrariWin)?.src ?? '' };
    }

    const key = `${team.id}:${win.number}`;
    const candidate = team.id === 'mclaren'
      ? (F1_WIN_PHOTOS[key] ?? MCLAREN_RECENT_WIN_IMAGES[win.number] ?? MCLAREN_HISTORIC_WIN_IMAGES[win.number])
      : (F1_WIN_PHOTOS[key] ?? F1_WIN_IMAGES[key]);
    const source = verifiedF1WinImage(team, win, candidate);
    const image = source
      ?? getF1WinRepresentativePhoto(team.id, win.number, true)
      ?? team.archiveImage;
    return { context: `${team.name} win ${win.number}`, url: image?.src ?? '' };
  }));
}

function displayedCarMedia(): MediaReference[] {
  return CARS.flatMap((car) => [
    { context: `${car.year} ${car.hero_car_name} tile`, url: toThumb(car.image_url, THUMB_TILE) },
    { context: `${car.year} ${car.hero_car_name} detail`, url: toThumb(car.image_url, THUMB_DETAIL) },
  ]);
}

const IMAGE_ACCEPT = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
const USER_AGENT = 'Classicverse/0.1 pre-deploy media validation';
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function wikimediaFileName(url: string): string | null {
  const parsed = new URL(url);
  if (!['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(parsed.hostname)) return null;
  const match = decodeURIComponent(parsed.pathname).match(
    /\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[^/]+\/([^/]+)/i,
  );
  return match?.[1] ?? null;
}

async function inspectDirect(reference: MediaReference): Promise<string | null> {
  if (!reference.url) return `${reference.context}: no URL`;
  if (reference.url.startsWith('/')) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    let response = await fetch(reference.url, {
      method: 'HEAD', redirect: 'follow', signal: controller.signal,
      headers: { Accept: IMAGE_ACCEPT, 'User-Agent': USER_AGENT },
    });
    // Some image hosts reject HEAD even though the browser's GET works.
    if (!response.ok || !(response.headers.get('content-type') ?? '').toLowerCase().startsWith('image/')) {
      response = await fetch(reference.url, {
        method: 'GET', redirect: 'follow', signal: controller.signal,
        headers: { Accept: IMAGE_ACCEPT, Range: 'bytes=0-2047', 'User-Agent': USER_AGENT },
      });
      await response.body?.cancel();
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok) return `${reference.context}: HTTP ${response.status} ${reference.url}`;
    if (!contentType.toLowerCase().startsWith('image/')) {
      return `${reference.context}: ${contentType || 'missing content type'} ${reference.url}`;
    }
    return null;
  } catch (error) {
    return `${reference.context}: ${error instanceof Error ? error.message : String(error)} ${reference.url}`;
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectWikimedia(references: MediaReference[]): Promise<string[]> {
  const failures: string[] = [];
  const byFile = new Map<string, MediaReference>();
  for (const reference of references) {
    const file = wikimediaFileName(reference.url);
    if (file && !byFile.has(file)) byFile.set(file, reference);
  }
  const files = [...byFile.keys()];

  // Commons accepts 50 file titles per API request. This verifies the canonical
  // records without issuing hundreds of CDN requests and triggering its limiter.
  for (let offset = 0; offset < files.length; offset += 50) {
    const batch = files.slice(offset, offset + 50);
    const body = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo',
      iiprop: 'url|mime', titles: batch.map((file) => `File:${file}`).join('|'),
    });
    let response: Response | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      response = await fetch('https://commons.wikimedia.org/w/api.php', {
        method: 'POST', body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
      });
      if (response.status !== 429) break;
      const retryAfter = Number(response.headers.get('retry-after')) * 1_000;
      await wait(Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter, 15_000)
        : Math.min(2_000 * (2 ** attempt), 15_000));
    }
    if (!response) throw new Error('Commons API did not respond');
    if (!response.ok) throw new Error(`Commons API returned HTTP ${response.status}`);
    const payload = await response.json() as {
      query?: { pages?: { title: string; missing?: boolean; invalid?: boolean; imageinfo?: { mime?: string }[] }[] };
    };
    for (const page of payload.query?.pages ?? []) {
      if (!page.missing && !page.invalid && page.imageinfo?.[0]?.mime?.startsWith('image/')) continue;
      const file = page.title.replace(/^File:/, '');
      const reference = byFile.get(file);
      failures.push(`${reference?.context ?? file}: missing Commons file ${file}`);
    }
    if (offset + 50 < files.length) await wait(250);
  }
  return failures;
}

async function main() {
  const references = [...displayedF1Media(), ...displayedCarMedia()];
  const uniqueRemote = [...new Map(
    references.filter((reference) => reference.url.startsWith('http')).map((reference) => [reference.url, reference]),
  ).values()];
  const wikimedia = uniqueRemote.filter((reference) => wikimediaFileName(reference.url));
  const direct = uniqueRemote.filter((reference) => !wikimediaFileName(reference.url));
  const failures = process.env.CHECK_MEDIA_SKIP_WIKIMEDIA === '1'
    ? []
    : await inspectWikimedia(wikimedia);
  const concurrency = 4;
  let cursor = 0;

  async function worker() {
    while (cursor < direct.length) {
      const reference = direct[cursor++];
      const failure = await inspectDirect(reference);
      if (failure) failures.push(failure);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  if (failures.length) {
    console.error(`Remote media failed: ${failures.length} of ${uniqueRemote.length}`);
    failures.forEach((failure) => console.error(`  ${failure}`));
    process.exitCode = 1;
    return;
  }

  const checkedCount = process.env.CHECK_MEDIA_SKIP_WIKIMEDIA === '1' ? direct.length : uniqueRemote.length;
  const scope = process.env.CHECK_MEDIA_SKIP_WIKIMEDIA === '1' ? ' non-Wikimedia' : '';
  console.log(
    `Remote media validated: ${checkedCount} unique${scope} image URLs `
    + `(${displayedF1Media().length} F1 records and ${CARS.length} cars in the archive).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
