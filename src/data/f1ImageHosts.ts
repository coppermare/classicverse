/**
 * Approved remote hosts used only for source-linked F1 circuit and first-party
 * photographs. Keeping this list explicit lets Next's optimizer resize those
 * originals without opening the image proxy to arbitrary origins.
 */
export const F1_REMOTE_IMAGE_HOSTS = [
  '8w.forix.com',
  'cdn.sanity.io',
  'commons.wikimedia.org',
  'coolhuntermx.com',
  'd3u3wx15oqvhcs.cloudfront.net',
  'en.apa.az',
  'for91days.com',
  'hips.hearstapps.com',
  'img.vavel.com',
  'img1.advisor.travel',
  'junglim.com',
  'library.sportingnews.com',
  'media.businessprofilers.fr',
  'media.formula1.com',
  'motorsportguides.com',
  'oversteer48.com',
  'res.cloudinary.com',
  'upload.wikimedia.org',
  'wetanddustyroads.com',
  'www.cascadevents.fr',
  'www.circuito-estoril.pt',
  'www.circuitsofthepast.com',
  'www.cuk-group.com',
  'www.fullgripmotorsport.com',
  'www.okayama-international-circuit.jp',
  'www.speedactiontv.be',
  'www.trophee-endurance.fr',
] as const;
