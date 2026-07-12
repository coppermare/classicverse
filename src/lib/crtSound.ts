// Self-contained Web Audio synthesis of CRT power sounds. No asset files.
// Everything is generated at call time and scaled by the TV's volume (0..1),
// so the VOLUME knob actually controls how loud the set is.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
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

function noiseBuffer(ac: AudioContext, dur: number): AudioBuffer {
  const n = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function master(ac: AudioContext, volume: number): GainNode {
  const g = ac.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume)) * 0.9;
  g.connect(ac.destination);
  return g;
}

/** Power ON: relay thunk, degauss "boing", and a short warm-up whoosh. */
export function playPowerOn(volume = 1) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const out = master(ac, volume);

  // Relay thunk
  const thunk = ac.createOscillator();
  thunk.type = 'sine';
  thunk.frequency.setValueAtTime(150, t);
  thunk.frequency.exponentialRampToValueAtTime(68, t + 0.09);
  const tg = ac.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.32, t + 0.006);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  thunk.connect(tg);
  tg.connect(out);
  thunk.start(t);
  thunk.stop(t + 0.14);

  // Degauss boing — a wobbling low tone that blooms then decays
  const boing = ac.createOscillator();
  boing.type = 'triangle';
  boing.frequency.setValueAtTime(108, t + 0.02);
  const lfo = ac.createOscillator();
  lfo.frequency.value = 17;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 26;
  lfo.connect(lfoGain);
  lfoGain.connect(boing.frequency);
  const bg = ac.createGain();
  bg.gain.setValueAtTime(0.0001, t + 0.02);
  bg.gain.exponentialRampToValueAtTime(0.16, t + 0.07);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  boing.connect(bg);
  bg.connect(out);
  boing.start(t + 0.02);
  boing.stop(t + 0.52);
  lfo.start(t + 0.02);
  lfo.stop(t + 0.52);

  // Warm-up whoosh — filtered noise fading in and out
  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(ac, 0.42);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1400;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.11, t + 0.12);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  n.connect(hp);
  hp.connect(ng);
  ng.connect(out);
  n.start(t);
  n.stop(t + 0.42);
}

/** Power OFF: flyback whine collapsing, an electrostatic snap, and a thunk. */
export function playPowerOff(volume = 1) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const out = master(ac, volume);

  // Flyback whine falling away
  const whine = ac.createOscillator();
  whine.type = 'sawtooth';
  whine.frequency.setValueAtTime(920, t);
  whine.frequency.exponentialRampToValueAtTime(70, t + 0.18);
  const wg = ac.createGain();
  wg.gain.setValueAtTime(0.0001, t);
  wg.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  whine.connect(wg);
  wg.connect(out);
  whine.start(t);
  whine.stop(t + 0.22);

  // Electrostatic collapse — bright noise that snaps shut
  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(ac, 0.12);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(6500, t);
  bp.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
  bp.Q.value = 0.7;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.3, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  n.connect(bp);
  bp.connect(ng);
  ng.connect(out);
  n.start(t);
  n.stop(t + 0.12);

  // Low thunk
  const thunk = ac.createOscillator();
  thunk.type = 'sine';
  thunk.frequency.setValueAtTime(120, t);
  thunk.frequency.exponentialRampToValueAtTime(52, t + 0.12);
  const tg = ac.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.34, t + 0.008);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  thunk.connect(tg);
  tg.connect(out);
  thunk.start(t);
  thunk.stop(t + 0.18);
}

/** UI button click: a short plasticky tick — filtered noise snap plus a tiny tock. */
export function playButtonClick(volume = 1) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const out = master(ac, volume * 0.55);

  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(ac, 0.02);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2600;
  bp.Q.value = 1.1;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  n.connect(bp);
  bp.connect(ng);
  ng.connect(out);
  n.start(t);
  n.stop(t + 0.02);

  const tock = ac.createOscillator();
  tock.type = 'square';
  tock.frequency.setValueAtTime(1400, t);
  tock.frequency.exponentialRampToValueAtTime(600, t + 0.015);
  const tg = ac.createGain();
  tg.gain.setValueAtTime(0.2, t);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  tock.connect(tg);
  tg.connect(out);
  tock.start(t);
  tock.stop(t + 0.02);
}
