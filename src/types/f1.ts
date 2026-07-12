// Types for the F1 Archive channel — the Ferrari wins archive and (future) other teams.

export interface F1Team {
  id: string;        // 'ferrari', 'red-bull', 'mercedes', ...
  name: string;      // 'Ferrari'
  tagline: string;   // '250 Grand Prix wins'
  accent: string;    // livery hex used for the folder tile
  logo: string;      // path under /public to the team's logo mark
  enabled: boolean;  // only Ferrari is live; the rest are "coming soon"
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

// One Ferrari Formula One Grand Prix win. Fields mirror the statsf1 victory
// table (statsf1.com/en/ferrari/victoire.aspx), the source of record.
export interface FerrariWin {
  number: number;      // 1–250, chronological
  year: number;
  grand_prix: string;  // 'Britain'
  circuit: string;     // 'Silverstone'
  car_number: string;  // race number carried, e.g. '16'
  driver: string;      // display name, e.g. 'Charles Leclerc'
  chassis: string;     // 'SF-26'
  engine: string;      // 'Ferrari'
}
