import type { F1Team } from '@/types/f1';
import teamConfig from './f1TeamConfig.json';
import { FERRARI_WINS } from './ferrariWins';
import { F1_WINS_BY_TEAM } from './f1Wins.generated';
import { F1_TEAM_IMAGES } from './f1TeamImages';

/**
 * The archive includes every non-Indianapolis-only F1 race-winning constructor,
 * grouped under its familiar works-team identity. Counts are
 * derived from the generated Jolpica dataset, except Ferrari, whose richer
 * hand-curated records and licensed photographs remain canonical.
 *
 * Aston Martin is retained as an explicit current-team placeholder. It stays
 * disabled until the constructor records a World Championship Grand Prix win.
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
