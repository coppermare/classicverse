import { isFolder, type FolderNode, type OSNode } from './types';

/**
 * Paths are ordinary filesystem paths over the node tree: `/cars/1960s/1962`.
 * A single string is the whole of the OS's navigation state, which is what makes
 * history, deep links and search results all trivially interchangeable — each is
 * just a path.
 */

export const ROOT = '/';

export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function joinPath(segments: string[]): string {
  return segments.length ? '/' + segments.join('/') : ROOT;
}

export function parentPath(path: string): string {
  return joinPath(splitPath(path).slice(0, -1));
}

export function childPath(path: string, id: string): string {
  return joinPath([...splitPath(path), id]);
}

export interface Resolved {
  /** The node at the path, or the deepest one that existed. */
  node: OSNode;
  /** Every node from root to `node`, inclusive. Drives the breadcrumb. */
  trail: OSNode[];
  /** The path actually resolved — trimmed if the tail didn't exist. */
  path: string;
  /** False when the requested path ran past a real node. */
  exact: boolean;
}

/**
 * Walk a path from the root. A path that goes stale — a renamed id, a hand-typed
 * URL — resolves to the deepest folder that does exist rather than throwing, so
 * a bad link lands somewhere sensible instead of a blank screen.
 */
export function resolvePath(root: FolderNode, path: string): Resolved {
  const segments = splitPath(path);
  let node: OSNode = root;
  const trail: OSNode[] = [root];
  const walked: string[] = [];

  for (const segment of segments) {
    if (!isFolder(node)) return { node, trail, path: joinPath(walked), exact: false };
    const next: OSNode | undefined = node.children().find((c) => c.id === segment);
    if (!next) return { node, trail, path: joinPath(walked), exact: false };
    node = next;
    trail.push(next);
    walked.push(segment);
  }
  return { node, trail, path: joinPath(walked), exact: true };
}

/** Siblings of the node at `path`, plus its index among them. */
export function siblingsOf(root: FolderNode, path: string): { siblings: OSNode[]; index: number } {
  const segments = splitPath(path);
  if (!segments.length) return { siblings: [], index: -1 };
  const parent = resolvePath(root, parentPath(path));
  if (!isFolder(parent.node)) return { siblings: [], index: -1 };
  const siblings = parent.node.children();
  return { siblings, index: siblings.findIndex((c) => c.id === segments[segments.length - 1]) };
}
