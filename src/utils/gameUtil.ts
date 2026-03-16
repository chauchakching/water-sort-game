import { COLORS, MAX_GAME_GENERATION_RETRY } from '../constants/gameConstants';
import { Tube } from '../types/gameTypes';
import { last, range, splitRightWhile, takeLeft } from './fp';

function isTubeEmpty(tube: Tube) {
  return tube.colors.length === 0;
}

function isTubeFullWithOneColor(tube: Tube) {
  return (
    tube.colors.every((color) => color === tube.colors[0]) &&
    tube.size === tube.colors.length
  );
}

function getTubeTopColor(tube: Tube) {
  return last(tube.colors);
}

function pour({
  i,
  j,
  tubes,
}: {
  i: number;
  j: number;
  tubes: Tube[];
}): Tube[] | undefined {
  if (isTubeEmpty(tubes[i])) return;
  if (isTubeFullWithOneColor(tubes[i])) return;
  if (isTubeFullWithOneColor(tubes[j])) return;

  if (
    !isTubeEmpty(tubes[j]) &&
    getTubeTopColor(tubes[i]) !== getTubeTopColor(tubes[j])
  ) {
    return;
  }

  const color = last(tubes[i].colors);
  const [remaining, poured] = splitRightWhile(
    (x) => x === color,
    tubes[i].colors,
  );
  const jTotal = [...tubes[j].colors, ...poured];

  if (jTotal.length > tubes[j].size) return;

  // Disallow meaningless move
  if (remaining.length === 0 && isTubeEmpty(tubes[j])) return;

  const updatedTubes = structuredClone(tubes);
  updatedTubes[i].colors = remaining;
  updatedTubes[j].colors = [...updatedTubes[j].colors, ...poured];
  return updatedTubes;
}

function won(tubes: Tube[]): boolean {
  return tubes.every(
    (tube) => isTubeEmpty(tube) || isTubeFullWithOneColor(tube),
  );
}

/** Orderless serialization — two tube arrangements that are permutations of
 *  each other map to the same key (correct for state-space deduplication). */
function serializeTubes(tubes: Tube[]): string {
  return tubes
    .map((tube) => tube.colors.join(','))
    .sort()
    .join('|');
}

/**
 * Determine whether a game is solvable.
 * Uses DFS with a memoized visited set (orderless) to avoid revisiting states.
 */
export function solveGame(tubes: Tube[]): boolean {
  const visited = new Set<string>();

  function dfs(current: Tube[]): boolean {
    const key = serializeTubes(current);
    if (visited.has(key)) return false;
    visited.add(key);

    if (won(current)) return true;

    for (let i = 0; i < current.length; i++) {
      for (let j = 0; j < current.length; j++) {
        if (i === j) continue;
        const next = pour({ i, j, tubes: current });
        if (next && dfs(next)) return true;
      }
    }
    return false;
  }

  return dfs(tubes);
}

/**
 * Find the next best move using BFS.
 * Returns {i, j} (pour from tube i into tube j) or null if no hint is available.
 */
function getHint(tubes: Tube[]): { i: number; j: number } | null {
  if (won(tubes)) return null;

  type Item = { tubes: Tube[]; firstMove: { i: number; j: number } | null };

  // Use ordered serialization so indices are stable across BFS levels
  const orderedKey = (ts: Tube[]) => ts.map((t) => t.colors.join(',')).join('|');

  const visited = new Set([orderedKey(tubes)]);
  const queue: Item[] = [{ tubes, firstMove: null }];
  const MAX_STATES = 40000;
  let explored = 0;

  while (queue.length > 0 && explored < MAX_STATES) {
    explored++;
    const { tubes: current, firstMove } = queue.shift()!;

    if (won(current)) return firstMove;

    for (let i = 0; i < current.length; i++) {
      for (let j = 0; j < current.length; j++) {
        if (i === j) continue;
        const next = pour({ i, j, tubes: current });
        if (next) {
          const key = orderedKey(next);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ tubes: next, firstMove: firstMove ?? { i, j } });
          }
        }
      }
    }
  }

  return null;
}

/**
 * Randomly fill the tubes with color water.
 */
function randomGame({
  colorCount,
  tubeCount,
  tubeSize,
}: {
  colorCount: number;
  tubeCount: number;
  tubeSize: number;
}): Tube[] {
  const tubes: Tube[] = Array.from({ length: tubeCount }, () => ({
    size: tubeSize,
    colors: [],
  }));

  let colors = takeLeft(colorCount)(range(0, COLORS.length));
  colors = repeatAndShuffle(colors, tubeSize);

  let currentTubeIndex = 0;
  for (let color of colors) {
    tubes[currentTubeIndex].colors.push(color);
    if (tubes[currentTubeIndex].colors.length === tubeSize) {
      currentTubeIndex++;
      if (currentTubeIndex >= tubeCount) break;
    }
  }

  return tubes;
}

function repeatAndShuffle<T>(array: T[], times: number): T[] {
  let result: T[] = [];
  for (let i = 0; i < times; i++) result = result.concat(array);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomSolvableGame({
  colorCount,
  tubeCount,
  tubeSize,
}: {
  colorCount: number;
  tubeCount: number;
  tubeSize: number;
}): Tube[] | undefined {
  for (let i = 0; i < MAX_GAME_GENERATION_RETRY; i++) {
    const game = randomGame({ colorCount, tubeCount, tubeSize });
    if (!solveGame(game)) continue;
    if (won(game)) continue;
    return game;
  }
  return undefined;
}

function hasPossibleMove(tubes: Tube[]): boolean {
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i !== j && pour({ i, j, tubes })) return true;
    }
  }
  return false;
}

function isDeadGame(tubes: Tube[]): boolean {
  return !won(tubes) && !hasPossibleMove(tubes);
}

export const gameUtil = {
  isTubeEmpty,
  pour,
  won,
  randomSolvableGame,
  isDeadGame,
  getTubeTopColor,
  isTubeFullWithOneColor,
  getHint,
};
