import type { F1Team, F1WinImage, F1WinRecord } from '@/types/f1';

/**
 * Photos whose source metadata explicitly describes another constructor in the
 * frame. They remain in the research index so they can be replaced deliberately,
 * but they must never appear inside the winning team's folder.
 */
export const F1_CROSS_TEAM_IMAGE_KEYS = new Set<string>();

const NON_CAR_IMAGE_TERMS = [
  'helmet', 'trophy', 'championship cup', 'podium', 'parade', 'paddock', 'pit', 'garage',
  'truck', 'safety car', 'engine', 'wing', 'steering', 'cockpit', 'model', 'toy',
  'museum room', 'drivers championship', 'grid', 'line up', 'duo', 'crash', 'celebration',
  'frontview', 'rearview', 'road car', 'roadcar', 'supercar', 'gtr',
];

const F1_CAR_MODEL_PATTERN = /\b(?:car|racing car|chassis|mp\d+[a-z]?|mcl\d+[a-z]?|fw\d+[a-z]?|rb\d+[a-z]?|w\d+[a-z]?|bt\d+[a-z]?|re\d+[a-z]?|rs\d+[a-z]?|b\d{2,3}|lotus\s+\d+|f1\s+car|formula one car|formula 1 car)\b/i;

/** True when the source metadata identifies a full Formula 1 car, not a person, part, trophy or other vehicle. */
export function isF1CarImage(image: Pick<F1WinImage, 'title' | 'label' | 'file'>): boolean {
  const sourceText = normalized([image.title, image.label, image.file].join(' '));
  if (NON_CAR_IMAGE_TERMS.some((term) => sourceText.includes(term))) return false;
  return F1_CAR_MODEL_PATTERN.test(sourceText);
}

function normalized(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * A direct image URL is not a reuse licence. Displayed non-Ferrari photos are
 * local WebP derivatives of Wikimedia Commons files; the Commons file page is
 * retained as the attribution/reuse record. Other candidates remain research
 * data and cannot be displayed.
 */
export function hasLawfulF1ImageBasis(image: F1WinImage): boolean {
  try {
    const sourceUrl = new URL(image.sourceUrl);
    const isLocalCommonsPhoto = image.src.startsWith('/f1-wins/')
      && sourceUrl.hostname === 'commons.wikimedia.org';
    const hasExplicitRights = Boolean(image.reuseBasis)
      && image.verificationStatus === 'verified';
    return isLocalCommonsPhoto || hasExplicitRights;
  } catch {
    return false;
  }
}

/**
 * Return a photograph only when it is safe to present alongside that win
 * record as contextual imagery.
 *
 * Circuit-only photography is useful research material, but it is not evidence
 * of a particular victory and can easily put another constructor in the wrong
 * folder. Race images also need a textual link to the winner or constructor;
 * anything uncertain remains unavailable rather than displaying a graphic or
 * borrowing a circuit-only/cross-team image.
 */
export function verifiedF1WinImage(
  team: Pick<F1Team, 'id' | 'name'>,
  win: F1WinRecord,
  image: F1WinImage | undefined,
): F1WinImage | undefined {
  if (!image || image.kind !== 'race') return undefined;
  if (!hasLawfulF1ImageBasis(image)) return undefined;
  if (F1_CROSS_TEAM_IMAGE_KEYS.has(`${team.id}:${win.number}`)) return undefined;
  if (!isF1CarImage(image)) return undefined;

  const sourceText = normalized([image.title, image.label, image.src, image.sourceUrl].join(' '));
  const driverSurname = normalized(win.driver).split(' ').at(-1) ?? '';
  const teamTerms = [normalized(team.name), normalized(team.id.replaceAll('-', ' '))]
    .map((term) => term.replace(/^team /, ''))
    .filter(Boolean);

  const namesWinner = driverSurname.length > 1 && sourceText.includes(driverSurname);
  const namesTeam = teamTerms.some((term) => sourceText.includes(term));
  return namesWinner || namesTeam ? image : undefined;
}

/** Return an associated circuit photograph, but never a race/team image. */
export function verifiedF1CircuitImage(
  win: F1WinRecord,
  image: F1WinImage | undefined,
): F1WinImage | undefined {
  if (!image || image.kind !== 'circuit') return undefined;
  if (!hasLawfulF1ImageBasis(image)) return undefined;

  const sourceText = normalized([image.title, image.label, image.src, image.sourceUrl].join(' '));
  const forbiddenTerms = [
    'car', 'driver', 'podium', 'garage', 'model', 'toy', 'truck', 'road', 'road car', 'roadcar',
    'vehicle', 'automobile', 'motorcycle', 'toyota', 'supra', 'automatic', 'corvette', 'porsche',
    'museum', 'monument', 'statue', 'sculpture', 'helmet', 'wing', 'engine', 'steering', 'cockpit',
  ];
  const sourceWords = sourceText.split(' ');
  if (forbiddenTerms.some((term) => term.includes(' ') ? sourceText.includes(term) : sourceWords.includes(term))) return undefined;
  if (!['circuit', 'track', 'speedway', 'autodrome', 'autodromo', 'aerial', 'satellite', 'skysat'].some((term) => sourceText.includes(term))) return undefined;
  const circuitText = normalized(win.circuit);
  const sourceTokens = new Set(sourceText.split(' '));
  const circuitTokens = circuitText.split(' ').filter((token) => token.length > 3);
  return circuitTokens.some((token) => sourceTokens.has(token)) ? image : undefined;
}
