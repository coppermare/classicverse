'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import type { EraName } from '@/types/car';
import { ERAS, getEraForYear } from '@/data/eras';

const MIN_YEAR = 1885;
const MAX_YEAR = 2000;
const SLOT_WIDTH = 44;
const SNAP_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const LABEL_CROSSFADE_MS = 165;

type KnobSlot = { year: number; era: EraName };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getBaseX(year: number, width: number) {
  return width / 2 - ((year - MIN_YEAR) * SLOT_WIDTH + SLOT_WIDTH / 2);
}

const TOTAL_SLOTS = MAX_YEAR - MIN_YEAR + 1;
const TRACK_WIDTH_PX = TOTAL_SLOTS * SLOT_WIDTH;

// Reuse single AudioContext
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

interface TimelineScrubberProps {
  currentYear: number;
  onYearSelect: (year: number) => void;
}

export default function TimelineScrubber({ currentYear, onYearSelect }: TimelineScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(800);
  const currentYearRef = useRef(currentYear);
  const dragRef = useRef<{ startX: number; startYear: number; lastYear: number } | null>(null);
  const isFirstRender = useRef(true);
  const [isDragging, setIsDragging] = useState(false);
  const [knob, setKnob] = useState(() => {
    const e = getEraForYear(currentYear);
    const slots: [KnobSlot, KnobSlot] = [
      { year: currentYear, era: e },
      { year: currentYear, era: e },
    ];
    return { active: 0 as 0 | 1, slots };
  });

  useEffect(() => { currentYearRef.current = currentYear; }, [currentYear]);

  useEffect(() => {
    queueMicrotask(() => {
      setKnob(prev => {
        const cur = prev.slots[prev.active];
        const era = getEraForYear(currentYear);
        if (cur.year === currentYear && cur.era === era) return prev;
        const reveal = (1 - prev.active) as 0 | 1;
        const nextSlots: [KnobSlot, KnobSlot] = [
          { ...prev.slots[0] },
          { ...prev.slots[1] },
        ];
        nextSlots[reveal] = { year: currentYear, era };
        return { active: reveal, slots: nextSlots };
      });
    });
  }, [currentYear]);

  const setPos = useCallback((year: number, animated: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animated ? `transform 0.3s ${SNAP_EASING}` : 'none';
    el.style.transform = `translateX(${getBaseX(year, widthRef.current)}px)`;
  }, []);

  useEffect(() => {
    if (dragRef.current) return;
    const animated = !isFirstRender.current;
    isFirstRender.current = false;
    setPos(currentYear, animated);
  }, [currentYear, setPos]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    widthRef.current = el.clientWidth;
    const ro = new ResizeObserver(() => {
      widthRef.current = el.clientWidth;
      if (!dragRef.current) setPos(currentYearRef.current, false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setPos]);

  const prevYearRef = useRef(currentYear);
  useEffect(() => {
    if (prevYearRef.current === currentYear) return;
    prevYearRef.current = currentYear;
    if (!dragRef.current) playTick();
  }, [currentYear]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startYear: currentYearRef.current, lastYear: currentYearRef.current };
    setIsDragging(true);
    if (trackRef.current) trackRef.current.style.transition = 'none';
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;

    if (trackRef.current) {
      trackRef.current.style.transform =
        `translateX(${getBaseX(dragRef.current.startYear, widthRef.current) + dx}px)`;
    }

    const newYear = clamp(
      Math.round(dragRef.current.startYear - dx / SLOT_WIDTH),
      MIN_YEAR, MAX_YEAR
    );

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
      Math.round(dragRef.current.startYear - dx / SLOT_WIDTH),
      MIN_YEAR, MAX_YEAR
    );
    dragRef.current = null;
    setIsDragging(false);
    setPos(finalYear, true);
    onYearSelect(finalYear);
  }, [onYearSelect, setPos]);

  const labelTransition =
    `opacity ${LABEL_CROSSFADE_MS}ms cubic-bezier(0.23, 1, 0.32, 1), transform ${LABEL_CROSSFADE_MS}ms cubic-bezier(0.23, 1, 0.32, 1)`;

  return (
    <div
      ref={containerRef}
      className="timeline-scrubber relative overflow-hidden select-none touch-none w-full"
      style={{
        height: '92px',
        backgroundColor: 'var(--cv-bg)',
        cursor: isDragging ? 'grabbing' : 'grab',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
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
      {/* Sliding rail: eras + ticks move together */}
      <div
        ref={trackRef}
        className="absolute inset-0 flex flex-col justify-end pb-3"
        style={{ width: TRACK_WIDTH_PX, willChange: 'transform' }}
      >
        {/* Era strip — scrolls with years */}
        <div
          className="absolute left-0 top-2 shrink-0 pointer-events-none"
          style={{ width: TRACK_WIDTH_PX, height: '28px' }}
        >
          {ERAS.map((era) => {
            const left = (era.start - MIN_YEAR) * SLOT_WIDTH;
            const w = (era.end - era.start + 1) * SLOT_WIDTH;
            return (
              <div
                key={era.name}
                className="absolute top-0 flex items-start justify-center border-l"
                style={{
                  left,
                  width: w,
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  borderColor: 'var(--cv-brass-08)',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    color: 'var(--cv-brass)',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {era.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tick row */}
        <div className="flex items-end shrink-0" style={{ width: TRACK_WIDTH_PX }}>
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const year = MIN_YEAR + i;
            const isDecade = year % 10 === 0;
            const isFive = year % 5 === 0 && !isDecade;
            return (
              <div
                key={year}
                className="flex flex-col items-center justify-end"
                style={{ width: SLOT_WIDTH, flexShrink: 0 }}
              >
                {isDecade && (
                  <span style={{
                    fontSize: '9px', color: 'var(--cv-brass)', fontWeight: 600,
                    lineHeight: 1, marginBottom: '4px', letterSpacing: '0.04em',
                  }}>
                    {year}
                  </span>
                )}
                <div style={{
                  width: '1px',
                  height: isDecade ? '18px' : isFive ? '11px' : '6px',
                  backgroundColor: isDecade ? 'var(--cv-brass)' : 'var(--cv-border)',
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Knob stack — above tick/decade row, arrow points down at the rail */}
      <div
        className="absolute left-1/2 pointer-events-none flex flex-col items-center"
        style={{
          bottom: 'calc(0.75rem + 9px + 4px + 18px + 2px)',
          transform: 'translateX(-50%)',
          width: 'min(220px, 72vw)',
          zIndex: 2,
          gap: '1px',
        }}
      >
        <div className="relative w-full" style={{ height: '16px' }}>
          {[0, 1].map((i) => {
            const { year } = knob.slots[i as 0 | 1];
            const on = knob.active === i;
            return (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? 'translateY(0)' : 'translateY(4px)',
                  transition: labelTransition,
                }}
                aria-hidden={!on}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--cv-red)',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {year}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative w-full" style={{ height: '14px' }}>
          {[0, 1].map((i) => {
            const { era } = knob.slots[i as 0 | 1];
            const on = knob.active === i;
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-start justify-center"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? 'translateY(0)' : 'translateY(3px)',
                  transition: labelTransition,
                }}
                aria-hidden={!on}
              >
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    color: 'var(--cv-brass)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {era}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            marginTop: '2px',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid var(--cv-red)',
            filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.06))',
          }}
        />
      </div>
    </div>
  );
}
