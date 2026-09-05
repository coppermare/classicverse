/** Integration regressions: real React effects and DOM events, mocked device APIs. */
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Classicverse from '../src/os/Classicverse';
import RadioApp from '../src/os/apps/RadioApp';
import WeatherApp from '../src/os/apps/WeatherApp';
import { useOSNav } from '../src/os/useOSNav';
import { DESKTOP } from '../src/os/registry';
import { resolvePath } from '../src/os/path';
import type { AppNode, AppProps } from '../src/os/types';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
const win = dom.window;
for (const key of ['window', 'document', 'navigator', 'localStorage', 'Element', 'HTMLElement', 'Node', 'MutationObserver']) {
  const value = key === 'window' ? win : win[key as keyof typeof win];
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  CSS: { escape: (value: string) => value.replace(/[^\w-]/g, '\\$&') },
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  ResizeObserver: class {
    constructor(private callback: (entries: unknown[]) => void) {}
    observe() { this.callback([{ contentRect: { width: 640, height: 480 } }]); }
    disconnect() {}
  },
});
win.requestAnimationFrame = () => 1;
win.cancelAnimationFrame = () => {};
win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
win.HTMLElement.prototype.scrollIntoView = () => {};
win.HTMLCanvasElement.prototype.getContext = (() => null) as typeof win.HTMLCanvasElement.prototype.getContext;

const media = new WeakMap<HTMLMediaElement, { pauses: number; loads: number; plays: number }>();
function mediaState(el: HTMLMediaElement) {
  if (!media.has(el)) media.set(el, { pauses: 0, loads: 0, plays: 0 });
  return media.get(el)!;
}
win.HTMLMediaElement.prototype.play = function () { mediaState(this).plays++; return Promise.resolve(); };
win.HTMLMediaElement.prototype.pause = function () { mediaState(this).pauses++; };
win.HTMLMediaElement.prototype.load = function () { mediaState(this).loads++; };

class AudioParamStub {
  value = 0;
  setTargetAtTime(value: number) { this.value = value; }
  setValueAtTime(value: number) { this.value = value; }
  exponentialRampToValueAtTime(value: number) { this.value = value; }
}
class AudioNodeStub {
  gain = new AudioParamStub();
  frequency = new AudioParamStub();
  Q = new AudioParamStub();
  loop = false;
  stopped = false;
  disconnected = false;
  frequencyBinCount = 256;
  connect(node: AudioNodeStub) { return node; }
  disconnect() { this.disconnected = true; }
  start() {}
  stop() { this.stopped = true; }
  getByteTimeDomainData(bytes: Uint8Array) { bytes.fill(128); }
}
const contexts: AudioContextStub[] = [];
const attachedMedia = new WeakSet<HTMLMediaElement>();
class AudioContextStub {
  state = 'running';
  sampleRate = 8000;
  currentTime = 0;
  destination = new AudioNodeStub();
  sources: AudioNodeStub[] = [];
  gains: AudioNodeStub[] = [];
  elements: HTMLMediaElement[] = [];
  constructor() { contexts.push(this); }
  createMediaElementSource(el: HTMLMediaElement) {
    assert.ok(!attachedMedia.has(el), 'a media element must not be attached twice');
    attachedMedia.add(el);
    this.elements.push(el);
    return new AudioNodeStub();
  }
  createGain() { const node = new AudioNodeStub(); this.gains.push(node); return node; }
  createAnalyser() { return new AudioNodeStub(); }
  createBiquadFilter() { return new AudioNodeStub(); }
  createOscillator() { return new AudioNodeStub(); }
  createBuffer(_channels: number, length: number) { return { getChannelData: () => new Float32Array(length) }; }
  createBufferSource() { const node = new AudioNodeStub(); this.sources.push(node); return node; }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}
Object.defineProperty(win, 'AudioContext', { configurable: true, value: AudioContextStub });
Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: AudioContextStub });

