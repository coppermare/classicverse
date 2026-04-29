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

export default function Home() {
  const [currentYear, setCurrentYear] = useState(MIN_YEAR);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [expanded, setExpanded]       = useState(false);
  const [isDark, setIsDark]           = useState(false);

  // Image crossfade state — no remounting
  const [displayCar, setDisplayCar]     = useState<CarRecord | undefined>(getCarForYear(MIN_YEAR));
  const [imageVisible, setImageVisible] = useState(true);
  const [imgError, setImgError]         = useState(false);
  const crossfadeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    setExpanded(false);
  }, []);

  const goToPrevYear   = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 1)), []);
  const goToNextYear   = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 1)), []);
  const goToPrevDecade = useCallback(() => setCurrentYear(y => Math.max(MIN_YEAR, y - 10)), []);
  const goToNextDecade = useCallback(() => setCurrentYear(y => Math.min(MAX_YEAR, y + 10)), []);

  // Crossfade on year change — blur trick
  useEffect(() => {
    const car = getCarForYear(currentYear);
    clearTimeout(crossfadeTimeout.current);
    queueMicrotask(() => {
      setImageVisible(false);
      setImgError(false);
    });
    crossfadeTimeout.current = setTimeout(() => {
      setDisplayCar(car);
      setImageVisible(true);
    }, 140);
    return () => clearTimeout(crossfadeTimeout.current);
  }, [currentYear]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft'  && e.shiftKey) { e.preventDefault(); goToPrevDecade(); return; }
      if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); goToNextDecade(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goToPrevYear(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNextYear(); return; }
      if (e.key === 'Escape') { setSearchOpen(false); setExpanded(false); return; }
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
      <div style={{ maxWidth: '960px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'var(--cv-bg)' }}>

        <header>
          <nav
            className="flex items-center justify-between px-6 py-3"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="text-sm font-bold uppercase tracking-widest no-underline hover:opacity-80 transition-opacity"
              style={{ color: 'var(--cv-brass)', fontFamily: "'Playfair Display', Georgia, serif" }}
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
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: '12px',
                backgroundColor: 'var(--cv-bg-deep)',
              }}
            >
              <div
                style={{
                  position: 'absolute', inset: 0,
                  opacity: imageVisible ? 1 : 0,
                  filter: imageVisible ? 'none' : 'blur(6px)',
                  transform: imageVisible ? 'scale(1)' : 'scale(1.015)',
                  transition: 'opacity 0.22s cubic-bezier(0.23, 1, 0.32, 1), filter 0.22s cubic-bezier(0.23, 1, 0.32, 1), transform 0.22s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                {displayCar?.image_url && !imgError ? (
                  <>
                    <Image
                      src={displayCar.image_url}
                      alt={`${displayCar.hero_car_name} by ${displayCar.manufacturer}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 720px) 100vw, 720px"
                      priority
                      onError={() => setImgError(true)}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 pointer-events-none"
                      style={{ height: '120px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
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
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '96px', color: 'var(--cv-bg-placeholder)', lineHeight: 1 }}
                    >
                      {currentYear}
                    </p>
                    <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: 'var(--cv-brass)' }}>
                      {displayCar?.era ?? 'Record in progress'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="px-6 mx-auto w-full" style={{ maxWidth: '720px', paddingTop: '48px', paddingBottom: '72px' }}>
            {displayCar ? (
              <>
                {/* Year */}
                <div style={{ marginBottom: '4px' }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '72px',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: 'var(--cv-text)',
                      letterSpacing: '-0.02em',
                      animation: 'fadeIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  >
                    {displayCar.year}
                  </span>
                  <span className="text-sm block" style={{ color: 'var(--cv-text-steel)', marginTop: '6px', letterSpacing: '0.03em' }}>
                    {displayCar.manufacturer} · {displayCar.country} · {displayCar.era}
                  </span>
                </div>

                {/* Car name */}
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: 'var(--cv-text)',
                    lineHeight: 1.2,
                    marginTop: '20px',
                    marginBottom: '20px',
                    animation: 'fadeInUp 0.32s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {displayCar.hero_car_name}
                </h1>

                {/* Short description */}
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '17px',
                    color: 'var(--cv-text-body)',
                    lineHeight: 1.75,
                    marginBottom: '32px',
                    animation: 'fadeInUp 0.36s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {displayCar.short_description}
                </p>

                {/* Fact chips — staggered via @starting-style */}
                {displayCar.verified_facts.length > 0 && (
                  <div className="flex flex-wrap gap-2" style={{ marginBottom: '36px' }}>
                    {displayCar.verified_facts.slice(0, 3).map((fact, i) => (
                      <span
                        key={`${displayCar.year}-${i}`}
                        className="fact-chip px-3 py-2 rounded-full text-xs leading-relaxed"
                        style={{
                          backgroundColor: 'var(--cv-bg-surface)',
                          color: 'var(--cv-text-muted)',
                          border: '1px solid var(--cv-brass-08)',
                          transitionDelay: `${i * 60}ms`,
                        }}
                      >
                        {fact}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expand toggle */}
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{
                    color: 'var(--cv-red)',
                    marginBottom: '36px',
                    transition: 'transform 160ms ease-out, opacity 160ms ease-out',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                  onMouseUp={e => (e.currentTarget.style.transform = '')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}
                >
                  {expanded ? 'Show less' : 'More info'}
                  <svg
                    className="w-4 h-4"
                    style={{ transition: 'transform 240ms cubic-bezier(0.23, 1, 0.32, 1)', transform: expanded ? 'rotate(180deg)' : 'none' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="space-y-6 border-t pt-6" style={{ borderColor: 'var(--cv-border)', animation: 'fadeInUp 0.28s cubic-bezier(0.23, 1, 0.32, 1)' }}>

                    <div className="flex flex-wrap gap-2 items-center">
                      <ConfidenceBadge level={displayCar.confidence_level} />
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--cv-bg-surface)', color: 'var(--cv-text-muted)' }}>
                        {REVIEW_LABEL[displayCar.review_status]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Why This Year</h3>
                      <p className="text-sm leading-relaxed italic" style={{ color: 'var(--cv-text)' }}>{displayCar.why_this_year}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Historical Context</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{displayCar.historical_context}</p>
                    </div>

                    {displayCar.verified_facts.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Verified Facts</h3>
                        <div className="space-y-2">
                          {displayCar.verified_facts.map((fact, i) => (
                            <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--cv-bg-surface)', border: '1px solid var(--cv-brass-08)' }}>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cv-text-steel)' }}>Fact {String(i + 1).padStart(2, '0')}</p>
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{fact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>In Detail</h3>
                      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--cv-text)' }}>
                        {displayCar.long_description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Why Iconic</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--cv-text)' }}>{displayCar.why_iconic}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Selection Basis</h3>
                      <p className="text-sm" style={{ color: 'var(--cv-text-muted)' }}>{SELECTION_BASIS_LABEL[displayCar.selection_basis] ?? displayCar.selection_basis}</p>
                    </div>

                    {displayCar.source_urls.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Sources</h3>
                        <ol className="space-y-1.5">
                          {displayCar.source_urls.map((src, i) => (
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
                      </div>
                    )}

                    {(displayCar.image_license || displayCar.image_creator || displayCar.image_attribution_url) && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Image Credit</h3>
                        <div className="text-xs space-y-0.5" style={{ color: 'var(--cv-text-muted)' }}>
                          {displayCar.image_license && <p>License: {displayCar.image_license}</p>}
                          {displayCar.image_creator && <p>Creator: {displayCar.image_creator}</p>}
                          {displayCar.image_attribution_url && (
                            <a href={displayCar.image_attribution_url} target="_blank" rel="noopener noreferrer"
                              className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--cv-red)' }}>
                              Attribution
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {displayCar.alternate_cars.length > 0 && (
                      <div className="space-y-2 pb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Considered Alternatives</h3>
                        <div className="space-y-3">
                          {displayCar.alternate_cars.map((alt, i) => (
                            <div key={i} className="text-sm space-y-0.5">
                              <p className="font-medium" style={{ color: 'var(--cv-text)' }}>{alt.manufacturer} {alt.name}</p>
                              <p className="leading-relaxed" style={{ color: 'var(--cv-text-muted)' }}>{alt.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--cv-text)' }}>{currentYear}</p>
                <p className="text-sm" style={{ color: 'var(--cv-text-steel)' }}>Our researchers are compiling the landmark automobile for this year.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} cars={CARS} onSelect={goToYear} />
    </>
  );
}
