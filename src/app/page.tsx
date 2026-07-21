'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore, Suspense } from 'react';
import RollerDial, { type RollerDialOption } from '@/components/RollerDial';
import VolumeDial from '@/components/VolumeDial';
import { DESKTOP } from '@/os/registry';
import { useOSNav } from '@/os/useOSNav';
import { childPath, parentPath, resolvePath, siblingsOf, splitPath, joinPath, ROOT } from '@/os/path';
import { isFolder, type OSApi, type OSNode } from '@/os/types';
import FolderView from '@/os/FolderView';
import Toolbar from '@/os/Toolbar';
import SearchPanel from '@/os/SearchPanel';
import ScreenCursor from '@/os/ScreenCursor';
import { getTuner, getServerTuner, subscribeTuner } from '@/os/tuner';
import * as sfx from '@/os/sound';

/* ── Round TV knob (BRIGHT / CONTRAST) ── */
function TvKnob({
  size = 30, value, onChange, label, accent = '#cfcfcf', startAngle = -135, endAngle = 135,
}: {
  size?: number; value: number; onChange: (v: number) => void; label: string;
  accent?: string; startAngle?: number; endAngle?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ lastAng: number; val: number; cx: number; cy: number } | null>(null);
  const angle = startAngle + (endAngle - startAngle) * value;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragRef.current = { lastAng: Math.atan2(e.clientY - cy, e.clientX - cx), val: Math.max(0, Math.min(1, value)), cx, cy };
    ref.current!.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const ang = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
    // Incremental, like VolumeDial: measuring from the grab let a drag through
    // the gap at the bottom wrap past ±π and snap the knob end to end.
    let delta = ang - d.lastAng;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const range = (endAngle - startAngle) * Math.PI / 180;
    d.lastAng = ang;
    d.val = Math.max(0, Math.min(1, d.val + delta / range));
    onChange(d.val);
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    onChange(Math.max(0, Math.min(1, value + (e.deltaY > 0 ? -1 : 1) * 0.05)));
  };

  const pad = 9;
  const total = size + pad * 2;
  const arcR = total / 2 - 4;
  const cx = total / 2, cy = total / 2;
  const toXY = (deg: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + arcR * Math.cos(rad), y: cy + arcR * Math.sin(rad) };
  };
  const p0 = toXY(startAngle), p1 = toXY(endAngle), pV = toXY(angle);
  const sweep = (endAngle - startAngle) * value;
  const trackD = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  const valD = value > 0.01
    ? `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${arcR} ${arcR} 0 ${sweep > 180 ? 1 : 0} 1 ${pV.x.toFixed(2)} ${pV.y.toFixed(2)}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ position: 'relative', width: total, height: total }}>
        <svg width={total} height={total} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <path d={trackD} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={2.5} strokeLinecap="round" />
          {valD && <path d={valD} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />}
        </svg>
        <div
          ref={ref}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}
          style={{
            position: 'absolute', top: pad, left: pad, width: size, height: size,
            borderRadius: '50%', background: '#c4c4bc',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.62)',
            cursor: 'grab', userSelect: 'none', touchAction: 'none',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, transform: `rotate(${angle}deg)`, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: '50%', top: '9%', width: 3, height: '38%', background: '#2a2824', transform: 'translateX(-50%)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function circleButtonShadow(pressed: boolean) {
  return pressed
    ? 'inset 0 3px 6px rgba(0,0,0,0.9), inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(0,0,0,0.75), 0 2px 3px rgba(0,0,0,0.40), 0 1px 1px rgba(0,0,0,0.30)'
    : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 2px rgba(255,255,255,0.06), 0 3px 0 rgba(0,0,0,0.75), 0 4px 6px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.35)';
}

type BootPhase = 'idle' | 'warming' | 'snow' | 'logo' | 'fading';

/**
 * Whether the set was left switched on.
 *
 * A television doesn't switch itself off because the page was reloaded — a
 * refresh isn't the same gesture as reaching for the power button. The set
 * still arrives off the first time anyone opens it, because nothing has been
 * stored yet; after that it comes back the way it was left.
 */
const POWER_KEY = 'cv-set-power';

function readLeftOn(): boolean {
  try {
    return localStorage.getItem(POWER_KEY) === 'on';
  } catch {
    // A full or disabled localStorage costs the memory, not the set.
    return false;
  }
}

/* Read once at startup and never again — nothing changes it behind our back,
   so there is no subscription to keep. Going through useSyncExternalStore
   rather than an effect is what keeps the restore off the critical path: the
   server and the hydrating render both see `false`, React swaps in the real
   value before it paints, and the set never flashes dark on its way to on. */
const subscribeToNothing = () => () => {};
const leftOnDuringSSR = () => false;

function rememberPower(on: boolean) {
  try {
    localStorage.setItem(POWER_KEY, on ? 'on' : 'off');
  } catch {
    // As above — never let storage take the set down with it.
  }
}

function Classicverse() {
  const nav = useOSNav();

  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(0.55);
  const [contrast, setContrast] = useState(0.6);
  const [searchOpen, setSearchOpen] = useState(false);
  /** Highlight override, valid only for the path it was made on. */
  const [selection, setSelection] = useState<{ path: string; id: string } | null>(null);
  const [screenGlitch, setScreenGlitch] = useState(false);
  const [volumeChanging, setVolumeChanging] = useState(false);

  /**
   * Is the set on.
   *
   * Off the first time anyone opens it, the way a television in a room is off
   * until someone turns it on — so the warm-up plays for real rather than being
   * a flourish you only see by switching the set off and on again. But a reload
   * isn't that gesture, so a set left on comes back on.
   *
   * Two sources, because they answer different questions: `leftOn` is how the
   * set was found, `powerChoice` is what has been done to it since. The choice
   * wins once it exists, which is also what stops a reload-restored `true` from
   * overriding a switch-off a moment later.
   */
  const leftOn = useSyncExternalStore(subscribeToNothing, readLeftOn, leftOnDuringSSR);
  const [powerChoice, setPowerChoice] = useState<boolean | null>(null);
  const screenOn = powerChoice ?? leftOn;
  const [turningOff, setTurningOff] = useState(false);
  const [turningOn, setTurningOn] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>('idle');

  const screenContentRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef({ on: false, busy: false });
  const volumeHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bootTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Every sound in the system reads the knob through this one call.
  useEffect(() => { sfx.setLevel(volume, muted); }, [volume, muted]);

  /* `setPower` reads the current state through this ref so it can stay
     dependency-free. A set restored as already-on has to be reflected here too,
     or the guard in `setPower` would read a stale `off` and swallow the first
     press of the power button. */
  useEffect(() => { powerRef.current.on = screenOn; }, [screenOn]);

  /* ── Where are we ── */
  const resolved = useMemo(() => resolvePath(DESKTOP, nav.path), [nav.path]);
  const node = resolved.node;
  const { siblings, index } = useMemo(() => siblingsOf(DESKTOP, nav.path), [nav.path]);

  // A stale or hand-typed path resolves to the nearest real folder; put the URL
  // back in step so Back/Forward don't keep replaying a location that isn't real.
  useEffect(() => {
    if (!resolved.exact && resolved.path !== nav.path) nav.replace(resolved.path);
  }, [resolved.exact, resolved.path, nav]);

  const navigate = useCallback((to: string) => {
    // `../id` lets an app step to a sibling without knowing where it lives.
    if (to.startsWith('../')) nav.navigate(childPath(parentPath(nav.path), to.slice(3)));
    else nav.navigate(to);
  }, [nav]);

  const openNode = useCallback((child: OSNode) => {
    if (child.enabled === false) { sfx.error(); return; }
    sfx.open();
    nav.navigate(childPath(nav.path, child.id));
  }, [nav]);

  const goUp = useCallback(() => {
    if (nav.path === ROOT) { sfx.error(); return; }
    sfx.back();
    nav.navigate(parentPath(nav.path));
  }, [nav]);

  const goHome = useCallback(() => {
    setSearchOpen(false);
    if (nav.path === ROOT) { sfx.error(); return; }
    sfx.back();
    nav.navigate(ROOT);
  }, [nav]);

  const goBack = useCallback(() => { if (nav.back()) sfx.back(); else sfx.error(); }, [nav]);
  const goForward = useCallback(() => { if (nav.forward()) sfx.open(); else sfx.error(); }, [nav]);

  const onCrumb = useCallback((i: number) => {
    const target = joinPath(splitPath(nav.path).slice(0, i));
    if (target === nav.path) return;
    sfx.back();
    nav.navigate(target);
  }, [nav]);

  /* ── Selection follows the screen ── */
  // Landing on a folder highlights its first child; landing on an app highlights
  // the app itself among its siblings, so the roller picks up where you are.
  // Derived during render and tagged with the path it belongs to, rather than
  // reset from an effect — an effect would render one frame with the previous
  // screen's selection still highlighted before correcting itself.
  const defaultSelection = isFolder(node) ? (node.children()[0]?.id ?? null) : node.id;
  const selectedId = selection?.path === nav.path ? selection.id : defaultSelection;
  const setSelectedId = useCallback((id: string) => {
    setSelection({ path: nav.path, id });
  }, [nav.path]);

  /* ── The tuning roller ── */
  // An app can claim the roller for its own list (the Radio publishes its
  // stations). Otherwise it steps whatever the screen is a list of: a folder's
  // contents, or an app's siblings — the next car, the next win. One control,
  // always tuning "the list you're looking at".
  const appTuner = useSyncExternalStore(subscribeTuner, getTuner, getServerTuner);

  const rollerNodes = useMemo(
    () => (isFolder(node) ? node.children() : siblings),
    [node, siblings],
  );
  const nodeOptions = useMemo<RollerDialOption[]>(
    () => rollerNodes.map((n) => ({ id: n.id, mark: n.name.slice(0, 3).toUpperCase(), count: 0 })),
    [rollerNodes],
  );
  const tunerOptions = useMemo<RollerDialOption[]>(
    () => (appTuner ? appTuner.options.map((o) => ({ id: o.id, mark: o.mark, count: 0 })) : []),
    [appTuner],
  );

  const rollerOptions = appTuner ? tunerOptions : nodeOptions;
  const rollerSelected = appTuner ? appTuner.selectedId : isFolder(node) ? selectedId : node.id;
  const rollerLabel = appTuner ? appTuner.ariaLabel : 'Tuning';

  const onRoller = useCallback((id: string | null) => {
    if (!id) return;
    if (appTuner) { appTuner.onSelect(id); return; }
    if (isFolder(node)) { setSelectedId(id); return; }
    // Inside an app the roller navigates directly — there is nothing to preview.
    navigate(`../${id}`);
  }, [appTuner, node, navigate, setSelectedId]);

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!screenOn) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setSearchOpen((o) => !o); sfx.click(); return;
      }
      if (searchOpen) return;

      if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); goUp(); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isFolder(node) && selectedId) {
          const child = node.children().find((c) => c.id === selectedId);
          if (child) openNode(child);
        }
        return;
      }

      // Inside a folder the grid handles its own arrows: it can see where the
      // tiles actually landed, which is the only way to know how many fit on a
      // row. Duplicating it here with a guessed column count is what made Up
      // and Down jump the wrong distance once the desktop reflowed.
      if (isFolder(node)) return;

      // Inside an app the arrows step to the next thing in the same folder -
      // the next car, the next win - exactly as the roller does. Unless the app
      // has claimed the roller for a list of its own, in which case the arrows
      // belong to it too: the Radio tunes with them.
      if (appTuner) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const to = siblings[index + step];
      if (to) { sfx.tick(); navigate(`../${to.id}`); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [node, selectedId, openNode, goUp, searchOpen, screenOn, appTuner, siblings, index, navigate]);

  /* ── Screen glitch on content change ── */
  useEffect(() => {
    clearTimeout(glitchTimeout.current);
    let activate = 0;
    const reset = requestAnimationFrame(() => {
      setScreenGlitch(false);
      activate = requestAnimationFrame(() => setScreenGlitch(true));
    });
    glitchTimeout.current = setTimeout(() => setScreenGlitch(false), 340);
    return () => {
      cancelAnimationFrame(reset); cancelAnimationFrame(activate);
      clearTimeout(glitchTimeout.current);
    };
  }, [nav.path]);

  /* ── Power ── */
  // A real set doesn't snap on: the heater warms, the tube finds a signal, then
  // the channel appears. The phases exist so the wait reads as the machine
  // working rather than the page being slow.
  const setPower = useCallback((on: boolean) => {
    if (on === powerRef.current.on || powerRef.current.busy) return;
    bootTimers.current.forEach(clearTimeout);
    bootTimers.current = [];
    powerRef.current = { on, busy: true };
    // Recorded on the press, not when the sequence finishes: a reload part-way
    // through the warm-up should still come back to a set that is on.
    rememberPower(on);

    if (on) {
      setPowerChoice(true);
      setTurningOn(true);
      setBootPhase('warming');
      sfx.powerOn();
      const at = (ms: number, fn: () => void) => bootTimers.current.push(setTimeout(fn, ms));
      at(420, () => setBootPhase('snow'));
      at(900, () => { setBootPhase('logo'); sfx.boot(); });
      at(2200, () => setBootPhase('fading'));
      at(2900, () => {
        setBootPhase('idle'); setTurningOn(false);
        powerRef.current.busy = false;
      });
    } else {
      sfx.powerOff();
      setBootPhase('idle');
      setTurningOff(true);
      setPowerChoice(false);
      setSearchOpen(false);
      bootTimers.current.push(setTimeout(() => {
        setTurningOff(false);
        powerRef.current.busy = false;
      }, 700));
    }
  }, []);

  useEffect(() => () => bootTimers.current.forEach(clearTimeout), []);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    setVolumeChanging(true);
    clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setVolumeChanging(false), 1600);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => { sfx.setLevel(volume, false); sfx.toggle(!m); return !m; });
    setVolumeChanging(true);
    clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setVolumeChanging(false), 1600);
  }, [volume]);

  const screenFilter = useMemo(() => {
    const b = 0.4 + brightness;
    const c = 0.6 + contrast * 1.4;
    return `brightness(${b}) contrast(${c}) saturate(${0.6 + contrast * 0.8})`;
  }, [brightness, contrast]);

  const os: OSApi = useMemo(() => ({
    root: DESKTOP, path: nav.path, navigate, back: goBack, forward: goForward,
    siblings, index, volume, muted,
  }), [nav.path, navigate, goBack, goForward, siblings, index, volume, muted]);

  const screenClass = [
    'cv-tv-screen', screenOn ? 'on' : 'off',
    turningOff ? 'turning-off' : '', turningOn ? 'turning-on' : '',
  ].filter(Boolean).join(' ');

  const AppComponent = !isFolder(node) ? node.component : null;
  // Nothing is on the screen while the set is off, so don't announce a channel
  // that isn't showing — say what the set is actually doing.
  const liveText = !screenOn
    ? 'The set is off. Use the power button to turn it on.'
    : isFolder(node)
      ? `${node.name}: ${node.children().length} items`
      : `${node.name}${node.subtitle ? `, ${node.subtitle}` : ''}`;

  return (
    <>
      {/* A "Skip to main content" link used to sit here, first in the tab order,
          so the first Tab on any screen popped it up over the set.

          It was left over from a masthead that no longer exists — the same one
          the stage's min-height was still reserving a strip for. A skip link
          earns its place by jumping past navigation repeated on every page, and
          there is none: the set is the first thing in the document, and the
          link's own target sat two elements below it. It didn't work either —
          the target is a div with no tabindex, so following the link moved the
          URL hash and left focus on the body, which is the opposite of what it
          promises. If a masthead ever returns, this comes back with it, and the
          target needs tabIndex={-1} to actually take focus. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveText}</div>

      <div className="cv-tv-stage">
        <div className="cv-tv">
          <div className="cv-tv-cabinet">
            <div className="cv-tv-cabinet-grain" />
            <div className="cv-tv-cabinet-edge-top" />
            <div className="cv-tv-cabinet-edge-bottom" />

            <div className="cv-tv-bezel">
              <div className="cv-tv-bezel-grain" />

              {/* `is-lit` hands the pointer over to the pixel cursor. Only while
                  the set is on: the drawn cursor isn't rendered when the screen
                  is dark, so hiding the real one as well would leave a visitor
                  with no pointer at all over the largest thing on the page —
                  which is now what they meet first. */}
              <div id="main-content" className={`cv-tv-screen-well${screenOn ? ' is-lit' : ''}`}>
                <div
                  ref={screenContentRef}
                  className={screenClass}
                  style={{ filter: screenOn ? screenFilter : 'none' }}
                >
                  {screenOn && bootPhase === 'idle' && (
                    <>
                      {isFolder(node) ? (
                        <FolderView folder={node} selectedId={selectedId} onSelect={setSelectedId} onOpen={openNode} />
                      ) : AppComponent ? (
                        <AppComponent node={node} os={os} />
                      ) : null}

                      <Toolbar
                        trail={resolved.trail}
                        canGoBack={nav.canGoBack}
                        canGoForward={nav.canGoForward}
                        canGoUp={nav.path !== ROOT}
                        onBack={goBack} onForward={goForward} onUp={goUp} onHome={goHome}
                        onSearch={() => { setSearchOpen((o) => !o); }}
                        onCrumb={onCrumb}
                        muted={muted} onToggleMute={toggleMute} searchOpen={searchOpen}
                      />

                      {searchOpen && (
                        <SearchPanel root={DESKTOP} onClose={() => setSearchOpen(false)} onNavigate={nav.navigate} />
                      )}
                    </>
                  )}

                  {/* Boot */}
                  {screenOn && bootPhase !== 'idle' && (
                    <div className={`cv-boot-overlay cv-boot-overlay--${bootPhase}`} aria-hidden="true">
                      {bootPhase === 'warming' && <div className="cv-boot-scan-bar" />}
                      {bootPhase === 'snow' && <div className="cv-boot-snow" />}
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

                  {/* Volume OSD — top-right; the bottom belongs to captions. */}
                  {screenOn && (
                    <div style={{
                      position: 'absolute', top: 52, right: 20, zIndex: 14,
                      pointerEvents: 'none',
                      opacity: volumeChanging ? 1 : 0,
                      transition: 'opacity 700ms ease-out',
                      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700, letterSpacing: '0.2em', color: '#fff',
                        textTransform: 'uppercase',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 14px rgba(255,255,255,0.45)',
                      }}>
                        {muted ? 'Mute' : `Vol ${Math.round(volume * 100)}`}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {Array.from({ length: 14 }).map((_, i) => {
                          const on = !muted && (i + 1) / 14 <= volume;
                          return (
                            <div key={i} style={{
                              width: 12, height: 12, borderRadius: 1,
                              background: on ? '#fff' : 'rgba(255,255,255,0.18)',
                              boxShadow: on ? '0 0 8px rgba(255,255,255,0.75), 0 1px 2px rgba(0,0,0,0.6)' : 'inset 0 0 0 1px rgba(255,255,255,0.22)',
                            }} />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <ScreenCursor hostRef={screenContentRef} enabled={screenOn} />

                  {screenOn && <div className={`cv-screen-glitch${screenGlitch ? ' cv-screen-glitch--active' : ''}`} aria-hidden="true" />}

                  <div className="cv-tv-screen-scanlines" />
                  <div className="cv-tv-screen-vignette" />
                  <div className="cv-tv-screen-glare" />
                  <div className="cv-tv-screen-curve" />
                  {/* Keyed to the switch-off, not to being off. It's the charge
                      left on the phosphor when the tube loses its signal, and it
                      fades over exactly the 700ms `turningOff` lasts — rendering
                      it for "off" in general meant it also flashed once on load,
                      on a set that had never been on. */}
                  {turningOff && <div key="off-dot" className="cv-tv-off-dot" />}
                </div>
              </div>

              {/* ── Right control column ── */}
              <div className="cv-tv-right-col">
                {/* The dial's 148px box holds a 108px face, i.e. 20px of built-in
                    halo below it. Cancel it so the optical gap to the roller
                    matches the column's 24px rhythm. */}
                <div style={{ marginBottom: -20 }}>
                  <VolumeDial value={volume} onChange={onVolume} embedded ariaLabel="Volume" />
                </div>

                <RollerDial
                  options={rollerOptions}
                  selectedId={rollerSelected}
                  onSelect={onRoller}
                  embedded
                  showAll={false}
                  ariaLabel={rollerLabel}
                  /* Geared by what one detent actually costs, not by how long
                     the list is.

                     Inside a folder a detent moves a highlight across tiles
                     that are already on screen, so it can be as quick as the
                     hand — that is what `list` is for.

                     Everywhere else a detent is expensive. Between apps it is a
                     whole navigation and a fresh full-screen photograph, and
                     spinning through seventeen of those per notch only means
                     sixteen aborted image fetches and a picture stuck on
                     whichever one last managed to load. The Radio is tuned
                     rather than travelled and wants the slow step for its own
                     reasons. Both take the fine pace. */
                  pace={isFolder(node) && !appTuner ? 'list' : 'fine'}
                />

                <div style={{ display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center' }}>
                  <TvKnob label="BRIGHT" value={brightness} onChange={setBrightness} />
                  <TvKnob label="CONTRAST" value={contrast} onChange={setContrast} />
                </div>

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

                {/* Power only. The Home button beside it duplicated the Home
                    control already in the screen's own toolbar, one press away
                    from wherever you are. */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: '0 4px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setPower(!screenOn)}
                    aria-label={screenOn ? 'Turn off' : 'Turn on'}
                    aria-pressed={screenOn}
                    style={{
                      width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: screenOn ? '#1c1512' : '#3a2f26',
                      boxShadow: circleButtonShadow(screenOn),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'box-shadow 200ms, background 200ms',
                    }}
                  >
                    {/* The glyph is drawn from y=2 to y=15 inside an 18-high box,
                        so it sits half a unit high of the button's true centre —
                        nudged back down rather than left looking off-axis. */}
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ display: 'block', overflow: 'visible' }}>
                      <g transform="translate(0 0.5)" style={{ filter: screenOn ? 'drop-shadow(0 0 2.5px #ffffffcc)' : 'none', transition: 'filter 200ms' }}>
                        <path d="M 5.5 4.2 A 6 6 0 1 0 12.5 4.2" stroke={screenOn ? '#fff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" fill="none" style={{ transition: 'stroke 200ms' }} />
                        <line x1="9" y1="2" x2="9" y2="7" stroke={screenOn ? '#fff' : '#b8ada2'} strokeWidth="1.8" strokeLinecap="round" style={{ transition: 'stroke 200ms' }} />
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="cv-tv-base" />
          <div className="cv-tv-shadow" />
        </div>
      </div>
    </>
  );
}

// useSearchParams opts the tree into client rendering, and Next requires that
// bail-out to sit under a Suspense boundary — without one `next build` fails to
// prerender this route at all.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Classicverse />
    </Suspense>
  );
}
