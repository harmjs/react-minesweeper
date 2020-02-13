import Array2D from '../lib/Array2D';
import IVect2D from '../lib/IVect2D';
import Tile from './Tile';

const Game = function(difficulty) {
  this.state = new Game.UndefinedState();
  this._update = null;
  this._setTime = null;

  this.difficulty = difficulty;
  this.shouldUpdate = null;
  
  this.time = null;
  this.tiles2D = null;
  this.tileArray = null;
  this.tileMap = null;
  this.tileCount = null;
}

Game.BOARD_SIZE = new IVect2D(8, 8);
Game.MINE_COUNT = 10;

Game.CLICK_TYPE_LEFT = 0;
Game.CLICK_TYPE_RIGHT = 1;

Game.prototype = {
  init: function(update, setTime, startingState) {
    this._update = update;
    this._setTime = setTime;

    this.state = startingState;

    this.state.onStart(this);
    this.scheduleUpdate();
  },
  setTime: function(nextTime) {
    this.time = nextTime;
    this._setTime(this.time);
  },
  scheduleUpdate: function() {
    if(this.shouldUpdate) {
      this.state.onUpdate(this);

      this.shouldUpdate = false;
      this._update();
    } 
  },
  stateTransition: function(nextState) {
    this.state.onStop(this);
    this.state = nextState;
    nextState.onStart(this);
  },
  onTileClick: function(tile, clickType) {
    this.state.onTileClick(tile, clickType, this);
    this.scheduleUpdate();
  },
  onFaceClick: function() {
    this.stateTransition(new Game.PlayState());
    this.scheduleUpdate();
  },
  onSetDifficulty: function(difficulty) {
    this.difficulty = difficulty;
    this.stateTransition(new Game.PlayState());
    this.scheduleUpdate();
  },
  countTiles: function() {
    return this.tileArray.reduce((counts, tile) => {
      const currentCount = counts.get(tile.state.constructor);
      counts.set(tile.state.constructor, currentCount + 1);
      return counts;
    },
    new Map(Object.values(Game.Tile).map((value) => [value, 0]))
  )}
}

const IGameState = {
  onStart: function() {},
  onStop: function() {},
  onTileClick: function() {},
  onUpdate: function() {}
}

Game.UndefinedState = function() {};

Game.UndefinedState.prototype = Object.assign(
  Object.create(IGameState),
  {
    constructor: Game.UndefinedState,
  }
);

Game.PlayState = function() {};

Game.PlayState.prototype = Object.assign(
  Object.create(IGameState),
  {
    constructor: Game.PlayState,
    onStart: function(game) {
      game.setTime(0);
      game.tiles2D = Array2D.fromIVect2D(game.difficulty.size, (x, y) => 
        new Tile(new Tile.UndefinedState(), new IVect2D(x, y))
      );
      game.tileArray = game.tiles2D.toArray();
      game.tileMap = game.tiles2D.toMap((tile) => tile.position.serialize());
      game.shouldUpdate = true;
    },
    onStop: function(game) {
      clearInterval(game.timerId);
    },
    onTileClick: function(tile, clickType, game) {
      tile.onClick(game, clickType);
    },
    onUpdate: function(game) {
      const tileCount = game.countTiles();
      const clearToWinCount = game.tileArray.length - game.difficulty.mineCount;

      const currentClearedCount = 
        tileCount.get(Game.Tile.UnsafeState)
        + tileCount.get(Game.Tile.SafeState);

      if(clearToWinCount === currentClearedCount) {
        game.stateTransition(new Game.WinState())
      }

      game.tileCount = tileCount;
    }
  }
);

Game.WinState = function() {};

Game.WinState.prototype = Object.assign(
  Object.create(IGameState),
  {
    constructor: Game.WinState
  }
);

Game.LossState = function() {};

Game.LossState.prototype = Object.assign(
  Object.create(IGameState),
  {
    constructor: Game.LoseState,
    onStart: function(game) {
      game.tileArray.forEach((tile) => {
        if(tile.state instanceof Tile.HiddenState) {
          tile.state = tile.state.hidden;
        } else if (
          tile.state instanceof Tile.FlagState
          && !(tile.state.hidden.hidden instanceof Tile.MineState)
        ) {
          tile.state = new Tile.FlagErrorState();
        }
      })
    }
  }
);

Game.Difficulty = function(name, size, mineCount) {
  this.name = name;
  this.size = size;
  this.mineCount = mineCount;
}

Game.Difficulty.BEGINNER = new Game.Difficulty("Beginner", new IVect2D(8, 8), 10);
Game.Difficulty.INTERMEDIATE = new Game.Difficulty("Intermediate", new IVect2D(16, 16), 40);
Game.Difficulty.EXPERT = new Game.Difficulty("Expert", new IVect2D(24, 24), 99);

Game.Tile = Tile;

export default Game;