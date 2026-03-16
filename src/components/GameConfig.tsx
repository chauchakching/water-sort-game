import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { gameStore } from '../stores/GameStore';

const CounterControl = ({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-slate-400 text-xs uppercase tracking-wider w-12 text-right">
      {label}
    </span>
    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <motion.button
        type="button"
        whileTap={{ scale: 0.82 }}
        onClick={onDec}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors text-lg font-light"
        aria-label={`Decrease ${label}`}
      >
        −
      </motion.button>
      <span className="w-8 text-center text-white font-semibold text-sm tabular-nums">
        {value}
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.82 }}
        onClick={onInc}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors text-lg font-light"
        aria-label={`Increase ${label}`}
      >
        +
      </motion.button>
    </div>
  </div>
);

export const GameConfig = observer(() => {
  return (
    <div className="border-t border-white/10 px-4 py-4 space-y-3 shrink-0">
      {/* Difficulty controls */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <CounterControl
          label="Colors"
          value={gameStore.colorCount}
          onDec={() => gameStore.updateColorCount(gameStore.colorCount - 1)}
          onInc={() => gameStore.updateColorCount(gameStore.colorCount + 1)}
        />
        <CounterControl
          label="Tubes"
          value={gameStore.tubeCount}
          onDec={() => gameStore.updateTubeCount(gameStore.tubeCount - 1)}
          onInc={() => gameStore.updateTubeCount(gameStore.tubeCount + 1)}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => gameStore.newGame()}
          className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          New Game
        </motion.button>

        {/* Hint button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => gameStore.requestHint()}
          disabled={gameStore.won || gameStore.isDeadGame || gameStore.isCalculatingHint}
          className={`flex items-center gap-1.5 border px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors
            ${
              gameStore.isCalculatingHint
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse cursor-wait'
                : gameStore.hintMove
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Get a hint"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M12 2a7 7 0 0 1 5.457 11.43A4.5 4.5 0 0 1 16 17v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1a4.5 4.5 0 0 1-1.457-3.57A7 7 0 0 1 12 2Zm-1 17h2v1a1 1 0 1 1-2 0v-1Z" />
          </svg>
          Hint
        </motion.button>

        {gameStore.canUndoMove && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => gameStore.undoMove()}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
            aria-label="Undo last move"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            Undo
          </motion.button>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => gameStore.reset()}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
          aria-label="Reset puzzle to initial state"
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
});
