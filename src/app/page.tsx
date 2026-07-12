'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CARS, getCarForYear } from '@/data/cars';
import { getBrandLogo } from '@/data/brandLogos';
import RollerDial, { type RollerDialOption } from '@/components/RollerDial';
import VolumeDial from '@/components/VolumeDial';
import SearchCommand from '@/components/SearchCommand';
import HomeScreen, { FolderIcon, type Channel } from '@/components/HomeScreen';
import F1TeamsScreen from '@/components/F1TeamsScreen';
import CarGallery from '@/components/CarGallery';
import WinGallery from '@/components/WinGallery';
import { playPowerOn, playPowerOff, playButtonClick } from '@/lib/crtSound';
import { F1_TEAMS, getF1Team } from '@/data/f1Teams';
import { FERRARI_WINS } from '@/data/ferrariWins';
import { getWinImage } from '@/data/ferrariChassisImages';

const MIN_YEAR = 1885;
const MAX_YEAR = 1984; // A century of cars: 1885–1984 inclusive (100 years)

// Same shadow layers in both states (just scaled down when pressed) so toggling a
// circular chrome button doesn't collapse/expand its visual footprint and appear to move.
function circleButtonShadow(pressed: boolean) {
  return pressed
    ? [
      'inset 0 3px 6px rgba(0,0,0,0.9)',
      'inset 0 1px 3px rgba(0,0,0,0.8)',
      '0 1px 0 rgba(0,0,0,0.75)',
      '0 2px 3px rgba(0,0,0,0.40)',
      '0 1px 1px rgba(0,0,0,0.30)',
    ].join(', ')
    : [
      'inset 0 1px 0 rgba(255,255,255,0.18)',
      'inset 0 -1px 2px rgba(255,255,255,0.06)',
      '0 3px 0 rgba(0,0,0,0.75)',
      '0 4px 6px rgba(0,0,0,0.50)',
      '0 1px 2px rgba(0,0,0,0.35)',
    ].join(', ');
}

// Home "channels" — the desktop of the Classicverse set. Only Cars is live.
// Rendered as a single horizontal row (see HomeScreen), so it can overflow
// past the screen edges and get clipped by the CRT glass, like a physical
// channel strip you'd need to tune across rather than a menu that reflows.
const CHANNELS: Channel[] = [
  { id: 'cars', name: 'A century of cars', tagline: 'A century · 1885–1984', mark: '01', accent: '#9a2a2a', enabled: true },
  { id: 'f1', name: 'F1 Archive', tagline: 'Ferrari · 250 wins', mark: '02', accent: '#DC0000', enabled: true },
  { id: 'guide', name: 'Guide', tagline: "What's on", mark: '03', accent: '#d4a017', enabled: false },
  { id: 'radio', name: 'Radio', tagline: 'Period sound', mark: '04', accent: '#1f6f3e', enabled: false },
  { id: 'about', name: 'About', tagline: 'The project', mark: '05', accent: '#2a4a8a', enabled: false },
];

const HOME_ROWS: Channel[][] = [CHANNELS];

function clampYear(year: number) {
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
}

function clampWin(n: number) {
  return Math.max(1, Math.min(FERRARI_WINS.length, n));
}


// Brand logo mark — rendered on a light chip so every logo (dark SVGs, white-
// background JPGs) reads consistently over a photo or the dark info panel.
// Makers with no freely-licensed logo return undefined and render nothing.
function BrandLogoMark({ manufacturer, size = 40 }: { manufacturer: string; size?: number }) {
  const logo = getBrandLogo(manufacturer);
  if (!logo) return null;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: size, minWidth: size, padding: '0 9px',
        background: 'rgba(244,240,229,0.94)',
        borderRadius: 7,
        boxShadow: '0 1px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt=""
        style={{ height: size - 14, width: 'auto', maxWidth: 72, objectFit: 'contain', display: 'block' }}
      />
    </span>
  );
}

// A single Windows-98-style toolbar button: a raised grey bevel that inverts
// to a pressed/sunken bevel while held, classic outset-then-inset border trick.
function Win98NavButton({
  direction, onClick, disabled,
}: { direction: 'back' | 'forward'; onClick: () => void; disabled: boolean }) {
  const [pressed, setPressed] = useState(false);
  const active = pressed && !disabled;
  const raised = 'inset -1px -1px 0 0 #0a0a0a, inset 1px 1px 0 0 #ffffff, inset -2px -2px 0 0 #808080, inset 2px 2px 0 0 #dfdfdf';
  const sunken = 'inset 1px 1px 0 0 #0a0a0a, inset -1px -1px 0 0 #ffffff, inset 2px 2px 0 0 #808080, inset -2px -2px 0 0 #dfdfdf';
  const arrowColor = disabled ? '#868686' : '#000';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'back' ? 'Back' : 'Forward'}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        width: 30, height: 24, padding: 0, border: 'none',
        background: '#c0c0c0',
        boxShadow: active ? sunken : raised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transform: active ? 'translate(1px, 1px)' : 'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 0, height: 0,
          borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
          ...(direction === 'back'
            ? { borderRight: `7px solid ${arrowColor}`, marginRight: 1 }
            : { borderLeft: `7px solid ${arrowColor}`, marginLeft: 1 }),
        }}
      />
    </button>
  );
}

