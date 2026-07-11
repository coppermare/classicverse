'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DRAG_WIDTH = 140; // matches RollerKnob's full-range travel (SLOT_WIDTH * steps)
const RIDGES_PER_FULL = 2.2; // same cycles-per-pixel roll rate as RollerKnob
const TICK_STEPS = 20; // audible tick every 5%

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

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

interface WheelTheme {
  ridgeDark: string;
  ridgeMid: string;
  ridgeLight: string;
  ridgeHighlight: string;
}

const WHEEL_THEME_LIGHT: WheelTheme = {
  ridgeDark: '#0e0d0c',
  ridgeMid: '#3a3830',
  ridgeLight: '#5a5650',
  ridgeHighlight: '#cec8bc',
};

const WHEEL_THEME_DARK: WheelTheme = {
  ridgeDark: '#0c0c0b',
  ridgeMid: '#3c3a32',
  ridgeLight: '#4c4944',
  ridgeHighlight: '#a8a29a',
};

function WheelSVG({
  width,
  height,
  rotation,
  theme,
}: {
  width: number;
  height: number;
  rotation: number;
  theme: WheelTheme;
}) {
  if (width <= 0 || height <= 0) return null;

  const id = 'cv-volume-wheel';
  const ridgeCount = 16;
  const ridgeSpacing = width / ridgeCount;
  const rotMod = ((rotation % 1) + 1) % 1;
  const offset = rotMod * ridgeSpacing;

  const ridges: { i: number; cx: number }[] = [];
  for (let i = -2; i < ridgeCount + 3; i++) {
    ridges.push({ i, cx: i * ridgeSpacing - offset + ridgeSpacing / 2 });
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" />
          <stop offset="50%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.ridgeMid} />
          <stop offset="40%" stopColor={theme.ridgeLight} />
          <stop offset="60%" stopColor={theme.ridgeLight} />
          <stop offset="100%" stopColor={theme.ridgeMid} />
        </linearGradient>
        <linearGradient id={`${id}-catch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.ridgeHighlight} stopOpacity="0.9" />
          <stop offset="50%" stopColor={theme.ridgeHighlight} stopOpacity="0.4" />
          <stop offset="100%" stopColor={theme.ridgeHighlight} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="1" />
          <stop offset="6%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="14%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="24%" stopColor="#000" stopOpacity="0" />
          <stop offset="76%" stopColor="#000" stopOpacity="0" />
          <stop offset="86%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="94%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width={width} height={height} rx={height / 2} ry={height / 2} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width={width} height={height} fill={`url(#${id}-bg)`} />

        {ridges.map(({ i, cx }) => {
          const xN = cx / width;
          const distFromCenter = Math.abs(xN - 0.5) / 0.5;
          if (distFromCenter > 1.05) return null;
          const cT = Math.max(0, 1 - distFromCenter);

          const w = ridgeSpacing * 0.78;
          const xL = cx - w / 2;
          const yTop = height * 0.12;
          const yBot = height - height * 0.10;
          const faceInsetX = w * 0.12;
          const fxL = xL + faceInsetX;
          const fxR = xL + w - faceInsetX;
          const fyT = yTop + (yBot - yTop) * 0.06;
          const fyB = yBot - (yBot - yTop) * 0.10;
          const litOpacity = 0.6 + cT * 0.4;

          return (
            <g key={i} opacity={Math.min(1, 0.4 + cT * 0.7)}>
              <rect x={xL} y={yTop} width={w} height={yBot - yTop} fill={theme.ridgeDark} rx={1} />
              <rect x={fxL} y={fyT} width={fxR - fxL} height={fyB - fyT} fill={`url(#${id}-face)`} opacity={litOpacity} />
              <rect x={fxL} y={fyT} width={fxR - fxL} height={Math.max(2, (fyB - fyT) * 0.18)} fill={`url(#${id}-catch)`} opacity={litOpacity} />
              <rect x={fxL} y={fyT} width={fxR - fxL} height={1} fill="#fff" opacity={0.5 * litOpacity} />
              <rect x={fxL} y={fyT} width={1} height={fyB - fyT} fill={theme.ridgeHighlight} opacity={0.3 * litOpacity} />
              <rect x={fxR - 1} y={fyT} width={1} height={fyB - fyT} fill="#000" opacity="0.5" />
            </g>
          );
        })}

        <rect x="0" y="0" width={width} height={height} fill={`url(#${id}-edge)`} />
        <rect x="0" y="0" width={width} height="1.5" fill="#fff" opacity="0.12" />
      </g>
    </svg>
  );
}

const BAR_COUNT = 20;

function VolumeMeter({ value }: { value: number }) {
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, i) => i), []);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-end gap-[3px]">
        {bars.map((i) => {
          const filled = (i + 1) / BAR_COUNT <= value;
          const loud = i >= BAR_COUNT - 3;
          return (
            <div
              key={i}
              style={{
                width: 5,
                height: 26,
                borderRadius: 1,
                background: filled ? (loud ? '#e05050' : 'var(--timeline-accent)') : 'rgba(255,255,255,0.10)',
                boxShadow: filled ? `0 0 5px ${loud ? '#e0505099' : 'var(--timeline-accent)'}` : 'none',
                transition: 'background 80ms ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface VolumeKnobProps {
  value: number;
  onChange: (v: number) => void;
  embedded?: boolean;
  ariaLabel?: string;
}

export default function VolumeKnob({ value, onChange, embedded, ariaLabel = 'Volume' }: VolumeKnobProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const [pillSize, setPillSize] = useState({ width: 0, height: 0 });

  const valueRef = useRef(value);
  const smoothRef = useRef(value);
  const [smoothValue, setSmoothValue] = useState(value);

  const dragRef = useRef<{ startX: number; startValue: number; lastStep: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const check = () => {
      const manual = document.documentElement.getAttribute('data-theme');
      setIsDark(manual === 'dark' || (!manual && mq.matches));
    };
    check();
    mq.addEventListener('change', check);
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mq.removeEventListener('change', check);
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf: number;
    const step = () => {
      if (!dragRef.current) {
        const cur = smoothRef.current;
        const tgt = valueRef.current;
        const d = tgt - cur;
        if (Math.abs(d) > 0.0005) {
          const next = cur + d * 0.22;
          smoothRef.current = next;
          setSmoothValue(next);
        } else if (cur !== tgt) {
          smoothRef.current = tgt;
          setSmoothValue(tgt);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setPillSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startValue: smoothRef.current,
      lastStep: Math.round(smoothRef.current * TICK_STEPS),
    };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const next = clamp(dragRef.current.startValue + dx / DRAG_WIDTH, 0, 1);
    smoothRef.current = next;
    setSmoothValue(next);
    const step = Math.round(next * TICK_STEPS);
    if (step !== dragRef.current.lastStep) {
      playTick();
      dragRef.current.lastStep = step;
    }
    onChange(next);
  }, [onChange]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    onChange(clamp(valueRef.current + (e.deltaY > 0 ? -1 : 1) * 0.04, 0, 1));
  }, [onChange]);

  const wheelTheme = isDark ? WHEEL_THEME_DARK : WHEEL_THEME_LIGHT;
  // Negated so a rightward drag rolls the wheel the same physical direction
  // as RollerKnob's (which decreases its index — and thus rotation — on a
  // rightward drag), even though volume itself increases with the drag.
  const wheelRotation = -smoothValue * RIDGES_PER_FULL;

  return (
    <section className={embedded ? 'w-full' : 'brand-knob-frame timeline-scrubber-frame mx-auto w-full px-3 pb-3 sm:px-5'} aria-label={ariaLabel}>
      <div
        className="brand-knob timeline-scrubber relative select-none touch-none w-full"
        style={{
          height: embedded ? '126px' : '154px',
          cursor: isDragging ? 'grabbing' : 'grab',
          outline: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={`${Math.round(value * 100)}%`}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div className={embedded
          ? 'timeline-display-shell absolute inset-x-1 top-0 h-[76px] rounded-[8px] p-[4px]'
          : 'timeline-display-shell absolute inset-x-4 top-0 h-[76px] rounded-[28px] p-[5px] sm:inset-x-8'
        }>
          <div
            className={embedded ? 'timeline-display-glass relative h-full overflow-hidden rounded-[6px]' : 'timeline-display-glass relative h-full overflow-hidden rounded-[23px]'}
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
            }}
          >
            <VolumeMeter value={smoothValue} />
          </div>
        </div>

        <div className={embedded
          ? 'timeline-roller-shell absolute inset-x-1 bottom-0 h-[44px] rounded-[8px]'
          : 'timeline-roller-shell absolute inset-x-20 bottom-0 h-[64px] rounded-[22px] sm:inset-x-32'
        }>
          <div className={embedded ? 'timeline-roller-cavity absolute inset-[5px] rounded-[10px]' : 'timeline-roller-cavity absolute inset-[9px] rounded-[14px]'}>
            <div
              ref={pillRef}
              className={embedded ? 'timeline-roller-pill absolute inset-[4px_8px] overflow-hidden' : 'timeline-roller-pill absolute inset-[6px_11px] overflow-hidden'}
              style={{ borderRadius: 999 }}
            >
              <WheelSVG
                width={pillSize.width}
                height={pillSize.height}
                rotation={wheelRotation}
                theme={wheelTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
