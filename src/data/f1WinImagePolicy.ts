import type { F1Team, F1WinImage, F1WinRecord } from '@/types/f1';

const NON_CAR_IMAGE_TERMS = [
  'helmet', 'trophy', 'championship cup', 'podium', 'parade', 'paddock', 'pit', 'garage',
  'truck', 'safety car', 'engine', 'wing', 'steering', 'cockpit', 'model', 'toy',
  'museum room', 'drivers championship', 'grid', 'line up', 'duo', 'crash', 'celebration',
  'frontview', 'rearview', 'road car', 'roadcar', 'supercar', 'gtr',
];

const F1_CAR_MODEL_PATTERN = /\b(?:car|racing car|chassis|mp\d+[a-z]?|mcl\d+[a-z]?|fw\d+[a-z]?|rb\d+[a-z]?|w\d+[a-z]?|bt\d+[a-z]?|re\d+[a-z]?|rs\d+[a-z]?|b\d{2,3}|lotus\s+\d+|f1\s+car|formula one car|formula 1 car)\b/i;

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

/** Source files confirmed deleted upstream; skip the failed request entirely. */
export const F1_BROKEN_IMAGE_KEYS = new Set<string>([
  'mclaren:113',
  'mclaren:115',
  'mclaren:117',
  'mclaren:119',
  'mclaren:138',
  'mclaren:144',
  'mclaren:157',
  'red-bull:75',
  'red-bull:93',
  'lotus:24',
]);

function normalized(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Reject people, parts, trophies, road cars and other non-F1 subjects. */
export function isF1CarImage(image: Pick<F1WinImage, 'title' | 'label' | 'file'>): boolean {
  const sourceText = normalized([image.title, image.label, image.file].join(' '));
  if (NON_CAR_IMAGE_TERMS.some((term) => sourceText.includes(term))) return false;
  if (sourceText.includes('mclaren f1')
    && !/\b(?:formula one|formula 1|f1 car|mp\d|mcl\d)\b/.test(sourceText)) return false;
  return F1_CAR_MODEL_PATTERN.test(sourceText);
}

/** Require a Commons source page or explicit verified rights metadata. */
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
 * Return a photograph only when it is safe to present as that exact win.
 *
 * Circuit-only photography is useful research material, but it is not evidence
 * of a particular victory and can easily put another constructor in the wrong
 * folder. Race images also need a textual link to the winner or constructor;
 * anything uncertain falls back to a labelled photograph of the constructor.
 */
export function verifiedF1WinImage(
  team: Pick<F1Team, 'id' | 'name'>,
  win: F1WinRecord,
  image: F1WinImage | undefined,
): F1WinImage | undefined {
  if (!image || image.kind !== 'race') return undefined;
  const key = `${team.id}:${win.number}`;
  if (F1_CROSS_TEAM_IMAGE_KEYS.has(key) || F1_BROKEN_IMAGE_KEYS.has(key)) return undefined;
  if (image.src.startsWith('/f1-wins/')
    && (!hasLawfulF1ImageBasis(image) || !isF1CarImage(image))) return undefined;
  if (!image.src.startsWith('/f1-wins/')
    && (!image.src.startsWith('https://') || !image.sourceUrl.startsWith('https://'))) return undefined;

  const sourceText = normalized([image.title, image.label, image.src, image.sourceUrl].join(' '));
  const driverSurname = normalized(win.driver).split(' ').at(-1) ?? '';
  const teamTerms = [normalized(team.name), normalized(team.id.replaceAll('-', ' '))]
    .map((term) => term.replace(/^team /, ''))
    .filter(Boolean);

  const namesWinner = driverSurname.length > 1 && sourceText.includes(driverSurname);
  const namesTeam = teamTerms.some((term) => sourceText.includes(term));
  return namesWinner || namesTeam ? image : undefined;
}

/** Admit only sourced ground-level photographs of the associated circuit. */
export function verifiedF1CircuitImage(
  win: F1WinRecord,
  image: F1WinImage | undefined,
): F1WinImage | undefined {
  if (!image || image.kind !== 'circuit' || image.mediaType !== 'photograph') return undefined;
  if (!hasLawfulF1ImageBasis(image)) return undefined;

  const sourceText = normalized([image.title, image.label, image.file, image.src].join(' '));
  const forbiddenTerms = [
    'map', 'diagram', 'schematic', 'layout', 'illustration', 'render', 'poster', 'graphic',
    'aerial', 'aereo', 'aeria', 'satellite', 'skysat', 'luftaufnahme', 'drone', 'from above',
    'bird eye', 'air view', 'overhead', 'car', 'driver', 'podium', 'garage', 'model', 'toy',
    'truck', 'road car', 'roadcar', 'vehicle', 'automobile', 'motorcycle', 'toyota', 'supra',
    'automatic', 'corvette', 'porsche', 'motogp', 'world endurance', 'wec', 'indycar',
    'nascar', 'formula e', 'championship', 'cobra', 'caterham', 'yamaha', 'vinales',
    'historic formula', 'test session', 'showcar', 'parked', 'speedfest', '24h', 'moto',
    'guzzi', 'lexus', 'super gt', 'cooper', 'brawn', 'button', 'wurz', 'museum',
    'monument', 'statue', 'sculpture', 'helmet', 'wing', 'engine', 'steering', 'cockpit',
  ];
  const sourceWords = sourceText.split(' ');
  if (forbiddenTerms.some((term) => term.includes(' ')
    ? sourceText.includes(term)
    : sourceWords.includes(term))) return undefined;
  if (!['circuit', 'track', 'raceway', 'speedway', 'autodrome', 'autodromo']
    .some((term) => sourceText.includes(term))) return undefined;
  const sourceTokens = new Set(sourceWords);
  const circuitTokens = normalized(win.circuit).split(' ').filter((token) => token.length > 3);
  return circuitTokens.some((token) => sourceTokens.has(token)) ? image : undefined;
}
