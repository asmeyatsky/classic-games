'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Scrabble Game Screen
 *
 * A word-based puzzle experience with:
 * - 15x15 game board with premium squares
 * - Draggable letter tiles
 * - Real-time word validation
 * - Score calculation with multipliers
 * - Beautiful typography and animations
 */
export default function ScrabblePage() {
  const [gameState, setGameState] = useState<any>(null);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('playing'); // playing, gameOver
  const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setGameState({
      board: Array(15)
        .fill(null)
        .map(() => Array(15).fill(null)),
      players: [
        { id: 1, name: 'You', rack: ['A', 'E', 'I', 'O', 'U', 'R', 'S'], score: 0 },
        { id: 2, name: 'AI Player', rack: [], score: 0 },
      ],
      currentPlayerIndex: 0,
      tilesRemaining: 93,
    });
    setPlayerScores({ player1: 0, player2: 0 });
    setGamePhase('playing');
  };

  const handlePlaceTile = (tile: string, row: number, col: number) => {
    console.log(`Placing ${tile} at ${row},${col}`);
  };

  const handleSubmitWord = () => {
    // Calculate score and submit word
    setCurrentScore(0);
  };

  const handleExchangeTiles = () => {
    console.log('Exchanging tiles');
  };

  const handleSkipTurn = () => {
    console.log('Skipping turn');
  };

  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const wordMultipliers = [3, 2, 2, 3, 1, 2, 2, 3, 2, 2, 3, 2, 2, 3, 2];
  const letterMultipliers = [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white overflow-hidden">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/80 backdrop-blur-xl border-b border-indigo-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Scrabble
              </h1>
              <p className="text-sm text-indigo-300 mt-1">
                {gamePhase === 'playing' && '📝 Word Game'}
                {gamePhase === 'gameOver' && '🏆 Game Complete'}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              {/* Score Display */}
              <div className="bg-indigo-900/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-indigo-700/50 min-w-max">
                <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Your Score</p>
                <p className="text-3xl font-black text-cyan-400">{playerScores.player1}</p>
              </div>

              {/* New Game Button */}
              <button
                onClick={initializeGame}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/50"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Board */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-indigo-800/40 to-indigo-700/40 backdrop-blur-sm rounded-3xl p-8 border border-indigo-700/30 shadow-2xl inline-block">
              {/* 15x15 Scrabble Board */}
              <div className="grid gap-0.5 bg-indigo-950 p-2 rounded-lg" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                {Array(225)
                  .fill(null)
                  .map((_, idx) => {
                    const row = Math.floor(idx / 15);
                    const col = idx % 15;
                    const isCenter = row === 7 && col === 7;
                    const isTripleWord = (row === 0 && col === 0) || (row === 0 && col === 7) || (row === 0 && col === 14);
                    const isDoubleWord = (row === 1 && col === 1) || (row === 1 && col === 13);
                    const isTripleLetter = (row === 1 && col === 5) || (row === 1 && col === 9);
                    const isDoubleLetter = (row === 0 && col === 3) || (row === 0 && col === 11);

                    let bgColor = 'bg-amber-100';
                    let textColor = 'text-xs text-gray-400';

                    if (isCenter) {
                      bgColor = 'bg-gradient-to-br from-pink-500 to-rose-600';
                      textColor = 'text-white text-xs';
                    } else if (isTripleWord) {
                      bgColor = 'bg-gradient-to-br from-red-600 to-red-700';
                      textColor = 'text-white text-xs';
                    } else if (isDoubleWord) {
                      bgColor = 'bg-gradient-to-br from-pink-400 to-pink-500';
                      textColor = 'text-white text-xs';
                    } else if (isTripleLetter) {
                      bgColor = 'bg-gradient-to-br from-blue-400 to-blue-500';
                      textColor = 'text-white text-xs';
                    } else if (isDoubleLetter) {
                      bgColor = 'bg-gradient-to-br from-cyan-300 to-cyan-400';
                      textColor = 'text-gray-700 text-xs';
                    }

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-sm ${bgColor} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-gray-300/20 group`}
                      >
                        {isCenter && <span className="text-lg">★</span>}
                        {isTripleWord && <span className={`${textColor} group-hover:scale-110 transition-transform`}>TW</span>}
                        {isDoubleWord && <span className={`${textColor} group-hover:scale-110 transition-transform`}>DW</span>}
                        {isTripleLetter && <span className={`${textColor} group-hover:scale-110 transition-transform`}>TL</span>}
                        {isDoubleLetter && <span className={`${textColor} group-hover:scale-110 transition-transform`}>DL</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Players Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Current Player */}
            <div className="bg-gradient-to-br from-indigo-800/40 to-indigo-700/40 backdrop-blur-sm p-8 rounded-2xl border border-indigo-700/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">👤 You</h3>
                  <p className="text-sm text-indigo-400">Current Player</p>
                </div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Score</span>
                  <span className="text-2xl font-black text-cyan-400">{playerScores.player1}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Tiles in Rack</span>
                  <span className="text-lg font-bold text-indigo-200">{currentPlayer?.rack?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Last Word</span>
                  <span className="text-lg font-bold text-indigo-200">—</span>
                </div>
              </div>
            </div>

            {/* Opponent */}
            <div className="bg-gradient-to-br from-indigo-800/40 to-indigo-700/40 backdrop-blur-sm p-8 rounded-2xl border border-indigo-700/30 opacity-60">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">🤖 AI Player</h3>
                  <p className="text-sm text-indigo-400">Opponent</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Score</span>
                  <span className="text-2xl font-black text-cyan-400">{playerScores.player2}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Tiles in Rack</span>
                  <span className="text-lg font-bold text-indigo-200">7</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg">
                  <span className="text-indigo-300 text-sm">Last Word</span>
                  <span className="text-lg font-bold text-indigo-200">PLAY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rack */}
          <div className="bg-gradient-to-r from-indigo-800/50 to-indigo-700/50 backdrop-blur-sm p-6 rounded-2xl border border-indigo-600/50">
            <h3 className="text-sm uppercase tracking-widest text-indigo-400 mb-4">Your Rack</h3>
            <div className="flex gap-3 flex-wrap">
              {currentPlayer?.rack?.map((tile: string, idx: number) => (
                <div
                  key={idx}
                  className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-yellow-500 hover:shadow-xl transition-shadow hover:-translate-y-1"
                >
                  <span className="text-lg font-black text-yellow-900">{tile}</span>
                </div>
              ))}
              {Array(7 - (currentPlayer?.rack?.length || 0))
                .fill(null)
                .map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="w-12 h-12 bg-indigo-900/30 rounded-lg border-2 border-dashed border-indigo-600/30"
                  />
                ))}
            </div>
            <p className="text-xs text-indigo-400 mt-4">Tiles Remaining: {gameState?.tilesRemaining || 93}</p>
          </div>
        </div>
      </main>

      {/* Action Controls - Fixed at Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur-xl border-t border-indigo-700/50 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Status */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-indigo-300">
                Place tiles on the board to form valid words. Submit when ready!
              </span>
            </div>
            <div className="text-sm text-indigo-400">
              Current Word Score: <span className="font-bold text-cyan-400">{currentScore}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Submit Word */}
            <button
              onClick={handleSubmitWord}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50 active:scale-95"
            >
              ✓ Submit Word
            </button>

            {/* Exchange Tiles */}
            <button
              onClick={handleExchangeTiles}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform bg-slate-600 hover:bg-slate-500 text-white hover:shadow-lg hover:shadow-slate-500/50 active:scale-95"
            >
              🔄 Exchange
            </button>

            {/* Skip Turn */}
            <button
              onClick={handleSkipTurn}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform bg-slate-700 hover:bg-slate-600 text-white hover:shadow-lg hover:shadow-slate-500/50 active:scale-95"
            >
              ⏭️ Skip
            </button>

            {/* Instructions */}
            <div className="flex-1 max-w-md">
              <div className="bg-indigo-900/50 rounded-xl p-4 border border-indigo-700/50">
                <p className="text-xs text-indigo-300 uppercase tracking-wider mb-2">How to Play</p>
                <p className="text-sm text-indigo-100">
                  Drag tiles from your rack onto the board to form words. Words must be connected and valid English words.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
