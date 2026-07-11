export interface BrandLogo {
  src: string;
  sourceUrl: string;
}

/**
 * Canonical brand -> logo asset. One entry per real brand.
 * The dataset uses many name variants for the same maker (e.g. four Cadillac
 * strings, four Ford strings); those resolve here via MANUFACTURER_ALIASES and
 * the parenthetical-stripping fallback in getBrandLogo(), so a single asset
 * covers every variant without touching the displayed manufacturer text.
 */
export const BRAND_LOGOS: Record<string, BrandLogo> = {
  benz: {
    src: '/brand-logos/benz-cie.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benz_1883.svg',
  },
  daimler: {
    src: '/brand-logos/daimler-motoren-gesellschaft.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mercedes_benz_logo_1902.png',
  },
  'mercedes-benz': {
    src: '/brand-logos/mercedes-benz.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mercedes-Benz_Star_(1969-1986,_2025-).svg',
  },
  ford: {
    src: '/brand-logos/ford.svg',
    sourceUrl: 'https://simpleicons.org/?q=ford',
  },
  oldsmobile: {
    src: '/brand-logos/oldsmobile.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Oldsmobile.png',
  },
  austin: {
    src: '/brand-logos/austin.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Logo_Automobile_Austin.jpg',
  },
  citroen: {
    src: '/brand-logos/citroen.svg',
    sourceUrl: 'https://simpleicons.org/?q=citroen',
  },
  dkw: {
    src: '/brand-logos/dkw.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DKW-logo.svg',
  },
  volkswagen: {
    src: '/brand-logos/volkswagen.svg',
    sourceUrl: 'https://simpleicons.org/?q=volkswagen',
  },
  fiat: {
    src: '/brand-logos/fiat.svg',
    sourceUrl: 'https://simpleicons.org/?q=fiat',
  },
  rover: {
    src: '/brand-logos/rover.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Rover_logo_2002.svg',
  },
  toyota: {
    src: '/brand-logos/toyota.svg',
    sourceUrl: 'https://simpleicons.org/?q=toyota',
  },
  chevrolet: {
    src: '/brand-logos/chevrolet.svg',
    sourceUrl: 'https://simpleicons.org/?q=chevrolet',
  },
  mclaren: {
    src: '/brand-logos/mclaren.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:McLaren_Speedmark.svg',
  },
  ferrari: {
    src: '/brand-logos/ferrari.svg',
    sourceUrl: 'https://simpleicons.org/?q=ferrari',
  },
  bmc: {
    src: '/brand-logos/bmc.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:BMC_rosette.png',
  },
  panhard: {
    src: '/brand-logos/panhard.gif',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pl_logo5.gif',
  },
  peugeot: {
    src: '/brand-logos/peugeot.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Peugeot_2021_Logo.svg',
  },
  'de-dion-bouton': {
    src: '/brand-logos/de-dion-bouton.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Embl%C3%A8me_De_Dion-Bouton.jpg',
  },
  renault: {
    src: '/brand-logos/renault.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Renault_2021.svg',
  },
  cadillac: {
    src: '/brand-logos/cadillac.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Cadillac_logo_BW.svg',
  },
  'rolls-royce': {
    src: '/brand-logos/rolls-royce.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rolls_royce_northamerica_logo.svg',
  },
  'hispano-suiza': {
    src: '/brand-logos/hispano-suiza.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:New_Logo_of_Hispano_Suiza.png',
  },
  bugatti: {
    src: '/brand-logos/bugatti.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bugatti_logo.svg',
  },
  duesenberg: {
    src: '/brand-logos/duesenberg.jpg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Duesenberg_logo.jpg',
  },
  cord: {
    src: '/brand-logos/cord.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:CordCrestTalla.jpg',
  },
  chrysler: {
    src: '/brand-logos/chrysler.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ChryPly_Blue_Pentastar.jpg',
  },
  mercer: {
    src: '/brand-logos/mercer.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mercer-motor_1917_logo.jpg',
  },
  dodge: {
    src: '/brand-logos/dodge.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:New_Dodge.png',
  },
  hudson: {
    src: '/brand-logos/hudson.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Hudson_Logo.svg',
  },
  studebaker: {
    src: '/brand-logos/studebaker.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Studebaker.svg',
  },
  willys: {
    src: '/brand-logos/willys.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Willys-knight.svg',
  },
  'auto-union': {
    src: '/brand-logos/auto-union.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Auto_Union.svg',
  },
  bmw: {
    src: '/brand-logos/bmw.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:BMW.svg',
  },
  porsche: {
    src: '/brand-logos/porsche.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Porsche_Logo_2024.png',
  },
  jaguar: {
    src: '/brand-logos/jaguar.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jaguar_1966_logo.svg',
  },
  lancia: {
    src: '/brand-logos/lancia.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Lancia_logo_2022.png',
  },
  'alfa-romeo': {
    src: '/brand-logos/alfa-romeo.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Alfa_Romeo_logo.png',
  },
  mg: {
    src: '/brand-logos/mg.png',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:MG_Cars_(logo).png',
  },
  'land-rover': {
    src: '/brand-logos/land-rover.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Land_Rover_logo_black.svg',
  },
  lincoln: {
    src: '/brand-logos/lincoln.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Logo_Lincoln.svg',
  },
  pontiac: {
    src: '/brand-logos/pontiac.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pontiac_logo_and_wordmark_1981.svg',
  },
  honda: {
    src: '/brand-logos/honda.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Honda_new_h_mark.svg',
  },
  mazda: {
    src: '/brand-logos/mazda.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mazda_logo_2024_(vertical).svg',
  },
  nsu: {
    src: '/brand-logos/nsu.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:NSU_1960_Logo.svg',
  },
  lamborghini: {
    src: '/brand-logos/lamborghini.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Lamborghini_Logo.svg',
  },
  lotus: {
    src: '/brand-logos/lotus.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Lotus_Cars_logo.svg',
  },
  audi: {
    src: '/brand-logos/audi.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Audi-Logo_2016.svg',
  },
  delorean: {
    src: '/brand-logos/delorean.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DeLorean_Motor_Company_logo.svg',
  },
  lanchester: {
    src: '/brand-logos/lanchester.gif',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Lanchester_Logo.gif',
  },
};

