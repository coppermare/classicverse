/**
 * The weather, from Open-Meteo.
 *
 * Real observations and a real forecast, fetched live from the browser. The
 * service was chosen over the better-known alternatives for one reason that
 * matters here: it needs no API key. There is no secret to keep out of the
 * bundle, no proxy route to stand up to hide one, and no signup between this
 * repo and anybody who clones it — the set works the moment it boots. It is
 * free for non-commercial use, sends `access-control-allow-origin: *`, and is
 * built on national met-office model data (DWD ICON, NOAA GFS, Météo-France).
 *
 * Two endpoints, both unauthenticated:
 *   geocoding-api.open-meteo.com/v1/search   — name → coordinates
 *   api.open-meteo.com/v1/forecast           — coordinates → conditions
 *
 * Attribution is required and is carried on the screen itself.
 */

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';

/** How many days of outlook the strip along the bottom shows. */
export const FORECAST_DAYS = 6;

/* ── Places ─────────────────────────────────────────────────── */

export interface Place {
  /** Stable across sessions, so the last-viewed place can be restored. */
  id: string;
  name: string;
  /** Country name, or 'Your location' for a geolocated fix. */
  country: string;
  /** Region/state, where the service knows one — disambiguates the Springfields. */
  admin1?: string;
  latitude: number;
  longitude: number;
}

/**
 * The dial's default stops.
 *
 * A weather channel with an empty dial is a search box wearing a costume, so the
 * knob starts with somewhere to sweep. These are picked to span the globe's
 * time zones and climates — turning the knob at any hour should find somewhere
 * in daylight and somewhere in weather — and any place found by search joins
 * them on the dial for the rest of the session.
 */
