'use client';

import { useRef, useEffect } from 'react';
import { DECADES } from '@/data/eras';

interface MobileYearSelectorProps {
  currentYear: number;
  onYearSelect: (year: number) => void;
}

function getCurrentDecade(year: number): number {
  return Math.floor(year / 10) * 10;
}

export default function MobileYearSelector({ currentYear, onYearSelect }: MobileYearSelectorProps) {
  const activeDecadeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentDecade = getCurrentDecade(currentYear);

  useEffect(() => {
    if (activeDecadeRef.current && scrollRef.current) {
      activeDecadeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentDecade]);

  const prevYear = Math.max(1885, currentYear - 1);
  const nextYear = Math.min(2000, currentYear + 1);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex flex-col md:hidden"
      style={{ backgroundColor: '#2C2C2C', height: '80px' }}
      role="navigation"
      aria-label="Year selector"
    >
      {/* Main row: prev / year / next */}
      <div className="flex items-center justify-between px-4 flex-1">
        <button
          onClick={() => onYearSelect(prevYear)}
          disabled={currentYear <= 1885}
          aria-label="Previous year"
          className="p-2 rounded-lg transition-opacity disabled:opacity-30"
          style={{ color: '#F5F0E8' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p
            className="text-2xl font-bold leading-none"
            style={{
              color: '#F5F0E8',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
            aria-live="polite"
            aria-label={`Current year: ${currentYear}`}
          >
            {currentYear}
          </p>
        </div>

        <button
          onClick={() => onYearSelect(nextYear)}
          disabled={currentYear >= 2000}
          aria-label="Next year"
          className="p-2 rounded-lg transition-opacity disabled:opacity-30"
          style={{ color: '#F5F0E8' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Decade tray */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto gap-1 px-3 pb-2 scrollbar-thin"
        style={{ scrollbarWidth: 'none' }}
      >
        {DECADES.filter((d) => d >= 1880 && d <= 2000).map((decade) => {
          const isActive = decade === currentDecade;
          const targetYear = decade === 1880 ? 1885 : decade;
          return (
            <button
              key={decade}
              ref={isActive ? activeDecadeRef : undefined}
              onClick={() => onYearSelect(targetYear)}
              aria-label={`Go to ${decade === 1880 ? '1885' : `${decade}s`}`}
              aria-current={isActive ? 'true' : undefined}
              className="shrink-0 px-3 py-0.5 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? '#B5913A' : 'transparent',
                color: isActive ? '#fff' : '#8B9BAE',
              }}
            >
              {decade === 1880 ? '1885' : `${decade}s`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
