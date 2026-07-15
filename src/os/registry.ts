import { CARS } from '@/data/cars';
import { F1_TEAMS } from '@/data/f1Teams';
import { FERRARI_WINS } from '@/data/ferrariWins';
import { getWinImage } from '@/data/ferrariChassisImages';
import { RADIO_STATIONS } from '@/data/radioStations';
import { toThumb, THUMB_TILE } from '@/lib/wikimedia';
import type { CarRecord } from '@/types/car';
import type { FerrariWin } from '@/types/f1';
import CarApp from './apps/CarApp';
import WinApp from './apps/WinApp';
import RadioApp from './apps/RadioApp';
import InfoApp from './apps/InfoApp';
import GuideApp from './apps/GuideApp';
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

/* ── A century of cars: decade folders → one car each ── */

function carNode(car: CarRecord): AppNode {
  return {
    id: String(car.year),
    kind: 'app',
    name: car.hero_car_name,
    subtitle: `${car.manufacturer} · ${car.year}`,
    icon: { kind: 'photo', src: toThumb(car.image_url, THUMB_TILE) },
    component: CarApp,
    chrome: 'bleed',
    data: car,
    keywords: [car.manufacturer, car.country, car.category, car.era, String(car.year)].join(' '),
  };
}

function decadeFolders(): FolderNode[] {
  const byDecade = new Map<number, CarRecord[]>();
  for (const car of [...CARS].sort((a, b) => a.year - b.year)) {
    const d = Math.floor(car.year / 10) * 10;
    if (!byDecade.has(d)) byDecade.set(d, []);
    byDecade.get(d)!.push(car);
  }
  return [...byDecade.entries()].map(([decade, cars]) => ({
    id: `${decade}s`,
    kind: 'folder',
    name: `${decade}s`,
    subtitle: `${cars.length} ${cars.length === 1 ? 'car' : 'cars'}`,
    icon: { kind: 'label', text: `${String(decade).slice(2)}s` },
    layout: 'gallery',
    keywords: cars.map((c) => `${c.hero_car_name} ${c.manufacturer}`).join(' '),
    children: () => cars.map(carNode),
  }));
}

const carsFolder: FolderNode = {
  id: 'cars',
  kind: 'folder',
  name: 'A century of cars',
  subtitle: '1885–1984',
  icon: { kind: 'glyph', id: 'cars' },
  layout: 'icons',
  keywords: 'archive automobile timeline history century',
  children: decadeFolders,
};

/* ── F1 Archive: team folders → one win each ── */

function winNode(win: FerrariWin): AppNode {
  const img = getWinImage(win, THUMB_TILE);
  return {
    id: String(win.number),
    kind: 'app',
    name: `${win.grand_prix} Grand Prix`,
    subtitle: `${win.year} · ${win.driver}`,
    icon: img?.src ? { kind: 'photo', src: img.src } : { kind: 'label', text: String(win.number) },
    component: WinApp,
    chrome: 'bleed',
    data: win,
    keywords: [win.driver, win.chassis, win.circuit, String(win.year), `win ${win.number}`].join(' '),
  };
}

const f1Folder: FolderNode = {
  id: 'f1',
  kind: 'folder',
  name: 'F1 Archive',
  subtitle: 'Grand Prix victories',
  icon: { kind: 'glyph', id: 'f1' },
  layout: 'icons',
  keywords: 'formula one grand prix racing motorsport',
  children: () => F1_TEAMS.map((team): FolderNode => ({
    id: team.id,
    kind: 'folder',
    name: team.name,
    subtitle: team.enabled ? team.tagline : 'Coming soon',
    icon: { kind: 'image', src: team.logo },
    enabled: team.enabled,
    layout: 'gallery',
    keywords: `${team.name} formula one`,
    children: () => (team.id === 'ferrari' ? FERRARI_WINS.map(winNode) : []),
  })),
};

/* ── Apps ── */

const radioApp: AppNode = {
  id: 'radio',
  kind: 'app',
  name: 'Radio',
  subtitle: 'Period recordings',
  icon: { kind: 'glyph', id: 'radio' },
  component: RadioApp,
  chrome: 'panel',
  // The whole programme is folded in, not just the station names — otherwise
  // searching the composer or the piece you can actually hear ("Joplin",
  // "Maple Leaf Rag") finds nothing, which makes the search look broken.
  keywords: [
    'music', 'stations', 'tuner', 'fm', 'song', 'track', 'listen',
    ...RADIO_STATIONS.map((s) => `${s.name} ${s.era}`),
    ...RADIO_STATIONS.flatMap((s) => s.tracks.map((t) => `${t.title} ${t.artist} ${t.year}`)),
  ].join(' '),
};

const guideApp: AppNode = {
  id: 'guide',
  kind: 'app',
  name: 'Guide',
  subtitle: "What's on",
  icon: { kind: 'glyph', id: 'guide' },
  component: GuideApp,
  chrome: 'panel',
  keywords: 'listings contents index everything',
};

const infoApp: AppNode = {
  id: 'info',
  kind: 'app',
  name: 'Info',
  subtitle: 'The project',
  icon: { kind: 'glyph', id: 'info' },
  component: InfoApp,
  chrome: 'panel',
  keywords: 'about credits sources licence colophon',
};

/** The root. Everything the set can show hangs off here. */
export const DESKTOP: FolderNode = {
  id: 'root',
  kind: 'folder',
  name: 'Classicverse',
  layout: 'icons',
  children: (): OSNode[] => [carsFolder, f1Folder, radioApp, guideApp, infoApp],
};
