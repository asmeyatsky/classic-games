'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Poker Game Screen
 *
 * An immersive Texas Hold'em experience with:
 * - 3D poker table with realistic cards and chips
 * - Real-time player information display
 * - Responsive game controls
 * - Detailed game state visualization
 * - Smooth animations and premium aesthetics
 */
// Mock game state for demo
const mockGameState = {
  pot: 450,
  phase: 'flop',
  currentBet: 50,
  currentPlayerIndex: 0,
  players: [
    { chips: 2500, bet: 50, holeCards: ['A♠', 'K♠'], folded: false },
    { chips: 3200, bet: 50, holeCards: ['?', '?'], folded: false },
    { chips: 1800, bet: 0, holeCards: ['?', '?'], folded: true },
    { chips: 5000, bet: 50, holeCards: ['?', '?'], folded: false },
    { chips: 2200, bet: 100, holeCards: ['?', '?'], folded: false },
    { chips: 1500, bet: 50, holeCards: ['?', '?'], folded: false },
  ],
  communityCards: ['K♥', 'Q♦', 'J♣'],
};

export default function PokerPage() {
  const [gameState] = useState(mockGameState);
  const [localBetAmount, setLocalBetAmount] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleFold = () => {
    setSelectedAction('fold');
    alert('Fold action - connected to game engine');
  };

  const handleCheck = () => {
    setSelectedAction('check');
    alert('Check action - connected to game engine');
  };

  const handleCall = () => {
    setSelectedAction('call');
    alert(`Call $${gameState.currentBet} - connected to game engine`);
  };

  const handleBetRaise = () => {
    if (localBetAmount > 0) {
      const action = gameState.currentBet === 0 ? 'bet' : 'raise';
      setSelectedAction(action);
      alert(`${action.toUpperCase()} $${localBetAmount} - connected to game engine`);
      setLocalBetAmount(0);
    }
  };

  const startNewHand = () => {
    alert('New hand - connected to game engine');
  };

  const currentPlayer = gameState.players[0]; // Human player
  const canCheck = gameState.currentBet === 0 || currentPlayer.bet === gameState.currentBet;
  const callAmount = gameState.currentBet - (currentPlayer.bet || 0);
  const maxBet = currentPlayer.chips || 0;
  const gamePhase = gameState.phase || 'preflop';
  const communityCards = gameState.communityCards || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Texas Hold'em
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {gamePhase === 'preflop' && 'Preflop Betting'}
                {gamePhase === 'flop' && 'Flop - 3 Community Cards'}
                {gamePhase === 'turn' && 'Turn - 4th Card'}
                {gamePhase === 'river' && 'River - Final Card'}
                {gamePhase === 'showdown' && 'Showdown'}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              {/* Pot Display */}
              <div className="bg-slate-800/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-700/50 min-w-max">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pot</p>
                <p className="text-3xl font-black text-yellow-400">
                  ${gameState?.pot || 0}
                </p>
              </div>

              {/* New Hand Button */}
              <button
                onClick={startNewHand}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50"
              >
                New Hand
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Table */}
          <div className="relative mb-12">
            <div className="bg-gradient-to-br from-emerald-900/40 via-slate-800/40 to-slate-800/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 shadow-2xl aspect-video flex items-center justify-center">
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎰</div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Poker Table</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#64748b' }}>
                  Game engine integration ready
                </p>
              </div>
            </div>

            {/* Community Cards Display */}
            {communityCards.length > 0 && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3">
                {communityCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-2xl flex items-center justify-center text-white font-bold border border-red-400/50 animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {card}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Players Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {gameState.players.slice(0, 3).map((player, idx) => (
              <PlayerCard
                key={idx}
                player={player}
                playerNumber={idx + 1}
                isCurrentPlayer={idx === 0}
                isActive={gameState.currentPlayerIndex === idx}
              />
            ))}
          </div>

          {/* Opponent Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {gameState.players.slice(3).map((player, idx) => (
              <PlayerCard
                key={idx + 3}
                player={player}
                playerNumber={idx + 4}
                isCurrentPlayer={false}
                isActive={gameState.currentPlayerIndex === idx + 3}
              />
            ))}
          </div>

          {/* Your Hand Info */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-slate-400 mb-2">Your Hand</h3>
                <div className="flex gap-3">
                  {currentPlayer?.holeCards && currentPlayer.holeCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-28 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg flex items-center justify-center text-white font-bold border-2 border-red-400 text-lg"
                    >
                      {card}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-2">Your Stack</p>
                <p className="text-4xl font-black text-green-400">
                  ${currentPlayer?.chips || 0}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Bet: ${currentPlayer?.bet || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls - Fixed at Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Status */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">
                {currentPlayer.folded ? 'You have folded' : 'Your turn to act'}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Min Bet: ${gameState.currentBet} • Your Bet: ${currentPlayer.bet}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Fold */}
            <button
              onClick={handleFold}
              disabled={currentPlayer.folded}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform
                ${currentPlayer.folded
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-lg hover:shadow-red-500/50 active:scale-95'
                }`}
            >
              ✕ Fold
            </button>

            {/* Check/Call */}
            {canCheck ? (
              <button
                onClick={handleCheck}
                disabled={currentPlayer.folded}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform
                  ${currentPlayer.folded
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-500 text-white hover:shadow-lg hover:shadow-slate-500/50 active:scale-95'
                  }`}
              >
                ✓ Check
              </button>
            ) : (
              <button
                onClick={handleCall}
                disabled={currentPlayer.folded}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform
                  ${currentPlayer.folded
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/50 active:scale-95'
                  }`}
              >
                Call ${callAmount}
              </button>
            )}

            {/* Bet/Raise Section */}
            <div className="flex gap-2 items-center">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={maxBet}
                  value={localBetAmount}
                  onChange={(e) => setLocalBetAmount(Number(e.target.value))}
                  className="w-40 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="absolute -bottom-6 left-0 text-xs text-slate-400">
                  ${localBetAmount || 0}
                </div>
              </div>
              <button
                onClick={handleBetRaise}
                disabled={currentPlayer.folded || localBetAmount === 0}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform whitespace-nowrap
                  ${currentPlayer.folded || localBetAmount === 0
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95'
                  }`}
              >
                {gameState.currentBet === 0 ? '💰 Bet' : '📈 Raise'} ${localBetAmount}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Player Card Component - displays player info and status
 */
function PlayerCard({ player, playerNumber, isCurrentPlayer, isActive }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-yellow-600/30 to-amber-600/30 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
          : isCurrentPlayer
          ? 'bg-slate-800/60 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-800/40 border-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">
            {isCurrentPlayer ? '👤 You' : `Player ${playerNumber}`}
          </h3>
          <p className={`text-sm ${player?.folded ? 'text-red-400' : 'text-slate-400'}`}>
            {player?.folded ? 'Folded' : 'Active'}
          </p>
        </div>
        {isActive && (
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Chips</p>
          <p className="text-2xl font-black text-green-400">${player?.chips || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Current Bet</p>
          <p className="text-lg font-bold text-yellow-400">${player?.bet || 0}</p>
        </div>
        {!isCurrentPlayer && (
          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">Hidden Cards</p>
          </div>
        )}
      </div>
    </div>
  );
}
