import type { F1ArchiveImage } from '@/types/f1';
import lotusPhotos from './f1PhotoPools/lotus.json';
import mclarenPhotos from './f1PhotoPools/mclaren.json';
import mercedesPhotos from './f1PhotoPools/mercedes.json';
import redBullPhotos from './f1PhotoPools/red-bull.json';
import renaultPhotos from './f1PhotoPools/renault.json';
import williamsPhotos from './f1PhotoPools/williams.json';

const PHOTO_POOLS: Record<string, readonly F1ArchiveImage[]> = {
  mclaren: mclarenPhotos,
  mercedes: mercedesPhotos,
  'red-bull': redBullPhotos,
  williams: williamsPhotos,
  lotus: lotusPhotos,
  renault: renaultPhotos,
};

/** McLaren records whose supplied race image is absent, unsafe, or unavailable. */
const MCLAREN_REPRESENTATIVE_WINS = [
  2, 10, 11, 12, 13, 16, 57, 59, 95,
  113, 114, 115, 117, 119, 138, 144, 157, 180,
];

/**
 * Return a real, source-linked constructor photograph for one win.
 *
 * The five historic constructor pools contain at least one unique photograph
 * per win, so the win number provides a stable one-to-one assignment. McLaren
 * already has race photographs for nearly every record; its smaller pool is
 * assigned only to records rejected by the race-photo policy.
 */
export function getF1WinRepresentativePhoto(
  teamId: string,
  winNumber: number,
  needsPrimary: boolean,
): F1ArchiveImage | undefined {
  const pool = PHOTO_POOLS[teamId];
  if (!pool?.length) return undefined;

  if (teamId === 'mclaren') {
    if (!needsPrimary) return undefined;
    const index = MCLAREN_REPRESENTATIVE_WINS.indexOf(winNumber);
    return index >= 0 ? pool[index] : undefined;
  }

  return pool[winNumber - 1];
}

export const F1_WIN_PHOTO_POOLS = PHOTO_POOLS;
