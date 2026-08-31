'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import type { AppProps } from '../types';
import { RetroButton } from '../ui';
import * as sfx from '../sound';
import {
  COLS, ROWS,
  createGame, fitBoard, queueTurn, tick,
  type Board, type Cell, type Game,
} from './snakeCore';

/**
 * Snake — the game, played on the whole screen.
 *
 * The set's screen *is* the board. There is no framed picture floating in a
 * surround any more: the field runs to all four edges, and the walls the snake
 * dies against are the edges of the screen itself. A game should own the
 * display it is being played on.
 *
 * Because the board is cut to the screen rather than the other way round, its
 * size is not a constant. The field is measured, divided into cells of roughly
 * TARGET_CELL across, and the run is played on whatever grid that gives —
 * 21×16 on a laptop, more on a wide one. The rulebook in snakeCore takes the
 * dimensions with the game, so none of this touches the rules.
 *
 * The whole game is real. The snake advances one cell per tick along the
 * direction it is travelling; eating the pellet grows it by a segment, scores a
 * point and quickens the tick; running into a wall or into itself ends the run.
 * Filling the board wins it. The best score is kept between visits. None of it
 * is faked or scripted — it is a working game with a working rulebook.
 */

/** Roughly how many pixels a cell should be. The grid is fitted to the screen
 *  around this, so cells stay close to square at any size. */
const TARGET_CELL = 24;

/* LCD palette. A pale olive field with dark ink laid on it — the way the
   handhelds that carried this game everywhere actually looked, rather than the
   glowing tube it started on. Light screen, dark snake, and the head darker
   still than the body so the leading end is the thing the eye lands on. The
   pellet keeps the set's red: the one colour here that is not the screen. */
const FIELD = '#d9e3b2';
const GRID = 'rgba(45,60,25,0.10)';
const BODY = '#6b8a3e';
const HEAD = '#33471c';
const FOOD = '#b3282d';
const LCD_INK = '#2f3f1b';

const BEST_KEY = 'cv-snake-best';

type Status = 'idle' | 'playing' | 'paused' | 'over' | 'won';

function readBest(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
  } catch {
    return 0;
  }
}

