import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { F1_ARCHIVE_TEAMS, F1_TEAMS } from '../src/data/f1Teams';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_CIRCUIT_PHOTOS } from '../src/data/f1CircuitPhotos.generated';
import { F1_WIN_PHOTOS } from '../src/data/f1WinPhotos.generated';
import { F1_REJECTED_WIN_IMAGE_KEYS } from '../src/data/f1RejectedWinImageKeys';
import { hasLawfulF1ImageBasis, isF1CarImage, verifiedF1WinImage } from '../src/data/f1WinImagePolicy';
import { MCLAREN_RECENT_WIN_IMAGES } from '../src/data/mclarenRecentWinImages';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '../src/data/mclarenHistoricWinImages';
import { F1_DATA_CUTOFF, F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import { getWinImage } from '../src/data/ferrariChassisImages';
import { getF1WinRepresentativePhoto } from '../src/data/f1WinRepresentativePhotos';
import { toThumb } from '../src/lib/wikimedia';

const winsFor = (teamId: string) => teamId === 'ferrari'
  ? FERRARI_WINS
  : (F1_WINS_BY_TEAM[teamId] ?? []);

function assertPhotoSource(src: string, label: string): void {
  if (src.startsWith('https://')) return;

  assert.match(src, /^\/f1-wins\/(?:context\/[a-z0-9-]+|win_\d{3})\.webp$/, `${label}: invalid local photo path`);
  const assetPath = join(process.cwd(), 'public', src.slice(1));
  assert.ok(existsSync(assetPath), `${label}: local photo is missing`);
  const signature = readFileSync(assetPath).subarray(0, 12);
  assert.equal(signature.subarray(0, 4).toString('ascii'), 'RIFF', `${label}: local photo is not a WebP file`);
  assert.equal(signature.subarray(8, 12).toString('ascii'), 'WEBP', `${label}: local photo is not a WebP file`);
}

assert.equal(
  toThumb('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Example.jpg/1280px-Example.jpg', 330),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Example.jpg/330px-Example.jpg',
  'existing Commons thumbnails must be resized for gallery tiles',
);

assert.equal(new Set(F1_TEAMS.map((team) => team.id)).size, F1_TEAMS.length, 'team ids must be unique');
assert.deepEqual(
  F1_ARCHIVE_TEAMS.map((team) => team.id),
  ['ferrari', 'mclaren', 'mercedes', 'red-bull', 'williams', 'lotus', 'renault'],
  'visitor-facing archive must contain only the selected constructors',
);
for (const team of F1_ARCHIVE_TEAMS) {
  assert.ok(team.logo?.startsWith('/f1-logos/'), `${team.name}: displayed constructor must have a local F1 logo`);
  assert.ok(existsSync(`public${team.logo}`), `${team.name}: local F1 logo asset must exist`);
}

for (const team of F1_TEAMS) {
  const wins = winsFor(team.id);
  assert.equal(team.enabled, wins.length > 0, `${team.name}: enabled state must match its records`);
  assert.equal(
    team.tagline,
    wins.length === 1 ? '1 Grand Prix win' : `${wins.length} Grand Prix wins`,
    `${team.name}: tagline must match its records`,
  );

  if (wins[0]) {
    if (team.id !== 'ferrari') {
      assert.ok(team.archiveImage, `${team.name}: winning constructor needs an archive photograph`);
      assert.ok(
        team.archiveImage.src.startsWith('https://upload.wikimedia.org/'),
        `${team.name}: archive photograph must be served by Wikimedia`,
      );
      assert.ok(
        team.archiveImage.sourceUrl.startsWith('https://en.wikipedia.org/wiki/'),
        `${team.name}: archive photograph needs a source page`,
      );
    }
  }

  wins.forEach((win, index) => {
    assert.equal(win.number, index + 1, `${team.name}: win numbers must be sequential`);
    assert.ok(win.year >= 1950, `${team.name}: invalid season on win ${win.number}`);
    assert.ok(win.grand_prix && win.circuit && win.driver, `${team.name}: incomplete win ${win.number}`);
    if (team.id !== 'ferrari') {
      assert.ok(win.date && win.date <= F1_DATA_CUTOFF, `${team.name}: invalid date on win ${win.number}`);
      assert.ok(win.source_url, `${team.name}: missing source URL on win ${win.number}`);
    }
  });

  const raceKeys = wins.map((win) => `${win.year}:${win.grand_prix}`);
  assert.equal(new Set(raceKeys).size, raceKeys.length, `${team.name}: duplicate race wins`);
}

const astonMartin = F1_TEAMS.find((team) => team.id === 'aston-martin');
assert.ok(astonMartin && !astonMartin.enabled, 'Aston Martin must remain a zero-win placeholder');

assert.deepEqual(
  Object.keys(MCLAREN_RECENT_WIN_IMAGES).map(Number).sort((a, b) => a - b),
  Array.from({ length: 21 }, (_, index) => index + 184),
  'McLaren recent seasons must have a first-party photo for every win',
);

assert.deepEqual(
  Object.keys(MCLAREN_HISTORIC_WIN_IMAGES).map(Number).sort((a, b) => a - b),
  Array.from({ length: 183 }, (_, index) => index + 1),
  'McLaren historic wins must have a race photo for every record',
);

for (const [key, image] of Object.entries(F1_WIN_IMAGES)) {
  const [teamId, number] = key.split(':');
  assert.ok(winsFor(teamId).some((win) => win.number === Number(number)), `image has no matching win: ${key}`);
  assertPhotoSource(image.src, key);
  assert.ok(image.sourceUrl.startsWith('https://'), `${key}: photo needs a source page`);
  assert.ok(image.title, `${key}: photo needs its source title`);
}
for (const [number, image] of Object.entries(MCLAREN_RECENT_WIN_IMAGES)) {
  assert.ok(F1_WINS_BY_TEAM.mclaren.some((win) => win.number === Number(number)), `McLaren image has no matching win: ${number}`);
  assert.ok(image.sourceUrl.startsWith('https://www.mclaren.com/') || image.sourceUrl.startsWith('https://www.formula1.com/'), `${number}: McLaren recent image needs a first-party source`);
}
for (const win of F1_WINS_BY_TEAM.mclaren) {
  assert.ok(
    MCLAREN_HISTORIC_WIN_IMAGES[win.number] || MCLAREN_RECENT_WIN_IMAGES[win.number],
    `McLaren win ${win.number} needs its own image`,
  );
}

for (const key of F1_REJECTED_WIN_IMAGE_KEYS) {
  assert.equal(F1_WIN_PHOTOS[key], undefined, `${key}: audited mismatch remains in the canonical catalog`);
}

for (const [key, image] of Object.entries(F1_WIN_PHOTOS)) {
  assertPhotoSource(image.src, key);
  assert.ok(hasLawfulF1ImageBasis(image), `${key}: photo needs a lawful reuse basis`);
  assert.ok(isF1CarImage(image), `${key}: photo must show a Formula 1 car`);
  assert.ok(statSync(join(process.cwd(), 'public', image.src.slice(1))).size <= 700 * 1024, `${key}: photo exceeds 700 KiB`);
}

for (const [circuit, image] of Object.entries(F1_CIRCUIT_PHOTOS)) {
  assert.equal(image.mediaType, 'photograph', `${circuit}: fallback must be a photograph`);
  assert.ok(hasLawfulF1ImageBasis(image), `${circuit}: fallback needs a lawful reuse basis`);
}

const archiveWinsWithImages = F1_ARCHIVE_TEAMS.flatMap((team) => winsFor(team.id).map((win) => {
  const key = `${team.id}:${win.number}`;
  if (team.id === 'ferrari') {
    const image = getWinImage(win as (typeof FERRARI_WINS)[number]);
    assert.ok(image?.src, `${key}: no display image`);
    assertPhotoSource(image.src, key);
    return image.src;
  }

  const candidate = team.id === 'mclaren'
    ? (F1_WIN_PHOTOS[key] ?? MCLAREN_RECENT_WIN_IMAGES[win.number] ?? MCLAREN_HISTORIC_WIN_IMAGES[win.number])
    : (F1_WIN_PHOTOS[key] ?? F1_WIN_IMAGES[key]);
  const exactImage = verifiedF1WinImage(team, win, candidate);
  const image = exactImage ?? getF1WinRepresentativePhoto(team.id, win.number, true);
  assert.ok(image?.src, `${key}: no real photograph`);
  assertPhotoSource(image.src, key);
  assert.ok(image.sourceUrl.startsWith('https://'), `${key}: photograph needs a source page`);
  return image.src;
}));

assert.equal(
  archiveWinsWithImages.length,
  F1_ARCHIVE_TEAMS.reduce((total, team) => total + winsFor(team.id).length, 0),
  'every displayed constructor win must resolve to an image',
);
assert.equal(
  new Set(archiveWinsWithImages).size,
  archiveWinsWithImages.length,
  'every displayed constructor win must have a distinct visual',
);

const circuitCandidates = Object.values(F1_WIN_IMAGES).filter((image) => image.kind === 'circuit').length;

console.log(
  `F1 archive validated: ${archiveWinsWithImages.length} distinct sourced photographs across ${F1_ARCHIVE_TEAMS.length} archive teams; `
  + `${circuitCandidates} research circuit candidates and ${F1_REJECTED_WIN_IMAGE_KEYS.size} audited mismatches removed through ${F1_DATA_CUTOFF}.`,
);
