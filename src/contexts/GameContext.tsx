import React, { createContext, useState, useCallback, useEffect } from 'react';
import { createGame, joinGame, playCard, discardCard, challengeWord, getGameState, exitGame } from '../services/GameService';

interface Player {
  name: string;
  score: number;
  hand: string[];
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  words: string[];
  drawPile: string[];
  discardPile: string[];
}

export interface GameContextType {
  game: GameState | null;
  playerName: string;
  setPlayerName: (name: string) => void;
  createGame: (playerName: string) => Promise<string>;
  joinGame: (gameId: string) => Promise<boolean>;
  playCard: (word: string) => Promise<void>;
  discardCard: (card: string) => Promise<void>;
  challengeWord: (word: string) => Promise<void>;
  exitGame: () => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameId, setGameId] = useState<string | null>(null);

  const createGameHandler = useCallback(async (name: string) => {
    const newGameId = await createGame(name);
    setGameId(newGameId);
    setPlayerName(name);
    return newGameId;
  }, []);

  const joinGameHandler = useCallback(async (id: string) => {
    if (playerName) {
      const joined = await joinGame(id, playerName);
      if (joined) {
        setGameId(id);
      }
      return joined;
    }
    return false;
  }, [playerName]);

  const exitGameHandler = useCallback(async () => {
    if (gameId && playerName) {
      try {
        await exitGame(gameId, playerName);
        setGameId(null);
        setPlayerName('');
        setGame(null);
      } catch (error) {
        console.error('Error exiting game:', error);
      }
    }
  }, [gameId, playerName]);


  const playCardHandler = useCallback(async (word: string) => {
    if (gameId && playerName) {
      await playCard(gameId, playerName, word);
    }
  }, [gameId, playerName]);

  const discardCardHandler = useCallback(async (card: string) => {
    if (gameId && playerName) {
      await discardCard(gameId, playerName, card);
    }
  }, [gameId, playerName]);

  const challengeWordHandler = useCallback(async (word: string) => {
    if (gameId && playerName) {
      await challengeWord(gameId, playerName, word);
    }
  }, [gameId, playerName]);

  useEffect(() => {
    const fetchGameState = async () => {
      if (gameId) {
        const state = await getGameState(gameId);
        if (state) {
          setGame(state);
        }
      }
    };

    fetchGameState();
    const intervalId = setInterval(fetchGameState, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [gameId]);

  const value = {
    game,
    playerName,
    setPlayerName,
    createGame: createGameHandler,
    joinGame: joinGameHandler,
    playCard: playCardHandler,
    discardCard: discardCardHandler,
    challengeWord: challengeWordHandler,
    exitGame: exitGameHandler
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};