export default function SnakeApp({}: AppProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  // Load the persisted record after hydration. Reading it in the state
  // initializer rendered 0 on the server and a different value in the browser,
  // which could make React discard the first render for returning players.
  const [best, setBest] = useState(0);
  /** The grid the screen currently affords. Null until the field is measured. */
  const [dims, setDims] = useState<Board | null>(null);
  /** The board actually being played on.
   *
   *  Deliberately not the same value as `dims`. A resize mid-run changes what
   *  the screen affords, but the run keeps the board it started with — so the
   *  two disagree for exactly as long as that run lasts, and everything the
   *  player is told (the grid, the cell count, the percentage filled) has to
   *  come from this one, not from the screen. Reading the HUD off `dims` had it
   *  reporting a board nobody was playing on, and measuring progress against
   *  the wrong denominator. */
  const [board, setBoard] = useState<Board>({ cols: COLS, rows: ROWS });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game>(createGame());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  /** The field's size in CSS pixels, read by the painter. */
  const sizeRef = useRef({ w: 0, h: 0 });
  /** Mirrors of state read inside timer/key callbacks, where the render closure
   *  would be stale. Written from effects, never during render. */
  const statusRef = useRef<Status>(status);
  const bestRef = useRef(best);
  const dimsRef = useRef<Board | null>(null);
  /** Synchronous run flag — stops the loop the instant a run ends, without
   *  waiting for React to re-render and tear the effect down. */
  const runningRef = useRef(false);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => {
    // Defer the external-store snapshot until after the first paint. Besides
    // matching the server render, this avoids a cascading render inside the
    // effect itself.
    const frame = window.requestAnimationFrame(() => {
      const stored = readBest();
      bestRef.current = stored;
      setBest(stored);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  /* ── Drawing ──
     Cells are sized from the field rather than fixed, so the board reaches the
     edges exactly. The backing store follows the element's real pixel size, so
     the grid stays crisp on a retina panel instead of being upscaled. */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const { w, h } = sizeRef.current;
    if (!canvas || !ctx || w < 2 || h < 2) return;
    const g = gameRef.current;

    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.round(w * dpr));
    const bh = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, w, h);

    const cw = w / g.cols;
    const ch = h / g.rows;

    // A faint lattice, so the field reads as a grid the snake sits on rather
    // than a void it floats in.
    ctx.fillStyle = GRID;
    for (let x = 1; x < g.cols; x++) ctx.fillRect(Math.round(x * cw), 0, 1, h);
    for (let y = 1; y < g.rows; y++) ctx.fillRect(0, Math.round(y * ch), w, 1);

    // A margin proportional to the cell, so segments read as beads on the grid
    // instead of one welded ribbon at every board size.
    const m = Math.max(1, Math.round(Math.min(cw, ch) * 0.1));
    const dot = (c: Cell, color: string) => {
      ctx.fillStyle = color;
      const x0 = Math.round(c.x * cw);
      const y0 = Math.round(c.y * ch);
      ctx.fillRect(x0 + m, y0 + m, Math.round(cw) - m * 2, Math.round(ch) - m * 2);
    };

    dot(g.food, FOOD);
    g.snake.forEach((c, i) => dot(c, i === 0 ? HEAD : BODY));
  }, []);

  /* ── Fitting the board to the screen ── */
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width < 2 || r.height < 2) return;
      sizeRef.current = { w: r.width, h: r.height };
      const nextDims = fitBoard(r.width, r.height, TARGET_CELL);
      // Keep the synchronous mirror current too. A click in the same frame as
      // a resize must start on the board now visible, not the previous one.
      dimsRef.current = nextDims;
      setDims((d) => (d && d.cols === nextDims.cols && d.rows === nextDims.rows ? d : nextDims));
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  /* A new grid means a new board. Adopted straight away when nothing is at
     stake, and held back until the next run when something is: moving the walls
     out from under a snake mid-run would kill it through no fault of the
     player's. */
  useEffect(() => {
    if (!dims) return;
    dimsRef.current = dims;
    const s = statusRef.current;
    if (s === 'playing' || s === 'paused') return;
    const g = createGame(dims.cols, dims.rows);
    gameRef.current = g;
    setBoard({ cols: g.cols, rows: g.rows });
    draw();
  }, [dims, draw]);

  /* Redraw whenever what is on screen changes — a new score, a pause, a reset —
     on top of the per-tick redraw the loop does while playing. */
  useEffect(() => { draw(); }, [draw, status, score]);

  /* ── Ending a run ── */
  const finish = useCallback((next: 'over' | 'won') => {
    runningRef.current = false;
    statusRef.current = next;
    const g = gameRef.current;
    const beat = g.score > bestRef.current;
    if (beat) {
      bestRef.current = g.score;
      setBest(g.score);
      try { localStorage.setItem(BEST_KEY, String(g.score)); } catch { /* private mode */ }
    }
    // Filling the board is the best thing that can happen in this game; it used
    // to be seen off with the same buzz as running into a wall.
    if (next === 'won') sfx.open(); else sfx.error();
    setStatus(next);
  }, []);

  /* ── One tick ──
     The rules are in snakeCore; this only turns the outcome into what the set
     does about it — score, sound, the end of a run — and repaints. */
  const step = useCallback(() => {
    const outcome = tick(gameRef.current);
    if (outcome === 'dead') { draw(); finish('over'); return; }
    if (outcome === 'eat') { setScore(gameRef.current.score); sfx.tick(); }
    if (outcome === 'won') { setScore(gameRef.current.score); draw(); finish('won'); return; }
    draw();
  }, [draw, finish]);

  /* ── The loop ── */
  useEffect(() => {
    if (status !== 'playing') return;
    runningRef.current = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!runningRef.current) return;
      step();
      if (runningRef.current) timer = setTimeout(loop, gameRef.current.speed);
    };
    timer = setTimeout(loop, gameRef.current.speed);
    return () => { runningRef.current = false; clearTimeout(timer); };
  }, [status, step]);

  /* ── Transport ── */
  const start = useCallback(() => {
    const d = dimsRef.current;
    const g = d ? createGame(d.cols, d.rows) : createGame();
    gameRef.current = g;
    setBoard({ cols: g.cols, rows: g.rows });
    setScore(0);
    statusRef.current = 'playing';
    setStatus('playing');
    sfx.click();
  }, []);

  /** Space / Start: begin a fresh run, or pause and resume one in progress. */
  const toggle = useCallback(() => {
    const s = statusRef.current;
    if (s === 'playing') {
      // Stop synchronously. Waiting for the state effect left a small window in
      // which an already-scheduled tick moved the snake after PAUSE was pressed.
      runningRef.current = false;
      statusRef.current = 'paused';
      setStatus('paused');
    } else if (s === 'paused') {
      statusRef.current = 'playing';
      setStatus('playing');
    }
    else start();
  }, [start]);

  /** Buffer a turn, dropping the ones a real snake can't make: no reversing onto
   *  itself, no no-op repeat, no more than two waiting at once. Validated against
   *  the last *queued* turn, not the current heading, so a two-key corner (up
   *  then left, both within one tick) is legal while a straight reverse is not. */
  const turn = useCallback((nd: Cell) => {
    if (statusRef.current !== 'playing') return;
    queueTurn(gameRef.current, nd);
  }, []);

  // The screen stays uncluttered on touch devices: swipe directly on the field
  // instead of reserving a permanent patch of the board for four arrow buttons.
  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    touchStartRef.current = point ? { x: point.clientX, y: point.clientY } : null;
  }, []);

  const onTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const startPoint = touchStartRef.current;
    const endPoint = event.changedTouches[0];
    touchStartRef.current = null;
    if (!startPoint || !endPoint) return;

    const dx = endPoint.clientX - startPoint.x;
    const dy = endPoint.clientY - startPoint.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    turn(Math.abs(dx) > Math.abs(dy)
      ? { x: dx > 0 ? 1 : -1, y: 0 }
      : { x: 0, y: dy > 0 ? 1 : -1 });
  }, [turn]);

  /* ── Keyboard ──
     Captured, so the arrows drive the snake and never reach the shell behind
     (which would otherwise read them as "change channel"). Escape is left to
     bubble, so the set's own Back still walks out of the game. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable)
      ) return;
      let handled = true;
      switch (e.key) {
        case ' ': case 'Enter': toggle(); break;
        case 'ArrowUp': case 'w': case 'W': turn({ x: 0, y: -1 }); break;
        case 'ArrowDown': case 's': case 'S': turn({ x: 0, y: 1 }); break;
        case 'ArrowLeft': case 'a': case 'A': turn({ x: -1, y: 0 }); break;
        case 'ArrowRight': case 'd': case 'D': turn({ x: 1, y: 0 }); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [toggle, turn]);

  const startLabel =
    status === 'playing' ? 'PAUSE'
      : status === 'paused' ? 'RESUME'
        : status === 'idle' ? 'START'
          : 'PLAY AGAIN';

  const { cols, rows } = board;

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: FIELD,
      fontFamily: 'var(--font-sans)',
      display: 'flex',
    }}>
      <div
        ref={fieldRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          aria-label={`Snake board, ${cols} by ${rows}. Score ${score}.`}
          style={{
            position: 'absolute', inset: 0, display: 'block',
            width: '100%', height: '100%',
            imageRendering: 'pixelated',
          }}
        />

        {status !== 'playing' && (
          <Overlay
            title={status === 'idle' ? 'SNAKE' : status === 'over' ? 'GAME OVER' : status === 'won' ? 'YOU WIN' : 'PAUSED'}
            score={score}
            best={best}
            showScore={status !== 'idle'}
            showKeyboard={status === 'idle'}
          />
        )}

        {status !== 'playing' && (
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center',
              padding: '12px 14px', pointerEvents: 'none',
            }}
          >
            <RetroButton label={startLabel} onClick={toggle} style={{ width: 104, minWidth: 104, height: 32, pointerEvents: 'auto' }}>
              {startLabel}
            </RetroButton>
          </div>
        )}
      </div>
    </div>
  );
}

/** One compact score reading, reserved for a pause or end state. */
function Readout({ label, value }: { label: string; value: number }) {
  return (
    <span style={{
      display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
    }}>
      <span style={{ font: '700 9px/1 var(--font-sans)', letterSpacing: '0.12em', opacity: 0.65 }}>{label}</span>
      <span style={{ font: '800 22px/1 var(--font-sans)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em' }}>
        {String(value).padStart(3, '0')}
      </span>
    </span>
  );
}

