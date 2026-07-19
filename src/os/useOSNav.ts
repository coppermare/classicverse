'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROOT } from './path';

/**
 * Navigation + history for the OS.
 *
 * The entire location is one path string in `?p=`, which is what makes Back and
 * Forward dependable: there is exactly one thing to compare, so "did the user
 * press Back" is answered by looking at neighbours in our own stack instead of
 * reconstructing state from a handful of loosely-related query params.
 *
 * We keep our own stack because the browser deliberately won't tell you whether
 * Back or Forward is available — without it the toolbar arrows can only guess.
 * The stack stays authoritative for the button states while the real browser
 * history stays authoritative for the actual movement, so the on-screen arrows
 * and the browser's own arrows drive the same trail and never disagree.
 *
 * Everything routes through next/navigation rather than raw history.pushState:
 * the App Router patches those globally and treats entries it didn't create as
 * cache misses, which turned a Back press into a full page reload — killing
 * in-flight audio and re-booting the whole set.
 */
export function useOSNav() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [path, setPath] = useState<string>(ROOT);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const stack = useRef<string[]>([ROOT]);
  const pos = useRef(0);
  const hydrated = useRef(false);

  const sync = useCallback(() => {
    setCanGoBack(pos.current > 0);
    setCanGoForward(pos.current < stack.current.length - 1);
    setPath(stack.current[pos.current]);
  }, []);

  const urlFor = (p: string) =>
    p === ROOT ? window.location.pathname : `${window.location.pathname}?p=${encodeURIComponent(p)}`;

  // Hydrate from the initial URL so a deep link or refresh lands on the right
  // screen. searchParams can only be read in an effect — this component is
  // server-rendered first.
  useEffect(() => {
    const initial = searchParams.get('p') || ROOT;
    stack.current = [initial];
    pos.current = 0;
    hydrated.current = true;
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((next: string) => {
    if (!hydrated.current || next === stack.current[pos.current]) return;
    stack.current = [...stack.current.slice(0, pos.current + 1), next];
    pos.current = stack.current.length - 1;
    router.push(urlFor(next), { scroll: false });
    sync();
  }, [router, sync]);

  /** Replace in place — for state that shouldn't earn a Back step. */
  const replace = useCallback((next: string) => {
    if (!hydrated.current) return;
    stack.current[pos.current] = next;
    router.replace(urlFor(next), { scroll: false });
    sync();
  }, [router, sync]);

  const back = useCallback(() => {
    if (pos.current <= 0) return false;
    router.back();
    return true;
  }, [router]);

  const forward = useCallback(() => {
    if (pos.current >= stack.current.length - 1) return false;
    router.forward();
    return true;
  }, [router]);

  // React to URL changes we didn't just make — the browser's own Back/Forward.
  // Neighbours are checked before a general search because a path can legitimately
  // appear in the stack twice (visit Radio, leave, come back); indexOf alone would
  // jump the cursor to the first copy and desync the arrows from the real trail.
  useEffect(() => {
    if (!hydrated.current) return;
    const p = searchParams.get('p') || ROOT;
    if (p === stack.current[pos.current]) return;

    if (stack.current[pos.current - 1] === p) pos.current -= 1;
    else if (stack.current[pos.current + 1] === p) pos.current += 1;
    else {
      const i = stack.current.indexOf(p);
      if (i !== -1) pos.current = i;
      else {
        stack.current = [...stack.current.slice(0, pos.current + 1), p];
        pos.current = stack.current.length - 1;
      }
    }
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return { path, navigate, replace, back, forward, canGoBack, canGoForward };
}
