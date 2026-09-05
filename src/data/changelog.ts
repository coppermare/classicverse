export interface ChangelogEntry {
  date: string;
  displayDate: string;
  title: string;
  summary: string;
}

/**
 * Product milestones reconstructed from the repository history.
 *
 * These are deliberately editorial rather than a commit feed: one entry per
 * meaningful change a visitor could see or use, with internal refactors and
 * corrective follow-ups folded into the feature they completed.
 */
export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: '2026-09-05',
    displayDate: '5 September 2026',
    title: 'Every channel gets a direct route',
    summary: 'The F1 Archive, century of cars, radio, weather, Snake and changelog move onto direct application routes, with deep links and browser navigation preserved inside the television shell.',
  },
  {
    date: '2026-09-05',
    displayDate: '5 September 2026',
    title: 'The archive gains a release check',
    summary: 'Automated preflight checks now cover routes, interface behavior, media reachability and all 951 displayed F1 photographs before a production build is accepted.',
  },
  {
    date: '2026-08-31',
    displayDate: '31 August 2026',
    title: 'Seven constructors remain on the grid',
    summary: 'The public F1 index is focused on Ferrari, McLaren, Mercedes, Red Bull, Williams, Team Lotus and Renault, each presented with its own constructor mark.',
  },
  {
    date: '2026-08-31',
    displayDate: '31 August 2026',
    title: 'F1 photography is audited',
    summary: 'Illustrations, maps, broken files and cross-team mismatches are removed from display. Every retained victory receives a distinct sourced photograph with a traceable record.',
  },
  {
    date: '2026-08-31',
    displayDate: '31 August 2026',
    title: 'Long galleries become lighter',
    summary: 'F1 folders request smaller thumbnails and release photographs outside the scroll area, reducing memory use and preventing large constructor archives from stalling the page.',
  },
  {
    date: '2026-08-17',
    displayDate: '17 August 2026',
    title: 'The F1 Archive opens out',
    summary: 'Grand Prix history expands into constructor galleries, giving each victory its own race record, driver, circuit, season and image view.',
  },
  {
    date: '2026-08-17',
    displayDate: '17 August 2026',
    title: 'The television fills the viewport',
    summary: 'A dedicated screen control expands the set into an edge-to-edge viewing mode while keeping the cabinet controls within reach.',
  },
  {
    date: '2026-07-22',
    displayDate: '22 July 2026',
    title: 'Snake joins the set',
    summary: 'A complete green-phosphor Snake game arrives with responsive walls, keyboard and swipe steering, score persistence, pause and restart states, and rules tested independently from the screen.',
  },
  {
    date: '2026-07-22',
    displayDate: '22 July 2026',
    title: 'Weather goes worldwide',
    summary: 'The live forecast channel grows from a small dial into a searchable world-city index, retaining saved places and units while the cabinet controls each keep one clear job.',
  },
  {
    date: '2026-07-21',
    displayDate: '21 July 2026',
    title: 'The set remembers its state',
    summary: 'Power, volume and saved weather locations persist between visits, so the television returns in the condition its viewer left it.',
  },
  {
    date: '2026-07-20',
    displayDate: '20 July 2026',
    title: 'Large folders stop rebuilding',
    summary: 'Archive nodes and tiles are cached and memoized, keeping pointer movement and keyboard navigation responsive inside long galleries.',
  },
  {
    date: '2026-07-20',
    displayDate: '20 July 2026',
    title: 'The tuning roller follows the list',
    summary: 'Wheel and hardware-style tuning input move through the visible archive with predictable detents, independent of folder length.',
  },
  {
    date: '2026-07-19',
    displayDate: '19 July 2026',
    title: 'Radio becomes a real receiver',
    summary: 'The radio moves onto a generated band of public internet stations, with live streams, crowded-frequency station stepping, signal states and the television volume controlling the broadcast.',
  },
  {
    date: '2026-07-15',
    displayDate: '15 July 2026',
    title: 'The set becomes an operating system',
    summary: 'Classicverse is rebuilt around one registry-driven desktop. Folders and applications now share URL-addressable paths, Back, Forward, Up and Home controls, global search, keyboard navigation and one physical tuning roller.',
  },
  {
    date: '2026-07-13',
    displayDate: '13 July 2026',
    title: 'The car archive becomes one exact century',
    summary: 'The exhibition settles on 100 cars from 1885 through 1984, ordered chronologically as a continuous gallery.',
  },
  {
    date: '2026-07-13',
    displayDate: '13 July 2026',
    title: 'Formula One joins the archive',
    summary: 'Constructor victories arrive as a second historical collection inside the television, alongside the century of cars.',
  },
  {
    date: '2026-07-10',
    displayDate: '10 July 2026',
    title: 'Home becomes a desktop',
    summary: 'The opening screen changes into a light desktop of folders and applications, giving every channel one clear place in the set.',
  },
  {
    date: '2026-07-09',
    displayDate: '9 July 2026',
    title: 'The cabinet controls find their jobs',
    summary: 'Brand marks, physical-style controls, sound cues and archive navigation are brought together as one coherent television interface.',
  },
  {
    date: '2026-05-03',
    displayDate: '3 May 2026',
    title: 'The television wakes up',
    summary: 'The interface gains a real power ritual: a CRT boot sequence, hardware-style controls and pixel cursors turn the archive frame into a television visitors operate.',
  },
  {
    date: '2026-04-30',
    displayDate: '30 April 2026',
    title: 'The century gains chronological controls',
    summary: 'A year scrubber, drum wheel and navigation bar make it possible to move precisely through the car timeline.',
  },
  {
    date: '2026-04-29',
    displayDate: '29 April 2026',
    title: 'Classicverse begins',
    summary: 'The project starts as a sourced classic-car encyclopedia with a searchable chronological timeline, detailed historical writing, facts, selection reasoning and image attribution.',
  },
] as const;
