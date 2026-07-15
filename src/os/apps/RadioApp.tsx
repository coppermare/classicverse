'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RADIO_STATIONS } from '@/data/radioStations';
import type { AppProps, RadioStation, RadioTrack } from '../types';
import { RetroButton, INK } from '../ui';
import { setTuner } from '../tuner';

/**
 * The Radio.
 *
 * You tune it across the band and find things. The knob sweeps the needle one
 * 0.5 MHz stop at a time; off a station you get static, and when the needle
 * lands on one it locks and the music comes up.
 *
 * The glass carries the band and nothing else — no names, no markers. The only
 * way to find a station is to sweep and listen for the hiss to break, which is
 * the entire pleasure of a radio; printing the names across the dial gave it
 * away, and even dots were a map that spoiled the hunt.
 *
 * Playback is a plain <audio> element streaming public-domain recordings from
 * Wikimedia Commons, routed through a Web Audio graph so the magic eye reads the
 * true signal and the set's VOLUME knob controls the gain. The static is
 * synthesised into the same graph, so one knob rides both. If the graph can't be
 * built (a CORS failure on the media source would otherwise silence playback
 * entirely) it falls back to the element's own volume and loses the eye and the
 * static — the music always wins over the decoration.
 *
 * Every track is public domain, so no per-track credit is legally owed; the Info
 * app documents the sourcing for the whole set.
 */

/** Dial glass: dark, with luminous printing — taken from the reference sets. */
const DIAL_INK = '#e8dcb0';
const DIAL_LIT = '#ffe9a8';

/**
 * The dial is scaled to the real FM band, so the stations sit where their
 * frequencies actually fall and the space between them is visible — that gap is
 * what you sweep through, and what the static fills.
 */
const BAND_MIN = 87;
const BAND_MAX = 108;
/** One detent of the knob. Stations sit on this grid, so a stop lands exactly. */
const STEP = 0.5;
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

