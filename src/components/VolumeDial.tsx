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
  const dragRef = useRef<{ lastAng: number; val: number; cx: number; cy: number } | null>(null);
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
    dragRef.current = { lastAng: Math.atan2(e.clientY - cy, e.clientX - cx), val: clamp(value, 0, 1), cx, cy };
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    el.focus();
  }, [value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const ang = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
    // Step by the angle travelled since the LAST move, not since the grab.
    // Measured from the grab, a drag through the gap at the bottom of the
    // scale wrapped past ±π and threw the knob from 0 straight to 10. Each
    // increment is tiny, so the wrap never trips, and clamping the running
    // value means an over-travelled knob sits at the stop and comes back the
    // way it went rather than jumping to the far end.
    let delta = ang - d.lastAng;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const range = (END_ANGLE - START_ANGLE) * Math.PI / 180;
    d.lastAng = ang;
    d.val = clamp(d.val + delta / range, 0, 1);
    commit(d.val);
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
  const knobSize = size * 0.52;
  const labelR = size * 0.405;
  const dotR = labelR;

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
      <div
        ref={ref}
        className={embedded ? 'relative select-none touch-none' : 'relative select-none touch-none brand-knob-frame mx-auto px-3 pb-3 sm:px-5'}
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

        {/* Black face — static, numerals are printed inside it near the rim */}
        <div style={{
          position: 'absolute',
          top: pad, left: pad,
          width: size, height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 42%, #1c1c1c 0%, #0a0a0a 70%, #000 100%)',
        }} />

        {/* Fixed printed numerals (do not rotate) + reference dot, sit on the black face */}
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
                fontSize={embedded ? 11 : 13}
                fontWeight={800}
                fontFamily="var(--font-sans)"
                fill={lit && !muted ? '#f0ece2' : '#6f6b66'}
              >
                {n}
              </text>
            );
          })}
        </svg>

        {/* Ambient contact shadow — grounds the knob so it reads as raised off the flat face */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: knobSize * 1.14, height: knobSize * 1.14,
          transform: 'translate(-50%, -42%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* Rotating knob — simple flat-top cylinder: a lit side wall under one flat disc */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: knobSize, height: knobSize,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          transition: isDragging ? 'none' : 'transform 140ms ease',
          pointerEvents: 'none',
          borderRadius: '50%',
          filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.75))',
        }}>
          {/* Cylinder wall — silver, so it separates from the near-black face */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#a8a8a0',
            boxShadow: [
              'inset 0 1px 1px rgba(255,255,255,0.35)',
              'inset 0 -2px 3px rgba(0,0,0,0.35)',
            ].join(', '),
          }}>
            {/* Flat top — silver, uniform matte fill, not a gradient (gradients across a full
                disc read as spherical shading no matter how "flat" the geometry is) */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: '#c4c4bc',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.45)',
                'inset 0 0 0 1px rgba(0,0,0,0.08)',
                '0 1px 0 rgba(255,255,255,0.15)',
              ].join(', '),
            }}>
              {/* Pointer — a clear solid line, indicates the selected position */}
              <div style={{
                position: 'absolute',
                left: '50%', top: '10%',
                width: 3,
                height: '44%',
                transform: 'translateX(-50%)',
                borderRadius: 2,
                background: muted ? '#9a968e' : '#2a2824',
                opacity: muted ? 0.55 : 1,
              }} />
            </div>
          </div>
        </div>
      </div>
  );
}
