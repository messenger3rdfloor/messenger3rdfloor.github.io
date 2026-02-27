import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { isNil, throttle } from "lodash";
import {
  gameWinTileValue,
  mergeAnimationDuration,
  tileCountPerDimension,
} from "@/constants";
import { Tile } from "@/models/tile";
import gameReducer, { initialState } from "@/reducers/game-reducer";

type MoveDirection = "move_up" | "move_down" | "move_left" | "move_right";

export const GameContext = createContext({
  score: 0,
  highScore: 0,
  status: "ongoing",
  moveTiles: (_: MoveDirection) => {},
  getTiles: () => [] as Tile[],
  startGame: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [highScore, setHighScore] = useState(0);
  const highScoreStorageKey = "12288_high_score";

  const getEmptyCells = () => {
    const results: [number, number][] = [];

    for (let x = 0; x < tileCountPerDimension; x++) {
      for (let y = 0; y < tileCountPerDimension; y++) {
        if (isNil(gameState.board[y][x])) {
          results.push([x, y]);
        }
      }
    }
    return results;
  };

  const appendRandomTile = () => {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
      const cellIndex = Math.floor(Math.random() * emptyCells.length);
      const newTile = {
        position: emptyCells[cellIndex],
        value: 3,
      };
      dispatch({ type: "create_tile", tile: newTile });
    }
  };

  const getTiles = () => {
    return gameState.tilesByIds.map((tileId) => gameState.tiles[tileId]);
  };

  const moveTiles = useCallback(
    throttle(
      (type: MoveDirection) => dispatch({ type }),
      mergeAnimationDuration * 1.05,
      { trailing: false },
    ),
    [dispatch],
  );

  const startGame = () => {
    dispatch({ type: "reset_game" });
    dispatch({ type: "create_tile", tile: { position: [0, 1], value: 3 } });
    dispatch({ type: "create_tile", tile: { position: [0, 2], value: 3 } });
  };

  const checkGameState = () => {
    const isWon =
      Object.values(gameState.tiles).filter((t) => t.value === gameWinTileValue)
        .length > 0;

    if (isWon) {
      dispatch({ type: "update_status", status: "won" });
      return;
    }

    const { tiles, board } = gameState;
    const size = tileCountPerDimension;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const currentTileId = board[x][y];
        if (isNil(currentTileId)) return;
        const currentValue = tiles[currentTileId].value;

        // 2. Check neighbor to the right (if not on the last column)
        if (x < size - 1) {
          const rightTileId = board[x + 1][y];
          if (isNil(rightTileId) || currentValue === tiles[rightTileId].value) {
            return;
          }
        }

        // 3. Check neighbor below (if not on the last row)
        if (y < size - 1) {
          const bottomTileId = board[x][y + 1];
          if (isNil(bottomTileId) || currentValue === tiles[bottomTileId].value) {
            return;
          }
        }
      }
    }

    dispatch({ type: "update_status", status: "lost" });
  };

  useEffect(() => {
    if (gameState.hasChanged) {
      setTimeout(() => {
        dispatch({ type: "clean_up" });
        appendRandomTile();
      }, mergeAnimationDuration);
    }
  }, [gameState.hasChanged]);

  useEffect(() => {
    if (!gameState.hasChanged) {
      checkGameState();
    }
  }, [gameState.hasChanged]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(highScoreStorageKey);
      const parsed = stored ? Number(stored) : 0;
      if (!Number.isNaN(parsed) && parsed > 0) {
        setHighScore(parsed);
      }
    } catch {
      // Ignore storage errors (privacy mode, disabled storage, etc.)
    }
  }, []);

  useEffect(() => {
    setHighScore((current) => {
      const next = Math.max(current, gameState.score);
      if (next !== current) {
        try {
          window.localStorage.setItem(highScoreStorageKey, String(next));
        } catch {
          // Ignore storage errors (privacy mode, disabled storage, etc.)
        }
      }
      return next;
    });
  }, [gameState.score]);

  return (
    <GameContext.Provider
      value={{
        score: gameState.score,
        highScore,
        status: gameState.status,
        getTiles,
        moveTiles,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
