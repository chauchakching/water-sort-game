import { Tube } from '../types/gameTypes';
import { gameUtil } from './gameUtil';

type GameTree = { i: number; j: number; nextMoves: GameTree }[];

function runGame(tubes: Tube[], maxMoves: number = 100000): GameTree {
  let moveCount = 0;

  let queue = [{ tubes: tubes, history: new Set(), path: [] }];
  let gameTrees = [];

  while (queue.length > 0 && moveCount < maxMoves) {
    const { tubes: currentTubes, history, path } = queue.shift();
    let children = [];

    for (let i = 0; i < currentTubes.length; i++) {
      for (let j = 0; j < currentTubes.length; j++) {
        if (i === j) continue;

        const updatedTubes = gameUtil.pour({ i, j, tubes: currentTubes });
        if (updatedTubes) {
          const tubesKey = JSON.stringify(updatedTubes);
          if (!history.has(tubesKey)) {
            history.add(tubesKey);
            moveCount++;

            const newPath = path.concat([{ i, j }]);
            queue.push({
              tubes: updatedTubes,
              history: new Set(history),
              path: newPath,
            });

            children.push({
              i,
              j,
              nextMoves: [], // Will be filled in subsequent iterations
            });
          }
        }
      }
    }

    gameTrees.push({ path, children });
  }

  if (moveCount >= maxMoves) {
    console.log('reached max game tree exploration limit', maxMoves);
  } else {
    console.log('total move count explored', moveCount);
  }

  // Construct the game tree from the paths and children
  function buildGameTree(paths, children) {
    let tree = [];
    paths.forEach((path, index) => {
      let node = path[path.length - 1];
      if (node) {
        node.nextMoves = children[index].children;
        tree.push(node);
      }
    });
    return tree;
  }

  const gameTree = buildGameTree(
    gameTrees.map((tree) => tree.path),
    gameTrees,
  );

  return gameTree;
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
