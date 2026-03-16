import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, MAX_TUBES_PER_ROW } from '../constants/gameConstants';
import { gameStore } from '../stores/GameStore';
import { splitEvery } from '../utils/fp';
import { gameUtil } from '../utils/gameUtil';
import { GameConfig } from './GameConfig';
import { Tube } from './Tube';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const style =
    difficultyStyles[difficulty] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}
    >
      {difficulty}
    </motion.span>
  );
};

const WinOverlay = observer(() => {
  const elapsed = gameStore.elapsedSeconds;
  const moves = gameStore.moveCount;
  const key = gameStore.difficultyKey;
  const bests = gameStore.personalBests;

  // Determine if this game set a new personal best.
  // personalBests is updated in recordWin() before this renders,
  // so check if the current result matches the stored best exactly.
  const stored = bests[key];
  const isNewBest = stored?.moves === moves && stored?.time === elapsed;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 border border-white/10 rounded-2xl p-8 text-center shadow-2xl w-full max-w-sm"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="text-6xl mb-3">{isNewBest ? '🏆' : '🎉'}</div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isNewBest ? 'New Best!' : 'Puzzle Solved!'}
        </h2>

        <div className="flex items-center justify-center gap-4 my-4 text-sm">
          <div className="bg-white/5 rounded-xl px-4 py-2">
            <div className="text-slate-400 text-xs mb-1">Moves</div>
            <div className="text-white font-bold text-xl tabular-nums">{moves}</div>
          </div>
          <div className="bg-white/5 rounded-xl px-4 py-2">
            <div className="text-slate-400 text-xs mb-1">Time</div>
            <div className="text-white font-bold text-xl tabular-nums">
              {formatTime(elapsed)}
            </div>
          </div>
        </div>

        {stored && !isNewBest && (
          <p className="text-slate-500 text-xs mb-4">
            Best: {stored.moves} moves in {formatTime(stored.time)}
          </p>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => gameStore.newGame()}
          className="w-full bg-sky-500 hover:bg-sky-400 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
        >
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
});

const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-40 rounded">
    <motion.div
      className="text-3xl"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    >
      💧
    </motion.div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const Game = observer(() => {
  useEffect(() => {
    gameStore.newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStore.colorCount, gameStore.tubeCount]);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white select-none overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h1 className="text-base font-bold tracking-tight">💧 Water Sort</h1>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {gameStore.difficulty ? (
              <DifficultyBadge key={gameStore.difficulty} difficulty={gameStore.difficulty} />
            ) : gameStore.isLoadingGame ? null : (
              <span
                key="dots"
                className="text-xs text-slate-500 animate-pulse"
              >
                ···
              </span>
            )}
          </AnimatePresence>

          <div className="text-sm text-slate-400 tabular-nums min-w-[3.5rem] text-right">
            {gameStore.won ? (
              <span className="text-emerald-400 font-semibold">
                {formatTime(gameStore.elapsedSeconds)}
              </span>
            ) : (
              <>
                <span className="text-white font-semibold">
                  {formatTime(gameStore.elapsedSeconds)}
                </span>
              </>
            )}
          </div>
          <div className="text-sm text-slate-400">
            ·{' '}
            <span className="text-white font-semibold tabular-nums">
              {gameStore.moveCount}
            </span>{' '}
            <span className="text-slate-500 text-xs">moves</span>
          </div>
        </div>
      </div>

      {/* ── Dead game banner ── */}
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

      {/* ── Game generation error ── */}
      <AnimatePresence>
        {gameStore.gameGenerationFailed && (
          <motion.div
            className="bg-amber-900/50 border-b border-amber-500/30 px-4 py-2.5 text-center text-sm text-amber-300 shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Could not generate a valid puzzle.{' '}
            <button
              onClick={() => gameStore.newGame()}
              className="underline font-semibold hover:text-amber-100 cursor-pointer"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tubes ── */}
      <div className="flex-1 flex flex-col justify-center gap-5 py-4 overflow-auto relative">
        {gameStore.isLoadingGame && <LoadingOverlay />}

        {splitEvery(MAX_TUBES_PER_ROW, gameStore.tubes).map((tubes, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-4 px-2">
            {tubes.map((tube, colIdx) => {
              const idx = rowIdx * MAX_TUBES_PER_ROW + colIdx;
              return (
                <Tube
                  key={idx}
                  size={tube.size}
                  colors={tube.colors.map((x) => COLORS[x])}
                  selected={gameStore.selectedFirstTube === idx}
                  completed={gameUtil.isTubeFullWithOneColor(tube)}
                  isHintSource={gameStore.hintMove?.i === idx}
                  isHintDest={gameStore.hintMove?.j === idx}
                  isInvalid={gameStore.invalidTube === idx}
                  onClick={() => gameStore.selectTube(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <GameConfig />

      {/* ── Win overlay ── */}
      <AnimatePresence>{gameStore.won && <WinOverlay />}</AnimatePresence>
    </div>
  );
});
