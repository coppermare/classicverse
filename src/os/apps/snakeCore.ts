/**
 * Snake — the rules, with no screen attached.
 *
 * Everything that decides what happens in the game lives here as plain data and
 * pure functions: advancing a tick, turning, growing, dying, winning. The React
 * component is only a view — it owns the canvas, the clock and the keys, and
 * calls into this. Keeping the rulebook separate from the paint is what lets the
 * whole game be tested deterministically (see scripts/test-snake.ts): feed it a
 * seeded source of randomness and every outcome is reproducible, with no timers
 * and no DOM.
 */

/** The field. 22×16 cells — a real board that still fills before a run drags. */
export const COLS = 22;
export const ROWS = 16;

/** The tick, in milliseconds: deliberate at first, a notch faster per pellet,
 *  down to a floor that is tense but still fair. */
export const START_MS = 150;
export const MIN_MS = 70;
export const SPEEDUP_MS = 4;

export interface Cell { x: number; y: number }

export interface Game {
  /** Head first. */
  snake: Cell[];
  /** The direction actually being travelled. */
  dir: Cell;
  /** Up to two buffered turns, so two quick presses in one tick both land. */
  queue: Cell[];
  food: Cell;
  /** Current tick length, in ms. */
  speed: number;
  score: number;
}

/** What a tick did — the component turns this into sound, score and status. */
export type Outcome = 'move' | 'eat' | 'dead' | 'won';

/** A source of randomness, injectable so tests are deterministic. */
export type Rng = () => number;

/** A fresh game. The first pellet is fixed so nothing random runs at creation;
 *  every pellet after it is placed at random. */
export function createGame(): Game {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  return {
    snake: [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }],
    dir: { x: 1, y: 0 },
    queue: [],
    food: { x: Math.floor(COLS * 0.75), y: cy },
    speed: START_MS,
    score: 0,
  };
}

/** A random empty cell, or null when the snake fills the board (a win). */
export function placeFood(snake: Cell[], rng: Rng = Math.random): Cell | null {
  const taken = new Set(snake.map((c) => `${c.x},${c.y}`));
  const free: Cell[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (!free.length) return null;
  return free[Math.floor(rng() * free.length)];
}

/**
 * Buffer a turn, rejecting the ones a snake can't make.
 *
 * Validated against the last *queued* turn, not the current heading, so a
 * two-key corner — up then left, both inside one tick — is legal, while a
 * straight reverse onto its own neck never is. Returns whether it was accepted.
 */
export function queueTurn(game: Game, nd: Cell): boolean {
  const last = game.queue.length ? game.queue[game.queue.length - 1] : game.dir;
  if (nd.x === last.x && nd.y === last.y) return false;          // no-op
  if (nd.x === -last.x && nd.y === -last.y) return false;         // reverse
  if (game.queue.length >= 2) return false;                      // buffer full
  game.queue.push(nd);
  return true;
}

/**
 * Advance one tick, mutating `game`. Returns what happened.
 *
 * The tail cell is about to be vacated, so it is not an obstacle — unless this
 * move eats, in which case the tail stays and the whole body counts. That one
 * rule is the difference between chasing your own tail (fine) and biting your
 * own side (fatal).
 */
export function tick(game: Game, rng: Rng = Math.random): Outcome {
  if (game.queue.length) game.dir = game.queue.shift()!;

  const head = game.snake[0];
  const nx = head.x + game.dir.x;
  const ny = head.y + game.dir.y;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return 'dead';

  const grows = nx === game.food.x && ny === game.food.y;
  const bodyLen = grows ? game.snake.length : game.snake.length - 1;
  for (let i = 0; i < bodyLen; i++) {
    if (game.snake[i].x === nx && game.snake[i].y === ny) return 'dead';
  }

  game.snake.unshift({ x: nx, y: ny });
  if (grows) {
    game.score += 1;
    game.speed = Math.max(MIN_MS, START_MS - game.score * SPEEDUP_MS);
    const food = placeFood(game.snake, rng);
    if (!food) return 'won';
    game.food = food;
    return 'eat';
  }
  game.snake.pop();
  return 'move';
}
