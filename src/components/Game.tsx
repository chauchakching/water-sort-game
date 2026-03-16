import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, MAX_TUBES_PER_ROW } from '../constants/gameConstants';
import { gameStore } from '../stores/GameStore';
import { splitEvery } from '../utils/fp';
import { gameUtil } from '../utils/gameUtil';
import { GameConfig } from './GameConfig';
import { Tube } from './Tube';

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const style = difficultyStyles[difficulty] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>
      {difficulty}
    </span>
  );
};

const WinOverlay = observer(() => (
  <motion.div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ background: 'rgba(0,0,0,0.75)' }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-slate-800 border border-white/10 rounded-2xl p-8 text-center shadow-2xl mx-4"
      initial={{ scale: 0.5, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <div className="text-6xl mb-3">🎉</div>
      <h2 className="text-2xl font-bold text-white mb-1">Puzzle Solved!</h2>
      <p className="text-slate-400 text-sm mb-6">
        Completed in{' '}
        <span className="text-white font-semibold">{gameStore.moveCount} moves</span>
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => gameStore.newGame()}
        className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
      >
        Play Again
      </motion.button>
    </motion.div>
  </motion.div>
));

export const Game = observer(() => {
  useEffect(() => {
    gameStore.newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStore.colorCount, gameStore.tubeCount]);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h1 className="text-base font-bold tracking-tight">💧 Water Sort</h1>
        <div className="flex items-center gap-3">
          {gameStore.difficulty && <DifficultyBadge difficulty={gameStore.difficulty} />}
          <span className="text-sm text-slate-400">
            Moves:{' '}
            <span className="text-white font-semibold tabular-nums">{gameStore.moveCount}</span>
          </span>
        </div>
      </div>

      {/* Dead game banner */}
      <AnimatePresence>
        {gameStore.isDeadGame && !gameStore.won && (
          <motion.div
            className="bg-red-950/60 border-b border-red-500/30 px-4 py-2.5 text-center text-sm text-red-300 shrink-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            No more moves —{' '}
            <button
              onClick={() => gameStore.reset()}
              className="underline font-semibold hover:text-red-100 cursor-pointer"
            >
              Reset
            </button>{' '}
            or{' '}
            <button
              onClick={() => gameStore.newGame()}
              className="underline font-semibold hover:text-red-100 cursor-pointer"
            >
              New Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tubes area */}
      <div className="flex-1 flex flex-col justify-center gap-6 py-6 overflow-auto">
        {splitEvery(MAX_TUBES_PER_ROW, gameStore.tubes).map((tubes, i) => (
          <div key={i} className="flex justify-center gap-4 px-4">
            {tubes.map((tube, j) => {
              const idx = i * MAX_TUBES_PER_ROW + j;
              return (
                <Tube
                  key={idx}
                  size={tube.size}
                  colors={tube.colors.map((x) => COLORS[x])}
                  selected={gameStore.selectedFirstTube === idx}
                  completed={gameUtil.isTubeFullWithOneColor(tube)}
                  onClick={() => gameStore.selectTube(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      <GameConfig />

      {/* Win overlay */}
      <AnimatePresence>{gameStore.won && <WinOverlay />}</AnimatePresence>
    </div>
  );
});
