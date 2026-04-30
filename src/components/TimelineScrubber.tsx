'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { ERAS } from '@/data/eras';

const MIN_YEAR = 1885;
const MAX_YEAR = 2000;
const SLOT_WIDTH = 24;
const RIDGES_PER_YEAR = 0.42;
const DISPLAY_SLOT_W = 76; // px per year slot in the display panel

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getEra(year: number) {
  return ERAS.find(e => year >= e.start && year <= e.end) ?? null;
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') _audioCtx = new AudioContext();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch { return null; }
}

function playTick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const n = Math.ceil(ctx.sampleRate * 0.022);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 14) * 0.2;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const gain = ctx.createGain();
  gain.gain.value = 1.6;
  src.connect(hp); hp.connect(gain); gain.connect(ctx.destination);
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

function WheelSVG({ width, height, rotation, theme }: {
  width: number;
  height: number;
  rotation: number;
  theme: WheelTheme;
}) {
  if (width <= 0 || height <= 0) return null;

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
        <linearGradient id="cv-wheelBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#000" />
          <stop offset="50%"  stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="cv-toothFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={theme.ridgeMid} />
          <stop offset="40%"  stopColor={theme.ridgeLight} />
          <stop offset="60%"  stopColor={theme.ridgeLight} />
          <stop offset="100%" stopColor={theme.ridgeMid} />
        </linearGradient>
        <linearGradient id="cv-toothCatch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={theme.ridgeHighlight} stopOpacity="0.9" />
          <stop offset="50%"  stopColor={theme.ridgeHighlight} stopOpacity="0.4" />
          <stop offset="100%" stopColor={theme.ridgeHighlight} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cv-cylEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#000" stopOpacity="1" />
          <stop offset="6%"   stopColor="#000" stopOpacity="0.55" />
          <stop offset="14%"  stopColor="#000" stopOpacity="0.15" />
          <stop offset="24%"  stopColor="#000" stopOpacity="0" />
          <stop offset="76%"  stopColor="#000" stopOpacity="0" />
          <stop offset="86%"  stopColor="#000" stopOpacity="0.15" />
          <stop offset="94%"  stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </linearGradient>
        <clipPath id="cv-wheelClip">
          <rect x="0" y="0" width={width} height={height} rx={height / 2} ry={height / 2} />
        </clipPath>
      </defs>

      <g clipPath="url(#cv-wheelClip)">
        <rect x="0" y="0" width={width} height={height} fill="url(#cv-wheelBg)" />

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
              <rect x={fxL} y={fyT} width={fxR - fxL} height={fyB - fyT} fill="url(#cv-toothFace)" opacity={litOpacity} />
              <rect x={fxL} y={fyT} width={fxR - fxL} height={Math.max(2, (fyB - fyT) * 0.18)} fill="url(#cv-toothCatch)" opacity={litOpacity} />
              <rect x={fxL} y={fyT} width={fxR - fxL} height={1} fill="#fff" opacity={0.5 * litOpacity} />
              <rect x={fxL} y={fyT} width={1} height={fyB - fyT} fill={theme.ridgeHighlight} opacity={0.3 * litOpacity} />
              <rect x={fxR - 1} y={fyT} width={1} height={fyB - fyT} fill="#000" opacity="0.5" />
            </g>
          );
        })}

        <rect x="0" y="0" width={width} height={height} fill="url(#cv-cylEdge)" />
        <rect x="0" y="0" width={width} height="1.5" fill="#fff" opacity="0.12" />
      </g>
    </svg>
  );
}

interface TimelineScrubberProps {
  currentYear: number;
  onYearSelect: (year: number) => void;
}

