import { makeAutoObservable, toJS } from 'mobx';
import { MAX_COLOR_COUNT, MAX_TUBES_PER_ROW } from '../constants/gameConstants';
import { Tube } from '../types/gameTypes';
import { gameUtil } from '../utils/gameUtil';
import { gameHeuristicsUtil } from '../utils/gameHeuristicsUtil';

class GameStore {
  constructor() {
    makeAutoObservable(this);
  }

  colorCount: number = Number(localStorage.getItem('colorCount')) || 5;
  tubeCount: number = Number(localStorage.getItem('tubeCount')) || 6;

  initTubes: Tube[] = [];
  tubes: Tube[] = [];
  history: Tube[][] = [];

  selectedFirstTube: number | null = null;

  gameMessage = '';
  moveCount: number = 0;
  difficulty: string = '';

  newGame() {
    this.history = [];
    this.tubes = this.initTubes;
    this.selectedFirstTube = null;
    this.gameMessage = '';
    this.moveCount = 0;

    const newGame = gameUtil.randomSolvableGame({
      colorCount: this.colorCount,
      tubeCount: this.tubeCount,
      tubeSize: 4,
    });
    if (!newGame) {
      console.log('failed to generated solvable game!');
      return;
    }
    this.initTubes = newGame;
    this.tubes = this.initTubes;

    this.difficulty = gameHeuristicsUtil.estimateDifficulty(toJS(this.initTubes));
  }

  reset() {
    this.history = [];
    this.tubes = this.initTubes;
    this.selectedFirstTube = null;
    this.gameMessage = '';
    this.moveCount = 0;
  }

  undoMove() {
    this.tubes = this.history.pop() ?? this.tubes;
    if (this.moveCount > 0) this.moveCount--;
  }

  selectTube(i: number) {
    if (this.selectedFirstTube === null) {
      if (gameUtil.isTubeEmpty(this.tubes[i])) {
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
        return;
      }
      this.history.push(this.tubes);
      this.tubes = updatedTubes;
      this.selectedFirstTube = null;
      this.moveCount++;
    }
  }

  updateColorCount(x: number) {
    this.colorCount = Math.max(2, Math.min(MAX_COLOR_COUNT, this.tubeCount - 1, x));
    localStorage.setItem('colorCount', String(this.colorCount));
  }

  updateTubeCount(x: number) {
    this.tubeCount = Math.max(this.colorCount + 1, Math.min(MAX_TUBES_PER_ROW * 4, x));
    localStorage.setItem('tubeCount', String(this.tubeCount));
  }

  setGameMessage(s: string) {
    this.gameMessage = s;
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
}

export const gameStore = new GameStore();
