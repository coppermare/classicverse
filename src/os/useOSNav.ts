'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROOT } from './path';

interface Entry { id: string; path: string }
const ENTRY_KEY = 'cvNavigationEntry';

function createEntry(path: string): Entry {
  // getRandomValues also works on the HTTP LAN URL used for device testing;
  // randomUUID is restricted to secure contexts in browsers.
  const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) => part.toString(16)).join('-');
  return { id, path };
}

/**
 * Each visit has its own history identity, even when its path repeats.
 * Next.js supports native pushState/replaceState navigation and copies its
 * router state into those entries. Every channel has a real pathname while the
 * shared root layout keeps the television mounted between them.
 */
export function useOSNav() {
  const [path, setPath] = useState<string>(ROOT);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const stack = useRef<Entry[]>([]);
  const pos = useRef(0);

  const sync = useCallback(() => {
    setCanGoBack(pos.current > 0);
    setCanGoForward(pos.current < stack.current.length - 1);
    setPath(stack.current[pos.current].path);
  }, []);

  useEffect(() => {
    const restore = () => {
      const legacyPath = new URLSearchParams(window.location.search).get('p');
      const currentPath = legacyPath || window.location.pathname || ROOT;
      const id = window.history.state?.[ENTRY_KEY];
      const index = stack.current.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        pos.current = index;
        stack.current[index].path = currentPath;
      } else {
        // A fresh load or an entry outside this mounted shell's history starts
        // a new known trail. Never guess an index from a matching path.
        const entry = createEntry(currentPath);
        stack.current = [entry];
        pos.current = 0;
        window.history.replaceState(
          { ...window.history.state, [ENTRY_KEY]: entry.id },
          '',
          legacyPath ? urlFor(currentPath) : undefined,
        );
      }
      sync();
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [sync]);

  const navigate = useCallback((next: string) => {
    if (!stack.current.length || next === stack.current[pos.current].path) return;
    const entry = createEntry(next);
    // Pass only our state; copying Next's internal flags here bypasses its
    // native-history adapter and would leave useSearchParams out of sync.
    window.history.pushState({ [ENTRY_KEY]: entry.id }, '', urlFor(next));
    stack.current = [...stack.current.slice(0, pos.current + 1), entry];
    pos.current = stack.current.length - 1;
    sync();
  }, [sync]);

  /** Replace in place, retaining the identity of this visit. */
  const replace = useCallback((next: string) => {
    const entry = stack.current[pos.current];
    if (!entry) return;
    window.history.replaceState({ [ENTRY_KEY]: entry.id }, '', urlFor(next));
    entry.path = next;
    sync();
  }, [sync]);

  const back = useCallback(() => {
    if (pos.current <= 0) return false;
    window.history.back();
    return true;
  }, []);

  const forward = useCallback(() => {
    if (pos.current >= stack.current.length - 1) return false;
    window.history.forward();
    return true;
  }, []);

  return useMemo(
    () => ({ path, navigate, replace, back, forward, canGoBack, canGoForward }),
    [path, navigate, replace, back, forward, canGoBack, canGoForward],
  );
}

function urlFor(path: string): string {
  const url = new URL(window.location.href);
  url.pathname = path;
  url.searchParams.delete('p');
  return `${url.pathname}${url.search}${url.hash}`;
}
