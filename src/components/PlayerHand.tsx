import React from 'react';
import { motion } from 'framer-motion';

interface PlayerHandProps {
  cards: string[];
  onSelectCard: (card: string) => void;
  selectedCard: string | null;
}

const CARD_VALUES: { [key: string]: number } = {
  'A': 10, 'E': 10, 'I': 10,
  'C': 8, 'H': 8, 'K': 8, 'L': 8, 'M': 8, 'N': 8, 'O': 8, 'P': 8, 'R': 8, 'S': 8, 'T': 8, 'U': 8, 'W': 8,
  'D': 6, 'J': 6, 'V': 6,
  'G': 4, 'Q': 4, 'Y': 4,
  'B': 2, 'F': 2, 'X': 2, 'Z': 2,
  '*': 15
};

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onSelectCard, selectedCard }) => {
  return (
    <div className="flex justify-center mt-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelectCard(card)}
          className={`w-16 h-24 bg-white text-black rounded-lg shadow-lg flex flex-col items-center justify-center m-1 cursor-pointer ${
            selectedCard === card ? 'border-4 border-yellow-400' : ''
          }`}
        >
          <span className="text-2xl font-bold">{card}</span>
          <span className="text-sm mt-1">{CARD_VALUES[card]} pts</span>
        </motion.div>
      ))}
    </div>
  );
};

export default PlayerHand;