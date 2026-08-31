import { FERRARI_WINS } from '@/data/ferrariWins';
import { getWinImage } from '@/data/ferrariChassisImages';
import { F1_WIN_IMAGES } from '@/data/f1WinImages.generated';
import { F1_WINS_BY_TEAM } from '@/data/f1Wins.generated';
import { F1_TEAMS } from '@/data/f1Teams';
import { MCLAREN_HISTORIC_WIN_IMAGES } from '@/data/mclarenHistoricWinImages';
import { MCLAREN_RECENT_WIN_IMAGES } from '@/data/mclarenRecentWinImages';
import { getF1WinArtwork } from '@/data/f1WinArtwork';
import { verifiedF1WinImage } from '@/data/f1WinImagePolicy';
import type {
  F1ImageRole,
  F1ImageVerificationStatus,
  F1Team,
  F1WinImage,
  F1WinRecord,
  FerrariWin,
} from '@/types/f1';

export interface F1WinImageManifestEntry {
  recordKey: string;
  src: string;
  imageRole: F1ImageRole;
  subject: {
    team: string;
    driver: string;
    season: number;
    car?: string;
  };
  sourcePage: string | null;
  reuseBasis: string;
  creator?: string;
  verificationStatus: F1ImageVerificationStatus;
  /** True when this is the image selected for the record's primary display. */
  display: boolean;
  note?: string;
}

export interface ResolvedF1WinImage {
  src: string;
  label: string;
  sourceUrl?: string;
  kind: F1WinImage['kind'] | 'artwork';
  role: F1ImageRole;
  reuseBasis: string;
  creator?: string;
  verificationStatus: F1ImageVerificationStatus;
  fallbackSrc: string;
}

function normalized(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function candidateFor(team: F1Team, win: F1WinRecord): F1WinImage | undefined {
  if (team.id === 'mclaren') {
    return MCLAREN_RECENT_WIN_IMAGES[win.number] ?? MCLAREN_HISTORIC_WIN_IMAGES[win.number];
  }
  return F1_WIN_IMAGES[`${team.id}:${win.number}`];
}

function roleFor(team: F1Team, win: F1WinRecord, image: F1WinImage): F1ImageRole {
  const context = normalized([image.title, image.label, image.src, image.sourceUrl].join(' '));
  const year = String(win.year);
  const event = normalized(win.grand_prix);
  const driver = normalized(win.driver);
  const teamTerms = [normalized(team.name), normalized(team.id.replaceAll('-', ' '))]
    .map((term) => term.replace(/^team /, ' '))
    .filter(Boolean);
  const hasDriver = driver.split(' ').at(-1) && context.includes(driver.split(' ').at(-1) ?? '');
  const hasTeam = teamTerms.some((term) => context.includes(term));

  if (context.includes(year) && context.includes(event) && (hasDriver || hasTeam)) return 'same-event';
  if (context.includes(year) && (hasDriver || hasTeam)) return 'same-season';
  return 'team-era';
}

function artworkFor(team: F1Team, win: F1WinRecord): ResolvedF1WinImage {
  return {
    src: getF1WinArtwork(
      { name: team.name, mark: team.mark, accent: team.accent },
      win,
    ),
    label: 'Editorial archive artwork — not a race photograph',
    kind: 'artwork',
    role: 'editorial-artwork',
    reuseBasis: 'Original Classicverse-generated artwork',
    verificationStatus: 'generated',
    fallbackSrc: getF1WinArtwork(
      { name: team.name, mark: team.mark, accent: team.accent },
      win,
    ),
  };
}

/** Resolve one safe primary image and retain a deterministic fallback. */
export function resolveF1WinImage(team: F1Team, win: F1WinRecord): ResolvedF1WinImage {
  const fallback = artworkFor(team, win);

  if (team.id === 'ferrari') {
    const image = getWinImage(win as FerrariWin);
    if (!image) return fallback;
    return {
      src: image.src,
      label: image.note ? `Car-context photograph — ${image.note}` : 'Car-context photograph',
      sourceUrl: image.attribution_url,
      kind: 'race',
      role: image.note?.toLowerCase().includes('win') ? 'same-event' : 'team-era',
      reuseBasis: image.license,
      creator: image.creator,
      verificationStatus: 'verified',
      fallbackSrc: fallback.src,
    };
  }

  const candidate = candidateFor(team, win);
  const verified = verifiedF1WinImage(team, win, candidate);
  if (!verified) return fallback;

  return {
    src: verified.src,
    label: `Context photograph — ${verified.label}`,
    sourceUrl: verified.sourceUrl,
    kind: verified.kind,
    role: roleFor(team, win, verified),
    reuseBasis: verified.reuseBasis ?? 'Wikimedia Commons file; licence and attribution are recorded on the source page',
    creator: verified.creator,
    verificationStatus: 'verified',
    fallbackSrc: fallback.src,
  };
}

/**
 * A generated manifest for every displayed win image. Keeping this derived
 * from the results and candidate indexes means a new result cannot silently
 * arrive without either a verified source photo or labelled artwork.
 */
export function buildF1WinImageManifest(): F1WinImageManifestEntry[] {
  const entries: F1WinImageManifestEntry[] = [];
  const teams = F1_TEAMS.filter((team) => team.enabled && team.id !== 'ferrari');
  for (const team of teams) {
    for (const win of F1_WINS_BY_TEAM[team.id] ?? []) {
      const resolved = resolveF1WinImage(team, win);
      entries.push({
        recordKey: `${team.id}:${win.number}`,
        src: resolved.src,
        imageRole: resolved.role,
        subject: { team: team.name, driver: win.driver, season: win.year, ...(win.chassis ? { car: win.chassis } : {}) },
        sourcePage: resolved.sourceUrl ?? null,
        reuseBasis: resolved.reuseBasis,
        ...(resolved.creator ? { creator: resolved.creator } : {}),
        verificationStatus: resolved.verificationStatus,
        display: true,
      });
    }
  }
  for (const win of FERRARI_WINS) {
    const team: F1Team = {
      id: 'ferrari', name: 'Ferrari', mark: 'F', accent: '#d40000', enabled: true,
      tagline: `${FERRARI_WINS.length} Grand Prix wins`,
    };
    const resolved = resolveF1WinImage(team, win);
    entries.push({
      recordKey: `ferrari:${win.number}`,
      src: resolved.src,
      imageRole: resolved.role,
      subject: { team: team.name, driver: win.driver, season: win.year, car: win.chassis },
      sourcePage: resolved.sourceUrl ?? null,
      reuseBasis: resolved.reuseBasis,
      ...(resolved.creator ? { creator: resolved.creator } : {}),
      verificationStatus: resolved.verificationStatus,
      display: true,
    });
  }
  return entries;
}

export const F1_WIN_IMAGE_MANIFEST = buildF1WinImageManifest();

export const F1_IMAGE_MANIFEST_SUMMARY = {
  total: F1_WIN_IMAGE_MANIFEST.length,
  verifiedPhotos: F1_WIN_IMAGE_MANIFEST.filter((entry) => entry.verificationStatus === 'verified').length,
  generatedArtwork: F1_WIN_IMAGE_MANIFEST.filter((entry) => entry.verificationStatus === 'generated').length,
};
