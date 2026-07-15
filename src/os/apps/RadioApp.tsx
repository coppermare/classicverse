'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RADIO_STATIONS } from '@/data/radioStations';
import type { AppProps, RadioStation, RadioTrack } from '../types';
import { Bevel, Lcd, RetroButton, Divider, RADIUS, WELL, INK } from '../ui';
import * as sfx from '../sound';

/**
 * The Radio — a real receiver, not a play button.
 *
 * Playback is a plain <audio> element streaming public-domain recordings from
 * Wikimedia Commons, routed through a Web Audio graph so the VU meter reads the
 * true signal and the set's VOLUME knob controls the gain. If the graph can't be
 * built (a CORS failure on the media source would otherwise silence playback
 * entirely) it falls back to the element's own volume and simply loses the meter
 * — the music always wins over the decoration.
 */

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

type Repeat = 'off' | 'all' | 'one';

export default function RadioApp({ os }: AppProps) {
  const stations = RADIO_STATIONS;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<{ ctx: AudioContext; gain: GainNode; analyser: AnalyserNode } | null>(null);
  const graphFailed = useRef(false);

  const [stationIndex, setStationIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('all');
  const [level, setLevel] = useState(0);
  const [sleepMin, setSleepMin] = useState(0);
  const [sleepLeft, setSleepLeft] = useState(0);

  const station: RadioStation = stations[stationIndex];
  const track: RadioTrack | undefined = station.tracks[trackIndex];

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

  // VU meter from the real signal.
  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      const g = graphRef.current;
      let raw = 0;
      if (g && playing) {
        const buf = new Uint8Array(g.analyser.frequencyBinCount);
        g.analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128) / 128);
        // Real recordings sit far hotter than a synthesised blip, so this maps
        // close to linear — the earlier curve pinned the meter at full scale and
        // stopped telling you anything.
        raw = Math.min(1, peak * 1.25);
      }
      smooth += (raw - smooth) * (raw > smooth ? 0.6 : 0.09);
      setLevel(smooth);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* ── Transport ── */
  // Touches the element only. Every piece of state below is driven by the
  // element's own events (play/pause/error), so the UI reflects what the audio
  // is really doing rather than what we asked it to do — and a rejected play()
  // (autoplay policy) leaves the button honestly showing Play.
  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    ensureGraph();
    const g = graphRef.current;
    if (g?.ctx.state === 'suspended') await g.ctx.resume();
    try { await el.play(); } catch { /* element emits pause/error; state follows */ }
  }, [ensureGraph]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);

  const pickNext = useCallback((dir: 1 | -1) => {
    const n = station.tracks.length;
    if (shuffle && n > 1) {
      let i = trackIndex;
      while (i === trackIndex) i = Math.floor(Math.random() * n);
      return i;
    }
    return (trackIndex + dir + n) % n;
  }, [shuffle, trackIndex, station.tracks.length]);

  const goTrack = useCallback((i: number) => {
    setTrackIndex(i);
    setElapsed(0);
    setFailed(false);
  }, []);

  const tuneTo = useCallback((i: number) => {
    if (i === stationIndex) return;
    sfx.staticBurst();
    setStationIndex(i);
    setTrackIndex(0);
    setElapsed(0);
    setFailed(false);
  }, [stationIndex]);

  // Load a new source whenever the track changes, and keep playing across it.
  // `playing` is read through a ref so changing track doesn't re-run this on
  // every play/pause — only a genuinely new source should reload the element.
  const playingRef = useRef(false);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    el.load();
    if (playingRef.current) void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.src]);

  /* ── Sleep timer ── */
  // Counted from a wall-clock deadline rather than by decrementing a counter, so
  // a throttled background tab can't make the timer drift long.
  useEffect(() => {
    if (!sleepMin) return;
    const until = Date.now() + sleepMin * 60_000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((until - Date.now()) / 1000));
      setSleepLeft(left);
      if (left <= 0) { clearInterval(id); pause(); setSleepMin(0); }
    }, 500);
    return () => clearInterval(id);
  }, [sleepMin, pause]);

  /* ── Keyboard: space/arrows, the way a remote works ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); if (playing) pause(); else void play(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); tuneTo((stationIndex + 1) % stations.length); }
      if (e.key === 'ArrowDown') { e.preventDefault(); tuneTo((stationIndex - 1 + stations.length) % stations.length); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [playing, pause, play, tuneTo, stationIndex, stations.length]);

  const dialPct = stations.length > 1 ? (stationIndex / (stations.length - 1)) * 100 : 50;
  const progress = duration > 0 ? elapsed / duration : 0;
  // Signal is a fiction, but a consistent one: a station reads the same strength
  // every time rather than flickering at random, which would read as a fault.
  const signal = useMemo(() => 3 + ((stationIndex * 7) % 3), [stationIndex]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    if (el && duration) { el.currentTime = p * duration; setElapsed(p * duration); }
    sfx.click();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, overflowY: 'auto',
      padding: '42px 14px 14px',
      background: 'linear-gradient(180deg, #3a2a1a 0%, #241a10 100%)',
      fontFamily: 'var(--font-sans)',
    }}>
      <audio
        ref={audioRef}
        src={track?.src}
        crossOrigin="anonymous"
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setFailed(false); }}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => { setFailed(true); setBuffering(false); }}
        onEnded={() => {
          if (repeat === 'one') { goTrack(trackIndex); void play(); return; }
          const next = pickNext(1);
          if (next === 0 && repeat === 'off' && !shuffle) { pause(); return; }
          goTrack(next);
        }}
      />

      <Bevel style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── Dial ── */}
        <div style={{
          position: 'relative', height: 54, flexShrink: 0, borderRadius: RADIUS,
          background: 'linear-gradient(180deg, #f6efdb 0%, #e0d4b6 100%)',
          boxShadow: WELL, padding: '7px 12px 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {stations.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => tuneTo(i)}
                onPointerEnter={() => sfx.hover()}
                aria-label={`Tune to ${s.name}, ${s.frequency} FM`}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  font: `700 12px/1 var(--font-sans)`,
                  color: i === stationIndex ? '#241a10' : '#8a7c60',
                }}
              >
                {s.frequency}
                <span style={{ width: 1, height: 8, background: 'rgba(36,26,16,0.45)' }} />
              </button>
            ))}
          </div>
          <div style={{
            position: 'absolute', top: 5, bottom: 5,
            left: `calc(12px + (100% - 24px) * ${dialPct / 100})`,
            width: 2, marginLeft: -1, background: '#c62828',
            boxShadow: '0 0 7px rgba(198,40,40,0.9)',
            transition: 'left 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }} />
        </div>

        {/* ── Readout ── */}
        <Lcd style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{station.frequency}</span>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em' }}>{station.name.toUpperCase()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700 }}>
              <span style={{ opacity: playing ? 1 : 0.28 }}>STEREO</span>
              <span style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{
                    width: 3, height: 4 + i * 2,
                    background: i < signal ? '#9ef06a' : 'rgba(158,240,106,0.2)',
                  }} />
                ))}
              </span>
            </span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {failed ? 'NO SIGNAL — TRACK UNAVAILABLE' : buffering ? 'TUNING…' : (track?.title ?? '—')}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track ? `${track.artist} · ${track.year}` : station.era}
          </div>

          {/* Seek */}
          <div
            onClick={seek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(elapsed)}
            tabIndex={0}
            style={{
              position: 'relative', height: 8, cursor: 'pointer', marginTop: 2,
              background: 'rgba(158,240,106,0.14)', borderRadius: 2,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, width: `${progress * 100}%`, background: '#9ef06a', borderRadius: 2, boxShadow: '0 0 6px rgba(158,240,106,0.7)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
            <span>{fmt(elapsed)}</span>
            <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 10 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{
                  width: 3, height: 3 + i * 0.6,
                  background: level * 12 > i ? (i > 9 ? '#e05050' : '#9ef06a') : 'rgba(158,240,106,0.16)',
                }} />
              ))}
            </span>
            <span>-{fmt(Math.max(0, duration - elapsed))}</span>
          </div>
        </Lcd>

        {/* ── Transport ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <RetroButton icon label="Previous track" onClick={() => goTrack(pickNext(-1))}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M10 1.5v9L4 6zM3 1.5h1.6v9H3z" fill={INK} /></svg>
          </RetroButton>
          <RetroButton icon label={playing ? 'Pause' : 'Play'} onClick={() => { if (playing) pause(); else void play(); }} style={{ minWidth: 40 }}>
            {playing
              ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5h3v9H2zM7 1.5h3v9H7z" fill={INK} /></svg>
              : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5l8 4.5-8 4.5z" fill={INK} /></svg>}
          </RetroButton>
          <RetroButton icon label="Next track" onClick={() => goTrack(pickNext(1))}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1.5v9L8 6zM7.4 1.5H9v9H7.4z" fill={INK} /></svg>
          </RetroButton>

          <Divider vertical />

          <RetroButton icon label="Seek down" onClick={() => tuneTo((stationIndex - 1 + stations.length) % stations.length)} title="Scan down">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M7 1.5v9L1 6zM11 1.5v9L5 6z" fill={INK} /></svg>
          </RetroButton>
          <RetroButton icon label="Seek up" onClick={() => tuneTo((stationIndex + 1) % stations.length)} title="Scan up">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M5 1.5v9L11 6zM1 1.5v9L7 6z" fill={INK} /></svg>
          </RetroButton>

          <Divider vertical />

          <RetroButton label="Shuffle" active={shuffle} silent
            onClick={() => { setShuffle((s) => { sfx.toggle(!s); return !s; }); }}>SHUF</RetroButton>
          <RetroButton label="Repeat" active={repeat !== 'off'} silent
            onClick={() => setRepeat((r) => {
              const next: Repeat = r === 'off' ? 'all' : r === 'all' ? 'one' : 'off';
              sfx.toggle(next !== 'off');
              return next;
            })}>
            {repeat === 'one' ? 'REP 1' : 'REPEAT'}
          </RetroButton>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ font: '600 11px/1 var(--font-sans)', color: '#3f3a33' }}>SLEEP</span>
            {[0, 15, 30].map((m) => (
              <RetroButton key={m} label={m ? `Sleep in ${m} minutes` : 'Sleep timer off'} active={sleepMin === m} silent
                onClick={() => { sfx.toggle(m !== 0); setSleepMin(m); setSleepLeft(m * 60); }}
                style={{ minWidth: 30, padding: '0 6px' }}>
                {m === 0 ? 'OFF' : m}
              </RetroButton>
            ))}
            {sleepLeft > 0 && (
              <span style={{ font: '700 11px/1 var(--font-sans)', color: '#3f3a33', minWidth: 34 }}>{fmt(sleepLeft)}</span>
            )}
          </div>
        </div>

        {/* ── Presets ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ font: '600 11px/1 var(--font-sans)', color: '#3f3a33' }}>PRESET</span>
          {stations.map((s, i) => (
            <RetroButton key={s.id} label={`Preset ${i + 1}: ${s.name}`} active={i === stationIndex} silent
              onClick={() => tuneTo(i)} style={{ minWidth: 26, padding: '0 8px' }}>
              {i + 1}
            </RetroButton>
          ))}
          <span style={{ marginLeft: 'auto', font: '600 11px/1 var(--font-sans)', color: '#3f3a33' }}>
            {station.era}
          </span>
        </div>
      </Bevel>

      {/* ── Playlist ── */}
      <Bevel style={{ marginTop: 10, padding: 6 }}>
        <div style={{ font: '700 11px/1 var(--font-sans)', color: '#3f3a33', padding: '3px 4px 6px' }}>
          {station.name.toUpperCase()} — {station.tracks.length} RECORDINGS
        </div>
        <div style={{ background: '#fff', borderRadius: RADIUS, boxShadow: WELL, overflow: 'hidden' }} role="listbox" aria-label={`${station.name} playlist`}>
          {station.tracks.map((t, i) => {
            const on = i === trackIndex;
            return (
              <button
                key={t.src}
                type="button"
                role="option"
                aria-selected={on}
                onPointerEnter={() => sfx.hover()}
                onClick={() => { sfx.click(); goTrack(i); void play(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '7px 9px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: on ? '#2a4a8a' : 'transparent',
                  color: on ? '#fff' : '#1c1a17',
                  font: '500 13px/1.3 var(--font-sans)',
                }}
              >
                <span style={{ width: 14, textAlign: 'right', opacity: 0.75, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                <span style={{ flex: 1, fontWeight: on ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <span style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>{t.artist}</span>
                <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{t.year}</span>
                <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums', width: 34, textAlign: 'right' }}>{fmt(t.duration)}</span>
              </button>
            );
          })}
        </div>
        {track && (
          <div style={{ font: '400 11px/1.4 var(--font-sans)', color: '#3f3a33', padding: '7px 4px 2px' }}>
            {track.license} · sourced from{' '}
            <a href={track.page} target="_blank" rel="noreferrer" style={{ color: '#2a4a8a', fontWeight: 600 }}>
              Wikimedia Commons
            </a>
          </div>
        )}
      </Bevel>
    </div>
  );
}
