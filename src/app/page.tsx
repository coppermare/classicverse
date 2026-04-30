'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CARS, getCarForYear } from '@/data/cars';
import TimelineScrubber from '@/components/TimelineScrubber';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import SearchCommand from '@/components/SearchCommand';
import type { CarRecord } from '@/types/car';

const MIN_YEAR = 1885;
const MAX_YEAR = 2000;

const REVIEW_LABEL: Record<string, string> = {
  pending: 'Pending review',
  in_review: 'Under review',
  reviewed: 'Reviewed',
  approved: 'Approved',
};

const SELECTION_BASIS_LABEL: Record<string, string> = {
  production_start: 'Production start',
  public_debut: 'Public debut',
  patent_registration: 'Patent registration',
  motorsport_breakthrough: 'Motorsport breakthrough',
  cultural_breakthrough: 'Cultural breakthrough',
};

const COUNTRY_FLAG_CLASS: Record<string, string> = {
  Germany: 'cv-flag--germany',
  France: 'cv-flag--france',
  Italy: 'cv-flag--italy',
  'United States': 'cv-flag--united-states',
  'United Kingdom': 'cv-flag--united-kingdom',
};

const MANUFACTURER_MARK: Record<string, string> = {
  'Benz & Cie.': 'BENZ',
  'Ford Motor Company': 'FORD',
  'Austin Motor Company': 'AUSTIN',
  'Citroën': 'CIT',
  'Volkswagenwerk GmbH': 'VW',
  'Alfa Romeo': 'AR',
  'Rover Company': 'ROVER',
  'British Motor Corporation (BMC)': 'BMC',
  'Volkswagen': 'VW',
  'McLaren Automotive': 'McL',
};

