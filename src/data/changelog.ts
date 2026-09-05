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
    date: '2026-08-17',
    displayDate: '17 August 2026',
    title: 'The F1 Archive opens out',
    summary: 'Grand Prix history expands into focused galleries for seven landmark constructors, pairing every listed victory with a distinct sourced photograph and race record. The television also gains its edge-to-edge fill view.',
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
    title: 'One century, and Formula One',
    summary: 'The car exhibition settles on an exact century from 1885 through 1984, while the first F1 constructor archive arrives as a second historical channel inside a substantially reworked television.',
  },
  {
    date: '2026-05-03',
    displayDate: '3 May 2026',
    title: 'The television wakes up',
    summary: 'The interface gains a real power ritual: a CRT boot sequence, hardware-style controls and pixel cursors turn the archive frame into a television visitors operate.',
  },
  {
    date: '2026-04-29',
    displayDate: '29 April 2026',
    title: 'Classicverse begins',
    summary: 'The project starts as a sourced classic-car encyclopedia with a searchable chronological timeline, detailed historical writing, facts, selection reasoning and image attribution.',
  },
] as const;