let root: Root | null = null;
let host: HTMLDivElement;
async function mount(children: ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => { root!.render(<StrictMode>{children}</StrictMode>); });
}
async function unmount() {
  if (root) await act(async () => { root!.unmount(); });
  root = null;
  document.body.replaceChildren();
}
function button(name: string): HTMLButtonElement {
  const found = [...host.querySelectorAll<HTMLButtonElement>('button')]
    .find((el) => el.getAttribute('aria-label') === name || el.textContent === name);
  assert.ok(found, `button ${name} exists`);
  return found;
}
async function click(name: string) { await act(async () => button(name).click()); }
async function key(target: HTMLElement, value: string) {
  const event = new win.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  await act(async () => { target.focus(); target.dispatchEvent(event); });
  return event;
}
function propsFor(path: string): AppProps {
  return {
    node: resolvePath(DESKTOP, path).node as AppNode,
    os: { root: DESKTOP, path, navigate() {}, back() {}, forward() {}, siblings: [], index: 0, volume: 0.5, muted: false },
  };
}
function reset() {
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  contexts.length = 0;
  globalThis.fetch = async () => new Response('[]');
}
let passed = 0;
async function test(name: string, run: () => Promise<void>) {
  reset();
  try { await run(); passed++; console.log(`  ✓ ${name}`); }
  finally { await unmount(); }
}

let nav: ReturnType<typeof useOSNav>;
function NavigationHarness() { nav = useOSNav(); return <output>{nav.path}</output>; }
async function traverse(action: () => void) {
  await act(async () => {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('popstate did not arrive')), 1000);
      window.addEventListener('popstate', () => { clearTimeout(timeout); resolve(); }, { once: true });
      action();
    });
  });
}