// Mute/unmute — same Win98 bevel button, a speaker glyph (sound waves when on,
// a cross when muted).
function Win98MuteButton({ muted, onClick }: { muted: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  const raised = 'inset -1px -1px 0 0 #0a0a0a, inset 1px 1px 0 0 #ffffff, inset -2px -2px 0 0 #808080, inset 2px 2px 0 0 #dfdfdf';
  const sunken = 'inset 1px 1px 0 0 #0a0a0a, inset -1px -1px 0 0 #ffffff, inset 2px 2px 0 0 #808080, inset -2px -2px 0 0 #dfdfdf';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        width: 30, height: 24, padding: 0, border: 'none',
        background: '#c0c0c0',
        boxShadow: pressed ? sunken : raised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transform: pressed ? 'translate(1px, 1px)' : 'none',
      }}
    >
      <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
        <path d="M1 5 H4 L8 1.5 V12.5 L4 9 H1 Z" fill="#000" />
        {muted ? (
          <path d="M10.5 5 L14.5 9 M14.5 5 L10.5 9" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
        ) : (
          <>
            <path d="M11 4.2 Q12.6 7 11 9.8" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M12.6 2.4 Q15.2 7 12.6 11.6" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}

// Replaces the breadcrumb trail: a Windows-98-style Back/Forward toolbar wired
// to real browser history (the app's own push/replace stack — see the seq
// tracking below), sitting in a sunken "groove" like a classic app toolbar.
function NavToolbar({
  canGoBack, canGoForward, onBack, onForward, muted, onToggleMute,
}: {
  canGoBack: boolean; canGoForward: boolean; onBack: () => void; onForward: () => void;
  muted: boolean; onToggleMute: () => void;
}) {
  return (
    <div
      style={{
        // Just enough inset to clear the screen's rounded corner (36px radius)
        // so the buttons read as content sitting inside the glass, not chrome
        // floating outside it — but tucked close to the corner, not low on the tube.
        // No explicit z-index: staying in normal DOM stacking order means the
        // scanline/vignette/glare/curve overlays (rendered later) paint over the
        // buttons too, the same way they do over the folders — immersed in the
        // screen, not a layer bolted on top of it.
        position: 'absolute', top: 14, left: 16,
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      <Win98NavButton direction="back" onClick={onBack} disabled={!canGoBack} />
      <Win98NavButton direction="forward" onClick={onForward} disabled={!canGoForward} />
      {/* Small gap, then mute — grouped with nav but set apart on the right of the cluster. */}
      <div style={{ width: 6 }} />
      <Win98MuteButton muted={muted} onClick={onToggleMute} />
    </div>
  );
}

// The single info page. The INFO button opens this from any content screen —
// it's always about the Classicverse project itself, never the selected item.
function AboutClassicverse({ onClose }: { onClose: () => void }) {
  return (
    <div className="cv-screen-info absolute inset-0 overflow-y-auto p-5" style={{ background: 'rgba(10,10,8,0.97)', paddingTop: 44, zIndex: 7 }}>
      <div className="space-y-5 pb-8" style={{ maxWidth: 560 }}>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: '#b0a898', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <span aria-hidden="true">‹</span> Back
        </button>

        <div className="flex items-center gap-3">
          <div className="cv-boot-logo-strip" style={{ display: 'flex', gap: 3, width: 44 }}>
            <span style={{ flex: 1, height: 18, background: '#9a2a2a' }} />
            <span style={{ flex: 1, height: 18, background: '#d4a017' }} />
            <span style={{ flex: 1, height: 18, background: '#1f6f3e' }} />
            <span style={{ flex: 1, height: 18, background: '#2a4a8a' }} />
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: '#e8e4dc', lineHeight: 1.05 }}>
            Classicverse
          </h2>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: '#c8c2b8' }}>
          Classicverse is an interactive archive of the automobile&apos;s first century — one
          landmark car for every year from 1885 to 1984, framed as channels on a vintage
          television set. Turn the dial, tune through the decades, and read each machine in the
          context of the world that built it.
        </p>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8a8680' }}>A century of cars</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#c8c2b8' }}>
            From Karl Benz&apos;s Patent-Motorwagen to the icons of the early 1980s, every year is
            represented by a single defining car chosen for its historical, technical, or cultural
            significance — a hundred years of engineering told one landmark at a time.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8a8680' }}>About this project</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#c8c2b8' }}>
            It&apos;s a portfolio piece, not a marketplace — an exercise in product thinking,
            historical research, data modelling, and interaction design. Photography is drawn from
            freely-licensed Creative Commons and public-domain sources, with each maker shown under
            its own marque.
          </p>
        </section>

        <p className="text-xs leading-relaxed" style={{ color: '#6a6459' }}>
          Press the INFO button again, or the Back link above, to return to the archive.
        </p>
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
      <div style={{ fontSize: 7.5, letterSpacing: '0.16em', color: '#ffffff', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
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
            background: '#c4c4bc',
            boxShadow: [
              'inset 0 1px 1px rgba(255,255,255,0.45)',
              'inset 0 -2px 3px rgba(0,0,0,0.35)',
              '0 4px 8px rgba(0,0,0,0.62)',
            ].join(', '),
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {/* Invisible rotating hand — no visible cap layer, just pivots the indicator line */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `rotate(${angle}deg)`,
            pointerEvents: 'none',
          }}>
            {/* Indicator line — a clear solid line, dark for contrast against the silver top */}
            <div style={{
              position: 'absolute', left: '50%', top: '9%',
              width: 3, height: '38%',
              background: '#2a2824',
              transform: 'translateX(-50%)',
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentYear, setCurrentYear] = useState(MIN_YEAR);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [view, setView]               = useState<'home' | 'gallery' | 'cars' | 'f1-teams' | 'f1-gallery' | 'f1-archive'>('home');
  // Last content view we came from, so the HOME button can toggle back off Home.
  const [lastContentView, setLastContentView] = useState<'gallery' | 'cars' | 'f1-teams' | 'f1-gallery' | 'f1-archive'>('gallery');
  const [channelId, setChannelId]     = useState('cars');
  const [teamId, setTeamId]           = useState('ferrari');
  const [winNumber, setWinNumber]     = useState(1);
  const [screenMode, setScreenMode]   = useState<'image' | 'info'>('image');
  const [screenGlitch, setScreenGlitch] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  // TV power + image adjustments
  const [brightness, setBrightness] = useState(0.55);
  const [contrast, setContrast]     = useState(0.6);
  const [volume, setVolume]         = useState(0.5);
  const [muted, setMuted]           = useState(false);
  const mutedRef = useRef(false);
  const [screenOn, setScreenOn]       = useState(true);
  const [turningOff, setTurningOff]   = useState(false);
  const [turningOn, setTurningOn]     = useState(false);
  const [bootPhase, setBootPhase]     = useState<'idle' | 'scanning' | 'logo' | 'fading'>('idle');
  const [volumeChanging, setVolumeChanging] = useState(false);
  const [screenCursor, setScreenCursor] = useState<{ x: number; y: number; pointer: boolean } | null>(null);
  const screenContentRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef({ on: true, turningOff: false, turningOn: false });
  const volumeRef = useRef(0.5);
  const volumeHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const displayCar = getCarForYear(currentYear);

  // Home is a flat, numbered channel list (01-05), like a real tuner dial —
  // one knob steps straight through it. The desktop grid is just a 2-column
  // layout of those channels, not a control axis of its own.
  const homeChannelOptions = useMemo<RollerDialOption[]>(
    () => CHANNELS.map((ch) => ({
      id: ch.id,
      mark: ch.mark,
      count: 0,
      icon: (
        <div style={{ transform: 'scale(0.56)', transformOrigin: 'center' }}>
          <FolderIcon channel={ch} />
        </div>
      ),
    })),
    [],
  );

  // The Cars top knob works exactly like the Home channel knob — it scrolls
  // through content (car images), not a bare year number.
  const carRollerOptions = useMemo<RollerDialOption[]>(
    () => [...CARS]
      .sort((a, b) => a.year - b.year)
      .map((car) => ({
        id: String(car.year),
        mark: car.hero_car_name.slice(0, 3).toUpperCase(),
        count: 0,
        logoSrc: car.image_url,
      })),
    [],
  );

  // F1 Archive: the teams roller (steps Ferrari / Red Bull / …) and, inside a
  // team, the wins roller (steps through the 250 records) — same knob, same
  // physics as the channel and car rollers above.
  const f1TeamOptions = useMemo<RollerDialOption[]>(
    () => F1_TEAMS.map((t) => ({
      id: t.id,
      mark: t.name.slice(0, 3).toUpperCase(),
      count: 0,
    })),
    [],
  );

  const winRollerOptions = useMemo<RollerDialOption[]>(
    () => FERRARI_WINS.map((w) => ({
      id: String(w.number),
      mark: w.chassis.slice(0, 3).toUpperCase(),
      count: 0,
    })),
    [],
  );

  const displayWin = FERRARI_WINS[clampWin(winNumber) - 1];

  const selectChannel = useCallback((id: string | null) => {
    if (id) setChannelId(id);
  }, []);

  const goHome = useCallback(() => {
    setView('home');
    setSearchOpen(false);
    setScreenMode('image');
  }, []);

  const openChannel = useCallback((id: string) => {
    const ch = CHANNELS.find((c) => c.id === id);
    if (!ch?.enabled) return;
    if (ch.id === 'cars') { setScreenMode('image'); setView('gallery'); return; }
    if (ch.id === 'f1')   { setScreenMode('image'); setView('f1-teams'); return; }
  }, []);

  // Open one car full-screen (the cars view has its own prev/next navigation).
  const openCar = useCallback((year: number) => {
    setCurrentYear(clampYear(year));
    setScreenMode('image');
    setView('cars');
  }, []);

  // F1 Archive navigation — team → win gallery → one win full-screen (mirrors
  // channel → century-of-cars gallery → one car full-screen).
  const openTeam = useCallback((id: string) => {
    const t = getF1Team(id);
    if (!t?.enabled) return;
    setTeamId(id);
    setWinNumber(1);
    setScreenMode('image');
    setView('f1-gallery');
  }, []);

  // Open one win full-screen (the f1-archive view has its own prev/next navigation).
  const openWin = useCallback((n: number) => {
    setWinNumber(clampWin(n));
    setScreenMode('image');
    setView('f1-archive');
  }, []);

  const goToWin       = useCallback((n: number) => setWinNumber(clampWin(n)), []);
  const goToPrevWin   = useCallback(() => setWinNumber(n => clampWin(n - 1)), []);
  const goToNextWin   = useCallback(() => setWinNumber(n => clampWin(n + 1)), []);
  const goToPrevWin10 = useCallback(() => setWinNumber(n => clampWin(n - 10)), []);
  const goToNextWin10 = useCallback(() => setWinNumber(n => clampWin(n + 10)), []);

  const goToYear        = useCallback((year: number) => setCurrentYear(clampYear(year)), []);
  const goToPrevYear    = useCallback(() => setCurrentYear(y => clampYear(y - 1)), []);
  const goToNextYear    = useCallback(() => setCurrentYear(y => clampYear(y + 1)), []);
  const goToPrevDecade  = useCallback(() => setCurrentYear(y => clampYear(y - 10)), []);
  const goToNextDecade  = useCallback(() => setCurrentYear(y => clampYear(y + 10)), []);
  const selectSearchResult = useCallback((year: number) => {
    setCurrentYear(clampYear(year));
    setView('cars');
  }, []);

  // ── Browser history / deep-linking ──
  // Each screen is treated like a real page: section-level navigation pushes a
  // history entry (so the browser Back/Forward buttons walk the trail), while
  // scrubbing within a section (year, win, info toggle) only replaces the current
  // entry so Back doesn't step through every single car. State also round-trips
  // through the URL query, so a refresh or shared link restores the same screen.
  //
  // This goes through next/navigation's router, not raw window.history — the
  // App Router patches history.pushState/replaceState and listens for its own
  // popstate globally; entries it didn't create via router.push/replace aren't
  // in its client-side cache, so popping back to one made it fall back to a
  // full page reload (killing any in-flight sound and flashing the whole TV).
  // Routing everything through router.push/replace keeps its cache consistent,
  // so Back/Forward stay soft, in-app transitions.
  const router = useRouter();
  const searchParams = useSearchParams();
  const VALID_VIEWS = useMemo(() => ['home', 'gallery', 'cars', 'f1-teams', 'f1-gallery', 'f1-archive'] as const, []);

  const applyNavFromParams = useCallback((p: URLSearchParams) => {
    const raw = p.get('v') ?? 'home';
    const v = (VALID_VIEWS as readonly string[]).includes(raw) ? (raw as typeof view) : 'home';
    setView(v);
    if (v !== 'home') setLastContentView(v as 'gallery' | 'cars' | 'f1-teams' | 'f1-gallery' | 'f1-archive');
    const year = Number(p.get('year')); if (year) setCurrentYear(clampYear(year));
    const team = p.get('team'); if (team) setTeamId(team);
    const win = Number(p.get('win')); if (win) setWinNumber(clampWin(win));
    setScreenMode(p.get('mode') === 'info' ? 'info' : 'image');
    setSearchOpen(false);
  }, [VALID_VIEWS]);

  const hydratedRef = useRef(false);
  const prevSectionRef = useRef<string | null>(null);

  // The Win98 toolbar's Back/Forward availability tracks the app's OWN pushed
  // stack (a plain list of "section" signatures + a position pointer) rather
  // than the whole tab history, since router.push/replace don't accept a
  // custom state payload the way raw history.pushState did.
  const navStackRef = useRef<string[]>([]);
  const navPosRef = useRef(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const updateNavFlags = useCallback(() => {
    setCanGoBack(navPosRef.current > 0);
    setCanGoForward(navPosRef.current < navStackRef.current.length - 1);
  }, []);
  const goBack = useCallback(() => { playButtonClick(mutedRef.current ? 0 : volumeRef.current); router.back(); }, [router]);
  const goForward = useCallback(() => { playButtonClick(mutedRef.current ? 0 : volumeRef.current); router.forward(); }, [router]);

  const sectionOf = useCallback((v: string, team: string) => (
    v + (v === 'f1-teams' || v === 'f1-gallery' || v === 'f1-archive' ? `:${team}` : '')
  ), []);

  // Hydrate once from the initial URL so refresh / deep links land on the
  // right screen. Reading searchParams must happen in an effect (not a lazy
  // initializer), since this client component is still server-rendered first.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyNavFromParams(searchParams);
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror OUR OWN nav-state changes into the URL via the router.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const section = sectionOf(view, teamId);
    const p = new URLSearchParams();
    if (view !== 'home') p.set('v', view);
    if (view === 'cars' || view === 'gallery') p.set('year', String(currentYear));
    if (view === 'f1-teams' || view === 'f1-gallery' || view === 'f1-archive') p.set('team', teamId);
    if (view === 'f1-gallery' || view === 'f1-archive') p.set('win', String(winNumber));
    if ((view === 'cars' || view === 'f1-archive') && screenMode === 'info') p.set('mode', 'info');
    const qs = p.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

    if (prevSectionRef.current === null || prevSectionRef.current === section) {
      router.replace(url, { scroll: false });
      if (prevSectionRef.current === null) {
        navStackRef.current = [section];
        navPosRef.current = 0;
      }
    } else {
      router.push(url, { scroll: false });
      navStackRef.current = [...navStackRef.current.slice(0, navPosRef.current + 1), section];
      navPosRef.current = navStackRef.current.length - 1;
    }
    prevSectionRef.current = section;
    updateNavFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentYear, teamId, winNumber, screenMode]);

  // React to changes in the URL that we didn't just write ourselves — i.e. the
  // browser's native Back/Forward. Next's router updates searchParams on any
  // navigation (including our own router.push/replace above), so this guards
  // on "does the resulting section already match what we just wrote" to skip
  // re-processing our own writes and only react to genuine external ones.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const raw = searchParams.get('v') ?? 'home';
    const v = (VALID_VIEWS as readonly string[]).includes(raw) ? raw : 'home';
    const team = searchParams.get('team') ?? teamId;
    const section = sectionOf(v, team);
    if (section === prevSectionRef.current) return;

    applyNavFromParams(searchParams);
    const idx = navStackRef.current.indexOf(section);
    if (idx !== -1) {
      navPosRef.current = idx;
    } else {
      navStackRef.current = [...navStackRef.current.slice(0, navPosRef.current + 1), section];
      navPosRef.current = navStackRef.current.length - 1;
    }
    prevSectionRef.current = section;
    updateNavFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
  }, [currentYear, screenMode, view, winNumber, teamId]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (!screenOn) return;
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); return; }
        // Step back one level: archive → gallery → teams → home; cars → gallery → home.
        if (view === 'f1-archive') { e.preventDefault(); setScreenMode('image'); setView('f1-gallery'); return; }
        if (view === 'f1-gallery') { e.preventDefault(); setScreenMode('image'); setView('f1-teams'); return; }
        if (view === 'f1-teams')   { e.preventDefault(); goHome(); return; }
        if (view === 'cars')       { e.preventDefault(); setScreenMode('image'); setView('gallery'); return; }
        if (view === 'gallery')    { e.preventDefault(); goHome(); return; }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
        return;
      }
      if (view === 'cars' || view === 'gallery') {
        if (view === 'gallery' && e.key === 'Enter') { e.preventDefault(); openCar(currentYear); return; }
        if (e.key === 'ArrowLeft'  && e.shiftKey) { e.preventDefault(); goToPrevDecade(); return; }
        if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); goToNextDecade(); return; }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goToPrevYear(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); goToNextYear(); return; }
      }
      if (view === 'f1-archive' || view === 'f1-gallery') {
        if (view === 'f1-gallery' && e.key === 'Enter') { e.preventDefault(); openWin(winNumber); return; }
        if (e.key === 'ArrowLeft'  && e.shiftKey) { e.preventDefault(); goToPrevWin10(); return; }
        if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); goToNextWin10(); return; }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goToPrevWin(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); goToNextWin(); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToPrevYear, goToNextYear, goToPrevDecade, goToNextDecade, goToPrevWin, goToNextWin, goToPrevWin10, goToNextWin10, view, searchOpen, goHome, screenOn, openCar, openWin, currentYear, winNumber]);

  // TV power control
  const setPowerState = useCallback((newOn: boolean) => {
    if (newOn === powerRef.current.on) return;
    if (newOn && !powerRef.current.turningOn) {
      playPowerOn(mutedRef.current ? 0 : volumeRef.current);
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
      playPowerOff(mutedRef.current ? 0 : volumeRef.current);
      setBootPhase('idle');
      setTurningOff(true);
      setScreenOn(false);
      setSearchOpen(false);
      setScreenMode('image');
      powerRef.current.on = false;
      powerRef.current.turningOff = true;
      setTimeout(() => { setTurningOff(false); powerRef.current.turningOff = false; }, 700);
    }
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    volumeRef.current = v;
    setVolumeChanging(true);
    clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setVolumeChanging(false), 1600);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m;
      mutedRef.current = next;
      return next;
    });
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

  // Physical chrome buttons are pure inputs: they light/depress ONLY while the
  // user is actually pressing them — never from screen or nav state. The data
  // flow is one-way (button → screen), so interacting with on-screen content
  // never back-lights a button.
  const [pressedButton, setPressedButton] = useState<'home' | 'search' | 'info' | null>(null);
  const pressBtn = (id: 'home' | 'search' | 'info') => ({
    onPointerDown: () => setPressedButton(id),
    onPointerUp: () => setPressedButton(null),
    onPointerLeave: () => setPressedButton(p => (p === id ? null : p)),
    onPointerCancel: () => setPressedButton(null),
  });

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
        {view === 'home'
          ? `Home: ${CHANNELS.find(c => c.id === channelId)?.name ?? 'Classicverse'} highlighted`
          : view === 'f1-teams'
          ? `F1 Archive: ${getF1Team(teamId)?.name ?? 'Ferrari'} highlighted`
          : view === 'f1-archive'
          ? `Ferrari win ${displayWin?.number} of ${FERRARI_WINS.length}: ${displayWin?.grand_prix} Grand Prix ${displayWin?.year}, ${displayWin?.driver}, ${displayWin?.chassis}`
          : `${currentYear}: ${displayCar ? `${displayCar.hero_car_name} by ${displayCar.manufacturer}` : 'Record in progress'}`}
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
                <div
                  ref={screenContentRef}
                  className={screenClassNames}
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

                      {screenOn && view === 'home' && (
                        <HomeScreen
                          rows={HOME_ROWS}
                          selectedId={channelId}
                          onSelect={setChannelId}
                          onOpen={openChannel}
                        />
                      )}

                      {screenOn && view === 'gallery' && (
                        <CarGallery
                          cars={CARS}
                          selectedYear={currentYear}
                          onOpen={openCar}
                        />
                      )}

                      {screenOn && view === 'cars' && (
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
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                                <BrandLogoMark manufacturer={displayCar.manufacturer} size={48} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                  <span className="cv-tv-car-name">{displayCar.hero_car_name}</span>
                                  <span className="cv-tv-car-meta">
                                    {displayCar.manufacturer} · {displayCar.year} · {displayCar.country}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {screenOn && view === 'f1-teams' && (
                        <F1TeamsScreen
                          teams={F1_TEAMS}
                          selectedId={teamId}
                          onSelect={setTeamId}
                          onOpen={openTeam}
                        />
                      )}

                      {screenOn && view === 'f1-gallery' && (
                        <WinGallery
                          wins={FERRARI_WINS}
                          selectedNumber={winNumber}
                          onOpen={openWin}
                        />
                      )}

                      {screenOn && view === 'f1-archive' && displayWin && (() => {
                        const winImg = getWinImage(displayWin);
                        return (
                          <>
                            {winImg?.src && failedImageUrl !== winImg.src ? (
                              <Image
                                src={winImg.src}
                                alt={`Ferrari ${displayWin.chassis} — win №${displayWin.number}, ${displayWin.grand_prix} Grand Prix ${displayWin.year}`}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="700px"
                                priority
                                onError={() => setFailedImageUrl(winImg.src)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#1a1612' }}>
                                <p className="font-bold select-none text-center" style={{ fontSize: 28, color: '#6a6258', padding: '0 24px' }}>
                                  Ferrari {displayWin.chassis}
                                </p>
                                <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: 'var(--cv-brass)' }}>
                                  {displayWin.grand_prix} · {displayWin.year}
                                </p>
                              </div>
                            )}

                            {/* Lower-third win title */}
                            <div className="cv-tv-title-overlay" aria-hidden="true">
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                                <div style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                  minWidth: 68, padding: '8px 14px', borderRadius: 9,
                                  background: '#c0c0c0', color: '#1a1a1a', lineHeight: 1,
                                }}>
                                  <span style={{ fontSize: 11, letterSpacing: '0.16em', opacity: 0.7 }}>WIN</span>
                                  <span style={{ fontSize: 32, fontWeight: 800 }}>{displayWin.number}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                  <span className="cv-tv-car-name">{displayWin.grand_prix} Grand Prix</span>
                                  <span className="cv-tv-car-meta">
                                    {displayWin.year} · {displayWin.driver} · {displayWin.chassis}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      {screenOn && bootPhase === 'idle' && !searchOpen
                        && screenMode === 'info' && (view === 'cars' || view === 'gallery' || view === 'f1-gallery' || view === 'f1-archive') && (
                        <AboutClassicverse onClose={() => setScreenMode('image')} />
                      )}

                      {screenOn && bootPhase === 'idle' && !searchOpen && (
                        <NavToolbar
                          canGoBack={canGoBack}
                          canGoForward={canGoForward}
                          onBack={goBack}
                          onForward={goForward}
                          muted={muted}
                          onToggleMute={toggleMute}
                        />
                      )}

                      {screenOn && screenCursor && (
                        <div style={{
                          position: 'absolute',
                          left: screenCursor.pointer ? screenCursor.x - 4 : screenCursor.x,
                          top: screenCursor.pointer ? screenCursor.y - 1 : screenCursor.y,
                          pointerEvents: 'none', zIndex: 99,
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screenCursor.pointer ? '/cursors/pointer.png' : '/cursors/arrow.png'}
                            alt=""
                            width={32}
                            height={32}
                            style={{ display: 'block', imageRendering: 'pixelated' }}
                          />
                        </div>
                      )}

                      {screenOn && (
                        <div className={`cv-screen-glitch${screenGlitch ? ' cv-screen-glitch--active' : ''}`} aria-hidden="true" />
                      )}

                      <SearchCommand
                        open={searchOpen}
                        onClose={() => setSearchOpen(false)}
                        cars={CARS}
                        onSelect={selectSearchResult}
                        inline
                      />

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

              {/* ── Right control column ── */}
              <div className="cv-tv-right-col">
                {/* Top knob: always Volume, regardless of screen. */}
                <VolumeDial value={volume} onChange={handleVolumeChange} embedded ariaLabel="Volume" />

                {/* Bottom knob: the primary tuning/navigation control — steps
                    through channels at Home, teams in the F1 lobby, and content
                    (cars / wins) inside a channel. Same roller, same interaction. */}
                {view === 'home' ? (
                  <RollerDial
                    options={homeChannelOptions}
                    selectedId={channelId}
                    onSelect={selectChannel}
                    embedded
                    showAll={false}
                    ariaLabel="Channel selector"
                  />
                ) : view === 'f1-teams' ? (
                  <RollerDial
                    options={f1TeamOptions}
                    selectedId={teamId}
                    onSelect={(id) => { if (id) setTeamId(id); }}
                    embedded
                    showAll={false}
                    ariaLabel="Team selector"
                  />
                ) : view === 'f1-gallery' || view === 'f1-archive' ? (
                  <RollerDial
                    options={winRollerOptions}
                    selectedId={String(winNumber)}
                    onSelect={(id) => { if (id) goToWin(Number(id)); }}
                    embedded
                    showAll={false}
                    ariaLabel="Win selector"
                  />
                ) : (
                  <RollerDial
                    options={carRollerOptions}
                    selectedId={String(currentYear)}
                    onSelect={(id) => { if (id) goToYear(Number(id)); }}
                    embedded
                    showAll={false}
                    ariaLabel="Car selector"
                  />
                )}

                {/* BRIGHT / CONTRAST — sit on the bezel, outside the knob plate */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center' }}>
                  <TvKnob size={30} label="BRIGHT" value={brightness} onChange={setBrightness} />
                  <TvKnob size={30} label="CONTRAST" value={contrast} onChange={setContrast} />
                </div>

                {/* Speaker grille — perforated dot panel, brand plate centered on it */}
                <div className="cv-tv-speaker-grille" style={{ margin: '0 4px', flex: 1, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="cv-tv-brand-plate">
                    <div className="cv-tv-brand-mark-strip">
                      <span style={{ background: '#9a2a2a' }} />
                      <span style={{ background: '#d4a017' }} />
                      <span style={{ background: '#1f6f3e' }} />
                      <span style={{ background: '#2a4a8a' }} />
                    </div>
                    <span className="cv-tv-brand-name">Classicverse</span>
                  </div>
                </div>

                {/* HOME · SRCH · INFO · power — all buttons, same row, bottom of the column */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>

                    {/* HOME: always visible; highlighted whenever the Home desktop is showing */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (view === 'home') {
                            // Already Home: a second press closes any open search,
                            // otherwise toggles back off Home to the last content view.
                            if (searchOpen) { setSearchOpen(false); return; }
                            setView(lastContentView);
                            return;
                          }
                          setLastContentView(view);
                          goHome();
                        }}
                        disabled={!screenOn}
                        aria-label={view === 'home' ? 'Leave Home' : 'Back to Home'}
                        {...pressBtn('home')}
                        aria-pressed={pressedButton === 'home'}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: screenOn ? 'pointer' : 'default',
                          background: pressedButton === 'home' ? '#1c1512' : '#3a2f26',
                          boxShadow: circleButtonShadow(pressedButton === 'home'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'box-shadow 200ms, background 200ms',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ overflow: 'visible' }}>
                          <g style={{ filter: pressedButton === 'home' ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
                            <path d="M2.5 8.5 L9 3 L15.5 8.5" stroke={pressedButton === 'home' ? '#ffffff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 200ms' }} />
                            <path d="M4.5 7.5 V15 H13.5 V7.5" stroke={pressedButton === 'home' ? '#ffffff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 200ms' }} />
                          </g>
                        </svg>
                      </button>
                    </div>

                    {/* Search button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <button
                        type="button"
                        onClick={() => setSearchOpen(o => !o)}
                        disabled={!screenOn}
                        aria-label={searchOpen ? 'Close search' : 'Search cars'}
                        {...pressBtn('search')}
                        aria-pressed={pressedButton === 'search'}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: screenOn ? 'pointer' : 'default',
                          background: pressedButton === 'search' ? '#1c1512' : '#3a2f26',
                          boxShadow: circleButtonShadow(pressedButton === 'search'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'box-shadow 200ms, background 200ms',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible' }}>
                          <g style={{ filter: pressedButton === 'search' ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
                            <circle cx="11" cy="11" r="7" stroke={pressedButton === 'search' ? '#ffffff' : '#b8ada2'} strokeWidth="2" style={{ transition: 'stroke 200ms' }} />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={pressedButton === 'search' ? '#ffffff' : '#b8ada2'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
                          </g>
                        </svg>
                      </button>
                    </div>

                    {/* INFO: open highlighted channel at Home; show car detail inside Cars */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <button
                        type="button"
                        onClick={() => {
                          // Grid views open the highlighted item into its detail (info).
                          if (view === 'home') { setSearchOpen(false); openChannel(channelId); return; }
                          if (view === 'f1-teams') { setSearchOpen(false); openTeam(teamId); return; }
                          // Detail views (cars, f1-archive): closing search re-activates info,
                          // otherwise a second press toggles back off info to the image.
                          if (searchOpen) { setSearchOpen(false); setScreenMode('info'); return; }
                          setScreenMode(m => (m === 'info' ? 'image' : 'info'));
                        }}
                        disabled={!screenOn}
                        aria-label={
                          view === 'home' || view === 'f1-teams' ? 'Open highlighted item'
                          : screenMode === 'info' ? 'Close About' : 'About Classicverse'
                        }
                        {...pressBtn('info')}
                        aria-pressed={pressedButton === 'info'}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: screenOn ? 'pointer' : 'default',
                          background: pressedButton === 'info' ? '#1c1512' : '#3a2f26',
                          boxShadow: circleButtonShadow(pressedButton === 'info'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'box-shadow 200ms, background 200ms',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ overflow: 'visible' }}>
                          <g style={{ filter: pressedButton === 'info' ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
                            <circle cx="9" cy="4.5" r="1.2" fill={pressedButton === 'info' ? '#ffffff' : '#b8ada2'} style={{ transition: 'fill 200ms' }} />
                            <line x1="9" y1="7.5" x2="9" y2="14" stroke={pressedButton === 'info' ? '#ffffff' : '#b8ada2'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
                          </g>
                        </svg>
                      </button>
                    </div>

                  </div>

                  {/* Power button — squared off (rounded corners) to stand apart from search/home/info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <button
                      type="button"
                      onClick={() => setPowerState(!screenOn)}
                      aria-label={screenOn ? 'Turn off' : 'Turn on'}
                      aria-pressed={screenOn}
                      style={{
                        width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: screenOn ? '#1c1512' : '#3a2f26',
                        boxShadow: circleButtonShadow(screenOn),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'box-shadow 200ms, background 200ms',
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ overflow: 'visible' }}>
                        <g style={{ filter: screenOn ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
                          <path
                            d="M 5.5 4.2 A 6 6 0 1 0 12.5 4.2"
                            stroke={screenOn ? '#ffffff' : '#b8ada2'}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            fill="none"
                            style={{ transition: 'stroke 200ms' }}
                          />
                          <line
                            x1="9" y1="2" x2="9" y2="7"
                            stroke={screenOn ? '#ffffff' : '#b8ada2'}
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
          </div>

          {/* Base */}
          <div className="cv-tv-base"><div className="cv-tv-base-shadow" /></div>
          <div className="cv-tv-shadow" />
        </div>
      </div>

    </>
  );
}
