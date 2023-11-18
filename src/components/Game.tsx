import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { MAX_TUBES_PER_ROW } from '../constants/gameConstants';
import { gameStore } from '../stores/GameStore';
import { splitEvery } from '../utils/fp';
import { DeadGameBackgroundImage } from './DeadGameBackgroundImage';
import { GameConfig } from './GameConfig';
import { Tube } from './Tube';

export const Game = observer(() => {
  useEffect(() => {
    gameStore.newGame();
  }, [gameStore.colorCount, gameStore.tubeCount]);

  useEffect(() => {
    if (gameStore.won) {
      gameStore.setGameMessage('🎉 Win! 🎉');
    }
  }, [gameStore.won]);

  return (
    <>
      {gameStore.isDeadGame && <DeadGameBackgroundImage />}

      <div className="h-full flex flex-col">
        <GameConfig />

        <div className="m-4 flex justify-center">
          <div className={`h-6 ${gameStore.gameMessage ? '' : 'invisible'}`}>
            {gameStore.gameMessage}
          </div>
        </div>

        <div className="tubes-container flex-1 flex flex-col justify-center">
          {splitEvery(MAX_TUBES_PER_ROW, gameStore.tubes).map((tubes, i) => (
            <div key={i} className="flex justify-center gap-8 mb-4">
              {tubes.map((tube, j) => {
                const idx = i * MAX_TUBES_PER_ROW + j;
                return (
                  <Tube
                    size={tube.size}
                    colors={tube.colors}
                    selected={gameStore.selectedFirstTube === idx}
                    onClick={() => {
                      gameStore.selectTube(idx);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
