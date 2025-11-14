'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BackgammonPage() {
  const [diceRoll, setDiceRoll] = useState<[number, number] | null>(null);
  const [playerPos, setPlayerPos] = useState(1);
  const [opponentPos, setOpponentPos] = useState(1);
  const [phase, setPhase] = useState('rolling');

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDiceRoll([d1, d2]);
    setPhase('moving');
  };

  const handleMove = () => {
    if (!diceRoll) return;
    const move = diceRoll[0];
    setPlayerPos(Math.min(playerPos + move, 25));
    setDiceRoll(null);
    setPhase('rolling');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-amber-950/80 backdrop-blur-xl border-b border-amber-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-amber-300 hover:text-white transition-colors"
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
            <h1 className="text-3xl font-bold text-amber-300">Backgammon</h1>
            <p className="text-sm text-amber-400">
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </p>
          </div>
          <div className="bg-amber-900/60 px-6 py-3 rounded-xl border border-amber-700/50">
            <p className="text-xs text-amber-400">GAME STATUS</p>
            <p className="text-xl font-bold text-yellow-400">In Progress</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Game Board */}
          <div className="bg-gradient-to-br from-amber-800/40 to-amber-700/40 backdrop-blur rounded-3xl p-12 border border-amber-700/30 mb-8">
            {/* Dice Display */}
            <div className="text-center mb-8">
              <p className="text-amber-300 text-sm mb-4 font-bold">DICE ROLL</p>
              {diceRoll ? (
                <div className="flex justify-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-4xl font-bold text-white border-2 border-red-400 shadow-lg">
                    {diceRoll[0]}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-4xl font-bold text-white border-2 border-red-400 shadow-lg">
                    {diceRoll[1]}
                  </div>
                </div>
              ) : (
                <p className="text-amber-400 text-lg">Click Roll Dice</p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent mb-8" />

            {/* Board Visualization */}
            <div className="grid grid-cols-6 gap-2 mb-8">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="h-20 bg-amber-900/50 rounded border border-amber-700 flex items-center justify-center"
                >
                  <span className="text-xs text-amber-300 font-bold">{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Player Positions */}
            <div className="bg-amber-900/30 rounded-xl p-4 text-center">
              <p className="text-amber-400 text-sm mb-3 font-bold">POSITIONS</p>
              <p className="text-yellow-400">You: Point {playerPos}</p>
              <p className="text-orange-400">Opponent: Point {opponentPos}</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-amber-900/40 rounded-2xl p-6 border border-amber-700/30">
              <p className="text-amber-400 text-sm mb-2 font-bold">YOUR CHECKERS</p>
              <p className="text-3xl font-bold text-yellow-400">15</p>
              <p className="text-sm text-amber-400 mt-2">Home: 0 | Board: 15</p>
            </div>
            <div className="bg-amber-900/40 rounded-2xl p-6 border border-amber-700/30">
              <p className="text-amber-400 text-sm mb-2 font-bold">OPPONENT CHECKERS</p>
              <p className="text-3xl font-bold text-orange-400">15</p>
              <p className="text-sm text-amber-400 mt-2">Home: 0 | Board: 15</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-amber-950/95 backdrop-blur-xl border-t border-amber-700/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-amber-400 mb-4">
            {phase === 'rolling' ? 'Ready to roll the dice' : 'Select your move'}
          </p>

          <div className="flex gap-3 justify-center">
            {phase === 'rolling' && (
              <button
                onClick={handleRollDice}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-amber-950 rounded-lg font-bold text-lg transition-all hover:shadow-lg"
              >
                🎲 Roll Dice
              </button>
            )}

            {phase === 'moving' && diceRoll && (
              <>
                <button
                  onClick={handleMove}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
                >
                  Move {diceRoll[0]} Points
                </button>
                <button
                  onClick={() => {
                    setDiceRoll(null);
                    setPhase('rolling');
                  }}
                  className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
                >
                  Skip Turn
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
