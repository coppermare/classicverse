import { CARS } from '@/data/cars';
import { F1_TEAMS } from '@/data/f1Teams';
import { FERRARI_WINS } from '@/data/ferrariWins';
import { F1_WINS_BY_TEAM } from '@/data/f1Wins.generated';
import { F1_WIN_IMAGES } from '@/data/f1WinImages.generated';
import { MCLAREN_RECENT_WIN_IMAGES } from '@/data/mclarenRecentWinImages';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '@/data/mclarenHistoricWinImages';
import { getWinImage } from '@/data/ferrariChassisImages';
import { toThumb, THUMB_TILE } from '@/lib/wikimedia';
import type { CarRecord } from '@/types/car';
import type { F1Team, F1Win, F1WinRecord, FerrariWin } from '@/types/f1';
import CarApp from './apps/CarApp';
import WinApp from './apps/WinApp';
import RadioApp from './apps/RadioApp';
import WeatherApp from './apps/WeatherApp';
import SnakeApp from './apps/SnakeApp';
import type { AppNode, FolderNode, OSNode } from './types';

/**
 * The desktop tree — the single place the system is defined.
 *
 * Adding a module (a game, a settings panel, another archive) means adding a
 * node here. The shell renders folders and apps generically and knows nothing
 * about cars, Ferrari or radios, so nothing else has to change.
 *
 * Children are built lazily. `cars` alone expands to 100 nodes and `ferrari` to
 * 250; deferring construction until a folder is opened keeps boot instant and
 * means a module can be arbitrarily large without slowing the desktop.
 */

/**
 * Builds a folder's children once, then hands back the same array forever.
 *
 * Lazy and *repeatable* are different things, and only the first was true here.
 * Every caller that asked a folder what it contained paid to rebuild the whole
 * list — and the shell asks constantly: once to work out the default selection,
 * once more to count the items for the live region, again for the roller. Inside
 * Ferrari that meant 250 nodes reconstructed several times per render, each one
 * re-deriving its thumbnail URL, and a render happens every time the pointer
 * crosses a tile.
 *
 * Caching also makes the array referentially stable, which is what lets the
 * `useMemo`s downstream actually hold: they key off the node, so a fresh array
 * on every call quietly defeated them.
 */
function lazy(build: () => OSNode[]): () => OSNode[] {
  let built: OSNode[] | null = null;
  return () => (built ??= build());
}

/* ── A century of cars: decade folders → one car each ── */

function carNode(car: CarRecord): AppNode {
  return {
    id: String(car.year),
    kind: 'app',
    name: car.hero_car_name,
    subtitle: `${car.manufacturer} - ${car.year}`,
    icon: { kind: 'photo', src: toThumb(car.image_url, THUMB_TILE) },
    component: CarApp,
    chrome: 'bleed',
    data: car,
    keywords: [car.manufacturer, car.country, car.category, car.era, String(car.year)].join(' '),
  };
}

/**
 * The century opens straight onto every car, as one gallery.
 *
 * It used to sit behind a row of decade folders, which meant two clicks and a
 * near-empty screen before you saw a single car — and the decades carried no
 * information the year on each photo didn't already give you. The archive's whole
 * point is the run of a hundred machines in order, so show it.
 */
const carsFolder: FolderNode = {
  id: 'cars',
  kind: 'folder',
  name: 'A century of cars',
  subtitle: '1885–1984',
  icon: { kind: 'glyph', id: 'cars' },
  layout: 'gallery',
  keywords: 'archive automobile timeline history century decade',
  children: lazy(() => [...CARS].sort((a, b) => a.year - b.year).map(carNode)),
};

/* ── F1 Archive: team folders → one win each ── */

