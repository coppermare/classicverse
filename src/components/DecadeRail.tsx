'use client';

import { useEffect, useRef } from 'react';
import { ERAS, DECADES } from '@/data/eras';
import { CARS } from '@/data/cars';
import type { EraName } from '@/types/car';

const CAR_YEARS = new Set(CARS.map(c => c.year));
const MIN_YEAR = 1885;
const MAX_YEAR = 2000;

interface DecadeRailProps {
  currentYear: number;
  onYearSelect: (year: number) => void;
}

function getEraAtDecade(decade: number): EraName | null {
  // Resolve the first real year in each decade slot (1880 slot starts at 1885)
  const firstYear = (d: number) => d === 1880 ? MIN_YEAR : d;
  const era = ERAS.find(e => firstYear(decade) >= e.start && firstYear(decade) <= e.end);
  if (!era) return null;
  const prevEra = ERAS.find(e => firstYear(decade - 10) >= e.start && firstYear(decade - 10) <= e.end);
  return (!prevEra || prevEra.name !== era.name) ? era.name : null;
}

function getCurrentDecade(year: number): number {
  return Math.floor(year / 10) * 10;
}

function getYearsInDecade(decade: number): number[] {
  const first = decade === 1880 ? MIN_YEAR : decade;
  const last = Math.min(decade + 9, MAX_YEAR);
  return Array.from({ length: last - first + 1 }, (_, i) => first + i).filter(y => CAR_YEARS.has(y));
}

export default function DecadeRail({ currentYear, onYearSelect }: DecadeRailProps) {
  const activeYearRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentDecade = getCurrentDecade(currentYear);

  useEffect(() => {
    if (activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentYear]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-col h-full overflow-y-auto scrollbar-thin py-6"
      style={{ backgroundColor: '#F5F0E8', width: '240px' }}
      role="navigation"
      aria-label="Decade navigation"
    >
      {/* Header */}
      <div className="px-5 mb-6">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: '#B5913A', fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Classicverse
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#8B9BAE' }}>
          1885 – 2000
        </p>
      </div>

      <div className="flex flex-col px-3">
        {DECADES.map((decade) => {
          const eraLabel = getEraAtDecade(decade);
          const isActive = decade === currentDecade;
          const isDecadeInRange = decade >= 1880 && decade <= 2000;
          const decadeYears = getYearsInDecade(decade);

          return (
            <div key={decade}>
              {/* Era boundary label */}
              {eraLabel && (
                <div className="px-2 pt-4 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
                    {eraLabel}
                  </p>
                </div>
              )}

              {/* Decade button */}
              {isDecadeInRange && (
                <div>
                  <button
                    onClick={() => onYearSelect(decade === 1880 ? MIN_YEAR : decade)}
                    aria-label={`Go to decade ${decade}s`}
                    aria-expanded={isActive}
                    className="group w-full text-left px-3 py-1.5 rounded-lg transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? '#B91C1C' : 'transparent',
                      color: isActive ? '#fff' : '#2C2C2C',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B5913A18';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {decade === 1880 ? '1885' : `${decade}s`}
                    </span>
                  </button>

                  {/* Expanded year list for the active decade */}
                  {isActive && (
                    <div className="ml-3 mt-0.5 mb-1 flex flex-col gap-px">
                      {decadeYears.map((y) => (
                        <button
                          key={y}
                          ref={y === currentYear ? activeYearRef : undefined}
                          onClick={() => onYearSelect(y)}
                          aria-label={`Go to year ${y}`}
                          aria-current={y === currentYear ? 'page' : undefined}
                          className="w-full text-left px-3 py-0.5 rounded transition-all duration-100 text-xs"
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            color: y === currentYear ? '#B91C1C' : '#6B7280',
                            fontWeight: y === currentYear ? '700' : '400',
                            backgroundColor: y === currentYear ? '#B91C1C12' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (y !== currentYear) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B5913A12';
                          }}
                          onMouseLeave={(e) => {
                            if (y !== currentYear) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                          }}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-6" />
    </div>
  );
}
