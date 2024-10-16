import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId" element={<Game />} />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;