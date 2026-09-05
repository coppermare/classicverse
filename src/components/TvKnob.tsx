'use client';

import { useRef } from 'react';

interface TvKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  size?: number;
  accent?: string;
  startAngle?: number;
  endAngle?: number;
}

/** A rotary cabinet control shared by the television's display adjustments. */
export default function TvKnob({
  label,
  value,
  onChange,
  size = 30,
  accent = '#cfcfcf',
  startAngle = -135,
  endAngle = 135,
}: TvKnobProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ lastAng: number; val: number; cx: number; cy: number } | null>(null);
  const angle = startAngle + (endAngle - startAngle) * value;

  const onPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragRef.current = {
      lastAng: Math.atan2(event.clientY - cy, event.clientX - cx),
      val: Math.max(0, Math.min(1, value)),
      cx,
      cy,
    };
    ref.current!.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pointerAngle = Math.atan2(event.clientY - drag.cy, event.clientX - drag.cx);
    let delta = pointerAngle - drag.lastAng;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const range = (endAngle - startAngle) * Math.PI / 180;
    drag.lastAng = pointerAngle;
    drag.val = Math.max(0, Math.min(1, drag.val + delta / range));
    onChange(drag.val);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    onChange(Math.max(0, Math.min(1, value + (event.deltaY > 0 ? -1 : 1) * 0.05)));
  };

  const padding = 9;
  const total = size + padding * 2;
  const radius = total / 2 - 4;
  const centre = total / 2;
  const pointAt = (degrees: number) => {
    const radians = (degrees - 90) * Math.PI / 180;
    return {
      x: centre + radius * Math.cos(radians),
      y: centre + radius * Math.sin(radians),
    };
  };
  const start = pointAt(startAngle);
  const end = pointAt(endAngle);
  const current = pointAt(angle);
  const sweep = (endAngle - startAngle) * value;
  const track = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  const active = value > 0.01
    ? `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${current.x.toFixed(2)} ${current.y.toFixed(2)}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ position: 'relative', width: total, height: total }}>
        <svg width={total} height={total} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <path d={track} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={2.5} strokeLinecap="round" />
          {active && <path d={active} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />}
        </svg>
        <div
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          style={{
            position: 'absolute',
            top: padding,
            left: padding,
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#c4c4bc',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.62)',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
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
