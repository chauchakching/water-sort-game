import { makeAutoObservable, toJS, action } from 'mobx';
import { MAX_COLOR_COUNT, MAX_TUBES_PER_ROW } from '../constants/gameConstants';
import { Tube } from '../types/gameTypes';
import { gameUtil } from '../utils/gameUtil';
import { gameHeuristicsUtil } from '../utils/gameHeuristicsUtil';

type PersonalBest = { moves: number; time: number };

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

class GameStore {
  constructor() {
    makeAutoObservable(this, { timerInterval: false });
  }

  colorCount: number = Number(localStorage.getItem('colorCount')) || 5;
  tubeCount: number = Number(localStorage.getItem('tubeCount')) || 6;

  initTubes: Tube[] = [];
  tubes: Tube[] = [];
  history: Tube[][] = [];

  selectedFirstTube: number | null = null;
  invalidTube: number | null = null; // triggers shake animation

  moveCount: number = 0;
  difficulty: string = '';
  isLoadingGame: boolean = false;
  gameGenerationFailed: boolean = false;

  // Timer
  startTime: number | null = null;
  currentTime: number = Date.now();
  timerInterval: ReturnType<typeof setInterval> | null = null;

  // Stats & personal bests
  totalWins: number = Number(localStorage.getItem('totalWins')) || 0;
  personalBests: Record<string, PersonalBest> = loadJSON('personalBests', {});

  // Hint
  hintMove: { i: number; j: number } | null = null;
  isCalculatingHint: boolean = false;

  // ── Computed ────────────────────────────────────────────────────────────────

  get difficultyKey(): string {
    return `${this.colorCount}-${this.tubeCount}`;
  }

  get personalBest(): PersonalBest | null {
    return this.personalBests[this.difficultyKey] ?? null;
  }

  get elapsedSeconds(): number {
    if (!this.startTime) return 0;
    return Math.floor((this.currentTime - this.startTime) / 1000);
  }

  get canUndoMove() {
    return this.history.length > 0;
  }

  get won() {
    return gameUtil.won(this.tubes);
  }

  get isDeadGame() {
    return gameUtil.isDeadGame(toJS(this.tubes));
  }

  // ── Timer ───────────────────────────────────────────────────────────────────

  startTimer() {
    this.startTime = Date.now();
    this.currentTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(
      action(() => {
        this.currentTime = Date.now();
      }),
      1000,
    );
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ── Game flow ────────────────────────────────────────────────────────────────

  newGame() {
    this.stopTimer();
    this.history = [];
    this.selectedFirstTube = null;
    this.moveCount = 0;
    this.difficulty = '';
    this.hintMove = null;
    this.isLoadingGame = true;
    this.gameGenerationFailed = false;

    const newGame = gameUtil.randomSolvableGame({
      colorCount: this.colorCount,
      tubeCount: this.tubeCount,
      tubeSize: 4,
    });

    this.isLoadingGame = false;

    if (!newGame) {
      this.gameGenerationFailed = true;
      return;
    }

    this.initTubes = newGame;
    this.tubes = this.initTubes;
    this.startTimer();

    // Defer the BFS difficulty estimation so the new game renders first
    const snapshot = toJS(this.initTubes);
    setTimeout(
      action(() => {
        this.difficulty = gameHeuristicsUtil.estimateDifficulty(snapshot);
      }),
      80,
    );
  }

  reset() {
    this.stopTimer();
    this.history = [];
    this.tubes = this.initTubes;
    this.selectedFirstTube = null;
    this.moveCount = 0;
    this.hintMove = null;
    this.startTimer();
  }

  undoMove() {
    if (!this.canUndoMove) return;
    this.tubes = this.history.pop()!;
    if (this.moveCount > 0) this.moveCount--;
    this.hintMove = null;
  }

  selectTube(i: number) {
    if (this.selectedFirstTube === null) {
      if (gameUtil.isTubeEmpty(this.tubes[i])) {
        this.flashInvalid(i);
        return;
      }
      this.selectedFirstTube = i;
    } else if (this.selectedFirstTube === i) {
      this.selectedFirstTube = null;
    } else {
      const updatedTubes = gameUtil.pour({
        i: this.selectedFirstTube,
        j: i,
        tubes: toJS(this.tubes),
      });

      if (!updatedTubes) {
        // Pour was invalid — shake both tubes for feedback
        this.flashInvalid(i);
        return;
      }

      this.history.push(this.tubes);
      this.tubes = updatedTubes;
      this.selectedFirstTube = null;
      this.moveCount++;
      this.hintMove = null;

      if (this.won) {
        this.stopTimer();
        this.recordWin();
      }
    }
  }

  private flashInvalid(i: number) {
    this.invalidTube = i;
    setTimeout(
      action(() => {
        this.invalidTube = null;
      }),
      500,
    );
  }

  private recordWin() {
    this.totalWins++;
    localStorage.setItem('totalWins', String(this.totalWins));

    const elapsed = this.elapsedSeconds;
    const prev = this.personalBests[this.difficultyKey];
    const isNewBest =
      !prev ||
      this.moveCount < prev.moves ||
      (this.moveCount === prev.moves && elapsed < prev.time);

    if (isNewBest) {
      this.personalBests = {
        ...this.personalBests,
        [this.difficultyKey]: { moves: this.moveCount, time: elapsed },
      };
      localStorage.setItem('personalBests', JSON.stringify(this.personalBests));
    }
  }

  requestHint() {
    if (this.isCalculatingHint || this.won || this.isDeadGame) return;
    this.isCalculatingHint = true;
    this.hintMove = null;

    const hint = gameUtil.getHint(toJS(this.tubes));
    this.hintMove = hint;
    this.isCalculatingHint = false;

    if (hint) {
      const captured = hint;
      setTimeout(
        action(() => {
          if (
            this.hintMove?.i === captured.i &&
            this.hintMove?.j === captured.j
          ) {
            this.hintMove = null;
          }
        }),
        3000,
      );
    }
  }

  // ── Settings ─────────────────────────────────────────────────────────────────

  updateColorCount(x: number) {
    this.colorCount = Math.max(2, Math.min(MAX_COLOR_COUNT, this.tubeCount - 1, x));
    localStorage.setItem('colorCount', String(this.colorCount));
  }

  updateTubeCount(x: number) {
    this.tubeCount = Math.max(
      this.colorCount + 1,
      Math.min(MAX_TUBES_PER_ROW * 4, x),
    );
    localStorage.setItem('tubeCount', String(this.tubeCount));
  }
}

export const gameStore = new GameStore();
