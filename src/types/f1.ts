// Types for the F1 Archive channel.

export interface F1ArchiveImage {
  src: string;
  sourceUrl: string;
  label: string;
}

export interface F1WinImage {
  file: string;
  src: string;
  sourceUrl: string;
  title: string;
  label: string;
  kind: 'team' | 'race' | 'circuit';
  /** Optional rights metadata for future non-Commons sources. */
  reuseBasis?: string;
  creator?: string;
  verificationStatus?: 'verified' | 'quarantined';
}

/** The honest relationship between a displayed image and the victory record. */
export type F1ImageRole =
  | 'exact-win'
  | 'same-event'
  | 'same-season'
  | 'team-era';

export type F1ImageVerificationStatus = 'verified' | 'unavailable';

export interface F1Team {
  id: string;        // 'ferrari', 'red-bull', 'mercedes', ...
  name: string;      // 'Ferrari'
  tagline: string;   // '250 Grand Prix wins'
  accent: string;    // livery hex used for the folder tile
  logo?: string;     // optional path under /public to the team's logo mark
  archiveImage?: F1ArchiveImage;
  mark: string;      // compact text fallback when no reusable logo is available
  enabled: boolean;  // false only for an explicit zero-win placeholder
}

// One freely-licensed Wikimedia Commons photo of a specific Ferrari chassis.
// Reused across every win that car scored (see ferrariChassisImages.ts).
export interface ChassisImage {
  src: string;             // direct upload.wikimedia.org URL
  license: string;         // e.g. 'CC BY-SA 4.0'
  creator: string;         // photographer / author
  attribution_url: string; // Commons File: page
  note?: string;           // set when the image is a same-family substitute
}

// Shared display fields for a Formula One constructor win. Ferrari supplies
// richer hand-curated car details; the generated Jolpica records add race date
// and source metadata but intentionally do not invent chassis or engine data.
export interface F1WinRecord {
  number: number;      // 1–250, chronological
  year: number;
  grand_prix: string;  // 'Britain'
  circuit: string;     // 'Silverstone'
  car_number: string;  // race number carried, e.g. '16'
  driver: string;      // display name, e.g. 'Charles Leclerc'
  chassis?: string;    // 'SF-26'; unavailable in the results API for other teams
  engine?: string;     // 'Ferrari'; unavailable in the results API for other teams
  date?: string;       // ISO race date for generated records
  source_url?: string; // race source supplied by the results API
  source_constructor?: string; // constructor label used by the source dataset
}

/** Ferrari records retain the richer hand-curated car specification. */
export interface FerrariWin extends F1WinRecord {
  chassis: string;
  engine: string;
}

/** A generated result record; Jolpica does not provide chassis or engine fields. */
export type ConstructorWin = F1WinRecord;

/** A win after it has been attached to a team folder for display. */
export interface F1Win extends F1WinRecord {
  teamId: string;
  teamName: string;
  teamMark: string;
  teamAccent: string;
  teamWinCount: number;
  teamImage?: string;
  teamImageLabel?: string;
  teamImageSourceUrl?: string;
  teamImageKind?: F1WinImage['kind'];
  teamImageRole?: F1ImageRole;
  teamImageReuseBasis?: string;
  teamImageCreator?: string;
  teamImageVerificationStatus?: F1ImageVerificationStatus;
}
