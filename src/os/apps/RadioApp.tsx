'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLiveBand } from '@/data/liveRadio';
import type { AppProps, RadioStation, RadioTrack } from '../types';
import { RetroButton, INK, FACE } from '../ui';
import { setTuner } from '../tuner';

/**
 * The Radio — a working FM receiver.
 *
 * The stations are real: thousands of broadcasters, each parked on the frequency
 * it genuinely transmits on, from a snapshot of the Radio Browser index (see
 * data/liveRadio.ts). The knob sweeps the needle a tenth of a MHz at a time; off
 * a frequency you get static, and when the needle lands on one it locks and
 * whatever that station is playing right now comes up.
 *
 * The glass carries the band and nothing else — no names, no markers. The only
 * way to find a station is to sweep and listen for the hiss to break, which is
 * the entire pleasure of a radio; printing the names across the dial gave it
 * away, and even dots were a map that spoiled the hunt.
 *
 * Playback is a plain <audio> element on the station's stream, routed through a
 * Web Audio graph so the signal meter reads the true output and the set's VOLUME
 * knob controls the gain. The static is synthesised into the same graph, so one
 * knob rides both. If the graph can't be built (a CORS failure on a stream would
 * otherwise silence playback entirely) it falls back to the element's own volume
 * and loses the meter and the static — the music always wins over the
 * decoration.
 */

/**
 * This is a channel on a television set, not a wooden radio sitting inside one.
 * Drawing a cabinet on the glass meant two sets nested in each other; the page
 * is now a broadcast graphic in the same paper-and-ink language as the rest of
 * the shell, and the only radio left is the scale you sweep.
 */
const PAPER = 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)';
const DIAL_INK = '#2c2620';
const DIAL_MUTED = '#6f675c';
const NEEDLE = '#b3282d';

/**
 * The dial is scaled to the real FM band, so the stations sit where their
 * frequencies actually fall and the space between them is visible — that gap is
 * what you sweep through, and what the static fills.
 */
const BAND_MIN = 87;
const BAND_MAX = 108;
/**
 * One detent of the knob — a tenth of a MHz, the real spacing of the FM band.
 * A coarser dial had to round stations onto stops they don't broadcast on, and
 * it left the whole band with 43 places to put 6,000 stations.
 */
const STEP = 0.1;
const pctFor = (freq: number) => ((freq - BAND_MIN) / (BAND_MAX - BAND_MIN)) * 100;

const STOPS: number[] = (() => {
  const out: number[] = [];
  for (let f = BAND_MIN; f <= BAND_MAX + 0.001; f += STEP) out.push(Math.round(f * 10) / 10);
  return out;
})();

const TICKS: { pct: number; major: boolean; label?: string }[] = (() => {
  const out: { pct: number; major: boolean; label?: string }[] = [];
  for (let f = BAND_MIN; f <= BAND_MAX + 0.001; f += 0.5) {
    const major = Math.round(f) === f && Math.round(f) % 2 === 0;
    out.push({ pct: pctFor(f), major, label: major ? String(Math.round(f)) : undefined });
  }
  return out;
})();

/**
 * Where the set was left. A radio you come back to is still on the station you
 * left it on — starting again at the bottom of the band every time made the
 * whole thing feel like a demo rather than a set you own.
 */
const LAST_KEY = 'cv-radio-last';

interface LastTuned { freq: number; id: string }

function readLastTuned(): LastTuned | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LastTuned>;
    return typeof v.freq === 'number' && typeof v.id === 'string' ? { freq: v.freq, id: v.id } : null;
  } catch {
    return null;
  }
}

