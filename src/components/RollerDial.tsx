'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/** Drag distance for one detent at the wheel's finest pace. */
const SLOT_WIDTH = 34;
/** The fastest the wheel is ever geared. Below this a sweep is uncontrollable. */
const MIN_SLOT_WIDTH = 6;
/**
 * How much of the list one full sweep of the wheel should cover, as a divisor —
 * 8 means a sweep moves an eighth of the way through, so any list is about eight
 * sweeps end to end however long it is.
 */
const SWEEPS_END_TO_END = 8;
const RIDGES_PER_STEP = 0.54;

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

  const id = 'cv-roller-dial-wheel';
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

export interface RollerDialOption {
  id: string | null;
  mark: string;
  count: number;
  logoSrc?: string;
  icon?: ReactNode;
}

interface RollerDialProps {
  options: RollerDialOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  embedded?: boolean;
  /** Prepend an "ALL" cell. Off for plain rollers e.g. channels, years. */
  showAll?: boolean;
  ariaLabel?: string;
  /**
   * How the wheel is geared.
   *
   * `fine` is one detent per 34px of drag, which is the right pace for a short
   * list and for anything you tune rather than travel — the Radio wants to
   * crawl the band a tenth of a MHz at a time.
   *
   * `list` gears the wheel to how much there is to get through, so a long
   * gallery doesn't take dozens of sweeps to cross.
   */
  pace?: 'fine' | 'list';
}

/**
 * The ridged roller wheel — the TV's physical tuning drum.
 *
 * The wheel is a pure INPUT: its rotation is driven only by dragging it, never
 * by `selectedId`. Navigating on the screen (clicking a folder, hovering a
 * tile) changes the selection without spinning the drum, so the data flow stays
 * one-way — knob → screen — exactly like the chrome buttons. The selection is
 * still tracked logically, so grabbing the wheel always resumes from whatever
 * is currently selected rather than from a stale position.
 */
