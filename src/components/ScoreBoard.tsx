import React from 'react';

interface Player {
  name: string;
  score: number;
}

interface ScoreBoardProps {
  players: Player[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players }) => {
  return (
    <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg mb-4">
      <h2 className="text-2xl font-bold mb-2">Score Board</h2>
      <div className="grid grid-cols-2 gap-2">
        {players.map((player, index) => (
          <div key={index} className="flex justify-between">
            <span>{player.name}</span>
            <span>{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;