import assert from 'node:assert/strict';
import { F1_TEAMS } from '../src/data/f1Teams';
import { FERRARI_WINS } from '../src/data/ferrariWins';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { MCLAREN_RECENT_WIN_IMAGES } from '../src/data/mclarenRecentWinImages';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '../src/data/mclarenHistoricWinImages';
import { F1_DATA_CUTOFF, F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';

const winsFor = (teamId: string) => teamId === 'ferrari'
  ? FERRARI_WINS
  : (F1_WINS_BY_TEAM[teamId] ?? []);

assert.equal(new Set(F1_TEAMS.map((team) => team.id)).size, F1_TEAMS.length, 'team ids must be unique');

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

const imageSources = [
  ...Object.entries(F1_WIN_IMAGES).filter(([key]) => !key.startsWith('mclaren:')).map(([, image]) => image),
  ...Object.values(MCLAREN_HISTORIC_WIN_IMAGES),
  ...Object.values(MCLAREN_RECENT_WIN_IMAGES),
].map((image) => image.src);
assert.equal(new Set(imageSources).size, imageSources.length, 'archive photographs must never repeat');
for (const [key, image] of Object.entries(F1_WIN_IMAGES)) {
  const [teamId, number] = key.split(':');
  assert.ok(winsFor(teamId).some((win) => win.number === Number(number)), `image has no matching win: ${key}`);
  assert.ok(image.src.startsWith('https://'), `${key}: photo must be a web image`);
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

console.log(`F1 archive validated: ${F1_TEAMS.length - 1} winning teams and ${imageSources.length} distinct sourced photos through ${F1_DATA_CUTOFF}.`);
