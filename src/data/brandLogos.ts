export interface BrandLogo {
  src: string;
  sourceUrl: string;
}

export const BRAND_LOGOS: Record<string, BrandLogo> = {
  'Benz & Cie.': {
    src: '/brand-logos/benz-cie.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Benz_1883.svg',
  },
  'Ford Motor Company': {
    src: '/brand-logos/ford.svg',
    sourceUrl: 'https://simpleicons.org/?q=ford',
  },
  Oldsmobile: {
    src: '/brand-logos/oldsmobile.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:1962_Oldsmobile_logo.svg',
  },
  'Austin Motor Company': {
    src: '/brand-logos/austin.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Logo_Automobile_Austin.jpg',
  },
  Citroën: {
    src: '/brand-logos/citroen.svg',
    sourceUrl: 'https://simpleicons.org/?q=citroen',
  },
  DKW: {
    src: '/brand-logos/dkw.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DKW-logo.svg',
  },
  'Volkswagenwerk GmbH': {
    src: '/brand-logos/volkswagen.svg',
    sourceUrl: 'https://simpleicons.org/?q=volkswagen',
  },
  Fiat: {
    src: '/brand-logos/fiat.svg',
    sourceUrl: 'https://simpleicons.org/?q=fiat',
  },
  'Rover Company': {
    src: '/brand-logos/rover.svg',
    sourceUrl: 'https://en.wikipedia.org/wiki/File:Rover_logo_2002.svg',
  },
  Toyota: {
    src: '/brand-logos/toyota.svg',
    sourceUrl: 'https://simpleicons.org/?q=toyota',
  },
  Chevrolet: {
    src: '/brand-logos/chevrolet.svg',
    sourceUrl: 'https://simpleicons.org/?q=chevrolet',
  },
  Volkswagen: {
    src: '/brand-logos/volkswagen.svg',
    sourceUrl: 'https://simpleicons.org/?q=volkswagen',
  },
  'McLaren Automotive': {
    src: '/brand-logos/mclaren.svg',
    sourceUrl: 'https://simpleicons.org/?q=mclaren',
  },
  Ferrari: {
    src: '/brand-logos/ferrari.svg',
    sourceUrl: 'https://simpleicons.org/?q=ferrari',
  },
};

export function getBrandLogo(manufacturer: string): BrandLogo | undefined {
  return BRAND_LOGOS[manufacturer];
}