function winNode(team: F1Team, win: F1WinRecord, teamWinCount: number): AppNode {
  const sourceImage = team.id === 'ferrari'
    ? undefined
    : team.id === 'mclaren'
      // McLaren only receives its hand-verified, first-party race photography.
      // The broad archive pool can contain a different constructor at the same
      // circuit, which is worse than honestly leaving an older win unsourced.
      ? (MCLAREN_RECENT_WIN_IMAGES[win.number] ?? MCLAREN_HISTORIC_WIN_IMAGES[win.number])
      : F1_WIN_IMAGES[`${team.id}:${win.number}`];
  const record: F1Win = {
    ...win,
    teamId: team.id,
    teamName: team.name,
    teamMark: team.mark,
    teamAccent: team.accent,
    teamWinCount,
    ...(sourceImage ? {
      teamImage: sourceImage.src,
      teamImageLabel: sourceImage.label,
      teamImageSourceUrl: sourceImage.sourceUrl,
      teamImageKind: sourceImage.kind,
    } : {}),
  };
  const img = team.id === 'ferrari' ? getWinImage(win as FerrariWin, THUMB_TILE) : undefined;
  const thumbnail = img?.src ?? sourceImage?.src;
  return {
    id: String(win.number),
    kind: 'app',
    name: `${win.grand_prix} Grand Prix`,
    subtitle: `${win.year} - ${win.driver}`,
    icon: thumbnail ? { kind: 'photo', src: thumbnail } : { kind: 'label', text: team.mark },
    component: WinApp,
    chrome: 'bleed',
    data: record,
    keywords: [team.name, win.driver, win.chassis, win.circuit, String(win.year), `win ${win.number}`]
      .filter(Boolean)
      .join(' '),
  };
}

function winsForTeam(team: F1Team): F1WinRecord[] {
  return team.id === 'ferrari' ? FERRARI_WINS : (F1_WINS_BY_TEAM[team.id] ?? []);
}

const f1Folder: FolderNode = {
  id: 'f1',
  kind: 'folder',
  name: 'F1 Archive',
  subtitle: 'Grand Prix victories',
  icon: { kind: 'glyph', id: 'f1' },
  layout: 'icons',
  keywords: 'formula one grand prix racing motorsport',
  children: lazy(() => F1_TEAMS.map((team): FolderNode => {
    const wins = winsForTeam(team);
    return {
      id: team.id,
      kind: 'folder',
      name: team.name,
      subtitle: team.enabled ? team.tagline : 'No Grand Prix wins yet',
      icon: team.logo
        ? { kind: 'image', src: team.logo }
        : team.archiveImage
          ? { kind: 'photo', src: team.archiveImage.src }
          : { kind: 'label', text: team.mark },
      enabled: team.enabled,
      layout: 'gallery',
      keywords: `${team.name} formula one constructor grand prix wins`,
      children: lazy(() => wins.map((win) => winNode(team, win, wins.length))),
    };
  })),
};

/* ── Apps ── */

const radioApp: AppNode = {
  id: 'radio',
  kind: 'app',
  name: 'Radio',
  subtitle: 'Live FM',
  icon: { kind: 'glyph', id: 'radio' },
  component: RadioApp,
  chrome: 'panel',
  // The programme is whatever is on air at the moment, so there is nothing
  // static to index beyond the set itself.
  keywords: 'music stations tuner fm song listen live broadcast band',
};

const weatherApp: AppNode = {
  id: 'weather',
  kind: 'app',
  name: 'Weather',
  subtitle: 'Live forecast',
  icon: { kind: 'glyph', id: 'weather' },
  component: WeatherApp,
  chrome: 'panel',
  // Like the Radio, what it shows is whatever is true at the moment, so there
  // is nothing static to index beyond the channel itself.
  keywords: 'forecast temperature rain sun cloud wind climate outlook meteo',
};

const snakeApp: AppNode = {
  id: 'snake',
  kind: 'app',
  name: 'Snake',
  subtitle: 'The game',
  icon: { kind: 'glyph', id: 'snake' },
  component: SnakeApp,
  chrome: 'panel',
  keywords: 'game play arcade classic nokia retro snake pellet high score',
};

/** The root. Everything the set can show hangs off here. */
export const DESKTOP: FolderNode = {
  id: 'root',
  kind: 'folder',
  name: 'Classicverse',
  layout: 'icons',
  children: lazy((): OSNode[] => [f1Folder, carsFolder, radioApp, weatherApp, snakeApp]),
};
