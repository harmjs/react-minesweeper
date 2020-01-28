import Game from './Game';
import random from '../lib/random';

const Tile = function(state, position) {
  this.state = state;
  this.position = position;
};

Tile.prototype = {
  getNeighbours: function(tileMap) {
    return this.position.neighbours(tileMap)
      .map((neighbourPosition) => neighbourPosition.serialize())
      .filter((neighbourKey) => tileMap.has(neighbourKey))
      .map((neighbourKey) => tileMap.get(neighbourKey));
  },
  onClick: function(game, clickType) {
    if(clickType === Game.CLICK_TYPE_LEFT) {
      this.state.onLeftClick(this, game);
    } else {
      this.state.onRightClick(this, game);
    }
  }
}

const ITileState = {
  onLeftClick: function() {},
  onRightClick: function() {}
}

Tile.UndefinedState = function() {};


Tile.UndefinedState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.UndefinedState,
    onLeftClick: function(tile, game) {
      const notPossibleMines = [tile, ...tile.getNeighbours(game.tileMap)];
      const possibleMines = random.shuffle(
        game.tileArray.filter((tile) => !notPossibleMines.includes(tile))
      );

      const mines = possibleMines.splice(0, game.difficulty.mineCount);
      mines.forEach((mine) => mine.state = new Tile.MineState);
      
      const notMines = possibleMines.concat(notPossibleMines);
      notMines.forEach((tile) => {
        const mineCount = tile.getNeighbours(game.tileMap)
          .reduce((mineCount, neighbourTile) => {
            if (neighbourTile.state instanceof Tile.MineState) mineCount += 1;
            return mineCount;
          }, 0);

        if(mineCount) {
          tile.state = new Tile.UnsafeState(mineCount);
        } else tile.state = new Tile.SafeState(); 
      })
      
      game.tileArray.forEach((tile) => {
        tile.state = new Tile.HiddenState(tile.state);
      });

      tile.state.onLeftClick(tile, game);

      game.timerId = setInterval(() => {
        game.setTime(game.time + 1);
      }, 1000);

      game.shouldUpdate = true;
    }
  }
);

Tile.HiddenState = function(hidden) {
  this.hidden = hidden;
};

Tile.HiddenState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.HiddenState,
    onLeftClick: function(tile, game) {
      tile.state = this.hidden;
      if(tile.state instanceof Tile.SafeState) {
        tile.getNeighbours(game.tileMap)
          .filter((tile) => tile.state instanceof Tile.HiddenState)
          .forEach((tile) => { tile.state.onLeftClick(tile, game) });
      } else if (tile.state instanceof Tile.MineState) {
        tile.state = new Tile.ExplosionState();
        game.stateTransition(new Game.LossState());
      }
      game.shouldUpdate = true;
    },
    onRightClick: function(tile, game) {
      tile.state = new Tile.FlagState(tile.state);
      game.shouldUpdate = true;
    }
  }
);

Tile.FlagState = function(hidden) {
  this.hidden = hidden;
};

Tile.FlagState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.FlagState,
    onRightClick: function(tile, game) {
      tile.state = tile.state.hidden;
      game.shouldUpdate = true;
    }
  }
);

Tile.FlagErrorState = function() {};

Tile.FlagErrorState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.FlagErrorState,
  }
);

Tile.ExplosionState = function() {};

Tile.ExplosionState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.ExplosionState,
  }
);

Tile.MineState = function() {};

Tile.MineState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.MineState,
  }
);

Tile.SafeState = function() {};

Tile.SafeState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.SafeState,
  }
)

Tile.UnsafeState = function(mineCount) {
  this.mineCount = mineCount;
};

Tile.UnsafeState.prototype = Object.assign(
  Object.create(ITileState),
  {
    constructor: Tile.UnsafeState,
    onLeftClick: function(tile, game) {
      const neighbours = tile.getNeighbours(game.tileMap);
      const flagCount = neighbours
        .reduce((flagCount, neighbourTile) => {
          if(neighbourTile.state instanceof Tile.FlagState) flagCount += 1;
          return flagCount;
        }, 0)

        if(flagCount === this.mineCount) {
          neighbours
            .filter((tile) => tile.state instanceof Tile.HiddenState)
            .forEach((tile) => tile.state.onLeftClick(tile, game));
        }
    }
  }
);

export default Tile;

