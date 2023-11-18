import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/GameStore';

export const GameConfig = observer(() => {
  return (
    <div className="flex justify-between">
      <div className="">
        <div>
          <span className="mr-2">color: {gameStore.colorCount}</span>
          <button
            type="button"
            className="border px-2 rounded mr-1"
            onClick={() => {
              gameStore.updateColorCount(gameStore.colorCount - 1);
            }}
          >
            -
          </button>
          <button
            type="button"
            className="border px-2 rounded"
            onClick={() => {
              gameStore.updateColorCount(gameStore.colorCount + 1);
            }}
          >
            +
          </button>
        </div>

        <div>
          <span className="mr-2">tubes: {gameStore.tubeCount}</span>
          <button
            type="button"
            className="border px-2 rounded mr-1"
            onClick={() => {
              gameStore.updateTubeCount(gameStore.tubeCount - 1);
            }}
          >
            -
          </button>
          <button
            type="button"
            className="border px-2 rounded"
            onClick={() => {
              gameStore.updateTubeCount(gameStore.tubeCount + 1);
            }}
          >
            +
          </button>
        </div>

        <button
          className="border px-2 rounded mt-2"
          onClick={() => {
            gameStore.newGame();
          }}
        >
          New Game
        </button>
      </div>

      <div className="flex">
        {gameStore.canUndoMove && (
          <button
            className="border px-2 rounded mr-1"
            onClick={() => {
              gameStore.undoMove();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
          </button>
        )}

        <button
          className="border px-2 rounded ml-4"
          onClick={() => {
            gameStore.reset();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
});
