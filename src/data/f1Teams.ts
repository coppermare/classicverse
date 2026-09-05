import type { F1Team } from '@/types/f1';
import teamConfig from './f1TeamConfig.json';
import { FERRARI_WINS } from './ferrariWins';
import { F1_WINS_BY_TEAM } from './f1Wins.generated';
import { F1_TEAM_IMAGES } from './f1TeamImages';

/**
 * The visible archive is intentionally limited to the selected major
 * constructor identities. Counts are derived from the generated Jolpica
 * dataset, except Ferrari, whose richer hand-curated records and licensed
 * photographs remain canonical.
 */
export const F1_TEAMS: F1Team[] = teamConfig.map((team) => {
  const winCount = team.id === 'ferrari'
    ? FERRARI_WINS.length
    : (F1_WINS_BY_TEAM[team.id]?.length ?? 0);
  const archiveImage = F1_TEAM_IMAGES[team.id];

  return {
    id: team.id,
    name: team.name,
    mark: team.mark,
    accent: team.accent,
    ...('logo' in team ? { logo: team.logo } : {}),
    ...(archiveImage ? { archiveImage } : {}),
    tagline: winCount === 1 ? '1 Grand Prix win' : `${winCount} Grand Prix wins`,
    enabled: winCount > 0,
  };
});

export const getF1Team = (id: string) => F1_TEAMS.find((t) => t.id === id);

/** Teams selected for the visitor-facing archive; source records stay intact. */
const ARCHIVE_TEAM_IDS = new Set([
  'ferrari', 'mclaren', 'mercedes', 'red-bull',
  'williams', 'lotus', 'renault',
]);

export const F1_ARCHIVE_TEAMS = F1_TEAMS.filter((team) => ARCHIVE_TEAM_IDS.has(team.id));
