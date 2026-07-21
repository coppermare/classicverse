/**
 * test-snake.ts — the Snake rulebook, exercised deterministically.
 *
 * Run: npx tsx scripts/test-snake.ts
 *
 * The game runs at seven cells a second, which is too fast to prove correct by
 * watching it. So the rules were split into a pure core (snakeCore.ts) and this
 * drives that core with a seeded, injectable source of randomness — no timers,
 * no canvas — asserting every rule that matters: moving, turning, the two-key
 * corner, growth and scoring, the speed-up, the tail-follow exception, and each
 * of the three ways a run can end (wall, self, full board).
 */

import assert from 'node:assert/strict';
import {
  COLS, ROWS, START_MS, SPEEDUP_MS,
  createGame, queueTurn, tick,
  type Cell, type Game,
} from '../src/os/apps/snakeCore';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

/** Freeze the food where we want it, so movement tests never eat by accident. */
function withFood(g: Game, food: Cell): Game {
  g.food = food;
  return g;
}
const OFFBOARD: Cell = { x: -1, y: -1 };

console.log('Snake core');

test('a fresh game is three cells, heading right, nothing scored', () => {
  const g = createGame();
  assert.equal(g.snake.length, 3);
  assert.deepEqual(g.dir, { x: 1, y: 0 });
  assert.equal(g.score, 0);
  assert.equal(g.speed, START_MS);
  // Head leads; body trails to its left.
  assert.deepEqual(g.snake[0], { x: 11, y: 8 });
  assert.deepEqual(g.snake[2], { x: 9, y: 8 });
});

test('a plain step advances the head and drags the tail, same length', () => {
  const g = withFood(createGame(), OFFBOARD);
  const before = g.snake.length;
  const out = tick(g);
  assert.equal(out, 'move');
  assert.equal(g.snake.length, before);
  assert.deepEqual(g.snake[0], { x: 12, y: 8 });   // moved right
  assert.deepEqual(g.snake[2], { x: 10, y: 8 });   // tail followed
});

test('eating the pellet grows by one, scores, and quickens the tick', () => {
  const g = withFood(createGame(), { x: 12, y: 8 }); // one cell ahead
  const out = tick(g, () => 0);
  assert.equal(out, 'eat');
  assert.equal(g.score, 1);
  assert.equal(g.snake.length, 4);                  // grew, tail not dropped
  assert.equal(g.speed, START_MS - SPEEDUP_MS);     // one notch faster
});

test('the tick speed floors at the minimum and never goes below it', () => {
  const g = createGame();
  g.score = 25;                                      // deep into a run
  g.food = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y };
  const out = tick(g, () => 0);
  assert.equal(out, 'eat');
  assert.equal(g.score, 26);
  assert.equal(g.speed, 70);                         // max(70, 150 − 26·4) = 70
});

test('turns queue; a reverse onto the last queued turn is refused', () => {
  const g = createGame();                            // heading right, queue empty
  assert.equal(queueTurn(g, { x: 0, y: 1 }), true);  // down: valid vs right
  assert.equal(queueTurn(g, { x: 0, y: -1 }), false); // up: reverse of down → refused
  assert.equal(queueTurn(g, { x: -1, y: 0 }), true); // left: valid vs down, fills 2nd slot
  assert.equal(queueTurn(g, { x: 0, y: 1 }), false); // buffer already holds two
});

test('a straight reverse from the current heading is refused', () => {
  const g = createGame();                            // heading right
  assert.equal(queueTurn(g, { x: -1, y: 0 }), false); // hard reverse
  assert.equal(queueTurn(g, { x: 1, y: 0 }), false);  // no-op (same way)
});

test('the two-key corner lands: up then left inside one tick', () => {
  const g = withFood(createGame(), OFFBOARD);
  assert.equal(queueTurn(g, { x: 0, y: -1 }), true); // up
  assert.equal(queueTurn(g, { x: -1, y: 0 }), true); // left (valid vs up)
  assert.equal(queueTurn(g, { x: 0, y: 1 }), false); // buffer capped at two
  tick(g); // consumes up
  assert.deepEqual(g.dir, { x: 0, y: -1 });
  tick(g); // consumes left
  assert.deepEqual(g.dir, { x: -1, y: 0 });
});

test('running into a wall ends the run', () => {
  const g = withFood(createGame(), OFFBOARD);
  g.snake = [{ x: COLS - 1, y: 5 }, { x: COLS - 2, y: 5 }, { x: COLS - 3, y: 5 }];
  g.dir = { x: 1, y: 0 };
  assert.equal(tick(g), 'dead');
});

test('following your own tail is allowed — the tail moves away', () => {
  const g = withFood(createGame(), OFFBOARD);
  // A closed square, head top-left, tail directly below it.
  g.snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
  g.dir = { x: 0, y: 1 };            // down, onto the tail cell (5,6)
  assert.equal(tick(g), 'move');     // legal: the tail vacates as we arrive
});

test('biting your own side ends the run', () => {
  const g = withFood(createGame(), OFFBOARD);
  // Same corner, but one cell longer, so (5,6) is now mid-body, not the tail.
  g.snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 7 }];
  g.dir = { x: 0, y: 1 };            // down, into (5,6) which no longer vacates
  assert.equal(tick(g), 'dead');
});

test('filling the last cell wins instead of asking for another pellet', () => {
  const g = createGame();
  const all: Cell[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) all.push({ x, y });
  const target: Cell = { x: 0, y: 0 };
  const head: Cell = { x: 1, y: 0 };
  // The snake covers every cell but the target; the head sits beside it.
  g.snake = [head, ...all.filter((c) => !(c.x === 0 && c.y === 0) && !(c.x === 1 && c.y === 0))];
  g.dir = { x: -1, y: 0 };           // step onto the target
  g.food = target;
  assert.equal(tick(g), 'won');
});

console.log(`\n${passed} passed.`);
