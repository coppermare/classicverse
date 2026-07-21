'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PRESET_PLACES, compassPoint, fetchForecast, geolocatedPlace, placeLabel,
  searchPlaces, toFahrenheit, toMph,
  type Forecast, type Place,
} from '@/data/weather';
import PixelArt from '../PixelArt';
import { skyGrid } from '../weatherArt';
import type { AppProps } from '../types';
import { RetroButton, INK, FACE, RADIUS, WELL } from '../ui';
import { setTuner } from '../tuner';

/**
 * The Weather — a channel showing the real sky.
 *
 * Live observations and a six-day outlook from Open-Meteo (see data/weather.ts),
 * which needs no API key, so the set works out of the box for anyone who clones
 * this and there is no secret sitting in the bundle pretending to be hidden.
 *
 * It is presented as a broadcast weather bulletin, in the paper-and-ink language
 * the rest of the shell speaks: an ident strip naming the place and its local
 * time, the conditions now set large enough to read from across a room, and the
 * days ahead as a strip of symbols along the bottom. Everything is drawn from
 * the same pixel lattice as the desktop icons rather than from a weather-icon
 * font, so the channel belongs to the set instead of visiting it.
 *
 * The tuning knob sweeps places, the way it sweeps frequencies on the Radio: the
 * dial is the set's one universal control, and a channel that ignored it would
 * be a web page parked behind glass.
 */

const PAPER = 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)';
const DIAL_INK = '#2c2620';
const DIAL_MUTED = '#6f675c';
const ACCENT = '#b3282d';

/** Where the set was left — the place, and whether it was reading °C or °F. */
const LAST_KEY = 'cv-weather-last';

interface Saved { placeId: string; unit: 'C' | 'F' }

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Saved>;
    return typeof v.placeId === 'string' && (v.unit === 'C' || v.unit === 'F')
      ? { placeId: v.placeId, unit: v.unit }
      : null;
  } catch {
    return null;
  }
}

/**
 * What came back for a place — the forecast, or why there isn't one.
 *
 * Kept as one value tagged with the place it belongs to, rather than as
 * separate `forecast`/`error`/`loading` flags. Three flags describing one
 * request can disagree (an error left standing beside a fresh forecast, a
 * spinner that never clears), and every combination has to be cleared by hand
 * on the way into a fetch — which means setting state synchronously inside the
 * effect, and cascading renders. One tagged result makes the screen's three
 * states derivable: matching forecast, matching error, or still tuning.
 */
interface Result {
  placeId: string;
  forecast?: Forecast;
  error?: string;
}

