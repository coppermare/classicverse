'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppProps } from '../types';
import { RetroButton, INK } from '../ui';
import * as sfx from '../sound';
import {
  COLS, ROWS, createGame, queueTurn, tick,
  type Cell, type Game,
} from './snakeCore';

/**
 * Snake — the game, on a green-phosphor screen.
 *
 * A vintage monochrome monitor is exactly what the original of this game ran on,
 * so the channel dresses the CRT as one: dark phosphor field, a bright-green
 * snake, an amber pellet. It reads as "classic Snake" at a glance and belongs to
 * a wooden television at the same time.
 *
 * The whole game is real. The snake advances one cell per tick along the
 * direction it is travelling; eating the pellet grows it by a segment, scores a
 * point and quickens the tick; running into a wall or into itself ends the run.
 * The best score is kept between visits. None of it is faked or scripted — it is
 * a working game with a working rulebook.
 */

/* The board's cell count (COLS×ROWS) and the rules live in snakeCore.ts; here is
   only how big a cell is drawn and the colours it is drawn in. */
const CELL = 22;
const W = COLS * CELL;
const H = ROWS * CELL;

/* Phosphor palette. A green screen with one amber accent for the pellet — two
   phosphors, both period-correct, and the contrast is what makes the pellet
   findable at speed. */
const BG = '#0c1410';
const GRID = 'rgba(158,240,106,0.05)';
const BODY = '#3fae5a';
const HEAD = '#9ef06a';
const FOOD = '#f0b34a';
const PHOSPHOR = '#9ef06a';

const BEST_KEY = 'cv-snake-best';

type Status = 'idle' | 'playing' | 'paused' | 'over' | 'won';

function readBest(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(BEST_KEY)) || 0;
}

export default function SnakeApp({}: AppProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game>(createGame());
  /** Mirrors of state read inside timer/key callbacks, where the render closure
   *  would be stale. Written from effects, never during render. */
  const statusRef = useRef<Status>(status);
  const bestRef = useRef(best);
  /** Synchronous run flag — stops the loop the instant a run ends, without
   *  waiting for React to re-render and tear the effect down. */
  const runningRef = useRef(false);

  useEffect(() => { statusRef.current = status; }, [status]);

  /* ── Drawing ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const g = gameRef.current;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // A faint lattice, so the field reads as a grid the snake sits on rather
    // than a void it floats in.
    ctx.fillStyle = GRID;
    for (let x = 1; x < COLS; x++) ctx.fillRect(x * CELL, 0, 1, H);
    for (let y = 1; y < ROWS; y++) ctx.fillRect(0, y * CELL, W, 1);

    const dot = (c: Cell, color: string) => {
      ctx.fillStyle = color;
      // A pixel of margin all round, so segments read as beads on the grid
      // instead of one welded ribbon.
      ctx.fillRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4);
    };

    dot(g.food, FOOD);
    g.snake.forEach((c, i) => dot(c, i === 0 ? HEAD : BODY));
  }, []);

  /* Redraw whenever what is on screen changes — a new score, a pause, a reset —
     on top of the per-tick redraw the loop does while playing. */
  useEffect(() => { draw(); }, [draw, status, score]);

  /* ── Ending a run ── */
  const finish = useCallback((next: 'over' | 'won') => {
    runningRef.current = false;
    const g = gameRef.current;
    if (g.score > bestRef.current) {
      bestRef.current = g.score;
      setBest(g.score);
      try { localStorage.setItem(BEST_KEY, String(g.score)); } catch { /* private mode */ }
    }
    sfx.error();
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
    gameRef.current = createGame();
    setScore(0);
    setStatus('playing');
    sfx.click();
  }, []);

  /** Space / Start: begin a fresh run, or pause and resume one in progress. */
  const toggle = useCallback(() => {
    const s = statusRef.current;
    if (s === 'playing') setStatus('paused');
    else if (s === 'paused') setStatus('playing');
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

  /* ── Keyboard ──
     Captured, so the arrows drive the snake and never reach the shell behind
     (which would otherwise read them as "change channel"). Escape is left to
     bubble, so the set's own Back still walks out of the game. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: 44,
      background: BG,
      fontFamily: 'var(--font-sans)',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch',
    }}>
      {/* ── Scoreboard ── */}
      <div style={{
        flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '10px 18px 8px',
        color: PHOSPHOR, textShadow: '0 0 7px rgba(158,240,106,0.5)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '0.14em',
      }}>
        <Readout label="SCORE" value={score} />
        <span style={{ font: '700 12px/1 var(--font-sans)', opacity: 0.7 }}>SNAKE</span>
        <Readout label="BEST" value={best} align="right" />
      </div>

      {/* ── The screen ── */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 18px',
      }}>
        <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', aspectRatio: `${W} / ${H}` }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            aria-label={`Snake board, ${COLS} by ${ROWS}. Score ${score}.`}
            style={{
              display: 'block', width: '100%', height: '100%',
              imageRendering: 'pixelated',
              borderRadius: 3,
              boxShadow: 'inset 0 0 0 1px rgba(158,240,106,0.18), 0 0 24px rgba(0,0,0,0.5)',
            }}
          />
          {/* CRT scanlines, drawn over the field — cheap, and it sells the tube. */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.16) 2px 3px)',
          }} />

          {status !== 'playing' && (
            <Overlay
              title={status === 'over' ? 'GAME OVER' : status === 'won' ? 'YOU WIN' : status === 'paused' ? 'PAUSED' : 'SNAKE'}
              lines={
                status === 'idle'
                  ? ['Eat the pellet, dodge yourself.', 'Arrow keys or the pad below.']
                  : status === 'paused'
                    ? [`Score ${score}`, 'Press Start to resume.']
                    : [`Score ${score}${score >= best && score > 0 ? ' — new best!' : `   Best ${best}`}`, 'Press Start to play again.']
              }
            />
          )}
        </div>
      </div>

      {/* ── The controls ──
          Keyboard is the real instrument; this pad is here so the game plays
          with the pointer the rest of the set is driven by. */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 18, padding: '10px 18px 14px',
      }}>
        <Dpad onTurn={turn} />
        <RetroButton label={startLabel} onClick={toggle} style={{ minWidth: 92, height: 34 }}>
          {startLabel}
        </RetroButton>
      </div>
    </div>
  );
}

