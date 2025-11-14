'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PokerPage() {
  const [pot, setPot] = useState(250);
  const [playerChips, setPlayerChips] = useState(2500);
  const [playerBet, setPlayerBet] = useState(50);
  const [currentBet, setCurrentBet] = useState(50);
  const [phase, setPhase] = useState('flop');
  const [folded, setFolded] = useState(false);

  const communityCards = ['K♥', 'Q♦', 'J♣'];
  const playerHand = ['A♠', 'K♠'];

  const handleFold = () => {
    setFolded(true);
  };

  const handleCheck = () => {
    alert('Check - your turn complete');
  };

  const handleCall = () => {
    const callAmount = currentBet - playerBet;
    setPlayerBet(currentBet);
    setPot(pot + callAmount);
    setPlayerChips(playerChips - callAmount);
  };

  const handleRaise = (amount: number) => {
    const totalBet = currentBet + amount;
    const raiseAmount = totalBet - playerBet;
    setCurrentBet(totalBet);
    setPlayerBet(totalBet);
    setPot(pot + raiseAmount);
    setPlayerChips(playerChips - raiseAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/80 backdrop-blur-xl border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors"
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
            <h1 className="text-3xl font-bold text-emerald-300">Texas Hold'em</h1>
            <p className="text-sm text-emerald-400">
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </p>
          </div>
          <div className="bg-emerald-900/60 px-6 py-3 rounded-xl border border-emerald-700/50">
            <p className="text-xs text-emerald-400">POT</p>
            <p className="text-2xl font-bold text-yellow-400">${pot}</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Poker Table */}
          <div className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur rounded-3xl p-12 border border-emerald-700/30 mb-8">
            {/* Community Cards */}
            <div className="text-center mb-8">
              <p className="text-emerald-300 text-sm mb-4">COMMUNITY CARDS</p>
              <div className="flex justify-center gap-3">
                {communityCards.map((card, i) => (
                  <div
                    key={i}
                    className="w-20 h-28 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-red-400 shadow-lg"
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-700 to-transparent mb-8" />

            {/* Your Hand */}
            <div className="text-center">
              <p className="text-emerald-300 text-sm mb-4">YOUR HAND</p>
              <div className="flex justify-center gap-3">
                {playerHand.map((card, i) => (
                  <div
                    key={i}
                    className="w-20 h-28 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-400 shadow-lg"
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-900/40 rounded-2xl p-6 border border-emerald-700/30">
              <p className="text-emerald-400 text-sm mb-2">YOUR CHIPS</p>
              <p className="text-3xl font-bold text-green-400">${playerChips}</p>
              <p className="text-sm text-emerald-400 mt-3">Current Bet: ${playerBet}</p>
            </div>
            <div className="bg-emerald-900/40 rounded-2xl p-6 border border-emerald-700/30">
              <p className="text-emerald-400 text-sm mb-2">GAME STATUS</p>
              <p className={`text-xl font-bold ${folded ? 'text-red-400' : 'text-yellow-400'}`}>
                {folded ? 'FOLDED' : 'ACTIVE'}
              </p>
              <p className="text-sm text-emerald-400 mt-3">Min Bet: ${currentBet}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-700/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-emerald-400 mb-4">
            {folded ? 'You have folded. Waiting for hand to complete...' : 'Your turn to act'}
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleFold}
              disabled={folded}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-lg'
              }`}
            >
              Fold
            </button>

            <button
              onClick={handleCheck}
              disabled={folded || currentBet > playerBet}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                folded || currentBet > playerBet
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-600 hover:bg-slate-500 text-white hover:shadow-lg'
              }`}
            >
              Check
            </button>

            <button
              onClick={handleCall}
              disabled={folded || currentBet === playerBet}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                folded || currentBet === playerBet
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg'
              }`}
            >
              Call ${currentBet - playerBet}
            </button>

            <button
              onClick={() => handleRaise(50)}
              disabled={folded}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              Raise $50
            </button>

            <button
              onClick={() => handleRaise(100)}
              disabled={folded}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              Raise $100
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