export const PRESET_PLACES: Place[] = [
  { id: 'p-london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 'p-tirana', name: 'Tirana', country: 'Albania', latitude: 41.3275, longitude: 19.8187 },
  { id: 'p-modena', name: 'Modena', country: 'Italy', latitude: 44.6471, longitude: 10.9252 },
  { id: 'p-stuttgart', name: 'Stuttgart', country: 'Germany', latitude: 48.7758, longitude: 9.1829 },
  { id: 'p-paris', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { id: 'p-newyork', name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { id: 'p-detroit', name: 'Detroit', country: 'United States', latitude: 42.3314, longitude: -83.0458 },
  { id: 'p-losangeles', name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { id: 'p-saopaulo', name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { id: 'p-capetown', name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
  { id: 'p-tokyo', name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { id: 'p-sydney', name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

/** Where a place sits on the dial and in the address bar. */
export function placeLabel(p: Place): string {
  return [p.name, p.admin1 && p.admin1 !== p.name ? p.admin1 : null, p.country]
    .filter(Boolean)
    .join(', ');
}

/* ── Conditions ─────────────────────────────────────────────── */

/**
 * The pixel symbol a condition is drawn with. Deliberately a short list: the
 * WMO table has 28 codes and drawing 28 icons at 32×32 would produce a set
 * nobody could tell apart at a glance, which is the opposite of what a symbol
 * is for. Codes collapse onto the nine shapes a forecast actually needs.
 */
export type SkySymbol =
  | 'clear' | 'partly' | 'overcast' | 'fog'
  | 'drizzle' | 'rain' | 'showers' | 'snow' | 'storm';

export interface Sky {
  label: string;
  symbol: SkySymbol;
}

/**
 * WMO 4677 present-weather codes, as Open-Meteo reports them.
 *
 * Written out rather than derived from ranges: the table is not monotonic —
 * freezing drizzle (56) sits between drizzle and rain, snow *showers* (85) sit
 * above thunderstorm-adjacent codes — and every range-based shortcut for it
 * ends up with a special case per band anyway.
 */
const WMO: Record<number, Sky> = {
  0: { label: 'Clear sky', symbol: 'clear' },
  1: { label: 'Mainly clear', symbol: 'partly' },
  2: { label: 'Partly cloudy', symbol: 'partly' },
  3: { label: 'Overcast', symbol: 'overcast' },
  45: { label: 'Fog', symbol: 'fog' },
  48: { label: 'Freezing fog', symbol: 'fog' },
  51: { label: 'Light drizzle', symbol: 'drizzle' },
  53: { label: 'Drizzle', symbol: 'drizzle' },
  55: { label: 'Heavy drizzle', symbol: 'drizzle' },
  56: { label: 'Freezing drizzle', symbol: 'drizzle' },
  57: { label: 'Freezing drizzle', symbol: 'drizzle' },
  61: { label: 'Light rain', symbol: 'rain' },
  63: { label: 'Rain', symbol: 'rain' },
  65: { label: 'Heavy rain', symbol: 'rain' },
  66: { label: 'Freezing rain', symbol: 'rain' },
  67: { label: 'Freezing rain', symbol: 'rain' },
  71: { label: 'Light snow', symbol: 'snow' },
  73: { label: 'Snow', symbol: 'snow' },
  75: { label: 'Heavy snow', symbol: 'snow' },
  77: { label: 'Snow grains', symbol: 'snow' },
  80: { label: 'Light showers', symbol: 'showers' },
  81: { label: 'Showers', symbol: 'showers' },
  82: { label: 'Violent showers', symbol: 'showers' },
  85: { label: 'Snow showers', symbol: 'snow' },
  86: { label: 'Heavy snow showers', symbol: 'snow' },
  95: { label: 'Thunderstorm', symbol: 'storm' },
  96: { label: 'Thunderstorm, hail', symbol: 'storm' },
  99: { label: 'Thunderstorm, hail', symbol: 'storm' },
};

export function decodeSky(code: number): Sky {
  return WMO[code] ?? { label: 'Unknown', symbol: 'overcast' };
}

/* ── The forecast ───────────────────────────────────────────── */

export interface CurrentConditions {
  /** Celsius. Conversion to Fahrenheit is a display concern, done in the app. */
  temperature: number;
  feelsLike: number;
  humidity: number;
  /** km/h. */
  windSpeed: number;
  /** Degrees the wind is blowing *from*. */
  windDirection: number;
  pressure: number;
  isDay: boolean;
  sky: Sky;
  /** Local wall-clock at the place, ISO without a zone, e.g. 2026-07-21T23:30. */
  time: string;
}

export interface DayOutlook {
  /** ISO date, local to the place. */
  date: string;
  high: number;
  low: number;
  /** Percent, or null where the model does not offer one. */
  precipitation: number | null;
  sky: Sky;
}

export interface Forecast {
  place: Place;
  /** IANA zone the readings are expressed in, e.g. Europe/Tirane. */
  timezone: string;
  current: CurrentConditions;
  days: DayOutlook[];
  /** When this was fetched, for the "as of" line. */
  fetchedAt: number;
}

/** The subset of the response this reads. The endpoint returns a great deal more. */
interface ForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
}

const CURRENT_FIELDS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'is_day',
  'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'surface_pressure',
].join(',');

const DAILY_FIELDS = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max',
].join(',');

/**
 * Conditions now, and the days ahead, for one place.
 *
 * `timezone=auto` is what makes the readings local to the place rather than to
 * the visitor — without it, looking up Tokyo from Europe returns Tokyo's weather
 * stamped with European timestamps, and the outlook strip is off by a day.
 */
export async function fetchForecast(place: Place, signal?: AbortSignal): Promise<Forecast> {
  const url = `${FORECAST}?latitude=${place.latitude}&longitude=${place.longitude}`
    + `&current=${CURRENT_FIELDS}&daily=${DAILY_FIELDS}`
    + `&timezone=auto&forecast_days=${FORECAST_DAYS}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Forecast returned ${res.status}`);
  const data = (await res.json()) as ForecastResponse;

  return {
    place,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.surface_pressure,
      isDay: data.current.is_day === 1,
      sky: decodeSky(data.current.weather_code),
      time: data.current.time,
    },
    days: data.daily.time.map((date, i) => ({
      date,
      high: data.daily.temperature_2m_max[i],
      low: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_probability_max[i] ?? null,
      sky: decodeSky(data.daily.weather_code[i]),
    })),
    fetchedAt: Date.now(),
  };
}

/** One hit from the gazetteer. */
interface GeocodeResponse {
  results?: {
    id: number;
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    feature_code?: string;
  }[];
}

/**
 * Find a place by name.
 *
 * Populated places only. The gazetteer indexes heliports, farms and mountain
 * huts alongside cities, so an unfiltered search for a capital returns the
 * airport and the military helipad above half the towns anybody means — the
 * `PPL` prefix is the GeoNames class for somewhere people live.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const res = await fetch(
    `${GEOCODE}?name=${encodeURIComponent(q)}&count=10&language=en&format=json`,
    { signal },
  );
  if (!res.ok) throw new Error(`Search returned ${res.status}`);
  const data = (await res.json()) as GeocodeResponse;

  return (data.results ?? [])
    .filter((r) => !r.feature_code || r.feature_code.startsWith('PPL'))
    .slice(0, 6)
    .map((r) => ({
      id: `g-${r.id}`,
      name: r.name,
      country: r.country ?? '',
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
}

/**
 * Name the coordinates a browser hands back, so a geolocated fix reads as a
 * town rather than as two decimals.
 *
 * Reverse geocoding is a separate, paid endpoint on this service, so this does
 * the honest cheap thing: search nothing, and let the caller fall back to the
 * coordinates if the nearest-place lookup finds nobody home. Failure here is
 * cosmetic — the forecast works from the raw fix either way.
 */
export function geolocatedPlace(latitude: number, longitude: number): Place {
  return {
    id: 'here',
    name: 'Your location',
    country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    latitude,
    longitude,
  };
}

/* ── Units ──────────────────────────────────────────────────── */

export const toFahrenheit = (c: number) => c * 9 / 5 + 32;
export const toMph = (kmh: number) => kmh * 0.621371;

/** The eight-point compass, which is as fine as a wind arrow can be read. */
export function compassPoint(deg: number): string {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round(((deg % 360) / 45)) % 8];
}
