/**
 * Wikimedia Commons image helpers.
 *
 * Commons serves full-resolution originals — often several megabytes — which is
 * far more than any screen here needs and slow enough to be visible: the car
 * grid alone would pull ~100 originals at once. Rewriting an original upload URL
 * to its scaled thumbnail (`/thumb/<h>/<hh>/<file>/<width>px-<file>`) gives the
 * same picture 10–30× smaller and CDN-cached.
 *
 * The data files keep the canonical original URLs, which is what attribution
 * refers to; scaling is applied only at read time.
 */

/**
 * Commons only renders an allowlisted set of thumbnail widths — anything else
 * is rejected at the edge with `400 Use thumbnail sizes listed on
 * https://w.wiki/GHai`, which arrives as a plain broken image. Verified working
 * buckets: 120, 250, 330, 500, 960, 1280, 1920. Do not invent a width here.
 */
export const THUMB_DETAIL = 960;
export const THUMB_TILE = 330;

export function toThumb(src: string, width = THUMB_DETAIL): string {
  const m = src.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/,
  );
  if (!m) return src; // already a thumb, a local file, or a non-Commons URL — leave as is
  const [, base, h1, h2, file] = m;
  return `${base}/thumb/${h1}/${h2}/${file}/${width}px-${file}`;
}