export default function WeatherApp({}: AppProps) {
  /** The dial's stops. Searched places join the presets for the session. */
  const [places, setPlaces] = useState<Place[]>(PRESET_PLACES);
  /* Restored from the last visit in the initialiser rather than in an effect:
     an effect would render the default place first and immediately fetch it,
     costing a wasted request and a visible flash of the wrong city. The app is
     only ever mounted by a click on the desktop, so this never runs during the
     server render — but it is guarded anyway, because a lazy initialiser does
     run on the server if a route ever prerenders it. */
  const [placeId, setPlaceId] = useState(() => {
    if (typeof window === 'undefined') return PRESET_PLACES[0].id;
    const saved = readSaved();
    return saved && PRESET_PLACES.some((p) => p.id === saved.placeId)
      ? saved.placeId
      : PRESET_PLACES[0].id;
  });
  const [unit, setUnit] = useState<'C' | 'F'>(() => {
    if (typeof window === 'undefined') return 'C';
    return readSaved()?.unit ?? 'C';
  });

  const [result, setResult] = useState<Result | null>(null);
  /** Bumped to re-fetch — by the REFRESH button and by the ten-minute timer. */
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState('');
  /* Tagged with the query that produced them, so a stale list is derived away
     rather than cleared by hand — the hits for "Lon" must not sit under
     "London" while the next lookup is in flight. */
  const [hits, setHits] = useState<{ query: string; places: Place[] } | null>(null);
  const [locating, setLocating] = useState(false);

  const place = useMemo(
    () => places.find((p) => p.id === placeId) ?? places[0],
    [places, placeId],
  );

  /* The three states of the screen, all read off the one result. */
  const forPlace = result?.placeId === place.id ? result : null;
  const showing = forPlace?.forecast ?? null;
  const error = forPlace?.error ?? null;
  const loading = !forPlace;

  const trimmed = query.trim();
  const results = hits && hits.query === trimmed ? hits.places : null;

  useEffect(() => {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ placeId, unit }));
    } catch {
      // A full or disabled localStorage costs the memory, not the forecast.
    }
  }, [placeId, unit]);

  /* ── The forecast ── */
  useEffect(() => {
    const ac = new AbortController();
    fetchForecast(place, ac.signal)
      .then((f) => setResult({ placeId: place.id, forecast: f }))
      .catch((e: Error) => {
        // StrictMode mounts twice and aborts the first request; that is not a
        // failure to report, and reporting it would flash an error on boot.
        if (e.name === 'AbortError') return;
        setResult({ placeId: place.id, error: 'The forecast could not be reached.' });
      });
    return () => ac.abort();
  }, [place, reloadKey]);

  /* Refresh on its own every ten minutes. A weather channel left on screen
     should not be quietly showing an hour-old reading; the model itself updates
     about this often, so anything faster is asking for data that has not
     changed. */
  useEffect(() => {
    const id = setInterval(() => setReloadKey((k) => k + 1), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Search ── */
  useEffect(() => {
    if (trimmed.length < 2) return;
    const ac = new AbortController();
    // Debounced: the gazetteer is a public service and one request per
    // keystroke would be rude as well as useless — the answer for "Lon" is
    // thrown away the moment "Lond" is typed.
    const id = setTimeout(() => {
      searchPlaces(trimmed, ac.signal)
        .then((places) => setHits({ query: trimmed, places }))
        .catch(() => { /* A failed lookup shows no hits, which is the truth. */ });
    }, 350);
    return () => { clearTimeout(id); ac.abort(); };
  }, [trimmed]);

  const choosePlace = useCallback((p: Place) => {
    setPlaces((list) => (list.some((x) => x.id === p.id) ? list : [p, ...list]));
    setPlaceId(p.id);
    setQuery('');
  }, []);

  /** Where the visitor actually is, if the browser will say. */
  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choosePlace(geolocatedPlace(pos.coords.latitude, pos.coords.longitude));
      },
      // Denied or unavailable: the dial still has a dozen places on it, so
      // there is nothing to recover from and nothing worth interrupting for.
      () => setLocating(false),
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }, [choosePlace]);

  /* ── The knob sweeps places ── */
  useEffect(() => {
    setTuner({
      ariaLabel: 'Location',
      options: places.map((p) => ({ id: p.id, mark: p.name })),
      selectedId: placeId,
      onSelect: setPlaceId,
    });
    return () => setTuner(null);
  }, [places, placeId]);

  /* ── Keyboard: arrows step the dial, as they do on the Radio ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      // The search field is a text input: left and right belong to the caret
      // while it has focus, not to the dial.
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      setPlaceId((id) => {
        const i = places.findIndex((p) => p.id === id);
        const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + places.length) % places.length;
        return places[next].id;
      });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [places]);

  const temp = useCallback(
    (c: number) => Math.round(unit === 'C' ? c : toFahrenheit(c)),
    [unit],
  );

  /* Only ever the reading that belongs to the place named on the ident —
     showing Tokyo's temperature under Cape Town's name for the length of a
     fetch is worse than showing nothing, which is what `showing` being tagged
     by place buys. */
  const current = showing?.current;

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: PAPER,
      fontFamily: 'var(--font-sans)',
      display: 'flex', flexDirection: 'column',
      color: DIAL_INK,
    }}>
      {/* ── Ident ──
          Which place, and what time it is there. Full-bleed, like the Radio's
          scale: the strip is the channel captioning itself. */}
      <div style={{
        flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
        padding: '13px 22px 12px',
        background: '#FBF9F3',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            font: '800 21px/1.15 var(--font-sans)', letterSpacing: '-0.01em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {place.name}
          </div>
          <div style={{
            font: '500 11px/1.3 var(--font-sans)', color: DIAL_MUTED, marginTop: 3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {[place.admin1 && place.admin1 !== place.name ? place.admin1 : null, place.country]
              .filter(Boolean).join(', ')}
          </div>
        </div>

        {showing && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              font: '700 17px/1 var(--font-sans)', fontVariantNumeric: 'tabular-nums',
            }}>
              {showing.current.time.slice(11, 16)}
            </div>
            <div style={{ font: '600 9px/1 var(--font-sans)', letterSpacing: '0.14em', color: DIAL_MUTED, marginTop: 5 }}>
              LOCAL TIME
            </div>
          </div>
        )}
      </div>

      {/* ── Now ── */}
      <div style={{
        flex: 1, minHeight: 0, display: 'flex', alignItems: 'center',
        gap: 'clamp(12px, 2.6cqw, 26px)', padding: '0 22px',
      }}>
        {error ? (
          <Notice
            badge="NO SIGNAL"
            text="The forecast could not be reached. Check the connection and press REFRESH."
          />
        ) : !showing || !current ? (
          <Notice badge="TUNING" text={`Fetching the forecast for ${place.name}…`} />
        ) : (
          <>
            <PixelArt
              grid={skyGrid(showing.current.sky.symbol, !showing.current.isDay)}
              scale={4}
              style={{ flexShrink: 0 }}
            />

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 62, fontWeight: 800, lineHeight: 0.92,
                  letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums',
                }}>
                  {temp(current.temperature)}
                </span>
                <span style={{ font: '700 17px/1 var(--font-sans)', marginTop: 6, color: DIAL_MUTED }}>
                  °{unit}
                </span>
              </div>
              <div style={{
                font: '700 16px/1.25 var(--font-sans)', marginTop: 9,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {current.sky.label}
              </div>
              <div style={{ font: '500 12px/1.3 var(--font-sans)', color: DIAL_MUTED, marginTop: 4 }}>
                Feels like {temp(current.feelsLike)}°
              </div>
            </div>

            {/* The instruments, as a ruled table — the part of a bulletin you
                read rather than glance at. */}
            <dl style={{
              marginLeft: 'auto', flexShrink: 0,
              display: 'grid', gridTemplateColumns: 'auto auto', gap: '7px 14px',
              font: '500 12px/1.2 var(--font-sans)', alignContent: 'center',
            }}>
              <Reading label="Wind">
                {Math.round(unit === 'C' ? current.windSpeed : toMph(current.windSpeed))}
                {unit === 'C' ? ' km/h' : ' mph'} {compassPoint(current.windDirection)}
              </Reading>
              <Reading label="Humidity">{Math.round(current.humidity)}%</Reading>
              <Reading label="Pressure">{Math.round(current.pressure)} hPa</Reading>
            </dl>
          </>
        )}
      </div>

      {/* ── The days ahead ──
          Six columns of symbol and range. The first is today, named as such:
          "Tue" beside a temperature you can feel out of the window reads as a
          forecast for a day that has not happened yet. */}
      {showing && (
        <div style={{
          flexShrink: 0, display: 'flex', gap: 1,
          padding: '0 22px 12px',
        }}>
          {showing.days.map((d, i) => (
            <div key={d.date} style={{
              flex: 1, minWidth: 0, textAlign: 'center',
              padding: '9px 2px 8px',
              background: i === 0 ? 'rgba(179,40,45,0.07)' : 'transparent',
              borderRadius: RADIUS,
            }}>
              <div style={{
                font: '700 10px/1 var(--font-sans)', letterSpacing: '0.1em',
                color: i === 0 ? ACCENT : DIAL_MUTED,
              }}>
                {i === 0 ? 'TODAY' : weekday(d.date)}
              </div>
              <PixelArt
                grid={skyGrid(d.sky.symbol)}
                scale={1.5}
                style={{ margin: '7px auto 6px' }}
              />
              <div style={{
                font: '700 12px/1 var(--font-sans)', fontVariantNumeric: 'tabular-nums',
              }}>
                {temp(d.high)}°
                <span style={{ fontWeight: 500, color: DIAL_MUTED }}> {temp(d.low)}°</span>
              </div>
              {/* Only worth printing when rain is a real prospect, but the line
                  keeps its space either way so the row of symbols does not jump
                  up and down as the week changes. `visibility` rather than a
                  transparent colour: transparent text still holds its place in
                  the accessibility tree, so a screen reader read out a chance of
                  rain for every dry day on the strip. */}
              <div style={{
                font: '600 9px/1 var(--font-sans)', marginTop: 5, color: '#3f6fb5',
                visibility: (d.precipitation ?? 0) >= 30 ? 'visible' : 'hidden',
              }}>
                {d.precipitation ?? 0}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Transport ──
          Find a place, jump to where you are, and switch the scale. The dial on
          the cabinet already steps between places, so there are no next/previous
          buttons here repeating it. */}
      <div style={{
        flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 16px',
        background: FACE,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 #a8a49c',
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('');
            if (e.key === 'Enter' && results?.length) choosePlace(results[0]);
          }}
          placeholder="Find a place…"
          aria-label="Search for a place"
          style={{
            flex: 1, minWidth: 0, height: 26,
            padding: '0 8px', border: 'none', borderRadius: RADIUS,
            background: '#fbfaf7', boxShadow: WELL, color: INK,
            font: '500 12px/1 var(--font-sans)', outline: 'none',
          }}
        />

        <RetroButton label={locating ? 'Locating…' : 'Use my location'} onClick={locate} disabled={locating}>
          {locating ? 'LOCATING' : 'HERE'}
        </RetroButton>

        <RetroButton
          label={`Show temperatures in ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          style={{ minWidth: 40 }}
        >
          °{unit}
        </RetroButton>

        {/* Clears the reading as well as asking for a new one, so pressing it
            visibly does something. The ten-minute timer deliberately does not:
            an unattended channel should swap the numbers, not blink. */}
        <RetroButton
          label="Refresh the forecast"
          onClick={() => { setResult(null); setReloadKey((k) => k + 1); }}
          disabled={loading}
        >
          {loading ? '…' : 'REFRESH'}
        </RetroButton>

        {/* Attribution, as the licence asks — on the screen the data is on, not
            filed away in a colophon. */}
        <span style={{
          font: '500 9px/1 var(--font-sans)', color: '#6f6b64', letterSpacing: '0.04em',
          flexShrink: 0, marginLeft: 2,
        }}>
          Open-Meteo
        </span>

        {/* Hits rise out of the field, the way a period combo box dropped its
            list — over the bulletin rather than pushing it around. */}
        {results && results.length > 0 && (
          <div style={{
            position: 'absolute', left: 16, bottom: 'calc(100% + 5px)', width: 268, zIndex: 10,
            background: '#fbfaf7', borderRadius: RADIUS,
            boxShadow: '0 0 0 1px #6f6b64, 0 6px 16px rgba(0,0,0,0.28)',
            overflow: 'hidden',
          }}>
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePlace(p)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', border: 'none', background: 'transparent',
                  font: '500 12px/1.3 var(--font-sans)', color: INK, cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e6e2d8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {placeLabel(p)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** One instrument reading: a label and its value, on one baseline. */
function Reading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt style={{ color: DIAL_MUTED, letterSpacing: '0.04em' }}>{label}</dt>
      <dd style={{ fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {children}
      </dd>
    </>
  );
}

/**
 * The card shown in place of a reading — same shape as the Radio's, so a
 * channel with nothing to show says so in the set's own voice.
 */
function Notice({ badge, text }: { badge: string; text: string }) {
  return (
    <div>
      <span style={{
        display: 'inline-block',
        border: `1px solid ${DIAL_MUTED}`, color: DIAL_MUTED, borderRadius: 3,
        padding: '3px 8px', marginBottom: 10,
        font: '700 12px/1 var(--font-sans)', letterSpacing: '0.14em',
      }}>
        {badge}
      </span>
      <div style={{ font: '500 14px/1.5 var(--font-sans)', color: DIAL_MUTED, maxWidth: 360 }}>
        {text}
      </div>
    </div>
  );
}

/**
 * The short weekday for an ISO date.
 *
 * Parsed as UTC and formatted as UTC. `new Date('2026-07-22')` is midnight UTC,
 * and formatting that in a zone west of Greenwich hands back the day before —
 * the whole strip would be labelled one day early for every visitor in the
 * Americas.
 */
function weekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })
    .toUpperCase();
}
