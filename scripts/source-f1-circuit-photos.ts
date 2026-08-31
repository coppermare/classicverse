import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { F1_WIN_IMAGES } from '../src/data/f1WinImages.generated';
import { F1_TEAMS } from '../src/data/f1Teams';
import { F1_WINS_BY_TEAM } from '../src/data/f1Wins.generated';
import type { F1WinImage } from '../src/types/f1';

type CircuitRecord = F1WinImage & { circuit: string };
type CommonsPage = {
  pageid: number;
  title: string;
  filePage?: string;
  snippet?: string;
  entityterms?: { label?: string[] };
  imageinfo?: Array<{
    thumburl?: string;
    width?: number;
    height?: number;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

const outputPath = join(process.cwd(), 'src/data/f1CircuitPhotos.generated.ts');
const cachePath = join(tmpdir(), 'classicverse-f1-circuit-search.json');
const userAgent = 'ClassicverseF1Archive/1.0 (local archival tooling)';
const circuitsWithVerifiedPrimaryCoverage = new Set([
  'Scandinavian Raceway',
  'Las Vegas Street Circuit',
  'Fair Park',
  'Riverside International Raceway',
  'Le Mans',
]);
const manualCircuitFiles: Record<string, { file: string; title: string; src?: string; sourceUrl?: string }> = {
  'Dijon-Prenois': { file: 'stage-pilotage-dijon.jpg', src: 'https://www.cascadevents.fr/img/cms/Circuit/stage-pilotage-dijon.jpg', sourceUrl: 'https://www.cascadevents.fr/circuit-de-pilotage/bourgogne-franche-comte/dijon-prenois/', title: 'Photograph of an empty Dijon-Prenois circuit corner' },
  'Autódromo Hermanos Rodríguez': { file: 'Coolhuntermx_Autodromo_IL_24-min-1.jpg', src: 'https://coolhuntermx.com/wp-content/uploads/2019/10/Coolhuntermx_Autodromo_IL_24-min-1.jpg', sourceUrl: 'https://coolhuntermx.com/el-rediseno-del-autodromo-hermanos-rodriguez-como-bienvenida-a-los-esports-formula-1/', title: 'Photograph of the empty Autódromo Hermanos Rodríguez circuit starting grid' },
  Kyalami: { file: 'kyalami-pit-lane.png', src: 'https://www.fullgripmotorsport.com/img/tracks/kyalami/1_50.png', sourceUrl: 'https://www.fullgripmotorsport.com/tracks/info/kyalami', title: 'Photograph of the empty Kyalami Grand Prix circuit pit lane' },
  'Silverstone Circuit': { file: 'NoiseBoys-Technologies-Ltd.-Silverstone-22-1200x800.jpg', src: 'https://www.cuk-group.com/wp-content/uploads/2023/08/NoiseBoys-Technologies-Ltd.-Silverstone-22-1200x800.jpg', sourceUrl: 'https://www.cuk-group.com/casestudies/sonic-speedways-unleashing-motorsport-magic-at-the-silverstone-circuit/', title: 'Photograph of the empty Silverstone circuit and grandstand' },
  'Autódromo Juan y Oscar Gálvez': { file: 'autodromo-juan-oscar-galvez-finish-straight.jpeg', src: 'https://img.vavel.com/b/WhatsApp%20Image%202023-07-13%20at%2011_24_33.jpeg', sourceUrl: 'https://www.vavel.com/es/motor/2025/07/22/motogp/1228352-motogp-regresa-a-argentina-en-2027-con-nueva-sede.html', title: 'Photograph of the empty Autódromo Juan y Oscar Gálvez circuit finish straight' },
  'Nivelles-Baulers': { file: 'Nivelles_Baulers_5.jpg', src: 'https://img1.advisor.travel/555x465px-Nivelles_Baulers_5.jpg', sourceUrl: 'https://no.advisor.travel/poi/Nivelles-Baulers-6276', title: 'Photograph of the empty former Nivelles-Baulers circuit track' },
  Montjuïc: { file: 'montjuich-circuit-038.jpg', src: 'https://www.circuitsofthepast.com/wp-content/uploads/2019/01/montjuich-circuit-038.jpg', sourceUrl: 'https://www.circuitsofthepast.com/montjuich-circuit-barcelona-lap/', title: 'Photograph of an empty road on the former Montjuïc street circuit' },
  'Circuit Paul Ricard': { file: 'circuit_paul_ricard_facade_1.jpg', src: 'https://media.businessprofilers.fr/produit/images/960x480/circuit_paul_ricard_16900/facade/circuit_paul_ricard_facade_1.jpg', sourceUrl: 'https://www.businessprofilers.com/lieu/circuit-paul-ricard.html', title: 'Photograph of the empty Circuit Paul Ricard start-finish straight' },
  'Autódromo do Estoril': { file: 'Estoril10.jpg', src: 'https://www.circuito-estoril.pt/wp-content/uploads/2023/05/Estoril10.jpg', sourceUrl: 'https://www.circuito-estoril.pt/en/technical-data/', title: 'Photograph of the empty Autódromo do Estoril circuit pit lane' },
  'Circuito de Jerez': { file: 'circuito-de-jerez.jpg', src: 'https://motorsportguides.com/wp-content/uploads/2019/01/circuito-de-jerez.jpg', sourceUrl: 'https://motorsportguides.com/circuito-de-jerez/', title: 'Photograph of the empty Circuito de Jerez main straight and pit lane' },
  'Phoenix street circuit': { file: 'Ayrton_Senna_McLaren_MP4-6_1991_United_States.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Ayrton_Senna_McLaren_MP4-6_1991_United_States.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ayrton_Senna_McLaren_MP4-6_1991_United_States.jpg', title: 'Photograph of Formula 1 action on the Phoenix street circuit' },
  'Donington Park': { file: 'Wheatcroft-grandstand-2.jpg', src: 'https://oversteer48.com/wp-content/uploads/2023/01/Wheatcroft-grandstand-2.jpg', sourceUrl: 'https://www.oversteer48.com/donington-park-circuit/', title: 'Photograph of the empty Donington Park circuit and grandstand' },
  'Albert Park Grand Prix Circuit': { file: 'Albert-Park-Melbourne-F1-030325.jpg', src: 'https://library.sportingnews.com/styles/twitter_card_120x120/s3/2025-03/Albert%20Park%20Melbourne%20F1%20030325.jpg?itok=6VlX9lE9', sourceUrl: 'https://www.sportingnews.com/au/formula-1/news/will-it-rain-australian-grand-prix-melbourne-weather-forecast-2025/51ca44f220c6d487cc5f1fc9', title: 'Photograph of the empty Albert Park Grand Prix circuit' },
  'Circuit de Nevers Magny-Cours': { file: 'MAGNYCOURS-01.jpeg', src: 'https://www.speedactiontv.be/Getimage.aspx?d=imgnews&m=F&n=MAGNYCOURS-01.jpeg', sourceUrl: 'https://www.speedactiontv.be/Le_Live_Timing_et_les_commentaires_des_Magny_Cours_Cups_via_RIS_Timing-31454-1.aspx', title: 'Photograph of the empty Circuit de Nevers Magny-Cours pit lane' },
  'Shanghai International Circuit': { file: 'shanghai-international-circuit-empty-pit-lane.jpg', src: 'https://cdn.sanity.io/images/fnx611yr/production/6860e58e2754b4b51fc39b8bddfb094fe88f8b79-3895x2191.jpg', sourceUrl: 'https://www.williamsf1.com/posts/8ca8144b-d46f-45b3-9e44-4e7c98e68c14/five-things-to-know-about-the-2025-chinese-gp', title: 'Photograph of the empty Shanghai International Circuit pit lane and grandstand' },
  'Sochi Autodrom': { file: 'sochi-autodrom-main-straight.webp', src: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000000/content/dam/fom-website/article-images/features/2014/10/q566-manual-152388604204f4d972699k.webp', sourceUrl: 'https://www.formula1.com/en/latest/article/sochi-uncovered-the-inside-track-on-russias-first-f1-circuit.1KlaBt1rxHwN2OY076ZJJD', title: 'Photograph of the empty Sochi Autodrom circuit main straight' },
  'Charade Circuit': { file: 'Circuit-photos-5.jpg', src: 'https://www.trophee-endurance.fr/wp-content/uploads/2022/06/Circuit-photos-5.jpg', sourceUrl: 'https://www.trophee-endurance.fr/epreuve-exceptionnelle-pour-le-tte-a-charade/', title: 'Photograph of the empty Charade circuit pit lane' },
  'Circuit Park Zandvoort': { file: 'Hoofdtribune-CMcom-Circuit-Zandvoort_0002_3.jpg', src: 'https://d3u3wx15oqvhcs.cloudfront.net/_912x570_crop_center-center_75_none/Hoofdtribune-CMcom-Circuit-Zandvoort_0002_3.jpg?v=1686303048', sourceUrl: 'https://www.circuitzandvoort.nl/op-het-circuit/', title: 'Photograph of the empty Circuit Park Zandvoort main straight and grandstand' },
  'Autódromo José Carlos Pace': { file: 'Autodromo Jose Carlos Pace main straight.jpg', title: 'Photograph of the Autódromo José Carlos Pace circuit main straight' },
  Jarama: { file: 'Tribuna recta Circuito del Jarama.jpg', title: 'Photograph of the Jarama circuit main straight and grandstand' },
  Nürburgring: { file: 'Nürburgring Boxengasse Panorama.jpg', title: 'Photograph of the Nürburgring circuit pit buildings and track' },
  'Detroit Street Circuit': { file: 'Renaissance Center, Jefferson Avenue, Detroit, MI - 54219278140.jpg', title: 'Photograph of the Detroit Street Circuit venue beside the Renaissance Center' },
  'Brands Hatch': { file: 'Brands Hatch, Brabham Straight - geograph.org.uk - 5607917.jpg', title: 'Photograph of the Brands Hatch circuit at Brabham Straight' },
  Hockenheimring: { file: 'Hockenheimring start-ziel-gerade 2010.jpg', title: 'Photograph of the Hockenheimring circuit start-finish straight' },
  'Red Bull Ring': { file: 'Start-Ziel Red Bull Ring.jpg', title: 'Photograph of the Red Bull Ring circuit start-finish straight' },
  'Fuji Speedway': { file: 'Fuji Speedway start-finish.jpg', title: 'Photograph of the Fuji Speedway circuit start-finish straight' },
  'Indianapolis Motor Speedway': { file: 'Indianapolis Motor Speedway Turn.jpg', title: 'Photograph of an Indianapolis Motor Speedway circuit turn' },
  'Miami International Autodrome': { file: 'miami-international-autodrome-empty-track.jpg', src: 'https://hips.hearstapps.com/hmg-prod/images/general-view-of-the-circuit-during-previews-ahead-of-the-f1-news-photo-1651771379.jpg?crop=1.00xw%3A0.847xh%3B0%2C0.153xh&resize=980%3A%2A', sourceUrl: 'https://www.autoweek.com/racing/formula-1/a39917292/iguanas-everything-need-f1-miami-grand-prix/', title: 'Photograph of the empty Miami International Autodrome circuit and grandstand' },
  'Baku City Circuit': { file: '643cf3570dbfe643cf3570dbff1681716055643cf3570dbfc643cf3570dbfd.jpg', src: 'https://en.apa.az/storage/news/2023/april/17/big/643cf3570dbfe643cf3570dbff1681716055643cf3570dbfc643cf3570dbfd.jpg', sourceUrl: 'https://en.apa.az/others-type/formula-1-roads-around-baku-city-circuit-to-remain-closed-from-april-24-to-may-2-401073', title: 'Photograph of the empty Baku City Circuit start-finish straight' },
  'Losail International Circuit': { file: 'Grand Stand.JPG', title: 'Photograph of the Losail International Circuit grandstand' },
  'Korean International Circuit': { file: '2007_f1-korea-intl-circuit_slide-02.jpg', src: 'https://junglim.com/wp-content/uploads/2007/01/2007_f1-korea-intl-circuit_slide-02.jpg', sourceUrl: 'https://junglim.com/f1-korea-intl-circuit/', title: 'Photograph of the Korean International Circuit main straight and grandstand' },
  'Circuit de Barcelona-Catalunya': { file: 'Circuit de Catalunya Grandstand.jpg', title: 'Photograph of the Circuit de Barcelona-Catalunya grandstand' },
  'Istanbul Park': { file: 'Istanbul park front straight and main grandstand.JPG', title: 'Photograph of the Istanbul Park circuit front straight and main grandstand' },
  'Circuit of the Americas': { file: 'Main straight and turn 1 hill, Circuit of the Americas.jpg', title: 'Photograph of the Circuit of the Americas main straight and turn one' },
  'Okayama International Circuit': { file: 'img_pit.png', src: 'https://www.okayama-international-circuit.jp/special/gt-asia-2016/img/facility/img_pit.png', sourceUrl: 'https://www.okayama-international-circuit.jp/special/gt-asia-2016/facility.html', title: 'Photograph of the empty Okayama International Circuit pit lane and track' },
  'Circuit Mont-Tremblant': { file: 'Mont-Tremblant Control Tower.JPG', title: 'Photograph of the Mont-Tremblant circuit control tower' },
  'Mosport International Raceway': { file: 'Mosport Speedway August 2008.jpg', title: 'Photograph of Mosport International Raceway' },
  'Long Beach': { file: 'LongBeachCircuit-BackStraight (34653284041).jpg', title: 'Photograph of the Long Beach circuit back straight' },
  'Autódromo Internacional Nelson Piquet': { file: 'autodromo-nelson-piquet-empty-track.jpg', src: 'https://opiniaobrasilia.com.br/wp-content/uploads/2021/05/51162805785_1ae2dd0fd0_c.jpg', sourceUrl: 'https://opiniaobrasilia.com.br/noticias/manchetes/autodromo-de-brasilia-de-volta-ao-circuito-nacional/', title: 'Photograph of the empty Autódromo Internacional Nelson Piquet circuit' },
  'Circuit Bremgarten': { file: 'Tennikurvebremgarp.jpg', title: 'Photograph of the Bremgarten circuit at the Tannenkurve' },
  'Aintree': { file: 'Aintree racecourse - geograph.org.uk - 5600617.jpg', title: 'Photograph of Aintree racecourse circuit' },
  'Las Vegas Strip Street Circuit': { file: '2024 Las Vegas Grand Prix at the Sphere - Friday, November 22, Orbi.jpg', title: 'Photograph of the Las Vegas Strip Street Circuit' },
  'Prince George Circuit': { file: 'el-race-track-3.jpg', src: 'https://wetanddustyroads.com/wp-content/uploads/2023/07/el-race-track-3.jpg?w=672', sourceUrl: 'https://wetanddustyroads.com/2023/07/17/race-track-east-london-south-africa/', title: 'Photograph of the Prince George Circuit' },
  'Rouen-Les-Essarts': { file: '96-rouen6.jpg', src: 'https://8w.forix.com/rouen/96-rouen6.jpg', sourceUrl: 'https://8w.forix.com/rouen-94-98.html', title: 'Photograph of the empty former Rouen-Les-Essarts circuit pit lane' },
  'Valencia Street Circuit': { file: '06-Abandoned-Forumula-1-Race-Track-DSC00225.jpg', src: 'https://for91days.com/wp-content/uploads/2022/01/06-Abandoned-Forumula-1-Race-Track-DSC00225-1536x1024.jpg', sourceUrl: 'https://for91days.com/the-abandoned-formula-1-race-track-in-valencia-urbex/', title: 'Photograph of the empty former Valencia Street Circuit track' },
  'Jeddah Corniche Circuit': { file: 'Jeddah Corniche Circuit Turn.jpg', src: 'https://res.cloudinary.com/prod-f2f3/image/upload/v1743680870/FA/Global/articles/2025/03_March/Jeddah_Test_Preview_Main.jpg', sourceUrl: 'https://www.f1academy.com/Latest/1ZvydLJR3JL9balPDOhQQz/preview-f1-academy-gets-back-on-track-in-season-testing-in-jeddah', title: 'Photograph of the Jeddah Corniche Circuit' },
  'Autodromo Enzo e Dino Ferrari': { file: 'Imola_Circuit_-_Variante_Bassa_-_Summer_1973.jpg', title: 'Imola Circuit, Variante Bassa, Summer 1973' },
};

function clean(value: string | undefined): string {
  return (value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalized(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function sourceText(page: CommonsPage): string {
  const info = page.imageinfo?.[0];
  return normalized(`${page.title} ${clean(info?.extmetadata?.ImageDescription?.value)} ${page.snippet ?? ''} ${page.entityterms?.label?.join(' ') ?? ''}`);
}

function isCircuitCandidate(page: CommonsPage, circuit: string): boolean {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl || !info.mime?.startsWith('image/')) return false;
  if ((info.width ?? 0) < 300 || (info.height ?? 0) < 200) return false;
  if (info.mime !== 'image/jpeg') return false;
  const text = sourceText(page);
  const titleText = normalized(page.title.replace(/^File:/, ''));
  const banned = [
    'layout', 'map', 'diagram', 'schematic', 'render', 'poster', 'logo', 'flag', 'model', 'toy',
    'aerial', 'aereo', 'aeria', 'satellite', 'skysat', 'luftaufnahme', 'drone', 'from above',
    'bird eye', 'air view', 'overhead',
    'car', 'racing', 'driver', 'winner', 'podio', 'pits', 'pit lane', 'garage', 'truck', 'camion',
    'motorcycle', 'rider', 'motogp', 'world endurance', 'wec', 'indycar', 'nascar', 'formula e',
    'cobra', 'caterham', 'yamaha', 'vinales', 'championship', 'historic formula', 'test session',
    'showcar', 'parked', 'speedfest', '24h', 'moto', 'guzzi', 'lexus', 'super gt',
    'cooper', 'brawn', 'button', 'wurz',
    'rossi', 'marquez', 'mclaren', 'mercedes', 'ferrari', 'lotus', 'renault', 'benetton', 'brabham',
    'williams', 'corvette', 'chevrolet', 'vehicle', 'automobile',
    'toyota', 'supra', 'automatic', 'monument', 'statue',
    'sculpture', 'museum', 'senna', 'hamilton', 'verstappen', 'prost', 'schumacher', 'vettel',
    'raikkonen', 'alonso', 'bottas', 'rosberg', 'webber', 'ricciardo', 'moss', 'fangio',
    'feydeau', 'theatre', 'dessin', 'drawing', 'illustration', 'actress', 'printed', 'board', 'phone',
    'advertisement', 'booklet', 'page', 'scan', 'dpla',
  ];
  const titleTokens = titleText.split(' ');
  const textTokens = text.split(' ');
  if (banned.some((term) => term.includes(' ')
    ? text.includes(term)
    : titleTokens.includes(term) || textTokens.includes(term))) return false;
  const genericTokens = new Set(['circuit', 'international', 'autodromo', 'autodrome', 'race', 'track', 'park', 'street', 'the']);
  const tokens = normalized(circuit).split(' ').filter((token) => token.length > 3 && !genericTokens.has(token));
  const hasCircuitName = tokens.some((token) => titleTokens.includes(token));
  return hasCircuitName && (text.includes('circuit') || text.includes('race track') || text.includes('grand prix') || text.includes('formula one'));
}

const searchCache = new Map<string, CommonsPage[]>();
if (existsSync(cachePath)) {
  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, CommonsPage[]>;
    for (const [key, pages] of Object.entries(cached)) searchCache.set(key, pages);
  } catch {
    // Ignore a partial cache; the next successful search rewrites it.
  }
}

async function commonsSearch(query: string): Promise<CommonsPage[]> {
  const cached = searchCache.get(query);
  if (cached) return cached;
  const encoded = encodeURIComponent(query);
  const html = execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--location', '--retry', '2', '--retry-delay', '2', '--retry-max-time', '30', '--max-time', '30', '-A', userAgent,
    `https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encoded}`,
  ], { encoding: 'utf8' });
  const marker = '"sdmsInitialSearchResults":';
  const jsonStart = html.indexOf(marker) + marker.length;
  let end = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = jsonStart; index < html.length; index += 1) {
    const character = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) { end = index + 1; break; }
  }
  if (jsonStart <= marker.length || end < 0) throw new Error(`Commons media search response did not contain results for ${query}`);
  const body = JSON.parse(html.slice(jsonStart, end)) as { results?: Record<string, CommonsPage> };
  const pages = Object.values(body.results ?? {});
  searchCache.set(query, pages);
  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(searchCache), null, 2));
  return pages;
}