async function main() {
  console.log('UI integration');
  await test('repeated paths retain correct Back and Forward states', async () => {
    await mount(<NavigationHarness />);
    await act(async () => nav.navigate('/f1'));
    await act(async () => nav.navigate('/'));
    await traverse(() => nav.back());
    assert.equal(nav.path, '/f1');
    assert.ok(nav.canGoBack && nav.canGoForward);
    await traverse(() => nav.forward());
    assert.equal(nav.path, '/');
    assert.ok(nav.canGoBack);
    assert.equal(nav.canGoForward, false);
    // Browser traversal can jump across several entries, including equal URLs.
    await traverse(() => window.history.go(-2));
    assert.equal(nav.path, '/');
    assert.equal(nav.canGoBack, false);
    assert.ok(nav.canGoForward);
    await traverse(() => window.history.go(2));
    assert.ok(nav.canGoBack);
    assert.equal(nav.canGoForward, false);
  });

  await test('replacement, branch truncation and deep links retain history identity', async () => {
    window.history.replaceState(null, '', '/cars/1885?ref=review#screen');
    await mount(<NavigationHarness />);
    assert.equal(nav.path, '/cars/1885');
    await act(async () => nav.replace('/cars'));
    assert.equal(nav.canGoBack, false);
    await act(async () => nav.navigate('/f1'));
    await act(async () => nav.navigate('/'));
    await traverse(() => nav.back());
    await act(async () => nav.navigate('/snake'));
    assert.equal(nav.canGoForward, false);
    assert.equal(new URLSearchParams(window.location.search).get('ref'), 'review');
    assert.equal(window.location.hash, '#screen');
    await traverse(() => nav.back());
    assert.equal(nav.path, '/f1');
    await traverse(() => nav.back());
    assert.equal(nav.path, '/cars');
    assert.equal(nav.canGoBack, false);
  });

  await test('focused buttons own Enter and focused volume does not tune the grid', async () => {
    localStorage.setItem('cv-set-power', 'on');
    await mount(<Classicverse />);
    const event = await key(button('Weather'), 'Enter');
    assert.equal(event.defaultPrevented, false, 'native activation must remain enabled');
    assert.equal(window.location.pathname, '/', 'the shell must not open F1 instead');
    const volume = host.querySelector<HTMLElement>('[aria-label="Volume"]')!;
    const tuning = host.querySelector('[aria-label="Tuning"]')!;
    const previousTuning = tuning.getAttribute('aria-valuenow');
    await key(volume, 'ArrowRight');
    assert.equal(tuning.getAttribute('aria-valuenow'), previousTuning);
    assert.equal(volume.getAttribute('aria-valuenow'), '55');
    await key(button('A century of cars'), 'ArrowRight');
    assert.equal(document.activeElement, button('Radio'), 'arrows follow the focused tile');
    await key(tuning as HTMLElement, 'End');
    assert.equal(tuning.getAttribute('aria-valuenow'), '5');
    await key(tuning as HTMLElement, 'Enter');
    assert.equal(window.location.pathname, '/changelog');
    await click('Home');
    await click('Snake');
    assert.equal((await key(button('Home'), 'Enter')).defaultPrevented, false, 'Snake must not capture toolbar activation');
    await click('Home');
    await click('Search');
    assert.equal((await key(button('Close search'), 'Enter')).defaultPrevented, false);
  });

  for (const [path, nextLabel] of [['/cars/1885', 'Next car'], ['/f1/ferrari/1', 'Next win']]) {
    await test(`a failed image at ${path} does not suppress the next record`, async () => {
      localStorage.setItem('cv-set-power', 'on');
      window.history.replaceState(null, '', path);
      await mount(<Classicverse />);
      const hero = () => host.querySelector<HTMLImageElement>('.cv-tv-screen img[alt]:not([alt=""])');
      const first = hero();
      assert.ok(first, 'first record has a photograph');
      const src = first.src;
      await act(async () => { first.dispatchEvent(new win.Event('error')); });
      assert.equal(hero(), null);
      await click(nextLabel);
      assert.ok(hero(), 'next record attempts its own image');
      assert.notEqual(hero()!.src, src);
    });
  }

  await test('a failed F1 race photo retries with a real constructor photograph', async () => {
    localStorage.setItem('cv-set-power', 'on');
    window.history.replaceState(null, '', '/f1/mclaren/1');
    await mount(<Classicverse />);
    const hero = () => host.querySelector<HTMLImageElement>('.cv-tv-screen img[alt]:not([alt=""])');
    const racePhoto = hero();
    assert.ok(racePhoto, 'win has a preferred race photograph');
    const raceSrc = racePhoto.src;
    await act(async () => { racePhoto.dispatchEvent(new win.Event('error')); });
    assert.ok(hero(), 'failed race photograph falls back to a constructor photograph');
    assert.notEqual(hero()!.src, raceSrc);
    assert.ok(hero()!.src.startsWith('https://'), 'fallback is a remote photograph');
  });

  await test('a failed F1 gallery thumbnail retries with a real constructor photograph', async () => {
    localStorage.setItem('cv-set-power', 'on');
    window.history.replaceState(null, '', '/f1/mclaren');
    await mount(<Classicverse />);
    const tile = host.querySelector<HTMLButtonElement>('button[data-id="1"]')!;
    const racePhoto = tile.querySelector<HTMLImageElement>('img')!;
    assert.ok(racePhoto, 'win tile has a preferred race photograph');
    const raceSrc = racePhoto.src;
    await act(async () => { racePhoto.dispatchEvent(new win.Event('error')); });
    const fallback = tile.querySelector<HTMLImageElement>('img');
    assert.ok(fallback, 'failed thumbnail falls back to a constructor photograph');
    assert.notEqual(fallback.src, raceSrc);
    assert.ok(fallback.src.startsWith('https://'), 'thumbnail fallback is a remote photograph');
  });

  await test('F1 Commons photographs request gallery and detail renditions', async () => {
    localStorage.setItem('cv-set-power', 'on');
    window.history.replaceState(null, '', '/f1/renault');
    await mount(<Classicverse />);
    const tile = host.querySelector<HTMLImageElement>('button[data-id="1"] img');
    assert.ok(tile?.src.includes('/330px-'), 'gallery requests the 330px Commons rendition');
    await unmount();

    window.history.replaceState(null, '', '/f1/renault/1');
    await mount(<Classicverse />);
    const detail = host.querySelector<HTMLImageElement>('.cv-tv-screen img[alt]:not([alt=""])');
    assert.ok(detail?.src.includes('/960px-'), 'detail requests the 960px Commons rendition');
  });

  await test('fresh HERE coordinates replace the previous forecast location', async () => {
    const requests: URL[] = [];
    globalThis.fetch = async (input) => {
      requests.push(new URL(String(input)));
      return new Response('{}', { status: 503 });
    };
    let coordinates = { latitude: 51.5, longitude: -0.1 };
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition(success: (position: { coords: typeof coordinates }) => void) { success({ coords: coordinates }); },
    } });
    await mount(<WeatherApp {...propsFor('/weather')} />);
    await click('Use my location');
    assert.equal(requests.at(-1)!.searchParams.get('latitude'), '51.5');
    coordinates = { latitude: 48.85, longitude: 2.35 };
    await click('Use my location');
    assert.equal(requests.at(-1)!.searchParams.get('latitude'), '48.85');
    assert.equal(requests.at(-1)!.searchParams.get('longitude'), '2.35');
    assert.ok(host.textContent!.includes('48.85°, 2.35°'));
  });

  await test('radio survives Strict Mode replay and disposes of its graph on unmount', async () => {
    await mount(<RadioApp {...propsFor('/radio')} />);
    const graph = contexts.find((ctx) => ctx.elements.length)!;
    assert.ok(graph);
    assert.equal(contexts.filter((ctx) => ctx.elements.length).length, 1);
    assert.equal(graph.state, 'running');
    const noise = graph.sources.find((source) => source.loop)!;
    assert.ok(noise && !noise.stopped);
    assert.ok(graph.gains.some((gain) => gain.gain.value === 0.09), 'empty band produces static');
    const audio = graph.elements[0];
    const pauses = mediaState(audio).pauses;
    await unmount();
    assert.equal(graph.state, 'closed');
    assert.ok(noise.stopped && noise.disconnected);
    assert.ok(mediaState(audio).pauses > pauses);
    assert.equal(mediaState(audio).loads, 1);
    await mount(<RadioApp {...propsFor('/radio')} />);
    assert.equal(contexts.filter((ctx) => ctx.elements.length && ctx.state === 'running').length, 1);
  });

  await test('switching the television off disposes of radio static', async () => {
    localStorage.setItem('cv-set-power', 'on');
    window.history.replaceState(null, '', '/radio');
    await mount(<Classicverse />);
    const graph = contexts.find((ctx) => ctx.elements.length)!;
    assert.ok(graph);
    await click('Turn off');
    assert.equal(graph.state, 'closed');
    assert.ok(graph.sources.filter((source) => source.loop).every((source) => source.stopped));
  });
  await test('long F1 galleries release offscreen images and restore them on return', async () => {
    const observers: ObserverStub[] = [];
    class ObserverStub {
      tiles: Element[] = [];
      disconnected = false;
      constructor(private callback: (entries: { target: Element; isIntersecting: boolean }[]) => void,
        readonly options: IntersectionObserverInit) { observers.push(this); }
      observe(tile: Element) { this.tiles.push(tile); }
      disconnect() { this.disconnected = true; }
      show(indices: number[]) {
        this.callback(this.tiles.map((target, i) => ({ target, isIntersecting: indices.includes(i) })));
      }
    }
    Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: ObserverStub });
    try {
      localStorage.setItem('cv-set-power', 'on');
      window.history.replaceState(null, '', '/f1/ferrari');
      await mount(<Classicverse />);
      const observer = observers.at(-1)!;
      assert.ok(observer.options.root, 'visibility uses the television scrollport');
      assert.equal(observer.tiles.length, 250, 'all wins remain keyboard-addressable');
      assert.equal(host.querySelectorAll('button[data-id] img').length, 0);
      await act(async () => observer.show([0, 1, 2, 3, 4, 5]));
      const first = host.querySelector('button[data-id="1"] img')!;
      assert.ok(first);
      await act(async () => observer.show([120, 121, 122, 123, 124, 125]));
      assert.equal(first.isConnected, false, 'the first image is released after scrolling away');
      assert.equal(host.querySelectorAll('button[data-id] img').length, 6);
      assert.equal(host.querySelectorAll('button[data-id]').length, 250);
      await act(async () => observer.show([0, 1, 2, 3, 4, 5]));
      assert.ok(host.querySelector('button[data-id="1"] img'), 'returning restores the first photo');
      await click('Home');
      assert.ok(observer.disconnected);
      await act(async () => observer.show([200]));
      assert.equal(host.querySelectorAll('button[data-id] img').length, 0, 'stale observer callbacks do not affect another folder');
    } finally {
      await unmount();
      Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    }
  });
  console.log(`\n${passed} integration checks passed.`);
  dom.window.close();
}

main().catch((error) => { console.error(error); dom.window.close(); process.exitCode = 1; });