export default function TimelineScrubber({ currentYear, onYearSelect }: TimelineScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [pillSize, setPillSize] = useState({ width: 0, height: 0 });

  const currentYearRef = useRef(currentYear);
  const smoothYearRef = useRef<number>(currentYear);
  const [smoothYear, setSmoothYear] = useState<number>(currentYear);

  const dragRef = useRef<{
    startX: number;
    startSmoothYear: number;
    lastYear: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => { currentYearRef.current = currentYear; }, [currentYear]);

  // Dark mode detection — watch both system preference and manual toggle
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
    return () => { mq.removeEventListener('change', check); mo.disconnect(); };
  }, []);

  // RAF loop: animate smoothYear toward currentYear when not dragging
  useEffect(() => {
    let raf: number;
    const step = () => {
      if (!dragRef.current) {
        const cur = smoothYearRef.current;
        const tgt = currentYearRef.current;
        const d = tgt - cur;
        if (Math.abs(d) > 0.005) {
          const next = cur + d * 0.22;
          smoothYearRef.current = next;
          setSmoothYear(next);
        } else if (cur !== tgt) {
          smoothYearRef.current = tgt;
          setSmoothYear(tgt);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Measure wheel pill for SVG sizing
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

  // Tick on year change when not dragging
  const prevYearRef = useRef(currentYear);
  useEffect(() => {
    if (prevYearRef.current === currentYear) return;
    prevYearRef.current = currentYear;
    if (!dragRef.current) playTick();
  }, [currentYear]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startSmoothYear: smoothYearRef.current,
      lastYear: Math.round(smoothYearRef.current),
    };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const rawYear = clamp(dragRef.current.startSmoothYear - dx / SLOT_WIDTH, MIN_YEAR, MAX_YEAR);
    smoothYearRef.current = rawYear;
    setSmoothYear(rawYear);
    const newYear = Math.round(rawYear);
    if (newYear !== dragRef.current.lastYear) {
      playTick();
      dragRef.current.lastYear = newYear;
      onYearSelect(newYear);
    }
  }, [onYearSelect]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const finalYear = clamp(
      Math.round(dragRef.current.startSmoothYear - dx / SLOT_WIDTH),
      MIN_YEAR, MAX_YEAR
    );
    dragRef.current = null;
    setIsDragging(false);
    onYearSelect(finalYear);
    // RAF loop animates smoothYear → finalYear
  }, [onYearSelect]);

  const wheelTheme = isDark ? WHEEL_THEME_DARK : WHEEL_THEME_LIGHT;
  const wheelRotation = (smoothYear - MIN_YEAR) * RIDGES_PER_YEAR;
  const activeYear = Math.round(smoothYear);
  const activeEra = getEra(activeYear);

  // Year track offset: center the smoothYear slot in the display container
  const displayTrackX = -((smoothYear - MIN_YEAR) * DISPLAY_SLOT_W + DISPLAY_SLOT_W / 2);

  return (
    <div className="timeline-scrubber-frame mx-auto w-full px-3 py-4 sm:px-5 sm:py-5">
      <div
        ref={containerRef}
        className="timeline-scrubber relative select-none touch-none w-full"
        style={{
          height: '178px',
          cursor: isDragging ? 'grabbing' : 'grab',
          outline: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-valuemin={MIN_YEAR}
        aria-valuemax={MAX_YEAR}
        aria-valuenow={currentYear}
        aria-label="Year selector"
        tabIndex={0}
      >
        {/* ── Display panel ── */}
        <div className="timeline-display-shell absolute inset-x-3 top-0 h-[90px] rounded-[32px] p-[5px] sm:inset-x-6">
          <div
            className="timeline-display-glass relative h-full overflow-hidden rounded-[27px]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
            }}
          >
            {/* Year track — all years, centered on smoothYear */}
            <div
              className="absolute inset-y-0 flex items-center"
              style={{
                left: '50%',
                transform: `translateX(${displayTrackX}px)`,
                willChange: 'transform',
              }}
            >
              {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
                const year = MIN_YEAR + i;
                const dist = Math.abs(year - smoothYear);
                const isActive = year === activeYear;
                const opacity = Math.max(0.12, 1 - dist * 0.18);
                const fontSize = isActive ? 20 : Math.max(10, 18 - dist * 3);
                const fontWeight = isActive ? 800 : dist < 1 ? 600 : 400;
                return (
                  // position:relative so the era label can be absolute without affecting flex centering
                  <div
                    key={year}
                    className="relative flex items-center justify-center h-full"
                    style={{ width: DISPLAY_SLOT_W, flexShrink: 0 }}
                  >
                    <span
                      className="timeline-year-number"
                      style={{
                        fontSize,
                        fontWeight,
                        opacity,
                        color: isActive ? 'var(--timeline-accent)' : 'var(--timeline-display-muted)',
                        letterSpacing: 0,
                        lineHeight: 1,
                        fontFamily: 'var(--font-sans)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {year}
                    </span>
                    {isActive && activeEra && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontSize: 7,
                          fontWeight: 700,
                          letterSpacing: '0.10em',
                          textTransform: 'uppercase',
                          color: 'var(--timeline-accent)',
                          opacity: 0.70,
                          fontFamily: 'var(--font-sans)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activeEra.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pointer indicator — inside the glass at bottom centre */}
            <div className="absolute bottom-[7px] left-1/2 z-10 -translate-x-1/2">
              <div className="timeline-pointer" />
            </div>
          </div>
        </div>

        {/* ── Roller drum ── */}
        <div className="timeline-roller-shell absolute inset-x-16 bottom-0 h-[80px] rounded-[26px] sm:inset-x-28">
          {/* Black cavity floor */}
          <div className="timeline-roller-cavity absolute inset-[10px] rounded-[16px]">
            {/* Wheel pill — SVG fills this */}
            <div
              ref={pillRef}
              className="timeline-roller-pill absolute inset-[7px_12px] overflow-hidden"
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
    </div>
  );
}