export default function RollerDial({ options: rawOptions, selectedId, onSelect, embedded, showAll = true, ariaLabel = 'Selector', pace = 'fine' }: RollerDialProps) {
  const options = useMemo<RollerDialOption[]>(() => (
    showAll
      ? [{ id: null, mark: 'ALL', count: rawOptions.reduce((sum, opt) => sum + opt.count, 0) }, ...rawOptions]
      : rawOptions
  ), [rawOptions, showAll]);

  const selectedIndex = Math.max(0, options.findIndex(option => option.id === selectedId));
  const pillRef = useRef<HTMLDivElement>(null);
  const [pillSize, setPillSize] = useState({ width: 0, height: 0 });

  const selectedIndexRef = useRef(selectedIndex);

  // Continuous wheel rotation, in "steps". Only a drag ever writes to this.
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);

  const dragRef = useRef<{
    startX: number;
    startIndex: number;
    startRotation: number;
    lastIndex: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

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
    const el = pillRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setPillSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Drag distance per detent.
   *
   * At the fixed 34px the wheel was geared for a handful of channels, and a
   * gallery of 250 inherited it: a sweep of the whole drum moved six images, so
   * crossing Ferrari meant about forty sweeps. The wheel kept up with the hand
   * perfectly — it was just geared far too low for what it was driving.
   *
   * Measuring against the wheel's own width means the pace follows the list
   * rather than a constant: eight sweeps end to end whether that list is a
   * hundred cars or two hundred and fifty wins. Short lists never get faster
   * than the fine pace, and nothing ever gets twitchier than MIN_SLOT_WIDTH.
   */
  const slotWidth = useMemo(() => {
    if (pace !== 'list') return SLOT_WIDTH;
    const width = pillSize.width || 200;
    const perSweep = Math.max(1, options.length / SWEEPS_END_TO_END);
    return clamp(width / perSweep, MIN_SLOT_WIDTH, SLOT_WIDTH);
  }, [pace, pillSize.width, options.length]);

  /**
   * The drum turns with the hand, not with the selection.
   *
   * Scaling by the same factor keeps the ridges moving at a constant rate per
   * pixel dragged, so gearing the wheel up makes the images fly without the
   * drum itself spinning into a blur. It still stops at either end of the list,
   * because it is driven by the clamped index.
   */
  const ridgesPerStep = RIDGES_PER_STEP * (slotWidth / SLOT_WIDTH);

  const selectIndex = useCallback((index: number) => {
    const option = options[clamp(index, 0, options.length - 1)];
    if (!option) return;
    onSelect(option.id);
  }, [onSelect, options]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    // Anchor the drag to whatever is selected RIGHT NOW, so a drag that follows
    // an on-screen selection change continues from there instead of snapping
    // back to where the wheel was last left.
    dragRef.current = {
      startX: e.clientX,
      startIndex: selectedIndexRef.current,
      startRotation: rotationRef.current,
      lastIndex: selectedIndexRef.current,
    };
    setIsDragging(true);
  }, []);

  // Rotation tracks how far the selection actually travelled, so the ridges stop
  // turning once the drag runs past either end of the list.
  const applyDrag = useCallback((clientX: number) => {
    const d = dragRef.current;
    if (!d) return null;
    const dx = clientX - d.startX;
    const rawIndex = clamp(d.startIndex - dx / slotWidth, 0, options.length - 1);
    const next = d.startRotation + (rawIndex - d.startIndex) * ridgesPerStep;
    rotationRef.current = next;
    setRotation(next);
    return rawIndex;
  }, [options.length, slotWidth, ridgesPerStep]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // A drag needs a button held. If a pointerup went missing — released
    // outside the window, a capture lost, a synthetic event — the drag state
    // survived and every later hover kept turning the knob, walking the Radio
    // up the band on its own. Treat "moving with no button down" as the end of
    // the drag rather than as more of it.
    if (dragRef.current && e.buttons === 0) {
      dragRef.current = null;
      setIsDragging(false);
      return;
    }
    const rawIndex = applyDrag(e.clientX);
    if (rawIndex === null || !dragRef.current) return;
    const newIndex = Math.round(rawIndex);
    if (newIndex !== dragRef.current.lastIndex) {
      playTick();
      dragRef.current.lastIndex = newIndex;
      selectIndex(newIndex);
    }
  }, [applyDrag, selectIndex]);

  /**
   * Spin the drum with the scroll wheel as well as by dragging it.
   *
   * A drag can only ever be as long as the screen is wide. Once the pointer
   * reaches the edge of the window `clientX - startX` stops growing, so the
   * drum dead-stops part-way through and the only way on is to let go and grab
   * it again — which in a long gallery happens well before the end of the list.
   * Scrolling has no such ceiling, so the wheel can be spun as far as you like
   * in one gesture.
   *
   * The scroll is measured in the same units as a drag, so one gesture covers
   * the same ground whichever way the drum is driven.
   *
   * Bound natively rather than through React's `onWheel`: React listens for
   * wheel events passively at the root, and a passive listener cannot stop the
   * page scrolling underneath the knob.
   */
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    let carry = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      carry += delta;
      const steps = Math.trunc(carry / slotWidth);
      if (!steps) return;
      carry -= steps * slotWidth;
      const from = selectedIndexRef.current;
      const next = clamp(from + steps, 0, options.length - 1);
      if (next === from) return;
      // Written straight away rather than waiting for the selection to come
      // back down as a prop: wheel events arrive far faster than React
      // re-renders, and reading a stale index would make every event after the
      // first in a frame step from the same place.
      selectedIndexRef.current = next;
      rotationRef.current += (next - from) * ridgesPerStep;
      setRotation(rotationRef.current);
      playTick();
      selectIndex(next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [slotWidth, ridgesPerStep, options.length, selectIndex]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const rawIndex = applyDrag(e.clientX);
    dragRef.current = null;
    setIsDragging(false);
    if (rawIndex !== null) selectIndex(Math.round(rawIndex));
  }, [applyDrag, selectIndex]);

  const wheelTheme = isDark ? WHEEL_THEME_DARK : WHEEL_THEME_LIGHT;
  const wheelRotation = rotation;

  return (
    <div
      ref={pillRef}
      className={embedded
        ? 'brand-knob timeline-roller-well relative select-none touch-none mx-6'
        : 'brand-knob timeline-roller-well brand-knob-frame relative select-none touch-none mx-28 sm:mx-40'
      }
      style={{
        height: embedded ? '46px' : '64px',
        padding: embedded ? '6px 14px' : '9px 20px',
        cursor: isDragging ? 'grabbing' : 'grab',
        outline: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={options.length - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={selectedId ?? 'All'}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <WheelSVG
        width={pillSize.width}
        height={pillSize.height}
        rotation={wheelRotation}
        theme={wheelTheme}
      />
    </div>
  );
}
