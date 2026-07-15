/**
 * The set's sound system. Every noise the hardware makes is synthesised here at
 * call time — there are no audio assets, so the whole UI layer costs nothing to
 * download and each sound can be tuned as a parameter rather than re-recorded.
 *
 * This is a module singleton rather than a hook or context on purpose: any
 * component, at any depth, can make a sound without the shell threading a
 * callback down to it. The shell keeps `setLevel` in sync with the VOLUME knob,
 * so every sound obeys the physical control (and mute) for free.
 */

let ctx: AudioContext | null = null;
let level = 0.5;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx || ctx.state === 'closed') ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setLevel(volume: number, isMuted: boolean) {
  level = Math.max(0, Math.min(1, volume));
  muted = isMuted;
}

/** Shared output stage — every sound is scaled by the knob and killed by mute. */
function out(a: AudioContext, scale: number): GainNode | null {
  if (muted || level <= 0.001) return null;
  const g = a.createGain();
  g.gain.value = level * scale;
  g.connect(a.destination);
  return g;
}

function noise(a: AudioContext, dur: number): AudioBuffer {
  const n = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** A pitched blip. The workhorse behind most UI sounds. */
function blip(
  a: AudioContext, dest: GainNode, t: number,
  { type = 'square', from, to, dur, gain: g0 }:
  { type?: OscillatorType; from: number; to: number; dur: number; gain: number },
) {
  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(g0, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function snap(a: AudioContext, dest: GainNode, t: number, hz: number, dur: number, g0: number, q = 1.1) {
  const n = a.createBufferSource();
  n.buffer = noise(a, dur);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = hz;
  bp.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(g0, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(bp); bp.connect(g); g.connect(dest);
  n.start(t); n.stop(t + dur);
}

/* ── UI ── */

/** A key going down: plasticky tick. */
export function click() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.5); if (!o) return;
  const t = a.currentTime;
  snap(a, o, t, 2600, 0.02, 0.5);
  blip(a, o, t, { from: 1400, to: 600, dur: 0.018, gain: 0.2 });
}

/** Cursor crossing something selectable — deliberately tiny. */
export function hover() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.12); if (!o) return;
  snap(a, o, a.currentTime, 5200, 0.012, 0.35, 2);
}

/** Descending into a folder or opening an app: a rising two-step. */
export function open() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.34); if (!o) return;
  const t = a.currentTime;
  blip(a, o, t, { type: 'square', from: 660, to: 700, dur: 0.05, gain: 0.16 });
  blip(a, o, t + 0.055, { type: 'square', from: 990, to: 1050, dur: 0.07, gain: 0.15 });
}

/** Going back up: the same two-step, inverted. */
export function back() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.34); if (!o) return;
  const t = a.currentTime;
  blip(a, o, t, { type: 'square', from: 880, to: 840, dur: 0.05, gain: 0.15 });
  blip(a, o, t + 0.055, { type: 'square', from: 560, to: 520, dur: 0.07, gain: 0.14 });
}

/** A refused action — a disabled folder, an edge of a list. */
export function error() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.3); if (!o) return;
  const t = a.currentTime;
  blip(a, o, t, { type: 'square', from: 220, to: 200, dur: 0.09, gain: 0.14 });
  blip(a, o, t + 0.1, { type: 'square', from: 165, to: 150, dur: 0.13, gain: 0.14 });
}

/** One detent of a knob or one step of a list. */
export function tick() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.5); if (!o) return;
  const t = a.currentTime;
  const n = a.createBufferSource();
  n.buffer = noise(a, 0.018);
  const hp = a.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1700;
  const g = a.createGain();
  g.gain.setValueAtTime(0.34, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  n.connect(hp); hp.connect(g); g.connect(o);
  n.start(t); n.stop(t + 0.02);
}

/** A latching control (mute, band, shuffle) flipping. */
export function toggle(on: boolean) {
  const a = ac(); if (!a) return;
  const o = out(a, 0.34); if (!o) return;
  const t = a.currentTime;
  snap(a, o, t, 3200, 0.015, 0.4);
  blip(a, o, t, { type: 'square', from: on ? 700 : 500, to: on ? 1100 : 340, dur: 0.06, gain: 0.13 });
}

/** A keystroke in the search field. */
export function key() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.22); if (!o) return;
  snap(a, o, a.currentTime, 3400, 0.012, 0.4, 1.6);
}

