import type { ComponentType } from 'react';

/**
 * The Classicverse OS object model.
 *
 * Everything on the set is one of two things: a **folder** (contains other
 * nodes) or an **app** (renders a screen). That is the whole model. A car page,
 * the radio, a game, a settings panel — all are apps; the desktop, a decade, a
 * team — all are folders. Nothing about a channel is special-cased in the shell,
 * so adding a module means adding a node to the tree in registry.ts and nothing
 * else.
 *
 * Folders list their children lazily. The archive holds 100 cars and 250 wins;
 * building those arrays only when a folder is actually opened keeps the desktop
 * instant and lets a module of any size register without cost.
 */

export type IconSpec =
  /** A pixel-art emblem from the icon set (see os/icons.ts). */
  | { kind: 'glyph'; id: string }
  /** A logo/marque asset — letterboxed, keeps its own aspect ratio. */
  | { kind: 'image'; src: string }
  /** A photograph — fills the tile, used for gallery layouts. */
  | { kind: 'photo'; src: string }
  /** Fallback: a short label stamped on the folder. */
  | { kind: 'label'; text: string };

export interface NodeBase {
  /** Unique among siblings; forms one segment of the path. */
  id: string;
  name: string;
  subtitle?: string;
  icon?: IconSpec;
  /** Disabled nodes render greyed and refuse to open. Defaults to true. */
  enabled?: boolean;
  /** Extra text folded into global search. */
  keywords?: string;
  /**
   * The node's payload — the car record, the win, the station. Apps read it
   * back and cast. This is what lets one generic component serve every node of
   * a kind, instead of each node closing over its own bespoke component (which
   * would mint a new component type per node and remount on every render).
   */
  data?: unknown;
}

export interface FolderNode extends NodeBase {
  kind: 'folder';
  /** `icons` = a desktop of folders; `gallery` = a dense grid of photos. */
  layout?: 'icons' | 'gallery';
  children: () => OSNode[];
}

export interface AppNode extends NodeBase {
  kind: 'app';
  component: ComponentType<AppProps>;
  /** Apps that paint their own full-bleed background (photo viewers). */
  chrome?: 'panel' | 'bleed';
}

export type OSNode = FolderNode | AppNode;

export const isFolder = (n: OSNode): n is FolderNode => n.kind === 'folder';
export const isApp = (n: OSNode): n is AppNode => n.kind === 'app';

/** What the shell hands every app. Apps never import the shell directly. */
export interface OSApi {
  /**
   * The desktop tree. Handed down rather than imported so an app can read the
   * whole system (the Guide indexes it) without importing the registry that
   * registers the app itself.
   */
  root: FolderNode;
  /** Absolute path of the node being rendered, e.g. `/cars/1960s/1962`. */
  path: string;
  /** Absolute or `../`-relative navigation. */
  navigate: (path: string) => void;
  back: () => void;
  forward: () => void;
  /** Siblings of the current node, for prev/next inside a viewer. */
  siblings: OSNode[];
  index: number;
  /** The set's speaker — apps play through the TV's own volume. */
  volume: number;
  muted: boolean;
}

export interface AppProps {
  node: AppNode;
  os: OSApi;
}

/* ── Radio ── */

export interface RadioTrack {
  title: string;
  artist: string;
  year: number;
  /** Seconds, as reported by Commons. */
  duration: number;
  src: string;
  license: string;
  /** Commons file page — the attribution of record. */
  page: string;
}

export interface RadioStation {
  id: string;
  name: string;
  /** Dial position, e.g. '88.5'. */
  frequency: string;
  era: string;
  accent: string;
  tracks: RadioTrack[];
}
