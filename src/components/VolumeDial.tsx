'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') _audioCtx = new AudioContext();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch {
    return null;
  }
}

function playTick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const n = Math.ceil(ctx.sampleRate * 0.018);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 12) * 0.16;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1700;
  const gain = ctx.createGain();
  gain.gain.value = 1.2;
  src.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const START_ANGLE = -135;
const END_ANGLE = 135;
const TICK_STEPS = 20; // audible tick every 5%
const RIDGE_COUNT = 32;
const MAJOR_TICKS = 11; // 0,10,...,100
const MINOR_TICKS_PER_MAJOR = 4;
const KEY_STEP = 0.05;
const KEY_STEP_BIG = 0.10;

interface VolumeDialProps {
  value: number;
  onChange: (v: number) => void;
  embedded?: boolean;
  ariaLabel?: string;
}

/**
 * A big circular volume knob — knurled ridged rim, tick-marked faceplate,
 * raised center hub and pointer indicator. Supports drag, scroll, keyboard
 * (arrow/page/home/end), and double-click/space to mute.
 */
export default function VolumeDial({ value, onChange, embedded, ariaLabel = 'Volume' }: VolumeDialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startAng: number; startVal: number; cx: number; cy: number } | null>(null);
  const lastStepRef = useRef(Math.round(value * TICK_STEPS));
  const preMuteRef = useRef(value || 0.5);
  const hideReadoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isDragging, setIsDragging] = useState(false);
  const [showReadout, setShowReadout] = useState(false);

  const angle = START_ANGLE + (END_ANGLE - START_ANGLE) * value;
  const muted = value <= 0.001;

  const flashReadout = useCallback(() => {
    setShowReadout(true);
    clearTimeout(hideReadoutTimer.current);
    hideReadoutTimer.current = setTimeout(() => setShowReadout(false), 1100);
  }, []);

  useEffect(() => () => clearTimeout(hideReadoutTimer.current), []);

  const emitTickIfCrossed = useCallback((next: number) => {
    const step = Math.round(next * TICK_STEPS);
    if (step !== lastStepRef.current) {
      playTick();
      lastStepRef.current = step;
    }
  }, []);

  const commit = useCallback((next: number) => {
    const clamped = clamp(next, 0, 1);
    if (clamped > 0.001) preMuteRef.current = clamped;
    emitTickIfCrossed(clamped);
    onChange(clamped);
    flashReadout();
  }, [emitTickIfCrossed, onChange, flashReadout]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragRef.current = { startAng: Math.atan2(e.clientY - cy, e.clientX - cx), startVal: value, cx, cy };
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    el.focus();
  }, [value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const ang = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
    let delta = ang - d.startAng;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const range = (END_ANGLE - START_ANGLE) * Math.PI / 180;
    commit(d.startVal + delta / range);
  }, [commit]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    setIsDragging(false);
    ref.current?.releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    commit(value + (e.deltaY > 0 ? -1 : 1) * 0.04);
  }, [value, commit]);

  const toggleMute = useCallback(() => {
    if (muted) {
      commit(preMuteRef.current || 0.5);
    } else {
      preMuteRef.current = value;
      commit(0);
    }
  }, [muted, value, commit]);

  const onDoubleClick = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        commit(value + KEY_STEP);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        commit(value - KEY_STEP);
        break;
      case 'PageUp':
        e.preventDefault();
        commit(value + KEY_STEP_BIG);
        break;
      case 'PageDown':
        e.preventDefault();
        commit(value - KEY_STEP_BIG);
        break;
      case 'Home':
        e.preventDefault();
        commit(0);
        break;
      case 'End':
        e.preventDefault();
        commit(1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleMute();
        break;
      default:
        break;
    }
  }, [value, commit, toggleMute]);

  const size = embedded ? 96 : 128;
  const pad = 16;
  const total = size + pad * 2;
  const cx = total / 2;
  const cy = total / 2;
  const arcR = total / 2 - 4;
  const tickOuterR = size / 2 + 6;
  const tickInnerRMajor = size / 2 + 1;
  const tickInnerRMinor = size / 2 + 3;

  // Rounded to a fixed precision so server- and client-rendered markup match
  // exactly — raw trig output can differ in its last bit between environments.
  const toXY = (deg: number, r: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return {
      x: Number((cx + r * Math.cos(rad)).toFixed(3)),
      y: Number((cy + r * Math.sin(rad)).toFixed(3)),
    };
  };
  const p0 = toXY(START_ANGLE, arcR);
  const p1 = toXY(END_ANGLE, arcR);
  const pV = toXY(angle, arcR);
  const sweep = (END_ANGLE - START_ANGLE) * value;
  const trackD = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  const valD = value > 0.01
    ? `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 ${sweep > 180 ? 1 : 0} 1 ${pV.x.toFixed(2)} ${pV.y.toFixed(2)}`
    : null;

  const loud = value >= 0.85;
  const accent = muted ? '#5e5c5a' : loud ? '#e05050' : 'var(--timeline-accent, #cfcfcf)';

  const majorTicks = Array.from({ length: MAJOR_TICKS }, (_, i) => i / (MAJOR_TICKS - 1));
  const minorTicks: number[] = [];
  for (let i = 0; i < MAJOR_TICKS - 1; i++) {
    for (let j = 1; j <= MINOR_TICKS_PER_MAJOR; j++) {
      minorTicks.push(i / (MAJOR_TICKS - 1) + (j / (MINOR_TICKS_PER_MAJOR + 1)) * (1 / (MAJOR_TICKS - 1)));
    }
  }

  return (
    <section className={embedded ? 'w-full' : 'brand-knob-frame mx-auto w-full px-3 pb-3 sm:px-5'} aria-label={ariaLabel}>
      <div
        ref={ref}
        className="relative select-none touch-none"
        style={{ width: total, height: total, margin: '0 auto', cursor: isDragging ? 'grabbing' : 'grab', outline: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={muted ? 'Muted' : `${Math.round(value * 100)}%`}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {/* Live value readout */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -20,
            transform: 'translateX(-50%)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: accent,
            fontFamily: 'var(--font-sans)',
            fontVariantNumeric: 'tabular-nums',
            opacity: showReadout || isDragging ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {muted ? 'MUTE' : `${Math.round(value * 100)}%`}
        </div>

        {/* Tick faceplate + level arc */}
        <svg width={total} height={total} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {minorTicks.map((t, i) => {
            const a = START_ANGLE + (END_ANGLE - START_ANGLE) * t;
            const o = toXY(a, tickOuterR - 3);
            const inn = toXY(a, tickInnerRMinor);
            return <line key={`mn-${i}`} x1={inn.x} y1={inn.y} x2={o.x} y2={o.y} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />;
          })}
          {majorTicks.map((t, i) => {
            const a = START_ANGLE + (END_ANGLE - START_ANGLE) * t;
            const o = toXY(a, tickOuterR);
            const inn = toXY(a, tickInnerRMajor);
            const lit = t <= value + 0.001;
            return (
              <line
                key={`mj-${i}`}
                x1={inn.x} y1={inn.y} x2={o.x} y2={o.y}
                stroke={lit ? accent : 'rgba(255,255,255,0.28)'}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            );
          })}
          <path d={trackD} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} strokeLinecap="round" />
          {valD && <path d={valD} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" opacity={0.85} />}
        </svg>

        {/* Knurled ridged rim — rotates as one rigid body with the face and pointer */}
        <div
          style={{
            position: 'absolute',
            top: pad, left: pad,
            width: size, height: size,
            borderRadius: '50%',
            background: `repeating-conic-gradient(from 0deg, #050403 0deg ${360 / RIDGE_COUNT * 0.5}deg, #2c2822 ${360 / RIDGE_COUNT * 0.5}deg ${360 / RIDGE_COUNT}deg)`,
            boxShadow: [
              'inset 0 2px 3px rgba(255,255,255,0.10)',
              'inset 0 -4px 8px rgba(0,0,0,0.90)',
              '0 6px 12px rgba(0,0,0,0.62)',
              '0 1px 0 rgba(255,255,255,0.06)',
            ].join(', '),
            transform: `rotate(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 120ms ease',
          }}
        >
          {/* Flat brushed-metal face */}
          <div style={{
            position: 'absolute', inset: '14%',
            borderRadius: '50%',
            background: 'linear-gradient(155deg, #3e3a34 0%, #29261f 48%, #1c1a15 100%)',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.14)',
              'inset 0 0 0 1px rgba(0,0,0,0.55)',
              'inset 0 -3px 6px rgba(0,0,0,0.75)',
            ].join(', '),
          }}>
            {/* Pointer groove — carved indent, not a glowing LED bar */}
            <div style={{
              position: 'absolute', left: '50%', top: '9%',
              width: 4, height: '30%',
              transform: 'translateX(-50%)',
              borderRadius: 2,
              background: 'linear-gradient(180deg, #080706, #080706)',
              boxShadow: [
                'inset 1px 0 0 rgba(255,255,255,0.10)',
                'inset -1px 0 0 rgba(0,0,0,0.6)',
              ].join(', '),
              opacity: muted ? 0.45 : 1,
            }} />
            <div style={{
              position: 'absolute', left: '50%', top: '10%',
              width: 4, height: 4,
              background: accent,
              borderRadius: '50%',
              transform: 'translate(-50%, -35%)',
              opacity: muted ? 0.45 : 1,
            }} />

            {/* Raised center hub */}
            <div style={{
              position: 'absolute', inset: '38%',
              borderRadius: '50%',
              background: 'linear-gradient(155deg, #4a453e 0%, #211f1a 100%)',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.20)',
                'inset 0 -2px 3px rgba(0,0,0,0.80)',
                '0 1px 2px rgba(0,0,0,0.6)',
              ].join(', '),
            }} />
          </div>
        </div>

        {/* Fixed specular highlight — simulates a static light source, doesn't rotate with the knob */}
        <div style={{
          position: 'absolute',
          top: pad, left: pad,
          width: size, height: size,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 46% 30% at 32% 24%, rgba(255,255,255,0.16), transparent 72%)',
          pointerEvents: 'none',
        }} />
      </div>
    </section>
  );
}
