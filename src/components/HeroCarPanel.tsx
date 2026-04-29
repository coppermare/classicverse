'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CarRecord } from '@/types/car';

interface HeroCarPanelProps {
  car: CarRecord | undefined;
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

function NavArrow({ direction, onClick, enabled }: { direction: 'prev' | 'next'; onClick: () => void; enabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label={direction === 'prev' ? 'Previous year' : 'Next year'}
      className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150"
      style={{
        [direction === 'prev' ? 'left' : 'right']: '12px',
        backgroundColor: enabled ? 'rgba(30,30,30,0.55)' : 'rgba(30,30,30,0.18)',
        color: enabled ? '#fff' : 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(6px)',
        cursor: enabled ? 'pointer' : 'default',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === 'prev'
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

function ImagePlaceholder({ year, era, label }: { year: number; era?: string; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: '#EDE9DF' }}>
      <p
        className="text-8xl font-bold select-none"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#C8B89A', lineHeight: 1 }}
      >
        {year}
      </p>
      <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: '#B5913A' }}>
        {era ? `${era} · ` : ''}{label}
      </p>
    </div>
  );
}

export default function HeroCarPanel({ car, year, onPrevYear, onNextYear, canGoPrev, canGoNext }: HeroCarPanelProps) {
  const [imgError, setImgError] = useState(false);

  if (!car) {
    return (
      <div className="flex flex-col h-full" style={{ minHeight: '400px' }}>
        <div className="relative shrink-0" style={{ height: '380px' }}>
          <NavArrow direction="prev" onClick={onPrevYear} enabled={canGoPrev} />
          <NavArrow direction="next" onClick={onNextYear} enabled={canGoNext} />
          <ImagePlaceholder year={year} label="Record in progress" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 text-center">
          <p className="text-5xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2C2C2C' }}>
            {year}
          </p>
          <p className="text-sm" style={{ color: '#8B9BAE' }}>Our researchers are compiling the landmark automobile for this year.</p>
        </div>
      </div>
    );
  }

  const showImage = car.image_url && !imgError;

  return (
    <article className="flex flex-col h-full overflow-y-auto">
      {/* Hero image */}
      <div className="relative w-full shrink-0" style={{ height: '380px' }}>
        <NavArrow direction="prev" onClick={onPrevYear} enabled={canGoPrev} />
        <NavArrow direction="next" onClick={onNextYear} enabled={canGoNext} />

        {showImage ? (
          <>
            <Image
              src={car.image_url!}
              alt={`${car.hero_car_name} by ${car.manufacturer}`}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, calc(100vw - 560px)"
              priority
              onError={() => setImgError(true)}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 1 }}
            />
            {(car.image_creator || car.image_license) && (
              <p className="absolute bottom-2 right-3 text-xs" style={{ color: 'rgba(255,255,255,0.78)', zIndex: 2 }}>
                {car.image_creator ? `© ${car.image_creator} · ` : ''}
                {car.image_license}
              </p>
            )}
          </>
        ) : (
          <ImagePlaceholder year={car.year} era={car.era} label={imgError ? 'Image unavailable' : 'Image pending'} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6 space-y-4">
        <div>
          <p
            className="text-5xl font-bold leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2C2C2C' }}
            aria-label={`Year: ${car.year}`}
          >
            {car.year}
          </p>
          <p className="text-sm tracking-wide" style={{ color: '#6B7280' }}>
            {car.manufacturer} · {car.country} · {car.era}
          </p>
        </div>

        <h1
          className="text-4xl font-bold leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2C2C2C' }}
        >
          {car.hero_car_name}
        </h1>

        <p className="text-lg leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2C2C2C' }}>
          {car.short_description}
        </p>

        <hr style={{ borderColor: '#B5913A30' }} />

        <div className="space-y-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
            Historical Context
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
            {car.historical_context}
          </p>
        </div>

        <hr style={{ borderColor: '#B5913A30' }} />

        <div className="space-y-2 pb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B5913A' }}>
            In Detail
          </h2>
          <div className="text-base leading-relaxed space-y-4" style={{ color: '#2C2C2C' }}>
            {car.long_description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
