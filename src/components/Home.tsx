import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/useGame';

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { createGame, joinGame, setPlayerName: setContextPlayerName } = useGame();

  const handleCreateGame = async () => {
    try {
      if (playerName.trim()) {
        setContextPlayerName(playerName.trim());
        const newGameId = await createGame(playerName.trim());
        navigate(`/game/${newGameId}`);
      } else {
        setError('Please enter a valid player name.');
      }
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    }
  };

  const handleJoinGame = async () => {
    try {
      if (playerName.trim() && gameId.trim()) {
        setContextPlayerName(playerName.trim());
        const joined = await joinGame(gameId.trim());
        if (joined) {
          navigate(`/game/${gameId.trim()}`);
        } else {
          setError('Failed to join the game. Please check the game ID.');
        }
      } else {
        setError('Please enter both player name and game ID.');
      }
    } catch (err) {
      setError('Failed to join game. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        Lexicon Card Game
      </motion.h1>
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg max-w-md w-full">
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-white bg-opacity-20 text-white placeholder-gray-300"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateGame}
          className="w-full bg-green-500 text-white p-2 rounded mb-4 flex items-center justify-center"
        >
          <Play size={20} className="mr-2" /> Create Game
        </motion.button>
        <input
          type="text"
          placeholder="Enter game ID to join"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-white bg-opacity-20 text-white placeholder-gray-300"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJoinGame}
          className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center"
        >
          <Users size={20} className="mr-2" /> Join Game
        </motion.button>
      </div>
    </div>
  );
};

export default Home;