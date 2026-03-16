import { Tube } from '../types/gameTypes';
import { gameUtil } from './gameUtil';

type GameTree = { i: number; j: number; nextMoves: GameTree }[];

function runGame(tubes: Tube[], maxMoves: number = 100000): GameTree {
  let moveCount = 0;

  let queue = [{ tubes: tubes, path: [] }];
  const history = new Set([serializeTubes(tubes)]);

  while (queue.length > 0 && moveCount < maxMoves) {
    const { tubes: currentTubes, path } = queue.shift();

    for (let i = 0; i < currentTubes.length; i++) {
      for (let j = 0; j < currentTubes.length; j++) {
        if (i === j) continue;

        const updatedTubes = gameUtil.pour({ i, j, tubes: currentTubes });
        if (updatedTubes) {
          const tubesKey = serializeTubes(updatedTubes);
          if (!history.has(tubesKey)) {
            history.add(tubesKey);
            moveCount++;

            const newPath = path.concat([{ i, j, nextMoves: [] }]);
            queue.push({ tubes: updatedTubes, path: newPath });
          }
        }
      }
    }
  }

  return queue.map((item) => item.path).flat();
}

function serializeTubes(tubes: Tube[]): string {
  const serializedTubes = tubes.map((tube) => tube.colors.join(',')).sort();
  return serializedTubes.join('|');
}

function colorAndTubeCountEstimator(tubes: Tube[]): number {
  const colorSet = new Set<number>();
  tubes.forEach((tube) => {
    tube.colors.forEach((color) => colorSet.add(color));
  });
  return colorSet.size + tubes.length;
}

function initialDistributionEstimator(tubes: Tube[]): number {
  let score = 0;
  tubes.forEach((tube) => {
    if (gameUtil.isTubeFullWithOneColor(tube)) {
      score -= 2;
    }
  });
  return score;
}

function moveComplexityEstimator(tubes: Tube[]): number {
  let potentialMoves = 0;
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i !== j && gameUtil.pour({ i, j, tubes })) {
        potentialMoves++;
      }
    }
  }
  return potentialMoves / 2;
}

function estimateDifficulty(tubes: Tube[]): string {
  runGame(tubes);

  const colorAndTubeCount = colorAndTubeCountEstimator(tubes);
  const initialDistribution = initialDistributionEstimator(tubes);
  const moveComplexity = moveComplexityEstimator(tubes);

  const difficultyScore = colorAndTubeCount + initialDistribution + moveComplexity;

  if (difficultyScore < 15) return 'Easy';
  if (difficultyScore < 25) return 'Medium';
  return 'Hard';
}

export const gameHeuristicsUtil = {
  estimateDifficulty,
};
