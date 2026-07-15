'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { isFolder, type FolderNode } from './types';
import { buildIndex, recommendations, search as runSearch, type Hit } from './search';
import { Bevel, TitleBar, RetroButton, RADIUS, WELL, RAISED } from './ui';
import * as sfx from './sound';

/**
 * Global search — a white system panel, not a black overlay.
 *
 * Before you type it recommends somewhere to go, so the panel is never a dead
 * end staring at you. The index covers the whole tree, so one field finds a car,
 * a decade, a Grand Prix, a station or an app.
 */
/**
 * Mounted only while open (the shell renders it conditionally), so it starts
 * from a clean field and cursor every time without an effect reaching in to
 * reset them.
 */
export default function SearchPanel({
  root, onClose, onNavigate,
}: {
  root: FolderNode;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Built once — walking 350+ nodes on every keystroke would be pointless work.
  const index = useMemo(() => buildIndex(root), [root]);
  const recs = useMemo(() => recommendations(root, index), [root, index]);
  const hits = useMemo(() => runSearch(index, query), [index, query]);

  const rows: { path: string; title: string; sub: string; context: string; kind: string }[] = query.trim()
    ? hits.map((h: Hit) => ({
        path: h.path,
        title: h.node.name,
        sub: h.node.subtitle ?? '',
        context: h.context,
        kind: isFolder(h.node) ? 'Folder' : 'Item',
      }))
    : recs.picks.map((e) => ({
        path: e.path,
        title: e.node.name,
        sub: e.node.subtitle ?? '',
        context: e.context,
        kind: isFolder(e.node) ? 'Folder' : 'Item',
      }));

  // Focus on mount. A DOM call, not state — the field should be live the instant
  // the panel appears, the way a Find box always has been.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const go = (path: string) => { sfx.open(); onNavigate(path); onClose(); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); sfx.back(); onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); sfx.tick(); setCursor((c) => Math.min(rows.length - 1, c + 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); sfx.tick(); setCursor((c) => Math.max(0, c - 1)); return; }
    if (e.key === 'Enter') { e.preventDefault(); const r = rows[cursor]; if (r) go(r.path); else sfx.error(); }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, padding: '40px 12px 12px', display: 'flex' }} onKeyDown={onKeyDown}>
      <Bevel style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 3 }}>
        <TitleBar
          title="Find"
          right={
            <RetroButton icon label="Close search" silent onClick={() => { sfx.back(); onClose(); }} style={{ height: 18, minWidth: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✕</span>
            </RetroButton>
          }
        />

        {/* Field */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 5px' }}>
          <label htmlFor="cv-search" style={{ font: '600 12px/1 var(--font-sans)', color: '#1c1a17', paddingLeft: 3 }}>
            Search:
          </label>
          <div style={{ flex: 1, background: '#fff', borderRadius: RADIUS, boxShadow: WELL, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#5a554d" strokeWidth="2.4" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#5a554d" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <input
              id="cv-search"
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); sfx.key(); }}
              placeholder="Cars, decades, Grand Prix, stations…"
              style={{
                flex: 1, height: 26, border: 'none', outline: 'none', background: 'transparent',
                font: '400 13px/1 var(--font-sans)', color: '#1c1a17',
              }}
            />
            {query && (
              <RetroButton icon label="Clear" silent onClick={() => { sfx.click(); setQuery(''); setCursor(0); inputRef.current?.focus(); }} style={{ height: 18, minWidth: 18 }}>
                <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✕</span>
              </RetroButton>
            )}
          </div>
        </div>

        {/* Places — always offered, so there's a way out of an empty result */}
        {!query.trim() && (
          <div style={{ padding: '0 8px 7px', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ font: '600 11px/1 var(--font-sans)', color: '#5a554d' }}>GO TO</span>
            {recs.places.map((p) => (
              <RetroButton key={p.node.id} label={`Open ${p.node.name}`} silent
                disabled={p.node.enabled === false}
                onClick={() => go(p.path)} style={{ height: 22 }}>
                {p.node.name}
              </RetroButton>
            ))}
          </div>
        )}

        {/* Results */}
        <div style={{ padding: '0 8px 4px', font: '600 11px/1 var(--font-sans)', color: '#5a554d' }}>
          {query.trim() ? `${hits.length} ${hits.length === 1 ? 'RESULT' : 'RESULTS'}` : 'SUGGESTIONS'}
        </div>
        <div
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          style={{
            flex: 1, minHeight: 0, overflowY: 'auto', margin: '0 5px 5px',
            background: '#fff', borderRadius: RADIUS, boxShadow: WELL,
          }}
        >
          {rows.length === 0 ? (
            <div style={{ padding: '26px 16px', textAlign: 'center' }}>
              <p style={{ font: '600 14px/1.5 var(--font-sans)', color: '#1c1a17', marginBottom: 4 }}>
                Nothing matches “{query}”.
              </p>
              <p style={{ font: '400 13px/1.5 var(--font-sans)', color: '#5a554d' }}>
                Try a maker, a year, a driver, or a decade — “Ferrari”, “1962”, “Lauda”, “1930s”.
              </p>
            </div>
          ) : rows.map((r, i) => {
            const on = i === cursor;
            return (
              <button
                key={r.path}
                data-active={on}
                role="option"
                aria-selected={on}
                type="button"
                onPointerEnter={() => { setCursor(i); sfx.hover(); }}
                onClick={() => go(r.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: on ? '#2a4a8a' : 'transparent',
                  color: on ? '#fff' : '#1c1a17',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 44, textAlign: 'center', padding: '2px 0', borderRadius: 3,
                  font: '600 10px/1.4 var(--font-sans)',
                  background: on ? 'rgba(255,255,255,0.22)' : '#eef2f9',
                  color: on ? '#fff' : '#2a4a8a',
                }}>
                  {r.kind}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', font: '600 13px/1.3 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </span>
                  {r.sub && (
                    <span style={{ display: 'block', font: '400 12px/1.3 var(--font-sans)', opacity: on ? 0.85 : 0.62, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.sub}
                    </span>
                  )}
                </span>
                {r.context && (
                  <span style={{ flexShrink: 0, font: '400 11px/1.3 var(--font-sans)', opacity: on ? 0.8 : 0.5, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.context}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 8,
          margin: '0 5px 4px', padding: '3px 7px',
          boxShadow: RAISED, borderRadius: RADIUS,
          font: '400 11px/1.5 var(--font-sans)', color: '#3f3a33',
        }}>
          <span>↑ ↓ to move · ↵ to open · Esc to close</span>
          <span>{index.length} items indexed</span>
        </div>
      </Bevel>
    </div>
  );
}
