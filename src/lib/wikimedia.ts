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
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (!['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(url.hostname)) return src;

  const parts = url.pathname.split('/');
  const commons = parts.indexOf('commons');
  if (commons < 0) return src;

  if (parts[commons + 1] === 'thumb') {
    const file = parts.at(-2);
    if (!file) return src;
    parts[parts.length - 1] = `${width}px-${file}`;
    url.pathname = parts.join('/');
    return url.toString();
  }

  const [h1, h2, file] = parts.slice(commons + 1);
  if (!h1 || !h2 || !file || parts.length !== commons + 4) return src;
  parts.splice(commons + 1, 0, 'thumb');
  parts.push(`${width}px-${file}`);
  url.pathname = parts.join('/');
  return url.toString();
}
