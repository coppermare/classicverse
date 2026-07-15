'use client';

import { useEffect, useMemo, useRef } from 'react';
import { isFolder, type FolderNode, type OSNode } from './types';
import PixelArt from './PixelArt';
import { emblemFor, folderGrid, labelEmblem, FOLDER_W, FOLDER_H } from './icons';
import * as sfx from './sound';

/**
 * Renders any folder's contents. It knows nothing about cars or Ferrari — it
 * reads the nodes, so a new module gets a working screen for free.
 *
 * Two layouts: `icons` for a desktop of folders and apps, `gallery` for a dense
 * grid of photographs. Folders and apps are drawn differently on purpose — a
 * folder is a manila folder you go *into*, an app is the program's own icon that
 * you *run* — which is the distinction every desktop of the era made, and the one
 * that tells you what a click will do before you make it.
 */

/** One CSS pixel per grid cell × this. Small enough to read as fine pixel art. */
const PX = 1.8;
/** Apps are drawn from a 32×32 emblem, so they need a bigger multiplier to carry
 *  the same visual weight as a folder. */
const APP_PX = 2.9;

function NodeArt({ node }: { node: OSNode }) {
  const icon = node.icon;
  const enabled = node.enabled !== false;

  // A marque or a photograph can't be redrawn as pixel art — those stay as
  // images, letterboxed onto the folder body.
  if (icon?.kind === 'image' || icon?.kind === 'photo') {
    const box = isFolder(node) ? { w: FOLDER_W * PX, h: FOLDER_H * PX } : { w: 40 * APP_PX, h: 34 * APP_PX };
    return (
      <div style={{ position: 'relative', width: box.w, height: box.h, opacity: enabled ? 1 : 0.5 }}>
        {isFolder(node) && <PixelArt grid={folderGrid(null, enabled)} scale={PX} />}
        <div style={{
          position: 'absolute', inset: 0, top: isFolder(node) ? 15 * PX : 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon.src}
            alt=""
            loading="lazy"
            style={icon.kind === 'photo'
              ? { width: 48 * PX, height: 32 * PX, objectFit: 'cover', display: 'block', boxShadow: '0 0 0 1px #241c0a' }
              // Bounded by the body's height, not a fixed square: a tall badge
              // (the Ferrari shield) and a wide wordmark (Williams) each fill
              // what they can of the same box.
              : { maxWidth: 46 * PX, maxHeight: 34 * PX, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>
    );
  }

  const emblem = icon?.kind === 'label' ? labelEmblem(icon.text)
    : icon?.kind === 'glyph' ? emblemFor(icon.id)
    : null;

  // Folder: emblem composited into the folder's own grid, so the whole icon is
  // one drawing on one lattice.
  if (isFolder(node)) return <PixelArt grid={folderGrid(emblem, enabled)} scale={PX} />;

  // App: just its icon, the way a program icon sat on a real desktop.
  if (!emblem) return <div style={{ width: 32 * APP_PX, height: 32 * APP_PX }} />;
  return <PixelArt grid={emblem} scale={APP_PX} style={{ opacity: enabled ? 1 : 0.5 }} />;
}

interface Props {
  folder: FolderNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (node: OSNode) => void;
}

export default function FolderView({ folder, selectedId, onSelect, onOpen }: Props) {
  // Children are built lazily, so calling this on every render rebuilt the whole
  // list — 250 nodes for a Ferrari season, each re-deriving its thumbnail URL —
  // every time anything re-rendered, hovering a tile included.
  const children = useMemo(() => folder.children(), [folder]);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const gallery = folder.layout === 'gallery';

  if (children.length === 0) {
    return (
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 44,
        background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ font: '600 15px/1.5 var(--font-sans)', color: '#6f675c', textAlign: 'center', maxWidth: 340 }}>
          This folder is empty.
        </p>
      </div>
    );
  }

  if (gallery) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#14110d', paddingTop: 44 }}>
        {/* Gutters, so the tiles read as separate photographs rather than one
            butted-together sheet — and so the selection ring has room to sit. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, padding: '7px 8px 10px' }}>
          {children.map((node) => {
            const active = node.id === selectedId;
            const photo = node.icon?.kind === 'photo' ? node.icon.src : null;
            return (
              <button
                key={node.id}
                ref={active ? activeRef : undefined}
                type="button"
                onPointerEnter={() => { onSelect(node.id); sfx.hover(); }}
                onClick={() => onOpen(node)}
                aria-label={`${node.name}${node.subtitle ? ` — ${node.subtitle}` : ''}`}
                aria-current={active ? 'true' : undefined}
                style={{
                  position: 'relative', display: 'block', padding: 0, border: 'none',
                  aspectRatio: '4 / 3', overflow: 'hidden', cursor: 'pointer', background: '#1a1612',
                  borderRadius: 3,
                  boxShadow: active
                    ? 'inset 0 0 0 2px #d4a017, 0 0 0 1px rgba(0,0,0,0.5)'
                    : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                }}
              >
                {photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={photo} alt="" loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <span style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: '600 15px/1 var(--font-sans)', color: '#6a6258',
                  }}>
                    {node.id}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: 'linear-gradient(180deg, #F7F3E9 0%, #EFE9DA 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '8px 2px', padding: '12px 18px', maxWidth: 600,
        }}>
          {children.map((node) => {
            const active = node.id === selectedId;
            const off = node.enabled === false;
            return (
              <button
                key={node.id}
                ref={active ? activeRef : undefined}
                type="button"
                onPointerEnter={() => { onSelect(node.id); if (!off) sfx.hover(); }}
                onClick={() => onOpen(node)}
                aria-label={`${node.name}${off ? ' (coming soon)' : ''}`}
                aria-current={active ? 'true' : undefined}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  width: 138, padding: '8px 6px 10px', border: 'none', borderRadius: 6,
                  cursor: off ? 'default' : 'pointer',
                  background: active ? 'rgba(74,110,158,0.18)' : 'transparent',
                  outline: active ? '1px dotted rgba(44,38,32,0.45)' : 'none',
                  outlineOffset: -2,
                }}
              >
                <NodeArt node={node} />
                {/* Name only. The subtitle repeated what the icon and the folder
                    already said, and a second line under every icon turned the
                    desktop into a wall of text. It still rides along in search
                    results and the Guide, where it disambiguates. */}
                <span style={{
                  font: '600 14px/1.25 var(--font-sans)',
                  color: off ? '#6f675c' : '#2c2620', textAlign: 'center',
                }}>
                  {node.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
