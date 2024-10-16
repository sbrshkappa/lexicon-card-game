import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/useGame';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import { X } from 'lucide-react';

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, playerName, setPlayerName, joinGame, playCard, discardCard, challengeWord, exitGame } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [joiningError, setJoiningError] = useState<string | null>(null);

  useEffect(() => {
    const joinGameHandler = async () => {
      if (gameId && playerName) {
        try {
          const joined = await joinGame(gameId);
          if (!joined) {
            setJoiningError("Failed to join the game. It might be full or no longer available.");
          }
        } catch (error) {
          setJoiningError("An error occurred while joining the game.");
          console.error(error);
        }
      }
    };

    joinGameHandler();
  }, [gameId, playerName, joinGame]);

  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Enter your name to join the game</h2>
        <input
          type="text"
          placeholder="Your name"
          className="p-2 mb-4 rounded bg-white bg-opacity-20 text-white placeholder-gray-300"
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (joiningError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{joiningError}</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!game) {
    return <div className="text-center mt-8">Loading game...</div>;
  }

  const handleExitGame = () => {
    exitGame();
    navigate('/');
  }

  const handleCardPlay = (word: string) => {
    playCard(word);
  };

  const handleCardDiscard = () => {
    if (selectedCard) {
      discardCard(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        Lexicon Game: {gameId}
      </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExitGame}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <X size={20} className="mr-2" />
          Exit Game
        </motion.button>
      </div>
      {/* ... (keep existing JSX) */}
    </div>
      <div className="w-full max-w-4xl">
        <ScoreBoard players={game.players} />
        <GameBoard
          words={game.words || []}
          onPlayCard={handleCardPlay}
          onChallengeWord={challengeWord}
        />
        <PlayerHand
          cards={game.players.find(p => p.name === playerName)?.hand || []}
          onSelectCard={setSelectedCard}
          selectedCard={selectedCard}
        />
        <div className="mt-4 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCardDiscard}
            disabled={!selectedCard}
            className="bg-red-500 text-white p-2 rounded mr-4 disabled:opacity-50"
          >
            Discard Card
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Implement card exchange logic */}}
            disabled={!selectedCard}
            className="bg-yellow-500 text-white p-2 rounded disabled:opacity-50"
          >
            Exchange Card
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Game;