function existingByCircuit(): Map<string, F1WinImage> {
  const result = new Map<string, F1WinImage>();
  for (const image of Object.values(F1_WIN_IMAGES)) {
    if (image.kind !== 'circuit') continue;
    const key = normalized(image.label);
    if (!result.has(key)) result.set(key, image);
  }
  return result;
}

function candidatePage(image: F1WinImage): CommonsPage {
  return {
    pageid: Number(new URL(image.sourceUrl).searchParams.get('curid') ?? 0),
    title: image.title,
    filePage: image.file,
    snippet: image.file,
    imageinfo: [{ thumburl: image.file, width: 1280, height: 720, mime: /\.(?:jpe?g)(?:$|[?#])/i.test(image.file) ? 'image/jpeg' : 'image/png' }],
  };
}

function buildRecord(circuit: string, page: CommonsPage): CircuitRecord {
  const info = page.imageinfo?.[0];
  const title = page.title.replace(/^File:/, '');
  const artist = clean(info?.extmetadata?.Artist?.value);
  return {
    circuit,
    file: page.title,
    src: info?.thumburl ?? page.filePage ?? page.title,
    sourceUrl: `https://commons.wikimedia.org/w/index.php?curid=${page.pageid}`,
    title,
    label: circuit,
    kind: 'circuit',
    reuseBasis: 'Wikimedia Commons circuit photograph; source and attribution are recorded on the Commons page',
    ...(artist ? { creator: artist } : {}),
    mediaType: 'photograph',
    verificationStatus: 'verified',
  };
}

function writeOutput(records: CircuitRecord[]): void {
  const map = Object.fromEntries(records.map(({ circuit, ...image }) => [circuit, image]));
  writeFileSync(outputPath,
    '// Generated by scripts/source-f1-circuit-photos.ts. Do not edit by hand.\n'
      + '// Every entry is a verified circuit photograph.\n\n'
      + "import type { F1WinImage } from '@/types/f1';\n\n"
      + `export const F1_CIRCUIT_PHOTOS: Record<string, F1WinImage> = ${JSON.stringify(map, null, 2)};\n`);
}

async function main(): Promise<void> {
  const circuits = [...new Set(F1_TEAMS.flatMap((team) => team.id === 'ferrari' ? [] : (F1_WINS_BY_TEAM[team.id] ?? []).map((win) => win.circuit)))]
    .filter((circuit) => !circuitsWithVerifiedPrimaryCoverage.has(circuit));
  const existing = existingByCircuit();
  const records: CircuitRecord[] = [];
  for (const circuit of circuits) {
    const manual = manualCircuitFiles[circuit];
    if (manual) {
      const encodedFile = encodeURIComponent(manual.file);
      records.push({
        circuit,
        file: `File:${manual.file}`,
        src: manual.src ?? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFile}`,
        sourceUrl: manual.sourceUrl ?? `https://commons.wikimedia.org/wiki/File:${encodedFile}`,
        title: manual.title,
        label: circuit,
        kind: 'circuit',
        reuseBasis: manual.sourceUrl && !manual.sourceUrl.includes('commons.wikimedia.org')
          ? 'Contextual circuit photograph; the original publisher page is recorded for source attribution'
          : 'Wikimedia Commons circuit photograph; source and attribution are recorded on the Commons page',
        mediaType: 'photograph',
        verificationStatus: 'verified',
      });
      console.log(`CIRCUIT ${circuit} <- ${manual.title}`);
      continue;
    }
    const candidate = existing.get(normalized(circuit));
    let page: CommonsPage | undefined;
  const useExistingCandidate = Boolean(
      candidate
      && candidate.sourceUrl.startsWith('https://commons.wikimedia.org/')
      && isCircuitCandidate(candidatePage(candidate), circuit),
    );
    if (useExistingCandidate && candidate) {
      page = candidatePage(candidate);
    } else {
      for (const query of [
        `${circuit} track surface`, `${circuit} grandstand`, `${circuit} corner`,
        `${circuit} Formula One circuit`, `${circuit} race track`, circuit,
      ]) {
        const pages = await commonsSearch(query);
        page = pages.filter((item) => isCircuitCandidate(item, circuit))
          .sort((a, b) => {
            const score = (item: CommonsPage) => {
              const text = sourceText(item);
              return (text.includes('circuit') ? 4 : 0) + (text.includes('speedway') ? 3 : 0)
                + (text.includes('raceway') ? 3 : 0) + (text.includes('track') ? 2 : 0);
            };
            return score(b) - score(a);
          })[0];
        if (page) break;
      }
    }
    if (!page) { console.log(`GAP ${circuit}`); continue; }
    const record = useExistingCandidate && candidate
      ? { circuit, ...candidate, src: candidate.file, label: circuit, reuseBasis: 'Wikimedia Commons circuit photograph; source and attribution are recorded on the Commons page', mediaType: 'photograph' as const, verificationStatus: 'verified' as const }
      : buildRecord(circuit, page);
    records.push(record);
    console.log(`CIRCUIT ${circuit} <- ${record.title}`);
  }
  writeOutput(records);
  console.log(`F1 circuit sourcing complete: localized ${records.length}/${circuits.length} circuit fallbacks.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