/** Radio tuning between stations: a wash of static. */
export function staticBurst(dur = 0.22) {
  const a = ac(); if (!a) return;
  const o = out(a, 0.3); if (!o) return;
  const t = a.currentTime;
  const n = a.createBufferSource();
  n.buffer = noise(a, dur);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1200, t);
  bp.frequency.linearRampToValueAtTime(3000, t + dur);
  bp.Q.value = 0.8;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(bp); bp.connect(g); g.connect(o);
  n.start(t); n.stop(t + dur);
}

/** The four-note logo sting under the boot screen. */
export function boot() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.3); if (!o) return;
  const t = a.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => {
    blip(a, o, t + i * 0.1, { type: 'triangle', from: hz, to: hz, dur: i === 3 ? 0.5 : 0.13, gain: 0.13 });
  });
}

/* ── Hardware ── */

/** Power ON: relay thunk, degauss "boing", and a short warm-up whoosh. */
export function powerOn() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.9); if (!o) return;
  const t = a.currentTime;

  const thunk = a.createOscillator();
  thunk.type = 'sine';
  thunk.frequency.setValueAtTime(150, t);
  thunk.frequency.exponentialRampToValueAtTime(68, t + 0.09);
  const tg = a.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.32, t + 0.006);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  thunk.connect(tg); tg.connect(o);
  thunk.start(t); thunk.stop(t + 0.14);

  // Degauss boing — a wobbling low tone that blooms then decays
  const boing = a.createOscillator();
  boing.type = 'triangle';
  boing.frequency.setValueAtTime(108, t + 0.02);
  const lfo = a.createOscillator();
  lfo.frequency.value = 17;
  const lfoGain = a.createGain();
  lfoGain.gain.value = 26;
  lfo.connect(lfoGain); lfoGain.connect(boing.frequency);
  const bg = a.createGain();
  bg.gain.setValueAtTime(0.0001, t + 0.02);
  bg.gain.exponentialRampToValueAtTime(0.16, t + 0.07);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  boing.connect(bg); bg.connect(o);
  boing.start(t + 0.02); boing.stop(t + 0.52);
  lfo.start(t + 0.02); lfo.stop(t + 0.52);

  // High-voltage line whistle spinning up — the sound a CRT actually makes
  const whine = a.createOscillator();
  whine.type = 'sine';
  whine.frequency.setValueAtTime(9000, t + 0.05);
  whine.frequency.exponentialRampToValueAtTime(15625, t + 0.55);
  const wg = a.createGain();
  wg.gain.setValueAtTime(0.0001, t + 0.05);
  wg.gain.exponentialRampToValueAtTime(0.02, t + 0.5);
  wg.gain.exponentialRampToValueAtTime(0.008, t + 1.4);
  whine.connect(wg); wg.connect(o);
  whine.start(t + 0.05); whine.stop(t + 1.4);

  const n = a.createBufferSource();
  n.buffer = noise(a, 0.42);
  const hp = a.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1400;
  const ng = a.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.11, t + 0.12);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  n.connect(hp); hp.connect(ng); ng.connect(o);
  n.start(t); n.stop(t + 0.42);
}

/** Power OFF: flyback whine collapsing, an electrostatic snap, and a thunk. */
export function powerOff() {
  const a = ac(); if (!a) return;
  const o = out(a, 0.9); if (!o) return;
  const t = a.currentTime;

  const whine = a.createOscillator();
  whine.type = 'sawtooth';
  whine.frequency.setValueAtTime(920, t);
  whine.frequency.exponentialRampToValueAtTime(70, t + 0.18);
  const wg = a.createGain();
  wg.gain.setValueAtTime(0.0001, t);
  wg.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  whine.connect(wg); wg.connect(o);
  whine.start(t); whine.stop(t + 0.22);

  const n = a.createBufferSource();
  n.buffer = noise(a, 0.12);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(6500, t);
  bp.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
  bp.Q.value = 0.7;
  const ng = a.createGain();
  ng.gain.setValueAtTime(0.3, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  n.connect(bp); bp.connect(ng); ng.connect(o);
  n.start(t); n.stop(t + 0.12);

  const thunk = a.createOscillator();
  thunk.type = 'sine';
  thunk.frequency.setValueAtTime(120, t);
  thunk.frequency.exponentialRampToValueAtTime(52, t + 0.12);
  const tg = a.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.34, t + 0.008);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  thunk.connect(tg); tg.connect(o);
  thunk.start(t); thunk.stop(t + 0.18);
}
