import type { EraName } from '@/types/car';

export const ERAS: { name: EraName; start: number; end: number }[] = [
  { name: 'Origins', start: 1885, end: 1904 },
  { name: 'Brass Era', start: 1905, end: 1918 },
  { name: 'Interwar', start: 1919, end: 1938 },
  { name: 'WWII', start: 1939, end: 1944 },
  { name: 'Postwar', start: 1945, end: 1959 },
  { name: 'Jet Age', start: 1960, end: 1969 },
  { name: 'Transition', start: 1970, end: 1979 },
  { name: 'Modern Classic', start: 1980, end: 2000 },
];

export function getEraForYear(year: number): EraName {
  return ERAS.find(e => year >= e.start && year <= e.end)!.name;
}

export const DECADES = Array.from({ length: 12 }, (_, i) => 1880 + i * 10).filter(d => d <= 2000);
