'use client';

import { useEffect, useRef } from 'react';
import PixelFolder from '@/components/PixelFolder';
import ChannelIcon from '@/components/ChannelIcon';
import { isFolder, type FolderNode, type IconSpec, type OSNode } from './types';
import { RADIUS, RAISED } from './ui';
import * as sfx from './sound';

/**
 * Renders any folder's contents. It knows nothing about cars or Ferrari — it
 * reads the nodes, so a new module gets a working screen for free.
 *
 * Two layouts: `icons` for a desktop of folders and apps, `gallery` for a dense
 * grid of photographs. Folders and apps are drawn differently on purpose — a
 * folder is a manila folder you go *into*, an app is a program tile you *run* —
 * which is the distinction every desktop OS makes and the one that tells you
 * what a click will do before you make it.
 */

const FOLDER_SCALE = 2.6;
/** Emblem sized off the folder's own 44×36 pixel grid so it scales with it. */
const EMBLEM = 19 * FOLDER_SCALE;

function Emblem({ icon, size }: { icon?: IconSpec; size: number }) {
  if (!icon) return null;
  switch (icon.kind) {
    case 'glyph':
      return <ChannelIcon id={icon.id} size={size} />;
    case 'image':
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={icon.src} alt="" style={{
          maxWidth: size * 1.7, maxHeight: size, width: 'auto', height: 'auto',
          objectFit: 'contain', display: 'block',
        }} />
      );
    case 'label':
      return (
        <span style={{
          font: `800 ${Math.round(size * 0.46)}px/1 var(--font-sans)`,
          color: '#2b2013', letterSpacing: '-0.02em',
        }}>
          {icon.text}
        </span>
      );
    case 'photo':
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={icon.src} alt="" loading="lazy" style={{
          width: size * 1.5, height: size, objectFit: 'cover', display: 'block',
          borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }} />
      );
  }
}

/** An app tile — a beveled program face, so it never reads as a folder. */
function AppTile({ node }: { node: OSNode }) {
  return (
    <div style={{
      width: 44 * FOLDER_SCALE, height: 36 * FOLDER_SCALE,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: node.enabled === false ? 0.5 : 1,
    }}>
      <div style={{
        width: 34 * FOLDER_SCALE * 0.86, height: 30 * FOLDER_SCALE * 0.86,
        borderRadius: RADIUS + 1,
        background: 'linear-gradient(180deg, #e8e4dc 0%, #cbc6bd 100%)',
        boxShadow: `${RAISED}, 0 3px 6px rgba(0,0,0,0.35)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Emblem icon={node.icon} size={EMBLEM * 0.82} />
      </div>
    </div>
  );
}

function NodeArt({ node }: { node: OSNode }) {
  if (isFolder(node)) {
    return (
      <PixelFolder enabled={node.enabled !== false} scale={FOLDER_SCALE}>
        <Emblem icon={node.icon} size={EMBLEM} />
      </PixelFolder>
    );
  }
  return <AppTile node={node} />;
}

interface Props {
  folder: FolderNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (node: OSNode) => void;
}

export default function FolderView({ folder, selectedId, onSelect, onOpen }: Props) {
  const children = folder.children();
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                  boxShadow: active ? 'inset 0 0 0 2px #d4a017' : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
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
                <span style={{
                  font: '600 14px/1.25 var(--font-sans)',
                  color: off ? '#6f675c' : '#2c2620', textAlign: 'center',
                }}>
                  {node.name}
                </span>
                {node.subtitle && (
                  <span style={{ font: '400 12px/1.2 var(--font-sans)', color: '#6f675c', textAlign: 'center' }}>
                    {off ? 'Coming soon' : node.subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
