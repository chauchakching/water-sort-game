import { Tube } from '../types/gameTypes';
import { gameUtil } from './gameUtil';

type GameTree = { i: number; j: number; nextMoves: GameTree }[];

function runGame(tubes: Tube[], maxMoves: number = 100000): GameTree {
  let moveCount = 0;

  let queue = [{ tubes: tubes, path: [] }];
  const history = new Set([serializeTubes(tubes)]); // Using custom serialization for history

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

  if (moveCount >= maxMoves) {
    console.log('Reached max game tree exploration limit:', maxMoves);
  } else {
    console.log('Total move count explored:', moveCount);
  }

  return queue.map((item) => item.path).flat();
}

// Custom serialization function for tubes
function serializeTubes(tubes: Tube[]): string {
  // Serialize each tube and sort the serialized strings
  const serializedTubes = tubes.map((tube) => tube.colors.join(',')).sort();
  return serializedTubes.join('|');
}

function colorAndTubeCountEstimator(tubes: Tube[]): number {
  const colorSet = new Set();
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
  return potentialMoves / 2; // Adjust factor as needed
}

function estimateDifficulty(tubes: Tube[]): string {
  const gameTree = runGame(tubes);

  const colorAndTubeCount = colorAndTubeCountEstimator(tubes);
  const initialDistribution = initialDistributionEstimator(tubes);
  const moveComplexity = moveComplexityEstimator(tubes);

  const difficultyScore =
    colorAndTubeCount + initialDistribution + moveComplexity;

  console.log('colorAndTubeCount', colorAndTubeCount);
  console.log('initialDistribution', initialDistribution);
  console.log('moveComplexity', moveComplexity);
  console.log('=> difficultyScore', difficultyScore);

  // Convert score to difficulty level
  if (difficultyScore < 15) {
    return 'Easy';
  } else if (difficultyScore < 25) {
    return 'Medium';
  } else {
    return 'Hard';
  }
}

export const gameHeuristicsUtil = {
  estimateDifficulty,
};
