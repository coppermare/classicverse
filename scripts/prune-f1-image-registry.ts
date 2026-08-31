import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { F1_REJECTED_WIN_IMAGE_KEYS } from '../src/data/f1RejectedWinImageKeys';
import type { F1WinImage } from '../src/types/f1';

const registryPath = join(process.cwd(), 'src/data/f1WinImages.generated.ts');
const photoCatalogPath = join(process.cwd(), 'src/data/f1WinPhotos.generated.ts');
const source = readFileSync(registryPath, 'utf8');
const match = source.match(/export const F1_WIN_IMAGES: Record<string, F1WinImage> = (\{[\s\S]*\});\n?$/);
if (!match) throw new Error(`Could not parse ${registryPath}`);

const parsed = Function(`return ${match[1]}`)() as Record<string, F1WinImage>;
const retained = Object.fromEntries(
  Object.entries(parsed).filter(([key]) => !F1_REJECTED_WIN_IMAGE_KEYS.has(key)),
);

writeFileSync(
  registryPath,
  '// Source-linked web photographs researched for the F1 archive.\n'
    + '// Audited mismatches are removed by scripts/prune-f1-image-registry.ts.\n'
    + '// Only the curated local catalog is eligible for runtime display.\n\n'
    + "import type { F1WinImage } from '@/types/f1';\n\n"
    + `export const F1_WIN_IMAGES: Record<string, F1WinImage> = ${JSON.stringify(retained, null, 2)};\n`,
);

console.log(`F1 raw image registry pruned: ${Object.keys(parsed).length - Object.keys(retained).length} audited mismatches removed.`);

const photoSource = readFileSync(photoCatalogPath, 'utf8');
const photoMatch = photoSource.match(/export const F1_WIN_PHOTOS: Record<string, F1WinImage> = (\{[\s\S]*\});\n?$/);
if (!photoMatch) throw new Error(`Could not parse ${photoCatalogPath}`);
const photoCatalog = Function(`return ${photoMatch[1]}`)() as Record<string, F1WinImage>;
let deletedAssets = 0;
for (const key of F1_REJECTED_WIN_IMAGE_KEYS) {
  if (retained[key] || photoCatalog[key]) throw new Error(`${key} is still registered and cannot be deleted`);
  if (!/^[a-z0-9-]+:\d+$/.test(key)) throw new Error(`Unsafe rejected image key: ${key}`);
  const assetPath = join(process.cwd(), 'public/f1-wins/context', `${key.replace(':', '-')}.webp`);
  if (existsSync(assetPath)) {
    rmSync(assetPath);
    deletedAssets += 1;
  }
}
console.log(`F1 rejected image assets removed: ${deletedAssets}.`);
