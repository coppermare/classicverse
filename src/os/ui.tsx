'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import * as sfx from './sound';

/**
 * The system's retro control kit.
 *
 * Every control in the OS is built from these, so the whole set looks and sounds
 * like one machine rather than a collection of screens. The look is the classic
 * 90s bevel: a raised face lit from above that inverts to a sunken one while
 * held — the depth is drawn with box-shadow rings rather than borders, so a
 * control never changes size when pressed and the row can't jitter.
 */

/** One radius, applied to all four corners of every control in the system. */
export const RADIUS = 4;

export const FACE = '#c8c4bc';
export const INK = '#1c1a17';

/**
 * The bevels.
 *
 * The obvious way to draw a 90s bevel is four hard-edged inset shadows offset by
 * 1px and 2px — but an inset shadow with an offset and no blur does not follow a
 * rounded corner. It's the shape translated, so each corner is left with a
 * crescent: the top-left reads square while the bottom-right reads round, and the
 * radius looks inconsistent even though every corner is set to the same value.
 *
 * So the crisp edges here are spread-only rings (`0 0 0 Npx`), which trace the
 * border radius exactly on all four corners, and the direction of the light comes
 * from the face gradient rather than from offset shadows. Blurred shadows are
 * fine to offset — the blur hides the crescent — so depth still comes from those.
 */
const EDGE = '#6f6b64';

export const FACE_RAISED = 'linear-gradient(180deg, #efebe3 0%, #dad6ce 52%, #c5c1b9 100%)';
export const FACE_SUNKEN = 'linear-gradient(180deg, #b4b0a8 0%, #c7c3bb 55%, #d3cfc7 100%)';

export const RAISED = [
  'inset 0 0 0 1px rgba(255,255,255,0.75)',
  `0 0 0 1px ${EDGE}`,
  '0 1px 2px rgba(0,0,0,0.30)',
].join(', ');

export const SUNKEN = [
  'inset 0 1px 3px rgba(0,0,0,0.42)',
  'inset 0 0 0 1px rgba(0,0,0,0.16)',
  `0 0 0 1px ${EDGE}`,
].join(', ');

/** A recessed well for content — the inverse of a button face. */
export const WELL = [
  'inset 0 1px 3px rgba(0,0,0,0.24)',
  `inset 0 0 0 1px rgba(0,0,0,0.20)`,
].join(', ');

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  /** Latching controls (mute, shuffle) stay sunken while active. */
  active?: boolean;
  label: string;
  /** Icon-only buttons get a square footprint and no visible label. */
  icon?: boolean;
  title?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Suppress the click sound where the caller plays its own. */
  silent?: boolean;
}

export function RetroButton({
  onClick, disabled, active, label, icon, title, style, children, silent,
}: ButtonProps) {
  const [held, setHeld] = useState(false);
  const down = (held && !disabled) || active;
  return (
    <button
      type="button"
      title={title ?? label}
      // Always labelled, not just when icon-only. A button whose face reads "3"
      // or "SHUF" is announced as exactly that without this — `label` carries
      // the meaning ("Preset 3: Brass Band"), which is what should be read out.
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onPointerDown={() => { if (!disabled) { setHeld(true); if (!silent) sfx.click(); } }}
      onPointerUp={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onPointerEnter={() => { if (!disabled) sfx.hover(); }}
      onClick={() => { if (disabled) { sfx.error(); return; } onClick?.(); }}
      style={{
        minWidth: icon ? 28 : undefined,
        height: 26,
        padding: icon ? 0 : '0 12px',
        border: 'none',
        borderRadius: RADIUS,
        background: disabled ? '#c2beb6' : down ? FACE_SUNKEN : FACE_RAISED,
        boxShadow: down ? SUNKEN : RAISED,
        color: disabled ? '#87837c' : INK,
        font: '600 12px/1 var(--font-sans)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: disabled ? 'default' : 'pointer',
        // Nudged rather than re-shadowed, so the glyph moves with the face.
        transform: down ? 'translate(1px, 1px)' : 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** A raised plate — the body of a panel or a control cluster. */
export function Bevel({ children, style, sunken }: { children?: ReactNode; style?: CSSProperties; sunken?: boolean }) {
  return (
    <div style={{
      background: FACE,
      borderRadius: RADIUS,
      boxShadow: sunken ? WELL : RAISED,
      ...style,
    }}>
      {children}
    </div>
  );
}

/** The glowing readout of a period appliance — amber on near-black. */
export function Lcd({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #14180f 0%, #0b0e08 100%)',
      borderRadius: RADIUS,
      boxShadow: WELL,
      color: '#9ef06a',
      textShadow: '0 0 6px rgba(158,240,106,0.55)',
      fontFamily: 'var(--font-sans)',
      fontVariantNumeric: 'tabular-nums',
      padding: '8px 12px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/** A window title bar, complete with the gradient every 90s app had. */
export function TitleBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      padding: '4px 5px 4px 8px',
      background: 'linear-gradient(90deg, #2a4a8a 0%, #6b8fc9 100%)',
      borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
      font: '700 12px/1 var(--font-sans)',
      color: '#fff',
      letterSpacing: '0.02em',
      flexShrink: 0,
    }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      {right}
    </div>
  );
}

/** A hairline groove — the classic separator. */
export function Divider({ vertical }: { vertical?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={vertical
        ? { width: 2, alignSelf: 'stretch', borderLeft: '1px solid #85817a', borderRight: '1px solid #fff', margin: '0 3px' }
        : { height: 2, borderTop: '1px solid #85817a', borderBottom: '1px solid #fff', margin: '3px 0' }}
    />
  );
}
