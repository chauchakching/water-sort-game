import { COLOR, MAX_GAME_GENERATION_RETRY } from '../constants/gameConstants';
import { Tube } from '../types/gameTypes';
import { last, splitRightWhile, takeLeft } from './fp';

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
  if (isTubeEmpty(tubes[i])) {
    // console.log('cannot move empty tube');
    return;
  }

  if (isTubeFullWithOneColor(tubes[i])) {
    // console.log('cannot move full tube');
    return;
  }

  if (isTubeFullWithOneColor(tubes[j])) {
    // console.log('another tube is already full');
    return;
  }

  // The top water color should match
  if (
    !isTubeEmpty(tubes[j]) &&
    getTubeTopColor(tubes[i]) !== getTubeTopColor(tubes[j])
  ) {
    // console.log('top water color not matched');
    return;
  }

  const color = last(tubes[i].colors);

  const [remaining, poured] = splitRightWhile(
    (x) => x === color,
    tubes[i].colors
  );
  const jTotal = [...tubes[j].colors, ...poured];

  // Cannot exceed tube size
  if (jTotal.length > tubes[j].size) {
    // console.log('not enough room to move the color water');
    return;
  }

  // Dis-allow meaningless move
  if (remaining.length === 0 && isTubeEmpty(tubes[j])) {
    // console.log('meaningless move is not allowed');
    return;
  }

  const updatedTubes = structuredClone(tubes);
  updatedTubes[i].colors = remaining;
  updatedTubes[j].colors = [...updatedTubes[j].colors, ...poured];

  return updatedTubes;
}

function won(tubes: Tube[]): boolean {
  return tubes.every(
    (tube) => isTubeEmpty(tube) || isTubeFullWithOneColor(tube)
  );
}

/**
 * Determine whether a game is solvable
 */
export function solveGame(tubes: Tube[]): boolean {
  if (gameUtil.won(tubes)) {
    return true;
  }

  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;
      const newTubes = gameUtil.pour({ i, j, tubes });
      if (newTubes && solveGame(newTubes)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Randomly fill the tubes with color water.
 * The total number of color water must equal (colorCount * tubeSize)
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
  // Initialize tubes
  const tubes: Tube[] = Array.from({ length: tubeCount }, () => ({
    size: tubeSize,
    colors: [],
  }));

  // Create and shuffle color array
  let colors = takeLeft(colorCount)(Object.values(COLOR));
  colors = repeatAndShuffle(colors, tubeSize);

  // Distribute colors into tubes
  let currentTubeIndex = 0;
  for (let color of colors) {
    tubes[currentTubeIndex].colors.push(color);
    if (tubes[currentTubeIndex].colors.length === tubeSize) {
      currentTubeIndex++;
      if (currentTubeIndex >= tubeCount) {
        break;
      }
    }
  }

  return tubes;
}

function repeatAndShuffle(array: string[], times: number): string[] {
  let result = [];
  for (let i = 0; i < times; i++) {
    result = result.concat(array);
  }
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
    if (!solveGame(game)) {
      console.log('Generated an unsolvable game. Retrying...');
      continue;
    }
    if (won(game)) {
      continue;
    }
    return game;
  }
  return undefined;
}

function hasPossibleMove(tubes: Tube[]): boolean {
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;

      if (pour({ i, j, tubes })) {
        return true;
      }
    }
  }
  return false;
}

function isDeadGame(tubes: Tube[]): boolean {
  return !won(tubes) && !hasPossibleMove(tubes);
}

export const gameUtil = {
  pour,
  won,
  randomSolvableGame,
  isDeadGame,
};
