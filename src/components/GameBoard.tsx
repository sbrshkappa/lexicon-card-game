import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/useGame';

interface GameBoardProps {
  words: string[];
  onPlayCard: (word: string) => void;
  onChallengeWord: (word: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ words = [], onPlayCard, onChallengeWord }) => {
  const [newWord, setNewWord] = useState('');
  const { game, playerName } = useGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      onPlayCard(newWord.trim().toUpperCase());
      setNewWord('');
    }
  };

  const canFormWord = (word: string, hand: string[]) => {
    const handCopy = [...hand];
    for (const letter of word) {
      const index = handCopy.indexOf(letter);
      if (index === -1) {
        const wildcardIndex = handCopy.indexOf('*');
        if (wildcardIndex === -1) {
          return false;
        }
        handCopy.splice(wildcardIndex, 1);
      } else {
        handCopy.splice(index, 1);
      }
    }
    return true;
  };

  const playerHand = game?.players.find(p => p.name === playerName)?.hand || [];

  return (
    <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Game Board</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        {words.map((word, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-500 text-white p-2 rounded-lg flex items-center"
          >
            <div className="flex mr-2">
              {word.split('').map((letter, i) => (
                <div key={i} className="w-8 h-10 bg-white text-black rounded-md flex items-center justify-center mr-1">
                  {letter}
                </div>
              ))}
            </div>
            <button
              onClick={() => onChallengeWord(word)}
              className="bg-red-500 text-xs px-2 py-1 rounded"
            >
              Challenge
            </button>
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Enter a new word"
          className="flex-grow p-2 rounded-l bg-white bg-opacity-20 text-white placeholder-gray-300"
        />
        <button
          type="submit"
          disabled={!canFormWord(newWord.toUpperCase(), playerHand)}
          className="bg-green-500 text-white p-2 rounded-r disabled:opacity-50"
        >
          Play
        </button>
      </form>
    </div>
  );
};

export default GameBoard;