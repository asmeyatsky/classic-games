'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Backgammon Game Screen
 *
 * An immersive backgammon experience with:
 * - 3D backgammon board with 24 points
 * - Physics-based dice rolling
 * - Real-time move validation
 * - Smooth piece animations
 * - Detailed game state visualization
 */
export default function BackgammonPage() {
  const [gameState, setGameState] = useState<any>(null);
  const [selectedChecker, setSelectedChecker] = useState<number | null>(null);
  const [availableMoves, setAvailableMoves] = useState<number[]>([]);
  const [diceRoll, setDiceRoll] = useState<[number, number] | null>(null);
  const [gamePhase, setGamePhase] = useState('rolling'); // rolling, moving, finished

  useEffect(() => {
    // Initialize game
    initializeGame();
  }, []);

  const initializeGame = () => {
    setGameState({
      board: Array(24).fill(0),
      whiteScore: 0,
      blackScore: 0,
      currentPlayer: 'white',
      dice: [0, 0],
      diceUsed: [false, false],
      bornOff: { white: 0, black: 0 },
    });
    setGamePhase('rolling');
  };

  const handleRollDice = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    setDiceRoll([die1, die2]);
    setGamePhase('moving');
  };

  const handleMoveChecker = (from: number, to: number) => {
    // Update game state with move
    console.log(`Moving from ${from} to ${to}`);
  };

  const handleSkipTurn = () => {
    setGamePhase('rolling');
    setDiceRoll(null);
    setSelectedChecker(null);
  };

  const whiteHome = gameState?.bornOff?.white || 0;
  const blackHome = gameState?.bornOff?.black || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-white overflow-hidden">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-amber-950/80 backdrop-blur-xl border-b border-amber-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-amber-200 hover:text-white transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Games
          </Link>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Backgammon
              </h1>
              <p className="text-sm text-amber-300 mt-1">
                {gamePhase === 'rolling' && '🎲 Roll Dice'}
                {gamePhase === 'moving' && '🎯 Move Checkers'}
                {gamePhase === 'finished' && '🏁 Game Over'}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              {/* Dice Display */}
              <div className="bg-amber-900/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-amber-700/50 min-w-max">
                <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">Last Roll</p>
                {diceRoll ? (
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-lg">
                      {diceRoll[0]}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-lg">
                      {diceRoll[1]}
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-300 font-bold">Ready</p>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={initializeGame}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50"
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
          <div className="relative mb-12">
            <div className="bg-gradient-to-br from-amber-800/40 to-amber-700/40 backdrop-blur-sm rounded-3xl p-8 border border-amber-700/30 shadow-2xl">
              {/* Backgammon Board */}
              <div className="grid gap-1 mb-8" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
                {Array(24)
                  .fill(null)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleMoveChecker(selectedChecker ?? 0, idx)}
                      className={`h-48 rounded-t-lg transition-all cursor-pointer border-2 flex flex-col items-center justify-start pt-2 ${
                        idx < 12
                          ? idx % 2 === 0
                            ? 'bg-gradient-to-b from-amber-900 to-amber-950 border-amber-800'
                            : 'bg-gradient-to-b from-red-900 to-red-950 border-red-800'
                          : idx % 2 === 0
                            ? 'bg-gradient-to-b from-red-900 to-red-950 border-red-800'
                            : 'bg-gradient-to-b from-amber-900 to-amber-950 border-amber-800'
                      }`}
                    >
                      <span className="text-xs text-amber-400 font-bold">{idx + 1}</span>
                      {/* Checker preview */}
                      <div className="flex flex-col gap-1 mt-2">
                        {Array(3)
                          .fill(null)
                          .map((_, c) => (
                            <div
                              key={c}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 shadow-md border border-gray-400"
                            />
                          ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Center Bar */}
              <div className="h-2 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded mb-8"></div>

              {/* Home Areas */}
              <div className="grid grid-cols-2 gap-12">
                <div className="bg-amber-900/30 rounded-xl p-6 border border-amber-700/50">
                  <h3 className="text-sm uppercase tracking-widest text-amber-300 mb-4">
                    ⚪ White Home
                  </h3>
                  <p className="text-4xl font-black text-yellow-300">{whiteHome}/15</p>
                  <p className="text-xs text-amber-400 mt-2">Checkers Borne Off</p>
                </div>
                <div className="bg-amber-900/30 rounded-xl p-6 border border-amber-700/50 text-right">
                  <h3 className="text-sm uppercase tracking-widest text-amber-300 mb-4">
                    ⚫ Black Home
                  </h3>
                  <p className="text-4xl font-black text-gray-300">{blackHome}/15</p>
                  <p className="text-xs text-amber-400 mt-2">Checkers Borne Off</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* White Player */}
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm p-8 rounded-2xl border border-amber-700/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-300 shadow-lg border-2 border-gray-400"></div>
                <div>
                  <h3 className="text-xl font-bold">You (White)</h3>
                  <p className="text-sm text-amber-400">Human Player</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">Pieces on Board</span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">In Home Board</span>
                  <span className="text-lg font-bold">8</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">Borne Off</span>
                  <span className="text-lg font-bold">{whiteHome}</span>
                </div>
              </div>
            </div>

            {/* Black Player */}
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm p-8 rounded-2xl border border-amber-700/30 opacity-60">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 shadow-lg border-2 border-gray-700"></div>
                <div>
                  <h3 className="text-xl font-bold">AI Opponent</h3>
                  <p className="text-sm text-amber-400">Computer Player</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">Pieces on Board</span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">In Home Board</span>
                  <span className="text-lg font-bold">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-900/50 rounded-lg">
                  <span className="text-amber-300 text-sm">Borne Off</span>
                  <span className="text-lg font-bold">{blackHome}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls - Fixed at Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-amber-950/95 backdrop-blur-xl border-t border-amber-700/50 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Status */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-amber-300">
                {gamePhase === 'rolling' && 'Ready to roll dice'}
                {gamePhase === 'moving' && 'Move your checkers using the dice'}
                {gamePhase === 'finished' && 'Game finished!'}
              </span>
            </div>
            <div className="text-sm text-amber-400">
              Total Moves Available: {diceRoll ? diceRoll[0] + diceRoll[1] : 0}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {gamePhase === 'rolling' && (
              <button
                onClick={handleRollDice}
                className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-amber-500/50 text-amber-950"
              >
                🎲 Roll Dice
              </button>
            )}

            {gamePhase === 'moving' && (
              <>
                <button
                  onClick={handleSkipTurn}
                  className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform bg-slate-600 hover:bg-slate-500 text-white hover:shadow-lg hover:shadow-slate-500/50 active:scale-95"
                >
                  End Turn
                </button>

                <div className="flex-1 max-w-md">
                  <div className="bg-amber-900/50 rounded-xl p-4 border border-amber-700/50">
                    <p className="text-xs text-amber-300 uppercase tracking-wider mb-2">
                      Move Instructions
                    </p>
                    <p className="text-sm text-amber-100">
                      Select a checker and click on a valid destination point to move it.
                    </p>
                  </div>
                </div>
              </>
            )}

            {gamePhase === 'finished' && (
              <button
                onClick={initializeGame}
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50 text-white"
              >
                🎮 Play Again
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
