import { isFolder, type FolderNode, type OSNode } from './types';
import { childPath, ROOT } from './path';

/**
 * Global search over the whole node tree.
 *
 * The index is built by walking the registry, so everything in the system is
 * searchable the moment it's registered — cars, wins, stations, apps.
 * There is no per-module search code and no separate list to keep in step.
 */

export interface Entry {
  path: string;
  node: OSNode;
  /** Where it lives, e.g. "F1 Archive / Ferrari". */
  context: string;
  haystack: string;
  /** Depth from root — used to prefer places over individual items. */
  depth: number;
}

export function buildIndex(root: FolderNode, maxDepth = 3): Entry[] {
  const out: Entry[] = [];
  const walk = (node: OSNode, path: string, trail: string[], depth: number) => {
    if (depth > maxDepth) return;
    if (path !== ROOT) {
      out.push({
        path,
        node,
        context: trail.join(' / '),
        depth,
        haystack: [node.name, node.subtitle, node.keywords, node.id].filter(Boolean).join(' ').toLowerCase(),
      });
    }
    if (isFolder(node)) {
      for (const child of node.children()) {
        walk(child, childPath(path, child.id), path === ROOT ? [] : [...trail, node.name], depth + 1);
      }
    }
  };
  walk(root, ROOT, [], 0);
  return out;
}

export interface Hit extends Entry { score: number }

/**
 * Rank by where the query landed, not just whether it matched. A name that
 * starts with the query beats one that merely contains it, which beats a hit
 * that only appears in the keywords — so typing "fer" surfaces Ferrari the
 * folder rather than the first of 250 wins that happens to mention it.
 */
export function search(index: Entry[], query: string, limit = 40): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  const hits: Hit[] = [];
  for (const e of index) {
    const name = e.node.name.toLowerCase();
    let score = 0;
    let matchedAll = true;

    for (const t of terms) {
      if (name === t) score += 120;
      else if (name.startsWith(t)) score += 70;
      else if (name.includes(t)) score += 40;
      else if ((e.node.subtitle ?? '').toLowerCase().includes(t)) score += 22;
      else if (e.haystack.includes(t)) score += 10;
      else { matchedAll = false; break; }
    }
    if (!matchedAll) continue;

    // Shallow things are usually the destination; deep leaves are the long tail.
    score += Math.max(0, 4 - e.depth) * 6;
    if (isFolder(e.node)) score += 8;
    if (e.node.enabled === false) score -= 30;
    hits.push({ ...e, score });
  }

  return hits.sort((a, b) => b.score - a.score || a.node.name.localeCompare(b.node.name)).slice(0, limit);
}

/**
 * What to show before anything is typed. Rather than a blank panel, offer the
 * places you can go plus a spread of real items sampled across each section —
 * deterministic, so the panel doesn't reshuffle every time it opens.
 */
export function recommendations(root: FolderNode, index: Entry[]) {
  const places = root.children().map((node) => ({
    path: childPath(ROOT, node.id),
    node,
  }));

  const picks: Entry[] = [];
  for (const section of root.children()) {
    if (!isFolder(section) || section.enabled === false) continue;
    const leaves = index.filter((e) => e.path.startsWith(`/${section.id}/`) && !isFolder(e.node));
    if (!leaves.length) continue;
    // Evenly spaced samples — a walk across the section rather than its first few.
    const step = Math.max(1, Math.floor(leaves.length / 4));
    for (let i = 0; i < leaves.length && picks.length < 12; i += step) picks.push(leaves[i]);
  }
  return { places, picks: picks.slice(0, 8) };
}
