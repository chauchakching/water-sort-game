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
    <span className="text-slate-400 text-xs uppercase tracking-wider w-12 text-right">{label}</span>
    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onDec}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors text-lg font-light"
      >
        −
      </motion.button>
      <span className="w-8 text-center text-white font-semibold text-sm">{value}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onInc}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors text-lg font-light"
      >
        +
      </motion.button>
    </div>
  </div>
);

export const GameConfig = observer(() => {
  return (
    <div className="border-t border-white/10 px-4 py-4 space-y-3">
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
      <div className="flex items-center justify-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => gameStore.newGame()}
          className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          New Game
        </motion.button>

        {gameStore.canUndoMove && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => gameStore.undoMove()}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
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
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
});