/**
 * Every manufacturer string used in the dataset, mapped to a canonical logo key.
 * Makers with no freely-licensed logo are intentionally absent (they fall back
 * to a generated text mark in the UI): American Bantam, Duryea, E.R. Thomas,
 * Napier & Son, Pierce-Arrow, Société Électrique Jenatzy, and the 1940 Jeep
 * ("Multiple contractors ...").
 */
const MANUFACTURER_ALIASES: Record<string, string> = {
  'Benz & Cie.': 'benz',
  'Benz & Cie': 'benz',
  'Daimler-Motoren-Gesellschaft': 'daimler',
  Daimler: 'daimler',
  'Mercedes (Daimler-Motoren-Gesellschaft)': 'daimler',
  Mercedes: 'daimler',
  'Mercedes-Benz': 'mercedes-benz',
  Ford: 'ford',
  'Ford Motor Company': 'ford',
  'Ford / Ford Advanced Vehicles': 'ford',
  'Henry Ford (self-built)': 'ford',
  Oldsmobile: 'oldsmobile',
  'Olds Motor Vehicle Company': 'oldsmobile',
  'Austin Motor Company': 'austin',
  'Citroën': 'citroen',
  DKW: 'dkw',
  Volkswagen: 'volkswagen',
  'Volkswagenwerk GmbH': 'volkswagen',
  'Volkswagen / Porsche': 'volkswagen',
  Fiat: 'fiat',
  'Rover Company': 'rover',
  Toyota: 'toyota',
  Chevrolet: 'chevrolet',
  'Chevrolet (General Motors)': 'chevrolet',
  'McLaren Automotive': 'mclaren',
  Ferrari: 'ferrari',
  'British Motor Corporation (BMC)': 'bmc',
  'Panhard et Levassor': 'panhard',
  Peugeot: 'peugeot',
  'De Dion-Bouton': 'de-dion-bouton',
  Renault: 'renault',
  'Renault Frères': 'renault',
  Cadillac: 'cadillac',
  'Cadillac (General Motors)': 'cadillac',
  'Cadillac Automobile Company': 'cadillac',
  'Cadillac Motor Car Company': 'cadillac',
  'Rolls-Royce': 'rolls-royce',
  'Rolls-Royce (Royce Ltd.)': 'rolls-royce',
  'Royce Ltd. / C.S. Rolls & Co.': 'rolls-royce',
  'Hispano-Suiza': 'hispano-suiza',
  Bugatti: 'bugatti',
  'Automobiles Ettore Bugatti': 'bugatti',
  'Bugatti Automobili S.p.A.': 'bugatti',
  'Duesenberg Automobile & Motors Company': 'duesenberg',
  Cord: 'cord',
  'Cord (Auburn Automobile Company)': 'cord',
  Chrysler: 'chrysler',
  'Mercer Automobile Company': 'mercer',
  Dodge: 'dodge',
  'Dodge (Chrysler Corporation)': 'dodge',
  'Dodge (Chrysler)': 'dodge',
  'Dodge Brothers': 'dodge',
  'Hudson Motor Car Company': 'hudson',
  'Studebaker Corporation': 'studebaker',
  'Willys-Overland Motors': 'willys',
  'Auto Union / Horch': 'auto-union',
  BMW: 'bmw',
  Porsche: 'porsche',
  Jaguar: 'jaguar',
  'Jaguar Cars': 'jaguar',
  Lancia: 'lancia',
  'Alfa Romeo': 'alfa-romeo',
  'MG Car Company': 'mg',
  'Land Rover': 'land-rover',
  'Land Rover (British Leyland)': 'land-rover',
  Lincoln: 'lincoln',
  'Lincoln (Ford Motor Company)': 'lincoln',
  Pontiac: 'pontiac',
  'Pontiac (General Motors)': 'pontiac',
  Honda: 'honda',
  Mazda: 'mazda',
  NSU: 'nsu',
  Lamborghini: 'lamborghini',
  'Lotus Cars': 'lotus',
  Audi: 'audi',
  'DeLorean Motor Company': 'delorean',
  Lanchester: 'lanchester',
};

export function getBrandLogo(manufacturer: string): BrandLogo | undefined {
  // Direct canonical key, then known alias.
  if (BRAND_LOGOS[manufacturer]) return BRAND_LOGOS[manufacturer];
  const alias = MANUFACTURER_ALIASES[manufacturer];
  if (alias) return BRAND_LOGOS[alias];

  // Fallback: strip parenthetical qualifiers (e.g. "Cadillac (General Motors)")
  // and retry against the alias table.
  const cleaned = manufacturer.replace(/\s*\([^)]*\)/g, '').trim();
  if (cleaned && cleaned !== manufacturer) {
    const cleanedAlias = MANUFACTURER_ALIASES[cleaned];
    if (cleanedAlias) return BRAND_LOGOS[cleanedAlias];
  }
  return undefined;
}
