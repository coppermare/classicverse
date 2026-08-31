import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { F1_TEAMS } from '../src/data/f1Teams';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_CIRCUIT_PHOTOS } from '../src/data/f1CircuitPhotos.generated';
import { F1_CROSS_TEAM_IMAGE_KEYS, hasLawfulF1ImageBasis, isF1CarImage, verifiedF1CircuitImage, verifiedF1WinImage } from '../src/data/f1WinImagePolicy';
import { F1_WIN_PHOTOS } from '../src/data/f1WinPhotos.generated';
import { MCLAREN_RECENT_WIN_IMAGES } from '../src/data/mclarenRecentWinImages';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '../src/data/mclarenHistoricWinImages';
import { F1_DATA_CUTOFF, F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import {
  F1_IMAGE_MANIFEST_SUMMARY,
  F1_WIN_IMAGE_MANIFEST,
  resolveF1WinImage,
} from '../src/data/f1WinImageManifest';

const winsFor = (teamId: string) => teamId === 'ferrari'
  ? FERRARI_WINS
  : (F1_WINS_BY_TEAM[teamId] ?? []);
const retainedTeamIds = ['ferrari', 'mclaren', 'mercedes', 'red-bull', 'williams', 'lotus', 'renault', 'brabham', 'benetton'];

assert.equal(new Set(F1_TEAMS.map((team) => team.id)).size, F1_TEAMS.length, 'team ids must be unique');
assert.deepEqual(F1_TEAMS.map((team) => team.id), retainedTeamIds, 'F1 visible roster must remain the selected major constructors');
assert.deepEqual(Object.keys(F1_WINS_BY_TEAM), retainedTeamIds.slice(1), 'generated F1 data must contain only retained non-Ferrari teams');

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

const enabledWins = F1_TEAMS.flatMap((team) => winsFor(team.id).map((win) => ({ team, win })));
const imageSources = [
  ...Object.entries(F1_WIN_IMAGES).filter(([key]) => !key.startsWith('mclaren:')).map(([, image]) => image),
  ...Object.values(MCLAREN_HISTORIC_WIN_IMAGES),
  ...Object.values(MCLAREN_RECENT_WIN_IMAGES),
].map((image) => image.src);
assert.equal(new Set(imageSources).size, imageSources.length, 'archive photographs must never repeat');
for (const [key, image] of Object.entries(F1_WIN_IMAGES)) {
  const [teamId, number] = key.split(':');
  assert.ok(winsFor(teamId).some((win) => win.number === Number(number)), `image has no matching win: ${key}`);
  assert.ok(image.src.startsWith('/f1-wins/') || image.src.startsWith('https://'), `${key}: photo must be a web or research image`);
  assert.ok(image.sourceUrl.startsWith('https://'), `${key}: photo needs a source page`);
  assert.ok(image.title, `${key}: photo needs its source title`);
  if (image.src.startsWith('/f1-wins/')) {
    assert.ok(image.src.endsWith('.webp'), `${key}: local display photos must be WebP`);
    assert.ok(existsSync(`public${image.src}`), `${key}: local display photo must exist`);
  }
  if (image.kind === 'race' && hasLawfulF1ImageBasis(image)) {
    assert.equal(image.sourceUrl.startsWith('https://commons.wikimedia.org/'), true, `${key}: cleared photo needs a Commons file page`);
  }
}
for (const [circuit, image] of Object.entries(F1_CIRCUIT_PHOTOS)) {
  assert.equal(image.kind, 'circuit', `${circuit}: fallback must be a circuit image`);
  assert.equal(image.mediaType, 'photograph', `${circuit}: fallback must be explicitly classified as a photograph`);
  assert.ok(image.src.startsWith('https://'), `${circuit}: fallback must be a real source image`);
  assert.ok(image.sourceUrl.startsWith('https://'), `${circuit}: fallback needs a source page`);
  assert.equal(hasLawfulF1ImageBasis(image), true, `${circuit}: fallback needs cleared local rights metadata`);
  const visualMetadata = [image.file, image.title, image.src].join(' ').toLowerCase();
  assert.equal(
    /(?:^|[ _-])(map|diagram|schematic|layout|illustration|render|poster|graphic)(?:$|[ ._?&-])/i.test(visualMetadata),
    false,
    `${circuit}: map/graphic/illustration media cannot be a fallback photograph`,
  );
  const circuitWin = enabledWins.find(({ team, win }) => team.id !== 'ferrari' && win.circuit === circuit)?.win;
  assert.ok(circuitWin, `${circuit}: fallback must correspond to a retained non-Ferrari circuit`);
  assert.equal(verifiedF1CircuitImage(circuitWin, image)?.src, image.src, `${circuit}: fallback must pass the circuit-only image policy`);
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

assert.equal(F1_WIN_IMAGE_MANIFEST.length, enabledWins.length, 'every enabled win must have a manifest entry');
assert.equal(new Set(F1_WIN_IMAGE_MANIFEST.map((entry) => entry.recordKey)).size, enabledWins.length, 'manifest record keys must be unique');
const displayedEntries = F1_WIN_IMAGE_MANIFEST.filter((entry) => entry.display);
const displayedCarEntries = displayedEntries.filter((entry) => entry.imageRole !== 'circuit');
assert.equal(new Set(displayedCarEntries.map((entry) => entry.src)).size, displayedCarEntries.length, 'displayed car photographs must be unique');
assert.equal('generatedArtwork' in F1_IMAGE_MANIFEST_SUMMARY, false, 'generated artwork must not be part of the F1 image summary');
assert.equal(F1_IMAGE_MANIFEST_SUMMARY.verifiedPhotos, 1013, 'every retained win must have a verified car or circuit image');
assert.equal(F1_IMAGE_MANIFEST_SUMMARY.unavailable, 0, 'all retained wins must have a verified car or circuit image');

const retainedCircuits = new Set(enabledWins.filter(({ team }) => team.id !== 'ferrari').map(({ win }) => win.circuit));
assert.deepEqual(
  [...retainedCircuits].filter((circuit) => !F1_CIRCUIT_PHOTOS[circuit]),
  [],
  'every retained circuit must have a verified fallback candidate',
);
assert.equal(Object.keys(F1_CIRCUIT_PHOTOS).length, retainedCircuits.size, 'every retained circuit must have exactly one photographic fallback record');

assert.equal(
  isF1CarImage({
    file: 'File:1996 McLaren F1 Chassis No 63 6.1 Front.jpg',
    title: '1996 McLaren F1 Chassis No 63 6.1 Front.jpg',
    label: '1996 McLaren F1 Chassis No 63 6.1 Front.jpg',
  }),
  false,
  'McLaren F1 road cars must never pass the Formula 1 car policy',
);
assert.equal(
  isF1CarImage(F1_WIN_PHOTOS['mclaren:1']),
  true,
  'McLaren win 1 must use the Formula 1 replacement, not the McLaren F1 road car',
);

for (const { team, win } of enabledWins) {
  const key = `${team.id}:${win.number}`;
  const resolved = resolveF1WinImage(team, win);
  const entry = F1_WIN_IMAGE_MANIFEST.find((candidate) => candidate.recordKey === key);
  assert.ok(entry, `${key}: resolved image needs a manifest entry`);
  assert.equal(entry?.display, resolved.verificationStatus === 'verified', `${key}: only verified images may be marked for display`);
  assert.ok(entry?.subject.team === team.name, `${key}: manifest image subject must name the winning team`);
  assert.ok(entry?.subject.driver === win.driver, `${key}: manifest image subject must name the winning driver`);
  assert.equal(entry?.subject.season, win.year, `${key}: manifest image subject must name the winning season`);
  assert.ok(entry?.imageRole, `${key}: manifest image needs an honest role label`);
  assert.ok(entry?.reuseBasis, `${key}: displayed image needs a reuse basis`);
  assert.ok(entry?.verificationStatus === 'verified' || entry?.verificationStatus === 'unavailable', `${key}: invalid verification status`);
  if (entry?.verificationStatus === 'verified') {
    assert.ok(entry.src?.startsWith('/f1-wins/') || entry.src?.startsWith('https://'), `${key}: displayed image must be local or source-linked`);
    if (entry.imageRole !== 'circuit') {
      assert.ok(entry.src?.startsWith('/f1-wins/'), `${key}: displayed car photo must be local`);
      assert.ok(entry.src?.endsWith('.webp'), `${key}: local display photo must be WebP`);
    }
    assert.notEqual(entry.imageRole, 'unavailable', `${key}: displayed photo needs a context role`);
    if (entry.imageRole === 'circuit') {
      assert.equal(resolved.kind, 'circuit', `${key}: circuit fallback must resolve as a circuit image`);
      assert.equal(F1_CIRCUIT_PHOTOS[win.circuit]?.src, entry.src, `${key}: circuit fallback must match the associated circuit`);
      assert.equal(verifiedF1CircuitImage(win, F1_CIRCUIT_PHOTOS[win.circuit])?.src, entry.src, `${key}: circuit fallback must pass the circuit policy`);
    } else if (key.startsWith('ferrari:')) {
      assert.ok(entry.src?.startsWith('/f1-wins/win_'), `${key}: Ferrari display photo must be a car photograph asset`);
    } else {
      assert.ok(F1_WIN_PHOTOS[key] && isF1CarImage(F1_WIN_PHOTOS[key]), `${key}: displayed photo must identify a full Formula 1 car`);
    }
  } else {
    assert.equal(entry?.src, null, `${key}: unavailable record must not have an image source`);
    assert.equal(entry?.display, false, `${key}: unavailable record must not be displayed as a photo`);
    assert.equal(entry?.imageRole, 'unavailable', `${key}: unavailable record needs an unavailable role`);
    assert.equal(resolved.src, undefined, `${key}: unavailable record must not resolve an image source`);
  }
}
for (const key of F1_CROSS_TEAM_IMAGE_KEYS) {
  const [teamId, number] = key.split(':');
  const team = F1_TEAMS.find((candidate) => candidate.id === teamId);
  const win = winsFor(teamId).find((candidate) => candidate.number === Number(number));
  const image = teamId === 'mclaren'
    ? (MCLAREN_RECENT_WIN_IMAGES[Number(number)] ?? MCLAREN_HISTORIC_WIN_IMAGES[Number(number)])
    : F1_WIN_IMAGES[key];
  assert.ok(team && win && image, `quarantined image must still have a traceable source record: ${key}`);
  assert.equal(verifiedF1WinImage(team, win, image), undefined, `cross-team image must remain quarantined: ${key}`);
}

const circuitCandidates = Object.values(F1_WIN_IMAGES).filter((image) => image.kind === 'circuit').length;

console.log(
  `F1 archive validated: ${F1_TEAMS.length} retained winning teams, ${F1_IMAGE_MANIFEST_SUMMARY.verifiedPhotos} real photos displayed `
  + `(${F1_IMAGE_MANIFEST_SUMMARY.unavailable} records honestly unavailable), `
  + `${circuitCandidates} circuit candidates and ${F1_CROSS_TEAM_IMAGE_KEYS.size} cross-team photos quarantined through ${F1_DATA_CUTOFF}.`,
);
