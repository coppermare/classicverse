'use client';

import { useRef, useCallback } from 'react';
import { ERAS } from '@/data/eras';

const MIN_YEAR = 1885;
const MAX_YEAR = 2000;
const RANGE = MAX_YEAR - MIN_YEAR;

interface TimelineScrubberProps {
  currentYear: number;
  onYearSelect: (year: number) => void;
}

function yearFromPosition(clientX: number, rect: DOMRect): number {
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(MIN_YEAR + ratio * RANGE)));
}

export default function TimelineScrubber({ currentYear, onYearSelect }: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const thumbPercent = ((currentYear - MIN_YEAR) / RANGE) * 100;

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      onYearSelect(yearFromPosition(e.clientX, rect));
    },
    [onYearSelect]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        onYearSelect(yearFromPosition(ev.clientX, rect));
      };

      const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [onYearSelect]
  );

  return (
    <div
      className="w-full px-6 py-3"
      style={{ backgroundColor: '#FAFAF7', borderTop: '1px solid #B5913A25' }}
      aria-label="Timeline scrubber"
    >
      {/* Era zone labels row */}
      <div className="relative h-4 mb-1 select-none" aria-hidden="true">
        {ERAS.map((era) => {
          const startPct = ((Math.max(era.start, MIN_YEAR) - MIN_YEAR) / RANGE) * 100;
          const endPct = ((Math.min(era.end, MAX_YEAR) - MIN_YEAR) / RANGE) * 100;
          return (
            <div
              key={era.name}
              className="absolute flex items-center"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%`, fontSize: '9px', color: '#8B9BAE', letterSpacing: '0.04em' }}
            >
              <span className="truncate uppercase">{era.name}</span>
            </div>
          );
        })}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer flex items-center"
        onClick={handleTrackClick}
        role="slider"
        aria-valuemin={MIN_YEAR}
        aria-valuemax={MAX_YEAR}
        aria-valuenow={currentYear}
        aria-label="Year selector"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onYearSelect(Math.max(MIN_YEAR, currentYear - 1));
          if (e.key === 'ArrowRight') onYearSelect(Math.min(MAX_YEAR, currentYear + 1));
          if (e.key === 'ArrowLeft' && e.shiftKey) onYearSelect(Math.max(MIN_YEAR, currentYear - 10));
          if (e.key === 'ArrowRight' && e.shiftKey) onYearSelect(Math.min(MAX_YEAR, currentYear + 10));
        }}
      >
        {/* Background track */}
        <div
          className="absolute inset-x-0 h-px rounded-full"
          style={{ backgroundColor: '#B5913A25', top: '50%' }}
        />

        {/* Era boundary ticks */}
        {ERAS.map((era) => {
          const pct = ((Math.max(era.start, MIN_YEAR) - MIN_YEAR) / RANGE) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={era.name}
              className="absolute w-px"
              style={{ left: `${pct}%`, height: '8px', top: 'calc(50% - 4px)', backgroundColor: '#B5913A40' }}
              aria-hidden="true"
            />
          );
        })}

        {/* Progress fill */}
        <div
          className="absolute h-0.5 left-0 rounded-full"
          style={{ width: `${thumbPercent}%`, backgroundColor: '#B91C1C', top: '50%', transform: 'translateY(-50%)' }}
        />

        {/* Thumb */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${thumbPercent}%`, transform: 'translateX(-50%)', top: '50%', marginTop: '-9px' }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="w-4 h-4 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-sm"
            style={{ backgroundColor: '#fff', borderColor: '#B91C1C' }}
          />
          <span
            className="text-xs mt-0.5 font-semibold whitespace-nowrap tabular-nums"
            style={{ color: '#B91C1C', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '11px' }}
          >
            {currentYear}
          </span>
        </div>
      </div>
    </div>
  );
}
