'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CarRecord } from '@/types/car';

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
  cars: CarRecord[];
  onSelect: (year: number) => void;
}

export default function SearchCommand({ open, onClose, cars, onSelect }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? cars.filter((car) => {
        const q = query.toLowerCase();
        return (
          String(car.year).includes(q) ||
          car.manufacturer.toLowerCase().includes(q) ||
          car.hero_car_name.toLowerCase().includes(q) ||
          car.country.toLowerCase().includes(q) ||
          car.category.toLowerCase().includes(q) ||
          car.era.toLowerCase().includes(q)
        );
      })
    : cars;

  const handleSelect = useCallback(
    (year: number) => {
      onSelect(year);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'var(--cv-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search cars"
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--cv-bg)' }}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--cv-brass-19)' }}
        >
          <svg
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--cv-text-steel)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by year, make, model, country, era…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--cv-text)' }}
            aria-label="Search cars"
          />
          <kbd
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs border"
            style={{ color: 'var(--cv-text-steel)', borderColor: 'var(--cv-steel-25)' }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto" role="listbox" aria-label="Search results">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--cv-text-steel)' }}>
                No cars found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            filtered.map((car) => (
              <button
                key={car.year}
                onClick={() => handleSelect(car.year)}
                className="w-full text-left px-4 py-3 border-b transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--cv-brass-08)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--cv-bg-surface)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
                role="option"
                aria-selected="false"
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: 'var(--cv-red)',
                    }}
                  >
                    {car.year}
                  </span>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--cv-text)' }}>
                    {car.manufacturer} {car.hero_car_name}
                  </span>
                  <span className="text-xs shrink-0 ml-auto" style={{ color: 'var(--cv-text-steel)' }}>
                    {car.country}
                  </span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--cv-text-muted)' }}>
                  {car.era} · {car.category}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--cv-brass-12)' }}
        >
          <p className="text-xs" style={{ color: 'var(--cv-text-steel)' }}>
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </p>
          <p className="text-xs" style={{ color: 'var(--cv-text-steel)' }}>
            Press{' '}
            <kbd
              className="px-1 py-0.5 rounded border text-xs"
              style={{ borderColor: 'var(--cv-steel-25)' }}
            >
              Enter
            </kbd>{' '}
            to select
          </p>
        </div>
      </div>
    </div>
  );
}