export default function RadioApp({ os }: AppProps) {
  const stations = RADIO_STATIONS;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<{ ctx: AudioContext; gain: GainNode; analyser: AnalyserNode } | null>(null);
  const staticRef = useRef<GainNode | null>(null);
  const graphFailed = useRef(false);

  const [freq, setFreq] = useState(Number(stations[0].frequency));
  /** The user's intent — is the set on. Distinct from whether audio is flowing:
   *  between stations the set is on but the element is silent and it's all hiss. */
  const [powered, setPowered] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [level, setLevel] = useState(0);

  /** Locked only when the needle is on a station's frequency. */
  const station: RadioStation | undefined = useMemo(
    () => stations.find((s) => Math.abs(Number(s.frequency) - freq) < 0.05),
    [stations, freq],
  );
  const track: RadioTrack | undefined = station?.tracks[trackIndex];
  const live = powered && !!station;

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

  // Hiss between stations: on when the set is powered and the needle is off any
  // station, off the moment it locks.
  useEffect(() => {
    const g = graphRef.current;
    const sg = staticRef.current;
    if (!g || !sg) return;
    const want = powered && !station ? 0.09 : 0;
    sg.gain.setTargetAtTime(want, g.ctx.currentTime, 0.05);
  }, [powered, station]);

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
    ensureGraph();
    const g = graphRef.current;
    if (g?.ctx.state === 'suspended') await g.ctx.resume();
  }, [ensureGraph]);

  // The element follows the set: playing only when powered AND locked on.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (live) { void el.play().catch(() => {}); }
    else el.pause();
  }, [live, track?.src]);

  /** The hour runs on and wraps — a station doesn't stop at the end of a record. */
  const step = useCallback((dir: 1 | -1) => {
    const n = station?.tracks.length ?? 1;
    return (trackIndex + dir + n) % n;
  }, [trackIndex, station]);

  const goTrack = useCallback((i: number) => {
    setTrackIndex(i);
    setFailed(false);
  }, []);

  /**
   * Sweep the needle. Landing on a station starts it from its first record.
   *
   * The current frequency is read from a ref, not from the render closure. The
   * tune buttons and the arrow keys nudge by ±STEP, and presses that land in the
   * same frame would otherwise all read the same stale `freq` and collapse into a
   * single step — three quick presses moved the needle 0.5 MHz instead of 1.5.
   * The ref is written here rather than in a setFreq updater so nothing has a
   * side effect inside a reducer, which StrictMode is free to run twice.
   */
  const freqRef = useRef(freq);
  const onStation = useCallback(
    (f: number) => stations.some((s) => Math.abs(Number(s.frequency) - f) < 0.05),
    [stations],
  );

  const tuneToFreq = useCallback((f: number) => {
    const next = Math.min(BAND_MAX, Math.max(BAND_MIN, Math.round(f * 10) / 10));
    const prev = freqRef.current;
    if (Math.abs(prev - next) < 0.01) return;
    if (onStation(next) && !onStation(prev)) setTrackIndex(0);
    freqRef.current = next;
    setFreq(next);
    setFailed(false);
  }, [onStation]);

  /** One detent, from wherever the needle actually is. */
  const nudge = useCallback((dir: 1 | -1) => {
    tuneToFreq(freqRef.current + dir * STEP);
  }, [tuneToFreq]);

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
    /* The screen IS the radio's front panel — no cabinet drawn inside it. The set
       already has a wooden case around this glass. */
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: 'linear-gradient(180deg, #8a5a2b 0%, #6b4119 55%, #4a2c0c 100%)',
      fontFamily: 'var(--font-sans)',
      display: 'flex', flexDirection: 'column',
    }}>
      <audio
        ref={audioRef}
        src={track?.src}
        crossOrigin="anonymous"
        preload="auto"
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setFailed(false); }}
        onCanPlay={() => setBuffering(false)}
        onError={() => { setFailed(true); setBuffering(false); }}
        onEnded={() => goTrack(step(1))}
      />

      {/* ── Tuning dial ──
          Drawn from real sets (Nordmende Tannhäuser '57, a 1952 Telefunken
          scale): dark glass with luminous printing, and ticks as short marks
          hanging off a baseline rule. Stations are dots only — the names are
          the thing you're meant to find. */}
      <div style={{
        flex: '0 0 50%', position: 'relative', minHeight: 0, overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a160d 0%, #0c0a06 100%)',
        boxShadow: 'inset 0 0 60px rgba(226,183,74,0.10), inset 0 -4px 10px rgba(0,0,0,0.5)',
        borderBottom: '2px solid #3a2410',
      }}>
        {(['left', 'right'] as const).map((side) => (
          <span key={side} style={{
            position: 'absolute', top: 'calc(46% - 9px)', [side]: 10, zIndex: 2,
            font: '700 10px/1 var(--font-sans)', letterSpacing: '0.16em',
            color: DIAL_LIT, border: `1px solid ${DIAL_LIT}`, borderRadius: 2, padding: '3px 5px',
          }}>
            FM
          </span>
        ))}

        {/* Baseline rule + ticks hanging from it */}
        <div style={{
          position: 'absolute', left: 46, right: 46, top: '46%', height: 1,
          background: DIAL_INK, opacity: 0.85,
        }} />
        {TICKS.map((t, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `calc(46px + (100% - 92px) * ${t.pct / 100})`,
            top: '46%',
            width: 1, marginLeft: -0.5,
            height: t.major ? 11 : 5,
            background: DIAL_INK,
            opacity: t.major ? 0.9 : 0.55,
          }} />
        ))}
        {TICKS.filter((t) => t.label).map((t, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `calc(46px + (100% - 92px) * ${t.pct / 100})`,
            top: 'calc(46% + 15px)',
            transform: 'translateX(-50%)',
            font: '700 13px/1 var(--font-sans)', color: DIAL_INK,
          }}>
            {t.label}
          </span>
        ))}

        {/* Nothing marks the stations. The glass carries the band and nothing
            else, so the only way to find a station is to sweep the dial and
            listen for the hiss to break — which is the point of the thing. The
            markers that used to sit here were a map, and a map spoils the hunt. */}

        {/* Pointer — thin and red, riding the scale. */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `calc(46px + (100% - 92px) * ${needlePct / 100})`,
          width: 2, marginLeft: -1, zIndex: 3,
          background: '#e03a2a',
          boxShadow: '0 0 9px rgba(224,58,42,0.9)',
          transition: 'left 160ms linear',
        }} />
      </div>

      {/* ── The title: what you found ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{
          flex: 1, minWidth: 0,
          background: 'linear-gradient(180deg, #14180f 0%, #0b0e08 100%)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
          color: '#9ef06a',
          textShadow: '0 0 8px rgba(158,240,106,0.5)',
          padding: '0 22px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {freq.toFixed(1)}
            </span>
            <span style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '0.04em',
              opacity: station ? 1 : 0.4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {station ? station.name.toUpperCase() : (powered ? 'TUNING…' : 'OFF')}
            </span>
          </div>

          {station ? (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {failed ? 'NO SIGNAL' : buffering ? '…' : (track?.title ?? '')}
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {track ? `${track.artist} · ${track.year}` : ''}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, opacity: 0.45 }}>
              {powered ? 'Turn the dial to find a station' : ''}
            </div>
          )}
        </div>

        <MagicEye level={level} live={live} />
      </div>

      {/* ── Transport ── */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 16px',
        borderTop: '2px solid #3a2410',
        boxShadow: 'inset 0 1px 0 rgba(255,220,160,0.2)',
      }}>
        <RetroButton icon label="Tune down" onClick={() => nudge(-1)}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M7 1.5v9L1 6zM11 1.5v9L5 6z" fill={INK} /></svg>
        </RetroButton>
        <RetroButton icon label={powered ? 'Switch off' : 'Switch on'} onClick={() => void power(!powered)} style={{ minWidth: 46 }}>
          {powered
            ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5h3v9H2zM7 1.5h3v9H7z" fill={INK} /></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5l8 4.5-8 4.5z" fill={INK} /></svg>}
        </RetroButton>
        <RetroButton icon label="Tune up" onClick={() => nudge(1)}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M5 1.5v9L11 6zM1 1.5v9L7 6z" fill={INK} /></svg>
        </RetroButton>

        <span style={{ width: 8 }} />

        <RetroButton icon label="Previous track" disabled={!station} onClick={() => goTrack(step(-1))}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M10 1.5v9L4 6zM3 1.5h1.6v9H3z" fill={INK} /></svg>
        </RetroButton>
        <RetroButton icon label="Next track" disabled={!station} onClick={() => goTrack(step(1))}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5v9L8 6zM7.4 1.5H9v9H7.4z" fill={INK} /></svg>
        </RetroButton>
      </div>
    </div>
  );
}

/**
 * A magic eye — the tuning indicator a valve radio actually had. The dark wedge
 * closes as the signal comes up, so it reads as "tuned in" rather than as a
 * meter. Driven by the real output level.
 */
function MagicEye({ level, live }: { level: number; live: boolean }) {
  const wedge = (live ? 78 * (1 - Math.min(1, level)) : 78) + 2;
  return (
    <div style={{
      width: 128, flexShrink: 0,
      background: '#0b0e08',
      boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.7)',
      borderLeft: '2px solid #3a2410',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 74, height: 74, borderRadius: '50%',
        background: `conic-gradient(from ${-wedge}deg, #0c2f16 0deg ${wedge * 2}deg, #46e878 ${wedge * 2}deg 360deg)`,
        boxShadow: '0 0 18px rgba(70,232,120,0.4), inset 0 0 12px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0c2f16', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.9)' }} />
      </div>
    </div>
  );
}
