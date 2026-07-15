'use client';

import { useEffect, useRef } from 'react';

/**
 * The on-screen pointer.
 *
 * This deliberately lives outside React's render cycle. Driving it from state
 * meant every mouse move re-rendered the whole shell — and because a folder
 * builds its children lazily on render, moving the cursor across the Ferrari
 * gallery rebuilt 250 nodes and re-rendered 250 tiles per event. The pointer was
 * the most expensive thing on the screen.
 *
 * So: one native listener, coalesced into a single rAF, writing `transform`
 * straight to the element. Transform is composited rather than laid out, the
 * host rect is measured once instead of per move, and the sprite only swaps when
 * the hit-test result actually changes. React renders this element once and then
 * never touches it again.
 */

const HIT = 'button, a, input, [role="option"], [role="slider"]';

export default function ScreenCursor({
  hostRef, enabled,
}: {
  hostRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const img = imgRef.current;
    if (!host || !img || !enabled) return;

    let rect = host.getBoundingClientRect();
    let x = 0, y = 0, pointer = false;
    let drawnPointer: boolean | null = null;
    let raf = 0;

    const measure = () => { rect = host.getBoundingClientRect(); };

    const draw = () => {
      raf = 0;
      // The pointer sprite's hotspot sits a couple of pixels into the glyph.
      const ox = pointer ? -4 : 0;
      const oy = pointer ? -1 : 0;
      img.style.transform = `translate3d(${x + ox}px, ${y + oy}px, 0)`;
      if (pointer !== drawnPointer) {
        drawnPointer = pointer;
        img.src = pointer ? '/cursors/pointer.png' : '/cursors/arrow.png';
      }
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      const t = e.target as Element | null;
      pointer = !!t?.closest?.(HIT);
      if (img.style.opacity !== '1') img.style.opacity = '1';
      // Many moves can arrive between frames; only the last one matters.
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onLeave = () => { img.style.opacity = '0'; };

    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseleave', onLeave);
    // The stage can move under the pointer without the mouse moving.
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    return () => {
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hostRef, enabled]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={imgRef}
      src="/cursors/arrow.png"
      alt=""
      width={32}
      height={32}
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 99,
        display: enabled ? 'block' : 'none',
        imageRendering: 'pixelated',
        willChange: 'transform',
      }}
    />
  );
}