function getManufacturerMark(manufacturer: string) {
  if (MANUFACTURER_MARK[manufacturer]) return MANUFACTURER_MARK[manufacturer];
  const cleaned = manufacturer
    .replace(/\([^)]*\)/g, '')
    .replace(/&/g, ' ')
    .replace(/\b(company|corporation|motor|motors|automotive|gmbh|cie)\b/gi, ' ')
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return manufacturer.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function CarScreenInfo({ car }: { car: CarRecord }) {
  return (
    <div className="cv-screen-info absolute inset-0 overflow-y-auto p-6 sm:p-8">
      <div className="space-y-6 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>
            Archive record
          </p>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--cv-text)', lineHeight: 1.1 }}>
            {car.hero_car_name}
          </h2>
          <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: 'var(--cv-text-body)' }}>
            {car.short_description}
          </p>
        </div>

        <div className="grid gap-2 text-xs sm:grid-cols-2" style={{ color: 'var(--cv-text-muted)' }}>
          <span><strong style={{ color: 'var(--cv-text)' }}>Year</strong> {car.year}</span>
          <span><strong style={{ color: 'var(--cv-text)' }}>Make</strong> {car.manufacturer}</span>
          <span><strong style={{ color: 'var(--cv-text)' }}>Origin</strong> {car.country}</span>
          <span><strong style={{ color: 'var(--cv-text)' }}>Era</strong> {car.era}</span>
          <span><strong style={{ color: 'var(--cv-text)' }}>Category</strong> {car.category}</span>
          <span><strong style={{ color: 'var(--cv-text)' }}>Selection</strong> {SELECTION_BASIS_LABEL[car.selection_basis] ?? car.selection_basis}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <ConfidenceBadge level={car.confidence_level} />
          <span className="cv-tactile-chip inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: 'var(--cv-text-muted)' }}>
            {REVIEW_LABEL[car.review_status]}
          </span>
        </div>

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Why This Year</h3>
          <p className="text-sm leading-relaxed italic" style={{ color: 'var(--cv-text)' }}>{car.why_this_year}</p>
        </section>

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Historical Context</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{car.historical_context}</p>
        </section>

        {car.verified_facts.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Verified Facts</h3>
            <div className="space-y-2">
              {car.verified_facts.map((fact, i) => (
                <div key={i} className="cv-tactile-chip p-3 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cv-text-steel)' }}>Fact {String(i + 1).padStart(2, '0')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{fact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>In Detail</h3>
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--cv-text)' }}>
            {car.long_description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </section>

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Why Iconic</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{car.why_iconic}</p>
        </section>

        {car.source_urls.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Sources</h3>
            <ol className="space-y-1.5">
              {car.source_urls.map((src, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="shrink-0 text-xs pt-0.5" style={{ color: 'var(--cv-text-steel)' }}>{i + 1}.</span>
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all"
                    style={{ color: 'var(--cv-red)' }}>
                    {src.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(car.image_license || car.image_creator || car.image_attribution_url) && (
          <section className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Image Credit</h3>
            <div className="text-xs space-y-0.5" style={{ color: 'var(--cv-text-muted)' }}>
              {car.image_license && <p>License: {car.image_license}</p>}
              {car.image_creator && <p>Creator: {car.image_creator}</p>}
              {car.image_attribution_url && (
                <a href={car.image_attribution_url} target="_blank" rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--cv-red)' }}>
                  Attribution
                </a>
              )}
            </div>
          </section>
        )}

        {car.alternate_cars.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Considered Alternatives</h3>
            <div className="space-y-3">
              {car.alternate_cars.map((alt, i) => (
                <div key={i} className="text-sm space-y-0.5">
                  <p className="font-medium" style={{ color: 'var(--cv-text)' }}>{alt.manufacturer} {alt.name}</p>
                  <p className="leading-relaxed" style={{ color: 'var(--cv-text-muted)' }}>{alt.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CarTitlePlate({
  car,
  screenMode,
  onToggleScreen,
}: {
  car: CarRecord;
  screenMode: 'image' | 'info';
  onToggleScreen: () => void;
}) {
  const flagClass = COUNTRY_FLAG_CLASS[car.country] ?? '';
  const mark = getManufacturerMark(car.manufacturer);
  return (
    <div className="cv-title-plate flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
      <div className="min-w-0">
        <h1
          className="text-3xl font-extrabold sm:text-4xl"
          style={{
            color: 'var(--cv-text)',
            lineHeight: 1.1,
          }}
        >
          {car.hero_car_name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium" style={{ color: 'var(--cv-text-muted)' }}>
          <span className="cv-inline-marque">{mark}</span>
          <span>{car.manufacturer}</span>
          <span className="flex items-center gap-1.5">
            <span className={`cv-inline-flag ${flagClass}`} aria-hidden="true" />
            {car.country}
          </span>
          <span>{car.year}</span>
          <span>{car.era}</span>
        </div>
      </div>
      <button
        type="button"
        className="cv-monitor-control shrink-0"
        onClick={onToggleScreen}
        aria-label={screenMode === 'image' ? 'Show car info on screen' : 'Show car image on screen'}
        aria-pressed={screenMode === 'info'}
      >
        <span className="cv-monitor-control-light" aria-hidden="true" />
        <span className="sr-only">{screenMode === 'image' ? 'Info' : 'Image'}</span>
      </button>
    </div>
  );
}

export default function Home() {
  const [currentYear, setCurrentYear] = useState(MIN_YEAR);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [isDark, setIsDark]           = useState(false);
  const [screenMode, setScreenMode]   = useState<'image' | 'info'>('image');
  const [screenGlitch, setScreenGlitch] = useState(false);

  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const displayCar = getCarForYear(currentYear);

  // Initialise theme from localStorage / system preference
  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem('cv-theme');
      if (saved === 'dark') {
        setIsDark(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (saved === 'light') {
        setIsDark(false);
        document.documentElement.setAttribute('data-theme', 'light');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('cv-theme', next ? 'dark' : 'light');
  }, [isDark]);

  const goToYear = useCallback((year: number) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    setCurrentYear(clamped);
  }, []);

  const goToPrevYear   = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 1)), []);
  const goToNextYear   = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 1)), []);
  const goToPrevDecade = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 10)), []);
  const goToNextDecade = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 10)), []);

  useEffect(() => {
    clearTimeout(glitchTimeout.current);
    let activate = 0;
    const reset = requestAnimationFrame(() => {
      setScreenGlitch(false);
      activate = requestAnimationFrame(() => setScreenGlitch(true));
    });
    glitchTimeout.current = setTimeout(() => setScreenGlitch(false), 360);
    return () => {
      cancelAnimationFrame(reset);
      cancelAnimationFrame(activate);
      clearTimeout(glitchTimeout.current);
    };
  }, [currentYear, screenMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft'  && e.shiftKey) { e.preventDefault(); goToPrevDecade(); return; }
      if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); goToNextDecade(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goToPrevYear(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNextYear(); return; }
      if (e.key === 'Escape') { setSearchOpen(false); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToPrevYear, goToNextYear, goToPrevDecade, goToNextDecade]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ backgroundColor: 'var(--cv-red)', color: '#fff' }}
      >
        Skip to main content
      </a>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {currentYear}: {displayCar ? `${displayCar.hero_car_name} by ${displayCar.manufacturer}` : 'Record in progress'}
      </div>

      {/* Page max-width wrapper */}
      <div className="cv-page-shell" style={{ maxWidth: '960px', margin: '0 auto', minHeight: '100vh' }}>

        <header>
          <nav
            className="flex items-center justify-between px-6 py-3"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="text-sm font-bold uppercase tracking-widest no-underline hover:opacity-80 transition-opacity"
              style={{ color: 'var(--cv-brass)' }}
              aria-current="page"
            >
              Classicverse
            </Link>

            <ul className="flex items-center gap-2 list-none m-0 p-0">
              <li>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity hover:opacity-70 active:scale-[0.97]"
                  style={{
                    backgroundColor: 'var(--cv-bg-surface)',
                    color: 'var(--cv-text-muted)',
                    transition: 'transform 160ms ease-out, opacity 160ms ease-out',
                  }}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="5" strokeWidth={2} />
                      <line x1="12" y1="1"     x2="12" y2="3"     strokeWidth={2} strokeLinecap="round" />
                      <line x1="12" y1="21"    x2="12" y2="23"    strokeWidth={2} strokeLinecap="round" />
                      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"   strokeWidth={2} strokeLinecap="round" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth={2} strokeLinecap="round" />
                      <line x1="1"  y1="12" x2="3"  y2="12" strokeWidth={2} strokeLinecap="round" />
                      <line x1="21" y1="12" x2="23" y2="12" strokeWidth={2} strokeLinecap="round" />
                      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" strokeWidth={2} strokeLinecap="round" />
                      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:opacity-70 active:scale-[0.97]"
                  style={{
                    backgroundColor: 'var(--cv-bg-surface)',
                    color: 'var(--cv-text-muted)',
                    transition: 'transform 160ms ease-out, opacity 160ms ease-out',
                  }}
                  aria-label="Search cars (⌘K)"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden sm:inline text-xs" style={{ color: 'var(--cv-brass)' }}>⌘K</kbd>
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <TimelineScrubber currentYear={currentYear} onYearSelect={goToYear} />

        {/* Main content */}
        <main id="main-content">

          {/* Hero image — crossfade, no remount */}
          <div style={{ maxWidth: '720px', margin: '32px auto 0', padding: '0 24px' }}>
            <div
              className="cv-image-frame"
              style={{
                position: 'relative',
                width: '100%',
                overflow: 'visible',
                borderRadius: '30px',
                padding: '18px',
              }}
            >
              <div
                className="cv-image-glass cv-monitor-screen"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: '18px',
                  overflow: 'hidden',
                }}
              >
                {displayCar && screenMode === 'info' ? (
                  <CarScreenInfo car={displayCar} />
                ) : displayCar?.image_url && failedImageUrl !== displayCar.image_url ? (
                  <>
                    <Image
                      src={displayCar.image_url}
                      alt={`${displayCar.hero_car_name} by ${displayCar.manufacturer}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 720px) 100vw, 720px"
                      priority
                      onError={() => setFailedImageUrl(displayCar.image_url)}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 pointer-events-none"
                      style={{ height: '120px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 1 }}
                    />
                    {(displayCar.image_creator || displayCar.image_license) && (
                      <p className="absolute bottom-2 right-3 text-xs" style={{ color: 'rgba(255,255,255,0.65)', zIndex: 1 }}>
                        {displayCar.image_creator ? `© ${displayCar.image_creator} · ` : ''}{displayCar.image_license}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p
                      className="font-bold select-none"
                      style={{ fontSize: '28px', color: 'var(--cv-bg-placeholder)', lineHeight: 1.15, textAlign: 'center', padding: '0 24px' }}
                    >
                      {displayCar?.hero_car_name ?? currentYear}
                    </p>
                    <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: 'var(--cv-brass)' }}>
                      {displayCar?.era ?? 'Record in progress'}
                    </p>
                  </div>
                )}
                <div className={`cv-screen-glitch${screenGlitch ? ' cv-screen-glitch--active' : ''}`} aria-hidden="true" />
              </div>
              {displayCar && (
                <CarTitlePlate
                  car={displayCar}
                  screenMode={screenMode}
                  onToggleScreen={() => setScreenMode(mode => mode === 'image' ? 'info' : 'image')}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} cars={CARS} onSelect={goToYear} />
    </>
  );
}