export default function RadioApp({ os }: AppProps) {
  const [liveBand, setLiveBand] = useState<RadioStation[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [bandError, setBandError] = useState(false);

  /* Memoised: it feeds the station lookup and the tuner, and a fresh [] on every
     render would re-run both continuously before the band has been scanned. */
  const stations = useMemo(() => liveBand ?? [], [liveBand]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<{ ctx: AudioContext; gain: GainNode; analyser: AnalyserNode } | null>(null);
  const staticRef = useRef<GainNode | null>(null);
  const graphFailed = useRef(false);

  /* The low end of the band. Where the needle rests before the set is switched
     on and the scan has told it where anything actually is. */
  const [freq, setFreq] = useState(BAND_MIN + 1);
  /** The user's intent — is the set on. Distinct from whether audio is flowing:
   *  between stations the set is on but the element is silent and it's all hiss. */
  const [powered, setPowered] = useState(false);
  /** Which of the stations sharing this frequency is playing. */
  const [stationIndex, setStationIndex] = useState(0);
  /**
   * How many stations on this frequency have been tried and failed.
   *
   * A quarter of the streams in any snapshot of the index are off the air by the
   * time anyone tunes in - servers move, stations fold, licences lapse - so
   * landing on a dead one is normal rather than exceptional. Stepping to the
   * next station on the same frequency turns that from a dead end into a pause,
   * and the counter stops it walking the whole stack forever when every station
   * on a frequency is down.
   */
  const triedRef = useRef(0);
  /** The stream that last failed, so one dead station is not counted twice. */
  const failedSrcRef = useRef<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [level, setLevel] = useState(0);

  /**
   * The band, indexed by frequency. Thousands of stations share ~200
   * frequencies, so scanning the flat list on every render (and every tick of
   * the signal meter) would be wasted work.
   */
  const byFrequency = useMemo(() => {
    const map = new Map<string, RadioStation[]>();
    for (const s of stations) {
      const list = map.get(s.frequency);
      if (list) list.push(s);
      else map.set(s.frequency, [s]);
    }
    return map;
  }, [stations]);

  /** Everything transmitting on the frequency the needle is sitting on. */
  const atNeedle = useMemo(
    () => byFrequency.get(freq.toFixed(1)) ?? [],
    [byFrequency, freq],
  );

  /** Locked only when the needle is on a frequency something broadcasts on. */
  const station: RadioStation | undefined = atNeedle[stationIndex % Math.max(1, atNeedle.length)];
  /* One stream per station — a live broadcast has no track list. */
  const track: RadioTrack | undefined = station?.tracks[0];
  const live = powered && !!station;

  /**
   * Sweep the needle.
   *
   * The current frequency is read from a ref, not from the render closure. The
   * knob and the arrow keys nudge by ±STEP, and presses that land in the
   * same frame would otherwise all read the same stale `freq` and collapse into a
   * single step — three quick presses moved the needle 0.5 MHz instead of 1.5.
   * The ref is written here rather than in a setFreq updater so nothing has a
   * side effect inside a reducer, which StrictMode is free to run twice.
   */
  const freqRef = useRef(freq);

  const tuneToFreq = useCallback((f: number) => {
    const next = Math.min(BAND_MAX, Math.max(BAND_MIN, Math.round(f * 10) / 10));
    const prev = freqRef.current;
    if (Math.abs(prev - next) < 0.01) return;
    freqRef.current = next;
    setFreq(next);
    setStationIndex(0);
    triedRef.current = 0;
    failedSrcRef.current = null;
    setFailed(false);
  }, []);

  /** One detent, from wherever the needle actually is. */
  const nudge = useCallback((dir: 1 | -1) => {
    tuneToFreq(freqRef.current + dir * STEP);
  }, [tuneToFreq]);

  /**
   * Scan the band, then put the needle back where it was left.
   *
   * The restore happens here rather than in an effect because it can only run
   * once the band is in hand — a saved frequency means nothing until there is
   * something on it.
   */
  const scanBand = useCallback(() => {
    if (liveBand || scanning) return;
    setScanning(true);
    setBandError(false);
    // Deliberately not abortable. Cancelling on unmount looks tidy and was a
    // trap: StrictMode's mount/cleanup/mount killed the request, the rejection
    // left `scanning` stuck true, and the guard above then refused to scan
    // again — the set sat on SCANNING forever. It is one cached same-origin
    // GET; letting it land is cheaper than the bug.
    fetchLiveBand()
      .then((band) => {
        setLiveBand(band);
        const last = readLastTuned();
        if (!last) return;
        const here = band.filter((s) => s.frequency === last.freq.toFixed(1));
        if (!here.length) return;
        const i = here.findIndex((s) => s.id === last.id);
        tuneToFreq(last.freq);
        setStationIndex(i < 0 ? 0 : i);
      })
      .catch(() => setBandError(true))
      .finally(() => setScanning(false));
  }, [liveBand, scanning, tuneToFreq]);

  /* ── Audio graph ── */
  const ensureGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || graphRef.current || graphFailed.current) return graphRef.current;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(el);
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(gain); gain.connect(analyser); analyser.connect(ctx.destination);
      graphRef.current = { ctx, gain, analyser };

      // Static: a looping noise bed feeding the same gain, so the VOLUME knob
      // rides the hiss exactly as it rides the music.
      const n = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2200;
      bp.Q.value = 0.6;
      const sg = ctx.createGain();
      sg.gain.value = 0;
      noise.connect(bp); bp.connect(sg); sg.connect(gain);
      noise.start();
      staticRef.current = sg;

      // Hand volume over to the graph in the same breath. The element keeps
      // whatever level it was given before the graph existed, and that would
      // multiply with the gain node — attenuating the knob twice.
      gain.gain.value = os.muted ? 0 : os.volume;
      el.volume = 1;
      return graphRef.current;
    } catch {
      // Routing failed — keep the element's own output rather than losing sound.
      graphFailed.current = true;
      return null;
    }
  }, [os.volume, os.muted]);

  // The set's knob drives the graph gain, or the element directly if there's no graph.
  useEffect(() => {
    const v = os.muted ? 0 : os.volume;
    const g = graphRef.current;
    if (g) g.gain.gain.setTargetAtTime(v, g.ctx.currentTime, 0.02);
    if (audioRef.current) audioRef.current.volume = g ? 1 : v;
  }, [os.volume, os.muted]);

  /**
   * Hiss whenever the set is on and nothing is actually coming out of it.
   *
   * The test used to be `!station`, but `station` only says the directory lists
   * a broadcaster on this frequency — not that any audio is arriving. A quarter
   * of the streams in the snapshot are off the air, so the commonest no-signal
   * case of all was a station the set had locked onto that plays nothing: the
   * dial read "No signal" in dead silence, which is the one thing a radio never
   * does. A carrier that fails to resolve into sound leaves you with the noise
   * floor, exactly as an empty frequency does.
   *
   * `buffering` counts for the same reason: until the stream resolves there is
   * no signal yet, so it hisses and then breaks into the station the moment it
   * locks. That also covers a mid-stream dropout, which is a real receiver
   * losing the carrier for a moment and sounds like one.
   */
  useEffect(() => {
    const g = graphRef.current;
    const sg = staticRef.current;
    if (!g || !sg) return;
    const silent = !station || failed || buffering;
    const want = powered && silent ? 0.09 : 0;
    sg.gain.setTargetAtTime(want, g.ctx.currentTime, 0.05);
  }, [powered, station, failed, buffering]);

  // Magic eye, from the real signal — shut when there's no station to read.
  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      const g = graphRef.current;
      let raw = 0;
      if (g && live) {
        const buf = new Uint8Array(g.analyser.frequencyBinCount);
        g.analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128) / 128);
        // Real recordings sit far hotter than a synthesised blip, so this maps
        // close to linear — a steeper curve pinned the eye shut permanently.
        raw = Math.min(1, peak * 1.25);
      }
      smooth += (raw - smooth) * (raw > smooth ? 0.6 : 0.09);
      setLevel(smooth);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  /* ── Transport ── */
  const power = useCallback(async (on: boolean) => {
    setPowered(on);
    if (!on) { audioRef.current?.pause(); return; }
    scanBand();
    ensureGraph();
    const g = graphRef.current;
    if (g?.ctx.state === 'suspended') await g.ctx.resume();
  }, [ensureGraph, scanBand]);

  /* Remember where the set is left, so opening the Radio again comes back to
     this station rather than to the bottom of the band. */
  useEffect(() => {
    if (!station) return;
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ freq, id: station.id }));
    } catch {
      // A full or disabled localStorage costs the memory, not the radio.
    }
  }, [station, freq]);

  /**
   * Switch on by itself. Opening the Radio is the gesture — a set you turn to
   * should already be playing, not waiting to be started a second time.
   *
   * Autoplay policies can still refuse the stream; `play()` rejecting leaves the
   * set powered with no audio, which reads as a station that won't come in, so
   * the failure is surfaced rather than swallowed.
   */
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void power(true);
  }, [power]);

  /**
   * A stream that will not play: step to the next station on this frequency,
   * unless they have all been tried, in which case say so and stop.
   */
  const onStreamFailure = useCallback(() => {
    setBuffering(false);
    // A dead stream reports itself twice - the element fires `error` and the
    // pending play() rejects - and counting both burned two of the frequency's
    // stations for one failure. Attribute a failure to the stream it came from.
    const src = audioRef.current?.currentSrc || audioRef.current?.src || null;
    if (src && src === failedSrcRef.current) return;
    failedSrcRef.current = src;
    if (atNeedle.length > 1 && triedRef.current < atNeedle.length - 1) {
      triedRef.current += 1;
      setStationIndex((i) => (i + 1) % atNeedle.length);
      return;
    }
    setFailed(true);
  }, [atNeedle.length]);

  // The element follows the set: playing only when powered AND locked on.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (live) { void el.play().catch(onStreamFailure); }
    else el.pause();
  }, [live, track?.src, onStreamFailure]);

  // Claim the set's tuning knob: one detent per 0.5 MHz across the whole band,
  // so the knob sweeps the dial rather than jumping station to station.
  useEffect(() => {
    setTuner({
      ariaLabel: 'Frequency tuning',
      options: STOPS.map((f) => ({ id: f.toFixed(1), mark: f.toFixed(1) })),
      selectedId: freq.toFixed(1),
      onSelect: (id) => tuneToFreq(Number(id)),
    });
    return () => setTuner(null);
  }, [freq, tuneToFreq]);

  /* ── Keyboard: space/arrows, the way a remote works ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); void power(!powered); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [powered, power, nudge]);

  const needlePct = pctFor(freq);

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: PAPER,
      fontFamily: 'var(--font-sans)',
      display: 'flex', flexDirection: 'column',
    }}>
      <audio
        ref={audioRef}
        src={track?.src}
        crossOrigin="anonymous"
        preload="auto"
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setFailed(false); triedRef.current = 0; failedSrcRef.current = null; }}
        onCanPlay={() => setBuffering(false)}
        onError={onStreamFailure}
        /* A live stream shouldn't end. If it does the station has dropped
           off the air, which is the same thing as no signal. */
        onEnded={onStreamFailure}
      />

      {/* ── The scale ──
          The one piece of the radio that survives as an instrument: a recessed
          strip carrying the band, ticks hanging off a baseline, and the needle.
          Stations are unmarked on purpose — a map would spoil the hunt. */}
      <div style={{ flexShrink: 0 }}>
        {/* Full-bleed: the band runs the width of the screen like a channel
            strip, so the scale reads as part of the broadcast rather than a
            control panel parked in a box. */}
        <div style={{
          position: 'relative', height: 112,
          background: '#FBF9F3',
          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          {(['left', 'right'] as const).map((side) => (
            <span key={side} style={{
              position: 'absolute', top: 30, [side]: 10, zIndex: 2,
              font: '700 9px/1 var(--font-sans)', letterSpacing: '0.16em',
              color: DIAL_MUTED, border: `1px solid ${DIAL_MUTED}`, borderRadius: 2, padding: '3px 4px',
            }}>
              FM
            </span>
          ))}

          <div style={{ position: 'absolute', left: 46, right: 46, top: 44, height: 1, background: DIAL_INK, opacity: 0.75 }} />
          {TICKS.map((t, i) => (
            <span key={i} style={{
              position: 'absolute',
              left: `calc(46px + (100% - 92px) * ${t.pct / 100})`,
              top: 44, width: 1, marginLeft: -0.5,
              height: t.major ? 14 : 7,
              background: DIAL_INK,
              opacity: t.major ? 0.8 : 0.4,
            }} />
          ))}
          {TICKS.filter((t) => t.label).map((t, i) => (
            <span key={i} style={{
              position: 'absolute',
              left: `calc(46px + (100% - 92px) * ${t.pct / 100})`,
              top: 64, transform: 'translateX(-50%)',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, lineHeight: 1,
              color: DIAL_MUTED, fontVariantNumeric: 'tabular-nums',
            }}>
              {t.label}
            </span>
          ))}

          {/* Needle: a flag at the top of a hairline, so the position reads at a
              glance. Eased rather than linear — it steps in detents, and a hard
              linear slide made each stop look like a jump. */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `calc(46px + (100% - 92px) * ${needlePct / 100})`,
            width: 1, marginLeft: -0.5, zIndex: 3,
            background: NEEDLE,
            transition: 'left 180ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}>
            <span style={{
              position: 'absolute', top: 0, left: -3, width: 7, height: 7,
              background: NEEDLE, borderRadius: '0 0 2px 2px',
            }} />
          </div>
        </div>
      </div>

      {/* ── The card: what you found ──
          A station ident, the way a channel would caption itself: the frequency
          set large, the station beside it, the record underneath. Re-keyed on
          the station so it fades in on a lock instead of swapping in place. */}
      <div style={{
        flex: 1, minHeight: 0, display: 'flex', alignItems: 'center',
        gap: 20, padding: '0 26px', color: DIAL_INK,
      }}>
        <div key={station?.id ?? 'none'} className="cv-radio-ident" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 12 }}>
            {/* Longhand, not the `font` shorthand: React warns when a shorthand
                and a longhand for the same value (fontVariantNumeric) are set
                together, and the shorthand resets it on every rerender. */}
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: 40, fontWeight: 800, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            }}>
              {freq.toFixed(1)}
            </span>
            <span style={{ font: '700 12px/1 var(--font-sans)', letterSpacing: '0.16em', color: DIAL_MUTED }}>MHZ</span>
          </div>

          {station ? (
            <>
              {/* The station's own name, set as type. It used to sit in a filled
                  chip, which read as a label stuck onto the broadcast rather
                  than as the thing the set had found. */}
              <div style={{ font: '700 22px/1.2 var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {failed ? 'No signal' : buffering ? 'Tuning…' : station.name}
              </div>
              <div style={{ font: '500 14px/1.4 var(--font-sans)', color: DIAL_MUTED, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {/* What it plays, where it broadcasts from, and — when a
                    frequency is crowded — which of the stations sharing it you
                    are listening to. */}
                {[track?.title, station.era].filter(Boolean).join(' - ')}
                {atNeedle.length > 1 && ` - ${(stationIndex % atNeedle.length) + 1} of ${atNeedle.length}`}
              </div>
            </>
          ) : (
            <>
              <span style={{
                display: 'inline-block',
                border: `1px solid ${DIAL_MUTED}`, color: DIAL_MUTED, borderRadius: 3,
                padding: '3px 8px', marginBottom: 10,
                font: '700 12px/1 var(--font-sans)', letterSpacing: '0.14em',
              }}>
                {scanning ? 'SCANNING' : powered ? 'NO STATION' : 'OFF'}
              </span>
              <div style={{ font: '500 14px/1.5 var(--font-sans)', color: DIAL_MUTED, maxWidth: 340 }}>
                {scanning
                  ? 'Scanning the band…'
                  : bandError
                    ? 'The station index could not be reached. Switch the set off and on to scan again.'
                    : liveBand?.length === 0
                      ? 'No stations came back from the scan.'
                      : powered
                        ? 'Nothing is labelled on the dial. Turn the knob and listen for the hiss to break.'
                        : 'Press play to switch the set on, then turn the knob to sweep the band.'}
              </div>
            </>
          )}
        </div>

        {/* Signal strength, standing up the right-hand edge — the one piece of
            live telemetry on the page, given room to read as an instrument
            rather than a decoration tucked beside the frequency. */}
        <SignalMeter level={level} live={live} />
      </div>

      {/* ── Transport ──
          Three controls, not five. The tune buttons that used to sit here were
          the knob on the cabinet drawn a second time, in the same double-arrow
          icon as the station buttons beside them — two identical-looking pairs
          doing different jobs. Tuning belongs to the knob (and the arrow keys);
          what is left is stopping the set, and reaching the stations the needle
          cannot point at separately. */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 16px',
        background: FACE,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 #a8a49c',
      }}>
        {/* Up to 92 stations share a single frequency worldwide. The needle can
            only point at one place, so these walk the ones stacked underneath
            it — otherwise all but the most-listened station is unreachable. */}
        <RetroButton icon label="Previous station on this frequency" disabled={atNeedle.length < 2}
          onClick={() => { triedRef.current = 0; setStationIndex((i) => (i - 1 + atNeedle.length) % atNeedle.length); setFailed(false); }}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M10 1.5v9L4 6zM3 1.5h1.6v9H3z" fill={INK} /></svg>
        </RetroButton>

        {/* Between the two skips, where a deck puts it. */}
        <RetroButton icon label={powered ? 'Switch off' : 'Switch on'} onClick={() => void power(!powered)} style={{ minWidth: 46 }}>
          {powered
            ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5h3v9H2zM7 1.5h3v9H7z" fill={INK} /></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5l8 4.5-8 4.5z" fill={INK} /></svg>}
        </RetroButton>
        <RetroButton icon label="Next station on this frequency" disabled={atNeedle.length < 2}
          onClick={() => { triedRef.current = 0; setStationIndex((i) => (i + 1) % atNeedle.length); setFailed(false); }}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5v9L8 6zM7.4 1.5H9v9H7.4z" fill={INK} /></svg>
        </RetroButton>

      </div>
    </div>
  );
}

const SEGMENTS = 18;

/**
 * Signal strength, as a broadcast graphic rather than a valve.
 *
 * This was a magic eye — a glowing green iris, a lovely object on a wooden set
 * and a foreign one on a page of paper and ink. A segmented meter says the same
 * thing (how much signal is coming through) in the shell's own language, and it
 * stays readable at a glance while the needle sweeps.
 *
 * Vertical, and standing at the right-hand edge of the ident: a meter that fills
 * upward reads as a level without needing a label.
 *
 * A plain ladder of equal bars, not the wedge it started as. Tapering the bars
 * drew a triangle, and a triangle is a picture of a level rather than a scale
 * you can read — the eye measures the outline instead of counting how far up the
 * lit segments have climbed. Equal rungs make the reading unambiguous.
 */
function SignalMeter({ level, live }: { level: number; live: boolean }) {
  const lit = live ? Math.round(Math.min(1, level) * SEGMENTS) : 0;
  return (
    <span
      role="img"
      aria-label={live ? `Signal ${Math.round(Math.min(1, level) * 100)} percent` : 'No signal'}
      style={{
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end',
        gap: 4, flexShrink: 0, alignSelf: 'stretch', justifyContent: 'center',
      }}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} style={{
          height: 5, width: 34, borderRadius: 1,
          background: i < lit ? NEEDLE : DIAL_INK,
          opacity: i < lit ? 1 : 0.13,
          transition: 'opacity 120ms ease-out, background-color 120ms ease-out',
        }} />
      ))}
    </span>
  );
}