/** One side of the scoreboard: a small label over a bright number. */
function Readout({ label, value, align = 'left' }: { label: string; value: number; align?: 'left' | 'right' }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start', gap: 3 }}>
      <span style={{ font: '600 8px/1 var(--font-sans)', opacity: 0.65 }}>{label}</span>
      <span style={{ font: '800 20px/1 var(--font-sans)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
        {String(value).padStart(3, '0')}
      </span>
    </span>
  );
}

/** The message shown whenever the game is not running. */
function Overlay({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 3,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
      background: 'rgba(6,12,8,0.72)', color: PHOSPHOR, textAlign: 'center', padding: 16,
      textShadow: '0 0 8px rgba(158,240,106,0.55)',
    }}>
      <div style={{ font: '800 26px/1 var(--font-sans)', letterSpacing: '0.12em' }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ font: '500 12px/1.4 var(--font-sans)', opacity: i === 0 ? 0.95 : 0.7, maxWidth: 260 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** A four-way pad in the set's own bevelled buttons, laid out on a 3×3 grid. */
const DPAD: { d: Cell; label: string; path: string; col: number; row: number }[] = [
  { d: { x: 0, y: -1 }, label: 'Up', path: 'M6 2l4 5H2z', col: 2, row: 1 },
  { d: { x: -1, y: 0 }, label: 'Left', path: 'M2 6l5-4v8z', col: 1, row: 2 },
  { d: { x: 1, y: 0 }, label: 'Right', path: 'M10 6L5 2v8z', col: 3, row: 2 },
  { d: { x: 0, y: 1 }, label: 'Down', path: 'M6 10L2 5h8z', col: 2, row: 3 },
];

function Dpad({ onTurn }: { onTurn: (d: Cell) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 34px)', gridTemplateRows: 'repeat(3, 34px)', gap: 4 }}>
      {DPAD.map((b) => (
        <div key={b.label} style={{ gridColumn: b.col, gridRow: b.row }}>
          <RetroButton icon label={b.label} onClick={() => onTurn(b.d)} style={{ width: 34, height: 34 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d={b.path} fill={INK} /></svg>
          </RetroButton>
        </div>
      ))}
    </div>
  );
}