function ScorePanel({ score, best }: { score: number; best: number }) {
  return (
    <div aria-label={`Score ${score}. Best ${best}.`} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48,
    }}>
      <Readout label="SCORE" value={score} />
      <Readout label="BEST" value={best} />
    </div>
  );
}

function Keycap({ children, wide = false }: { children: string; wide?: boolean }) {
  return (
    <kbd aria-hidden style={{
      minWidth: wide ? 56 : 25, height: 25, padding: '0 6px', border: `1px solid ${HEAD}`, borderRadius: 2,
      background: '#f3f0df', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72), 0 1px 0 rgba(47,63,27,0.28)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      font: '800 12px/1 var(--font-sans)', color: LCD_INK,
    }}>{children}</kbd>
  );
}

function KeyboardHint() {
  return (
    <div aria-label="Use the arrow keys or W A S D to steer. Enter or Space starts and pauses the game." style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
      <div style={{ font: '700 10px/1 var(--font-sans)', letterSpacing: '0.11em', opacity: 0.7 }}>ARROWS OR WASD TO STEER</div>
      <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Keycap>←</Keycap><Keycap>↑</Keycap><Keycap>↓</Keycap><Keycap>→</Keycap>
        <span style={{ margin: '0 5px', font: '700 9px/1 var(--font-sans)', opacity: 0.52 }}>OR</span>
        <Keycap>W</Keycap><Keycap>A</Keycap><Keycap>S</Keycap><Keycap>D</Keycap>
      </div>
      <div style={{ marginTop: 4, font: '700 9px/1 var(--font-sans)', letterSpacing: '0.11em', opacity: 0.64 }}>START / PAUSE</div>
      <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Keycap wide>ENTER</Keycap>
        <span style={{ margin: '0 2px', font: '700 9px/1 var(--font-sans)', opacity: 0.52 }}>OR</span>
        <Keycap wide>SPACE</Keycap>
      </div>
    </div>
  );
}

/** The only interruption to the field: a short status, score, or start prompt. */
function Overlay({
  title, score, best, showScore, showKeyboard,
}: {
  title: string;
  score: number;
  best: number;
  showScore: boolean;
  showKeyboard: boolean;
}) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
      background: 'rgba(217,227,178,0.78)', color: LCD_INK, textAlign: 'center', padding: 16,
    }}>
      <div style={{ font: '800 26px/1 var(--font-sans)', letterSpacing: '0.12em' }}>{title}</div>
      {showScore && <ScorePanel score={score} best={best} />}
      {showKeyboard && <KeyboardHint />}
    </div>
  );
}
