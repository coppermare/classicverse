import type { F1Team, F1WinImage, F1WinRecord } from '@/types/f1';

/**
 * Photos whose source metadata explicitly describes another constructor in the
 * frame. They remain in the research index so they can be replaced deliberately,
 * but they must never appear inside the winning team's folder.
 */
export const F1_CROSS_TEAM_IMAGE_KEYS = new Set<string>([
  'mclaren:2',
  'mclaren:10',
  'mclaren:11',
  'mclaren:12',
  'mclaren:13',
  'mclaren:57',
  'mclaren:59',
  'mclaren:95',
  'mclaren:114',
  'mclaren:180',
]);

function normalized(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Return a photograph only when it is safe to present as that exact win.
 *
 * Circuit-only photography is useful research material, but it is not evidence
 * of a particular victory and can easily put another constructor in the wrong
 * folder. Race images also need a textual link to the winner or constructor;
 * anything uncertain falls back to the labelled editorial card.
 */
export function verifiedF1WinImage(
  team: Pick<F1Team, 'id' | 'name'>,
  win: F1WinRecord,
  image: F1WinImage | undefined,
): F1WinImage | undefined {
  if (!image || image.kind !== 'race') return undefined;
  if (F1_CROSS_TEAM_IMAGE_KEYS.has(`${team.id}:${win.number}`)) return undefined;

  const sourceText = normalized([image.title, image.label, image.src, image.sourceUrl].join(' '));
  const driverSurname = normalized(win.driver).split(' ').at(-1) ?? '';
  const teamTerms = [normalized(team.name), normalized(team.id.replaceAll('-', ' '))]
    .map((term) => term.replace(/^team /, ''))
    .filter(Boolean);

  const namesWinner = driverSurname.length > 1 && sourceText.includes(driverSurname);
  const namesTeam = teamTerms.some((term) => sourceText.includes(term));
  return namesWinner || namesTeam ? image : undefined;
}
