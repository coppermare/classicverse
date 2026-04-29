'use client';

import { useState, useEffect, useCallback } from 'react';
import { CARS, getCarForYear } from '@/data/cars';
import DecadeRail from '@/components/DecadeRail';
import HeroCarPanel from '@/components/HeroCarPanel';
import QuickFactsGrid from '@/components/QuickFactsGrid';
import SourcePanel from '@/components/SourcePanel';
import TimelineScrubber from '@/components/TimelineScrubber';
import SearchCommand from '@/components/SearchCommand';
import MobileYearSelector from '@/components/MobileYearSelector';

const MIN_YEAR = 1885;
const MAX_YEAR = 2000;

export default function Home() {
  const [currentYear, setCurrentYear] = useState(MIN_YEAR);
  const [searchOpen, setSearchOpen] = useState(false);

  const goToYear = useCallback((year: number) => {
    setCurrentYear(Math.max(MIN_YEAR, Math.min(MAX_YEAR, year)));
  }, []);

  const goToPrevYear = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 1)), []);
  const goToNextYear = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 1)), []);
  const goToPrevDecade = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 10)), []);
  const goToNextDecade = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 10)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft' && e.shiftKey) { e.preventDefault(); goToPrevDecade(); return; }
      if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); goToNextDecade(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevYear(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNextYear(); return; }
      if (e.key === 'Escape') { setSearchOpen(false); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToPrevYear, goToNextYear, goToPrevDecade, goToNextDecade]);

  const car = getCarForYear(currentYear);

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ backgroundColor: '#B91C1C', color: '#fff' }}
      >
        Skip to main content
      </a>

      {/* Screen-reader live region for year changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {currentYear}: {car ? `${car.hero_car_name} by ${car.manufacturer}` : 'Record in progress'}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex h-screen overflow-hidden" style={{ backgroundColor: '#FAFAF7' }}>
        {/* Left: Decade Rail */}
        <aside className="shrink-0" style={{ width: '240px' }}>
          <DecadeRail currentYear={currentYear} onYearSelect={goToYear} />
        </aside>

        {/* Center: Hero content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid #B5913A20', borderRight: '1px solid #B5913A20' }}
        >
          <div className="flex-1 overflow-y-auto" key={currentYear}>
            <HeroCarPanel
              car={car}
              year={currentYear}
              onPrevYear={goToPrevYear}
              onNextYear={goToNextYear}
              canGoPrev={currentYear > MIN_YEAR}
              canGoNext={currentYear < MAX_YEAR}
            />
          </div>

          {/* Timeline scrubber at bottom of center column */}
          <div className="shrink-0">
            <TimelineScrubber currentYear={currentYear} onYearSelect={goToYear} />
          </div>
        </main>

        {/* Right: Context + Sources */}
        <aside
          className="shrink-0 overflow-y-auto"
          style={{ width: '320px', backgroundColor: '#FAFAF7' }}
        >
          {/* Search button at top */}
          <div className="px-6 pt-6 pb-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left"
              style={{ backgroundColor: '#F5F0E8', color: '#6B7280' }}
              aria-label="Search cars (⌘K)"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1 truncate">Search cars…</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs" style={{ color: '#8B9BAE' }}>
                <span>⌘</span><span>K</span>
              </kbd>
            </button>
          </div>

          {/* Quick facts */}
          {car && (
            <div className="px-6 py-2">
              <QuickFactsGrid facts={car.verified_facts} />
            </div>
          )}

          <SourcePanel car={car} />
        </aside>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col min-h-screen pb-20" style={{ backgroundColor: '#FAFAF7' }}>
        {/* Mobile header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: '#FAFAF7', borderBottom: '1px solid #B5913A20' }}
        >
          <p
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: '#B5913A', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Classicverse
          </p>
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: '#6B7280' }}
            aria-label="Search cars"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </header>

        {/* Mobile content */}
        <main id="main-content" className="flex-1">
          <div key={currentYear}>
            <HeroCarPanel
              car={car}
              year={currentYear}
              onPrevYear={goToPrevYear}
              onNextYear={goToNextYear}
              canGoPrev={currentYear > MIN_YEAR}
              canGoNext={currentYear < MAX_YEAR}
            />
          </div>
          {car && (
            <div className="px-4 py-4">
              <QuickFactsGrid facts={car.verified_facts} />
            </div>
          )}
          <SourcePanel car={car} />
        </main>

        {/* Mobile sticky year selector */}
        <MobileYearSelector currentYear={currentYear} onYearSelect={goToYear} />
      </div>

      {/* Search overlay — shared between desktop and mobile */}
      <SearchCommand
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        cars={CARS}
        onSelect={goToYear}
      />
    </>
  );
}
