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

const START_ANGLE = -160;
const END_ANGLE = 160;
const TICK_STEPS = 10; // one tick per numbered position, 0-10
const KEY_STEP = 0.05;
const KEY_STEP_BIG = 0.10;
const LABELS = Array.from({ length: TICK_STEPS + 1 }, (_, i) => i); // 0..10

interface VolumeDialProps {
  value: number;
  onChange: (v: number) => void;
  embedded?: boolean;
  ariaLabel?: string;
}

/**
 * A rotary channel-selector style knob — chrome bezel, black face with
 * printed numerals fixed in place, and a flat metal lever that rotates to
 * point at the current position. Supports drag, scroll, keyboard
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

  const size = embedded ? 108 : 140;
  const pad = 20;
  const total = size + pad * 2;
  const cx = total / 2;
  const cy = total / 2;
  const labelR = size / 2 + 11;
  const dotR = size / 2 + 11;

  // Rounded to a fixed precision so server- and client-rendered markup match
  // exactly — raw trig output can differ in its last bit between environments.
  const toXY = (deg: number, r: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return {
      x: Number((cx + r * Math.cos(rad)).toFixed(3)),
      y: Number((cy + r * Math.sin(rad)).toFixed(3)),
    };
  };

  const dotPos = toXY(START_ANGLE - 9, dotR);

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
            top: -18,
            transform: 'translateX(-50%)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: muted ? '#8a8480' : '#cfcfcf',
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

        {/* Fixed printed numerals (do not rotate) + reference dot */}
        <svg width={total} height={total} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <circle cx={dotPos.x} cy={dotPos.y} r={1.6} fill="#e8e4dc" opacity={0.85} />
          {LABELS.map((n) => {
            const t = n / TICK_STEPS;
            const a = START_ANGLE + (END_ANGLE - START_ANGLE) * t;
            const p = toXY(a, labelR);
            const lit = t <= value + 0.001;
            return (
              <text
                key={n}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={embedded ? 13 : 16}
                fontWeight={800}
                fontFamily="var(--font-sans)"
                fill={lit && !muted ? '#f0ece2' : '#8a857e'}
              >
                {n}
              </text>
            );
          })}
        </svg>

        {/* Black face — static, numerals painted on it are fixed */}
        <div style={{
          position: 'absolute',
          top: pad, left: pad,
          width: size, height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 42%, #1c1c1c 0%, #0a0a0a 70%, #000 100%)',
          boxShadow: [
            'inset 0 2px 4px rgba(0,0,0,0.9)',
            'inset 0 0 0 2px #cfcfcc',
            'inset 0 0 0 4px #1a1a1a',
          ].join(', '),
        }} />

        {/* Inner chrome ring — thick polished band around a black center, static, sits under the lever */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: size * 0.6, height: size * 0.6,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'conic-gradient(from 40deg, #eeeeea 0deg, #6c6c68 45deg, #f4f4f0 90deg, #585854 120deg, #eeeeea 150deg, #7c7c78 190deg, #f6f6f2 235deg, #64645f 265deg, #eeeeea 300deg, #86867f 330deg, #eeeeea 360deg)',
          boxShadow: [
            'inset 0 2px 2px rgba(255,255,255,0.6)',
            'inset 0 -2px 3px rgba(0,0,0,0.5)',
            '0 1px 2px rgba(0,0,0,0.4)',
          ].join(', '),
        }}>
          <div style={{
            position: 'absolute', inset: '19%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 42%, #1c1c1c 0%, #0a0a0a 70%, #000 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95)',
          }} />
        </div>

        {/* Rotating lever — spans the full diameter through the pivot, like a real channel lever */}
        <div style={{
          position: 'absolute',
          top: pad, left: pad,
          width: size, height: size,
          transform: `rotate(${angle}deg)`,
          transition: isDragging ? 'none' : 'transform 140ms ease',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            left: '50%', top: '-6%',
            width: 17,
            height: '112%',
            transform: 'translateX(-50%)',
            borderRadius: 4,
            background: muted
              ? 'linear-gradient(90deg, #262626 0%, #363636 45%, #2c2c2c 55%, #1c1c1c 100%)'
              : 'linear-gradient(90deg, #4a4846 0%, #57534e 40%, #34322f 52%, #201f1c 100%)',
            boxShadow: [
              '0 2px 5px rgba(0,0,0,0.75)',
              'inset 2px 0 0 rgba(255,255,255,0.22)',
              'inset -2px 0 0 rgba(0,0,0,0.55)',
            ].join(', '),
          }} />
          {/* Rivet near the outer tip */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '4%',
            width: 4, height: 4,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #e8e4dc, #6a6864)',
            opacity: muted ? 0.5 : 0.9,
          }} />
        </div>
      </div>
    </section>
  );
}
