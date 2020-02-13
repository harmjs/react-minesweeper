import React, { useRef, useState, useEffect } from 'react';
import { useObject } from './lib/customHooks';
import Game from './models/Game';
import Tile from './models/Tile';

import './style.css';

const FaceEmoticonMap = new Map([
  [Game.PlayState, () => <div className="face-button">🙂</div>],
  [Game.WinState, () => <div className="face-button">😃</div>],
  [Game.LoseState, () => <div className="face-button">😑</div>]
])

const GameComponent = () => {
  const [game, updateGame] = useObject(new Game(Game.Difficulty.BEGINNER));
  const [time, setTime] = useState(0);

  useEffect(() => {
    game.init(updateGame, setTime, new Game.PlayState());
  }, [])

  if(game.state instanceof Game.UndefinedState) return null;

  const FaceEmoticon = FaceEmoticonMap.get(game.state.constructor);
  const mineCount = game.difficulty.mineCount - game.tileCount.get(Game.Tile.FlagState);

  return (
    <div className="container">
      <div className="tools">
        <div className="tools__tool">
          <div>Mines</div>
          <div>{ mineCount }</div>
        </div>
        <div 
          className="tools__tools"
          onClick={() => game.onFaceClick()}
        >
          <FaceEmoticon />
        </div>
        <div>
          <div>Time</div>
          <div
            style={{ textAlign: "right" }}
          >
            { time }
          </div>
        </div>
      </div>
      <GameBoard 
        game={game}
      />
      <DifficultyOptions game={game}/>
    </div>
  );
}

const DifficultyOptions = ({ game }) => {
  return (
    <div className="difficulty">
      <div className="difficulty__options">
        {Object.values(Game.Difficulty).map((difficulty, index) => (
          <label key={index}>
            <input 
              type="radio" 
              name="difficulty" 
              value={difficulty.name} 
              checked={game.difficulty === difficulty}
              onChange={() => game.onSetDifficulty(difficulty)}
            />
            {difficulty.name}
          </label>
        ))}
      </div>
    </div>
  )
}

const GameBoard = ({ game }) => {
  return (
    <div
      className="board"
    >
      { game.tiles2D.map((array1D, xIndex) => (
        <div 
          key={xIndex}
          className="row"
        >
          { array1D.map((tile, yIndex) => (
            <TileComponent 
              key={yIndex}
              tile={tile}
              game={game}
            />
          ))}
        </div>
      )) }
    </div>
  )
}

const HiddenTileState = () => (
  <div className="tile__hidden"></div>
);

const UNSAFE_MINECOUNT_COLOR = {
  1: "Blue",
  2: "Green",
  3: "Red",
  4: "DarkBlue",
  5: "Brown",
  6: "Cyan",
  7: "Black",
  8: "Grey"
}

const SafeTileComponent = () => null;

const UnsafeTileComponent = ({ state }) => {
  const color = UNSAFE_MINECOUNT_COLOR[state.mineCount];
  return (
    <div
      className="tile__revealed"
      style={{ color }}
    >
      { state.mineCount }
    </div>
  );
};

const FlagTileComponent = () => (
  <div className="tile__hidden tile__flag">
    🚩
  </div>
);

const FlagErrorTileComponent = () => (
  <div className="tile__hidden tile__flag">
    ❌
  </div>
);

const MineTileComponent = () => (
  <div
    className="tile__revealed tile__bomb"
  >
    💣
  </div>
);

const ExplosionTileComponent = () => (
  <div
    className="tile__revealed tile__explosion"
  >
    💥
  </div>
);

const TileStateComponentMap = new Map([
  [Game.Tile.UndefinedState, HiddenTileState],
  [Game.Tile.HiddenState, HiddenTileState],
  [Game.Tile.SafeState, SafeTileComponent],
  [Game.Tile.UnsafeState, UnsafeTileComponent],
  [Game.Tile.FlagState, FlagTileComponent],
  [Game.Tile.FlagErrorState, FlagErrorTileComponent],
  [Game.Tile.MineState, MineTileComponent],
  [Game.Tile.ExplosionState, ExplosionTileComponent]
]);

const TileComponent = ({ tile, game }) => {
  const TileStateComponent = TileStateComponentMap.get(tile.state.constructor);
  return (
    <div 
        className="tile"
        onClick={() => game.onTileClick(tile, Game.CLICK_TYPE_LEFT)}
        onContextMenu={(event) => {
          event.preventDefault();
          game.onTileClick(tile, Game.CLICK_TYPE_RIGHT);
        }}
      >
      <TileStateComponent 
        state={tile.state}
      />
    </div>
  )
}

export default GameComponent;


