'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { CARS, getCarForYear } from '@/data/cars';
import { getBrandLogo } from '@/data/brandLogos';
import TimelineScrubber from '@/components/TimelineScrubber';
import BrandKnob, { type BrandOption } from '@/components/BrandKnob';
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
  'Benz & Cie.': 'B',
  'Ford Motor Company': 'F',
  'Austin Motor Company': 'A',
  'Citroën': 'C',
  'Volkswagenwerk GmbH': 'VW',
  'Alfa Romeo': 'AR',
  'Rover Company': 'R',
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
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
}

function clampYear(year: number) {
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
}


function CarScreenInfo({ car }: { car: CarRecord }) {
  return (
    <div className="cv-screen-info absolute inset-0 overflow-y-auto p-5" style={{ background: 'rgba(10,10,8,0.96)' }}>
      <div className="space-y-5 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>
            Archive record
          </p>
          <h2 className="mt-2 text-xl font-extrabold" style={{ color: '#e8e4dc', lineHeight: 1.1 }}>
            {car.hero_car_name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#b0a898' }}>
            {car.short_description}
          </p>
        </div>

        <div className="grid gap-2 text-xs" style={{ color: '#8a8680' }}>
          <span><strong style={{ color: '#d4cfc4' }}>Year</strong> {car.year}</span>
          <span><strong style={{ color: '#d4cfc4' }}>Make</strong> {car.manufacturer}</span>
          <span><strong style={{ color: '#d4cfc4' }}>Origin</strong> {car.country}</span>
          <span><strong style={{ color: '#d4cfc4' }}>Era</strong> {car.era}</span>
          <span><strong style={{ color: '#d4cfc4' }}>Category</strong> {car.category}</span>
          <span><strong style={{ color: '#d4cfc4' }}>Selection</strong> {SELECTION_BASIS_LABEL[car.selection_basis] ?? car.selection_basis}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <ConfidenceBadge level={car.confidence_level} />
          <span className="cv-tactile-chip inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: '#8a8680' }}>
            {REVIEW_LABEL[car.review_status]}
          </span>
        </div>

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Why This Year</h3>
          <p className="text-sm leading-relaxed italic" style={{ color: '#c8c2b8' }}>{car.why_this_year}</p>
        </section>

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Historical Context</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#c8c2b8' }}>{car.historical_context}</p>
        </section>

        {car.verified_facts.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Verified Facts</h3>
            <div className="space-y-2">
              {car.verified_facts.map((fact, i) => (
                <div key={i} className="cv-tactile-chip p-3 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8a8680' }}>Fact {String(i + 1).padStart(2, '0')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#c8c2b8' }}>{fact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>In Detail</h3>
          <div className="text-sm leading-relaxed space-y-3" style={{ color: '#c8c2b8' }}>
            {car.long_description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </section>

        {car.source_urls.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Sources</h3>
            <ol className="space-y-1.5">
              {car.source_urls.map((src, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="shrink-0 text-xs pt-0.5" style={{ color: '#8a8680' }}>{i + 1}.</span>
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

        {car.alternate_cars.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--cv-brass)' }}>Considered Alternatives</h3>
            <div className="space-y-3">
              {car.alternate_cars.map((alt, i) => (
                <div key={i} className="text-sm space-y-0.5">
                  <p className="font-medium" style={{ color: '#d4cfc4' }}>{alt.manufacturer} {alt.name}</p>
                  <p className="leading-relaxed" style={{ color: '#8a8680' }}>{alt.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── Bat-handle toggle switch ── */
function BatToggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 7.5, letterSpacing: '0.16em', color: '#8a8480', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
        {label}
      </div>
      {/* Mount plate */}
      <div
        onClick={() => onChange(!value)}
        style={{
          position: 'relative',
          width: 28, height: 44,
          borderRadius: 6,
          background: 'linear-gradient(180deg, #1a1814 0%, #0d0b09 100%)',
          boxShadow: [
            'inset 0 2px 5px rgba(0,0,0,0.9)',
            'inset 0 -1px 2px rgba(255,255,255,0.04)',
            '0 3px 8px rgba(0,0,0,0.7)',
            '0 1px 0 rgba(255,255,255,0.06)',
          ].join(', '),
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Slot recess */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '14%', bottom: '14%',
          width: 6,
          transform: 'translateX(-50%)',
          borderRadius: 3,
          background: 'rgba(0,0,0,0.7)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
        }} />
        {/* Lever */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: value ? '52%' : '10%',
          transform: 'translateX(-50%)',
          transition: 'bottom 180ms cubic-bezier(0.4, 0, 0.2, 1)',
          width: 14, height: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          {/* Bat head */}
          <div style={{
            width: 14, height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #706860 0%, #3a3530 50%, #1c1a16 100%)',
            boxShadow: [
              'inset 0 2px 3px rgba(255,255,255,0.20)',
              'inset 0 -2px 5px rgba(0,0,0,0.85)',
              '0 2px 6px rgba(0,0,0,0.8)',
            ].join(', '),
            flexShrink: 0,
          }} />
          {/* Stem */}
          <div style={{
            width: 5, height: 10,
            background: 'linear-gradient(180deg, #4a4540 0%, #252220 100%)',
            borderRadius: '0 0 3px 3px',
            boxShadow: '1px 0 2px rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.5)',
            flexShrink: 0,
          }} />
        </div>
        {/* ON/OFF pip labels */}
        <span style={{
          position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
          fontSize: 5, letterSpacing: '0.05em', color: value ? '#d4cfc4' : '#3a3835',
          fontFamily: 'var(--font-sans)', fontWeight: 700, transition: 'color 180ms',
          userSelect: 'none',
        }}>I</span>
        <span style={{
          position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
          fontSize: 5, letterSpacing: '0.05em', color: value ? '#3a3835' : '#d4cfc4',
          fontFamily: 'var(--font-sans)', fontWeight: 700, transition: 'color 180ms',
          userSelect: 'none',
        }}>O</span>
      </div>
    </div>
  );
}

/* ── Round TV knob ── */
function TvKnob({
  size = 38,
  value,
  onChange,
  label,
  accent = '#cfcfcf',
  startAngle = -135,
  endAngle = 135,
}: {
  size?: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
  accent?: string;
  startAngle?: number;
  endAngle?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startAng: number; startVal: number; cx: number; cy: number } | null>(null);

  const angle = startAngle + (endAngle - startAngle) * value;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragRef.current = { startAng: Math.atan2(e.clientY - cy, e.clientX - cx), startVal: value, cx, cy };
    ref.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const ang = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
    let delta = ang - d.startAng;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const range = (endAngle - startAngle) * Math.PI / 180;
    onChange(Math.max(0, Math.min(1, d.startVal + delta / range)));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    onChange(Math.max(0, Math.min(1, value + (e.deltaY > 0 ? -1 : 1) * 0.05)));
  };

  // Arc ring geometry
  const pad = 9;
  const total = size + pad * 2;
  const arcR = total / 2 - 4;
  const cx = total / 2;
  const cy = total / 2;
  const toXY = (deg: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + arcR * Math.cos(rad), y: cy + arcR * Math.sin(rad) };
  };
  const p0 = toXY(startAngle);
  const p1 = toXY(endAngle);
  const pV = toXY(angle);
  const sweep = (endAngle - startAngle) * value;
  const trackD = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  const valD = value > 0.01
    ? `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 ${sweep > 180 ? 1 : 0} 1 ${pV.x.toFixed(2)} ${pV.y.toFixed(2)}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 7.5, letterSpacing: '0.16em', color: '#8a8480', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ position: 'relative', width: total, height: total }}>
        {/* Arc track + value fill */}
        <svg width={total} height={total} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <path d={trackD} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={2.5} strokeLinecap="round" />
          {valD && <path d={valD} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.80} />}
        </svg>
        {/* Knob body */}
        <div
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          style={{
            position: 'absolute',
            top: pad, left: pad,
            width: size, height: size,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 28%, #60584e 0%, #26221e 46%, #121008 100%)',
            boxShadow: [
              'inset 0 2px 2px rgba(255,255,255,0.22)',
              'inset 0 -3px 6px rgba(0,0,0,0.90)',
              '0 4px 8px rgba(0,0,0,0.62)',
              '0 1px 0 rgba(255,255,255,0.06)',
            ].join(', '),
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {/* Rotating cap */}
          <div style={{
            position: 'absolute', inset: 5,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 32% 24%, #4a4640 0%, #18160f 62%, #0a0806 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.14), inset 0 -3px 7px rgba(0,0,0,0.92)',
            transform: `rotate(${angle}deg)`,
          }}>
            {/* Indicator line */}
            <div style={{
              position: 'absolute', left: '50%', top: '5%',
              width: 3, height: '40%',
              background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
              transform: 'translateX(-50%)',
              borderRadius: 2,
              boxShadow: `0 0 5px ${accent}cc`,
            }} />
          </div>
          {/* Gloss highlight */}
          <div style={{
            position: 'absolute', top: '9%', left: '17%',
            width: '37%', height: '22%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.40), transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(0.5px)',
          }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentYear, setCurrentYear] = useState(MIN_YEAR);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [isDark, setIsDark]           = useState(false);
  const [screenMode, setScreenMode]   = useState<'image' | 'info'>('image');
  const [screenGlitch, setScreenGlitch] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  // TV power + image adjustments
  const [brightness, setBrightness] = useState(0.55);
  const [contrast, setContrast]     = useState(0.6);
  const [volume, setVolume]         = useState(0.5);
  const [screenOn, setScreenOn]       = useState(true);
  const [turningOff, setTurningOff]   = useState(false);
  const [turningOn, setTurningOn]     = useState(false);
  const [bootPhase, setBootPhase]     = useState<'idle' | 'scanning' | 'logo' | 'fading'>('idle');
  const [volumeChanging, setVolumeChanging] = useState(false);
  const [screenCursor, setScreenCursor] = useState<{ x: number; y: number; pointer: boolean } | null>(null);
  const screenContentRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef({ on: true, turningOff: false, turningOn: false });
  const volumeHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const displayCar = getCarForYear(currentYear);

  const brandOptions = useMemo<BrandOption[]>(() => {
    const byManufacturer = new Map<string, { count: number; firstYear: number }>();
    CARS.forEach((car) => {
      const existing = byManufacturer.get(car.manufacturer);
      if (existing) {
        existing.count += 1;
        existing.firstYear = Math.min(existing.firstYear, car.year);
        return;
      }
      byManufacturer.set(car.manufacturer, { count: 1, firstYear: car.year });
    });
    return Array.from(byManufacturer.entries())
      .sort(([, a], [, b]) => a.firstYear - b.firstYear)
      .map(([manufacturer, details]) => ({
        manufacturer,
        mark: getManufacturerMark(manufacturer),
        count: details.count,
        logoSrc: getBrandLogo(manufacturer)?.src,
      }));
  }, []);

  // Theme init
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

  const goToYear        = useCallback((year: number) => setCurrentYear(clampYear(year)), []);
  const goToPrevYear    = useCallback(() => setCurrentYear(y => clampYear(y - 1)), []);
  const goToNextYear    = useCallback(() => setCurrentYear(y => clampYear(y + 1)), []);
  const goToPrevDecade  = useCallback(() => setCurrentYear(y => clampYear(y - 10)), []);
  const goToNextDecade  = useCallback(() => setCurrentYear(y => clampYear(y + 10)), []);
  const selectSearchResult = useCallback((year: number) => setCurrentYear(clampYear(year)), []);

  // Glitch on year/mode change
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

  // Keyboard nav
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

  // TV power control
  const setPowerState = useCallback((newOn: boolean) => {
    if (newOn === powerRef.current.on) return;
    if (newOn && !powerRef.current.turningOn) {
      setScreenOn(true);
      setTurningOn(true);
      setBootPhase('scanning');
      powerRef.current.on = true;
      powerRef.current.turningOn = true;
      setTimeout(() => { setBootPhase('logo'); }, 500);
      setTimeout(() => { setBootPhase('fading'); }, 1800);
      setTimeout(() => {
        setBootPhase('idle');
        setTurningOn(false);
        powerRef.current.turningOn = false;
      }, 2500);
    } else if (!newOn && !powerRef.current.turningOff) {
      setBootPhase('idle');
      setTurningOff(true);
      setScreenOn(false);
      powerRef.current.on = false;
      powerRef.current.turningOff = true;
      setTimeout(() => { setTurningOff(false); powerRef.current.turningOff = false; }, 700);
    }
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    setVolumeChanging(true);
    clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setVolumeChanging(false), 1600);
  }, []);

  const screenFilter = useMemo(() => {
    const b = 0.4 + brightness;
    const c = 0.6 + contrast * 1.4;
    return `brightness(${b}) contrast(${c}) saturate(${0.6 + contrast * 0.8})`;
  }, [brightness, contrast]);

  const screenClassNames = [
    'cv-tv-screen',
    screenOn ? 'on' : 'off',
    turningOff ? 'turning-off' : '',
    turningOn  ? 'turning-on'  : '',
  ].filter(Boolean).join(' ');

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

      {/* ── TV Stage ── */}
      <div className="cv-tv-stage">
        <div className="cv-tv">

          {/* Cabinet */}
          <div className="cv-tv-cabinet">
            <div className="cv-tv-cabinet-grain" />
            <div className="cv-tv-cabinet-edge-top" />
            <div className="cv-tv-cabinet-edge-bottom" />

            {/* Inner bezel */}
            <div className="cv-tv-bezel">
              <div className="cv-tv-bezel-grain" />

              {/* ── CRT Screen ── */}
              <div id="main-content" className="cv-tv-screen-well" style={{ cursor: 'none' }}>
                <div className="cv-tv-screen-dome" />
                <div className="cv-tv-screen-frame">
                  <div className={screenClassNames}>

                    <div
                      ref={screenContentRef}
                      className="cv-tv-screen-content"
                      style={{ filter: screenOn ? screenFilter : 'none' }}
                      onMouseMove={e => {
                        const r = screenContentRef.current?.getBoundingClientRect();
                        if (r) {
                          const pointer = !!(e.target as Element).closest('button, a, [role="option"]');
                          setScreenCursor({ x: e.clientX - r.left, y: e.clientY - r.top, pointer });
                        }
                      }}
                      onMouseLeave={() => setScreenCursor(null)}
                    >
                      {/* Boot overlay — always full-size, covers content during startup */}
                      {screenOn && bootPhase !== 'idle' && (
                        <div className={`cv-boot-overlay cv-boot-overlay--${bootPhase}`} aria-hidden="true">
                          {/* Scan flash bar — visible only during scanning phase */}
                          {bootPhase === 'scanning' && (
                            <div className="cv-boot-scan-bar" />
                          )}
                          {/* Logo — visible during logo + fading phases */}
                          {(bootPhase === 'logo' || bootPhase === 'fading') && (
                            <div className="cv-boot-logo">
                              <div className="cv-boot-logo-strip">
                                <span style={{ background: '#9a2a2a' }} />
                                <span style={{ background: '#d4a017' }} />
                                <span style={{ background: '#1f6f3e' }} />
                                <span style={{ background: '#2a4a8a' }} />
                              </div>
                              <span className="cv-boot-logo-name">Classicverse</span>
                            </div>
                          )}
                        </div>
                      )}

                      {screenOn && (
                        <>
                          {screenMode === 'info' && displayCar ? (
                            <CarScreenInfo car={displayCar} />
                          ) : (
                            <>
                              {displayCar?.image_url && failedImageUrl !== displayCar.image_url ? (
                                <Image
                                  src={displayCar.image_url}
                                  alt={`${displayCar.hero_car_name} by ${displayCar.manufacturer}`}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                  sizes="700px"
                                  priority
                                  onError={() => setFailedImageUrl(displayCar.image_url)}
                                />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#1a1612' }}>
                                  <p className="font-bold select-none text-center" style={{ fontSize: 28, color: '#6a6258', padding: '0 24px' }}>
                                    {displayCar?.hero_car_name ?? currentYear}
                                  </p>
                                  <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: 'var(--cv-brass)' }}>
                                    {displayCar?.era ?? 'Record in progress'}
                                  </p>
                                </div>
                              )}

                              {/* Lower-third car title */}
                              {displayCar && (
                                <div className="cv-tv-title-overlay" aria-hidden="true">
                                  <span className="cv-tv-era-label">{displayCar.era}</span>
                                  <span className="cv-tv-car-name">{displayCar.hero_car_name}</span>
                                  <span className="cv-tv-car-meta">
                                    {displayCar.manufacturer} · {displayCar.year} · {displayCar.country}
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {screenCursor && (
                            <div style={{
                              position: 'absolute',
                              left: screenCursor.pointer ? screenCursor.x - 6 : screenCursor.x,
                              top: screenCursor.pointer ? screenCursor.y - 2 : screenCursor.y,
                              pointerEvents: 'none', zIndex: 99,
                            }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={screenCursor.pointer ? '/cursors/pointer.png' : '/cursors/arrow.png'}
                                alt=""
                                width={48}
                                height={48}
                                style={{ display: 'block', imageRendering: 'pixelated' }}
                              />
                            </div>
                          )}

                          <div className={`cv-screen-glitch${screenGlitch ? ' cv-screen-glitch--active' : ''}`} aria-hidden="true" />
                        </>
                      )}

                      <SearchCommand
                        open={searchOpen}
                        onClose={() => setSearchOpen(false)}
                        cars={CARS}
                        onSelect={selectSearchResult}
                        inline
                      />
                    </div>

                    {/* Volume OSD */}
                    {screenOn && (
                      <div style={{
                        position: 'absolute', bottom: 20, left: 22,
                        pointerEvents: 'none', zIndex: 8,
                        opacity: volumeChanging ? 1 : 0,
                        transition: 'opacity 700ms ease-out',
                        display: 'flex', flexDirection: 'column', gap: 5,
                      }}>
                        <span style={{
                          fontSize: 7, letterSpacing: '0.24em', color: '#d4a017',
                          fontFamily: 'monospace', textTransform: 'uppercase',
                          textShadow: '0 0 8px #d4a01799',
                        }}>VOL</span>
                        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                          {Array.from({ length: 14 }).map((_, i) => {
                            const filled = (i + 1) / 14 <= volume;
                            const loud = i >= 11;
                            return (
                              <div key={i} style={{
                                width: 7, height: 7,
                                background: filled ? (loud ? '#e05050' : '#d4a017') : 'rgba(255,255,255,0.10)',
                                boxShadow: filled ? `0 0 5px ${loud ? '#e0505099' : '#d4a01799'}` : 'none',
                              }} />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="cv-tv-screen-scanlines" />
                    <div className="cv-tv-screen-vignette" />
                    <div className="cv-tv-screen-glare" />
                    <div className="cv-tv-screen-curve" />
                    {!screenOn && <div key="off-dot" className="cv-tv-off-dot" />}
                  </div>
                </div>
              </div>

              {/* ── Right control column ── */}
              <div className="cv-tv-right-col">
                <TimelineScrubber currentYear={currentYear} onYearSelect={goToYear} embedded />
                <BrandKnob brands={brandOptions} selectedBrand={selectedBrand} onBrandSelect={setSelectedBrand} embedded />

                {/* Knob plate */}
                <div className="cv-tv-knob-plate">
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center' }}>
                    <TvKnob label="BRIGHT" value={brightness} onChange={setBrightness} />
                    <TvKnob label="CONTRAST" value={contrast} onChange={setContrast} />
                    <TvKnob label="VOLUME" value={volume} onChange={handleVolumeChange} />
                  </div>

                  {/* SRCH · MODE · INFO row */}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center' }}>

                    {/* Search button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ fontSize: 7.5, letterSpacing: '0.16em', color: '#8a8480', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>SRCH</div>
                      <button
                        type="button"
                        onClick={() => setSearchOpen(o => !o)}
                        aria-label="Search cars"
                        aria-pressed={searchOpen}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                          background: searchOpen ? '#181614' : '#232120',
                          boxShadow: searchOpen ? [
                            'inset 0 4px 10px rgba(0,0,0,0.95)',
                            'inset 0 2px 4px rgba(0,0,0,0.85)',
                            '0 1px 0 rgba(255,255,255,0.04)',
                          ].join(', ') : [
                            'inset 0 1px 0 rgba(255,255,255,0.18)',
                            'inset 0 -1px 2px rgba(255,255,255,0.06)',
                            '0 6px 0 rgba(0,0,0,0.85)',
                            '0 8px 16px rgba(0,0,0,0.65)',
                            '0 2px 4px rgba(0,0,0,0.50)',
                          ].join(', '),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'box-shadow 200ms, background 200ms',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible' }}>
                          <g style={{ filter: searchOpen ? 'drop-shadow(0 0 2.5px #4a9edabb)' : 'none', transition: 'filter 200ms' }}>
                            <circle cx="11" cy="11" r="7" stroke={searchOpen ? '#4a9eda' : '#5e5c5a'} strokeWidth="2" style={{ transition: 'stroke 200ms' }} />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={searchOpen ? '#4a9eda' : '#5e5c5a'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
                          </g>
                        </svg>
                      </button>
                    </div>

                    {/* Theme toggle switch */}
                    <BatToggle label="MODE" value={isDark} onChange={toggleTheme} />

                    {/* Info / Image toggle button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ fontSize: 7.5, letterSpacing: '0.16em', color: '#8a8480', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>INFO</div>
                      <button
                        type="button"
                        onClick={() => setScreenMode(m => m === 'image' ? 'info' : 'image')}
                        aria-label={screenMode === 'image' ? 'Show car info' : 'Show car image'}
                        aria-pressed={screenMode === 'info'}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                          background: screenMode === 'info' ? '#181614' : '#232120',
                          boxShadow: screenMode === 'info' ? [
                            'inset 0 4px 10px rgba(0,0,0,0.95)',
                            'inset 0 2px 4px rgba(0,0,0,0.85)',
                            '0 1px 0 rgba(255,255,255,0.04)',
                          ].join(', ') : [
                            'inset 0 1px 0 rgba(255,255,255,0.18)',
                            'inset 0 -1px 2px rgba(255,255,255,0.06)',
                            '0 6px 0 rgba(0,0,0,0.85)',
                            '0 8px 16px rgba(0,0,0,0.65)',
                            '0 2px 4px rgba(0,0,0,0.50)',
                          ].join(', '),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'box-shadow 200ms, background 200ms',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ overflow: 'visible' }}>
                          <g style={{ filter: screenMode === 'info' ? 'drop-shadow(0 0 2.5px #4a9edabb)' : 'none', transition: 'filter 200ms' }}>
                            <circle cx="9" cy="4.5" r="1.2" fill={screenMode === 'info' ? '#4a9eda' : '#5e5c5a'} style={{ transition: 'fill 200ms' }} />
                            <line x1="9" y1="7.5" x2="9" y2="14" stroke={screenMode === 'info' ? '#4a9eda' : '#5e5c5a'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
                          </g>
                        </svg>
                      </button>
                    </div>

                  </div>

                  {/* Speaker grille */}
                  <div className="cv-tv-grille">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="cv-tv-grille-slot" />
                    ))}
                  </div>
                </div>

                {/* Brand plate row: logo + PWR button as siblings */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 4px' }}>
                  <div className="cv-tv-brand-plate" style={{ flex: 1 }}>
                    <div className="cv-tv-brand-mark-strip">
                      <span style={{ background: '#9a2a2a' }} />
                      <span style={{ background: '#d4a017' }} />
                      <span style={{ background: '#1f6f3e' }} />
                      <span style={{ background: '#2a4a8a' }} />
                    </div>
                    <span className="cv-tv-brand-name">Classicverse</span>
                  </div>

                  {/* Power button — rectangular, outside logo frame */}
                  <button
                    type="button"
                    onClick={() => setPowerState(!screenOn)}
                    aria-label={screenOn ? 'Turn off' : 'Turn on'}
                    aria-pressed={screenOn}
                    style={{
                      width: 44, height: 28,
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: screenOn ? '#181614' : '#232120',
                      boxShadow: screenOn ? [
                        'inset 0 4px 10px rgba(0,0,0,0.95)',
                        'inset 0 2px 4px rgba(0,0,0,0.85)',
                        '0 1px 0 rgba(255,255,255,0.04)',
                      ].join(', ') : [
                        'inset 0 1px 0 rgba(255,255,255,0.18)',
                        'inset 0 -1px 2px rgba(255,255,255,0.06)',
                        '0 4px 0 rgba(0,0,0,0.85)',
                        '0 6px 12px rgba(0,0,0,0.65)',
                        '0 2px 4px rgba(0,0,0,0.50)',
                      ].join(', '),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'box-shadow 200ms, background 200ms',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" style={{ overflow: 'visible' }}>
                      <g style={{ filter: screenOn ? 'drop-shadow(0 0 2.5px #d4a017bb)' : 'none', transition: 'filter 200ms' }}>
                        <path
                          d="M 5.5 4.2 A 6 6 0 1 0 12.5 4.2"
                          stroke={screenOn ? '#d4a017' : '#5e5c5a'}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          fill="none"
                          style={{ transition: 'stroke 200ms' }}
                        />
                        <line
                          x1="9" y1="2" x2="9" y2="7"
                          stroke={screenOn ? '#d4a017' : '#5e5c5a'}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          style={{ transition: 'stroke 200ms' }}
                        />
                      </g>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Base */}
          <div className="cv-tv-base"><div className="cv-tv-base-shadow" /></div>
          <div className="cv-tv-shadow" />
        </div>
      </div>

    </>
  );
}
