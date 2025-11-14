'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ScrabblePage() {
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [phase, setPhase] = useState('playing');

  const playerTiles = ['A', 'E', 'I', 'O', 'U', 'R', 'S'];
  const boardSize = 15;

  const handleTileSelect = (index: number) => {
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter((i) => i !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const handlePlayWord = () => {
    if (selectedTiles.length > 0) {
      const points = selectedTiles.length * 10;
      setPlayerScore(playerScore + points);
      setSelectedTiles([]);
    }
  };

  const handlePass = () => {
    setSelectedTiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/80 backdrop-blur-xl border-b border-indigo-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Games
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-300">Scrabble</h1>
            <p className="text-sm text-indigo-400">
              {phase === 'playing' ? 'Word Game' : 'Game Over'}
            </p>
          </div>
          <div className="bg-indigo-900/60 px-6 py-3 rounded-xl border border-indigo-700/50">
            <p className="text-xs text-indigo-400">TILES LEFT</p>
            <p className="text-xl font-bold text-cyan-400">87</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Game Board */}
          <div className="bg-gradient-to-br from-indigo-800/40 to-indigo-700/40 backdrop-blur rounded-3xl p-8 border border-indigo-700/30 mb-8">
            <div
              className="grid gap-px mb-8"
              style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
            >
              {Array.from({ length: boardSize * boardSize }, (_, i) => {
                const row = Math.floor(i / boardSize);
                const col = i % boardSize;
                const isCenterWord =
                  (row === 7 && col === 7) ||
                  (row === 0 && col === 0) ||
                  (row === 0 && col === boardSize - 1) ||
                  (row === boardSize - 1 && col === 0) ||
                  (row === boardSize - 1 && col === boardSize - 1);
                const isDoubleWord = (row === 1 && col === 1) || (row === 13 && col === 13);
                const isTripleWord = (row === 0 && col === 7) || (row === 7 && col === 0);
                const isDoubleLetter =
                  (row === 0 && col === 3) || (row === 0 && col === 11) || (row === 3 && col === 0);
                const isTripleLetter = (row === 1 && col === 5) || (row === 5 && col === 1);

                let bgColor = 'bg-amber-100';
                let textColor = 'text-gray-700 text-xs font-bold';

                if (isCenterWord) {
                  bgColor = 'bg-gradient-to-br from-pink-500 to-rose-600';
                  textColor = 'text-white text-xs';
                } else if (isTripleWord) {
                  bgColor = 'bg-gradient-to-br from-red-600 to-red-700';
                  textColor = 'text-white text-xs';
                } else if (isDoubleWord) {
                  bgColor = 'bg-gradient-to-br from-pink-400 to-pink-500';
                  textColor = 'text-white text-xs';
                } else if (isTripleLetter) {
                  bgColor = 'bg-gradient-to-br from-blue-500 to-blue-600';
                  textColor = 'text-white text-xs';
                } else if (isDoubleLetter) {
                  bgColor = 'bg-gradient-to-br from-cyan-300 to-cyan-400';
                  textColor = 'text-gray-800 text-xs';
                }

                return (
                  <div
                    key={i}
                    className={`w-8 h-8 md:w-10 md:h-10 ${bgColor} rounded-sm flex items-center justify-center border border-gray-300/20 hover:opacity-80 cursor-pointer transition-opacity`}
                  >
                    {isCenterWord && <span className="text-lg">★</span>}
                    {isTripleWord && <span className={`${textColor}`}>TW</span>}
                    {isDoubleWord && <span className={`${textColor}`}>DW</span>}
                    {isTripleLetter && <span className={`${textColor}`}>TL</span>}
                    {isDoubleLetter && <span className={`${textColor}`}>DL</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player Tiles and Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Your Rack */}
            <div className="bg-indigo-900/40 rounded-2xl p-6 border border-indigo-700/30">
              <p className="text-indigo-400 text-sm font-bold mb-4">YOUR TILES</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {playerTiles.map((tile, i) => (
                  <button
                    key={i}
                    onClick={() => handleTileSelect(i)}
                    className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                      selectedTiles.includes(i)
                        ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                        : 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                    }`}
                  >
                    {tile}
                  </button>
                ))}
              </div>
              <p className="text-indigo-400 text-sm font-bold mb-2">YOUR SCORE</p>
              <p className="text-4xl font-bold text-cyan-400">{playerScore}</p>
            </div>

            {/* Opponent Info */}
            <div className="bg-indigo-900/40 rounded-2xl p-6 border border-indigo-700/30 opacity-60">
              <p className="text-indigo-400 text-sm font-bold mb-4">OPPONENT TILES</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg bg-gray-400 border border-gray-500"
                  />
                ))}
              </div>
              <p className="text-indigo-400 text-sm font-bold mb-2">OPPONENT SCORE</p>
              <p className="text-4xl font-bold text-orange-400">{opponentScore}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur-xl border-t border-indigo-700/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-indigo-400 mb-4">
            {selectedTiles.length > 0
              ? `${selectedTiles.length} tiles selected`
              : 'Select tiles to form a word'}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePlayWord}
              disabled={selectedTiles.length === 0}
              className={`px-8 py-4 rounded-lg font-bold transition-all ${
                selectedTiles.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              ✓ Play Word
            </button>

            <button
              onClick={handlePass}
              className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
            >
              Skip Turn
            </button>

            <button
              onClick={() => setSelectedTiles([])}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
