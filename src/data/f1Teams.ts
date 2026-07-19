import type { F1Team } from '@/types/f1';

// The F1 Archive team roster. Ferrari is live (250 wins); the rest are
// "coming soon" placeholders. Accent colors follow each team's livery.
// Logos live in /public/f1-logos: Ferrari/Mercedes/McLaren reuse the project's
// existing brand marks (CC0 Simple Icons / Wikimedia); Red Bull and Aston Martin
// are Simple Icons (CC0); Williams is the CC BY-SA 4.0 Commons mark.
export const F1_TEAMS: F1Team[] = [
  // The full Scuderia badge — shield, tricolore and horse — rather than the bare
  // horse glyph, which read as an anonymous silhouette next to the other marques.
  { id: 'ferrari',      name: 'Ferrari',      tagline: '250 Grand Prix wins', accent: '#DC0000', logo: '/f1-logos/ferrari-emblem.svg', enabled: true  },
  { id: 'red-bull',     name: 'Red Bull',     tagline: 'Archive',             accent: '#223971', logo: '/f1-logos/red-bull.svg',     enabled: false },
  { id: 'mercedes',     name: 'Mercedes',     tagline: 'Archive',             accent: '#00A19B', logo: '/f1-logos/mercedes.svg',     enabled: false },
  { id: 'mclaren',      name: 'McLaren',      tagline: 'Archive',             accent: '#FF8000', logo: '/f1-logos/mclaren.svg',      enabled: false },
  { id: 'williams',     name: 'Williams',     tagline: 'Archive',             accent: '#00A3E0', logo: '/f1-logos/williams.svg',     enabled: false },
  { id: 'aston-martin', name: 'Aston Martin', tagline: 'Archive',             accent: '#00594F', logo: '/f1-logos/aston-martin.svg', enabled: false },
];

export const getF1Team = (id: string) => F1_TEAMS.find((t) => t.id === id);
