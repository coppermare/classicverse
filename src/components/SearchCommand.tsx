'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CarRecord } from '@/types/car';

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
  cars: CarRecord[];
  onSelect: (year: number) => void;
  inline?: boolean;
}

export default function SearchCommand({ open, onClose, cars, onSelect, inline }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setQuery('');
    });
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
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

  const panel = (
    <div
      className={inline ? undefined : 'w-full max-w-lg rounded-xl shadow-2xl overflow-hidden'}
      style={inline ? {
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(8,7,6,0.97)',
        display: 'flex', flexDirection: 'column',
      } : { backgroundColor: 'var(--cv-bg)' }}
      onKeyDown={handleKeyDown}
    >
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: `1px solid ${inline ? 'rgba(212,160,23,0.18)' : 'var(--cv-brass-19)'}`,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ color: inline ? '#6a6460' : 'var(--cv-text-steel)', flexShrink: 0 }}
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by year, make, model, country, era…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13,
            color: inline ? '#e0dbd2' : 'var(--cv-text)',
            fontFamily: 'inherit',
          }}
          aria-label="Search cars"
        />
        <kbd style={{
          fontSize: 10, padding: '2px 5px', borderRadius: 4,
          border: `1px solid ${inline ? 'rgba(255,255,255,0.12)' : 'var(--cv-steel-25)'}`,
          color: inline ? '#6a6460' : 'var(--cv-text-steel)',
        }}>Esc</kbd>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }} role="listbox" aria-label="Search results">
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: inline ? '#6a6460' : 'var(--cv-text-steel)' }}>
              No records found for &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          filtered.map((car) => (
            <button
              key={car.year}
              onClick={() => handleSelect(car.year)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 16px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${inline ? 'rgba(255,255,255,0.05)' : 'var(--cv-brass-08)'}`,
                display: 'block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  inline ? 'rgba(255,255,255,0.04)' : 'var(--cv-bg-surface)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
              role="option"
              aria-selected="false"
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, color: inline ? '#d4a017' : 'var(--cv-red)' }}>
                  {car.year}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: inline ? '#d4cfc4' : 'var(--cv-text)' }}>
                  {car.manufacturer} {car.hero_car_name}
                </span>
                <span style={{ fontSize: 11, flexShrink: 0, marginLeft: 'auto', color: inline ? '#8a8680' : 'var(--cv-text-steel)' }}>
                  {car.country}
                </span>
              </div>
              <p style={{ fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: inline ? '#6a6460' : 'var(--cv-text-muted)' }}>
                {car.era} · {car.category}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px', display: 'flex', justifyContent: 'space-between',
        borderTop: `1px solid ${inline ? 'rgba(212,160,23,0.12)' : 'var(--cv-brass-12)'}`,
      }}>
        <p style={{ fontSize: 11, color: inline ? '#6a6460' : 'var(--cv-text-steel)' }}>
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </p>
        <p style={{ fontSize: 11, color: inline ? '#6a6460' : 'var(--cv-text-steel)' }}>
          ↩ to select
        </p>
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'var(--cv-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Search cars"
    >
      {panel}
    </div>
  );
}
