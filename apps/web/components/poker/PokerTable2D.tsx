'use client';

import { usePokerStore } from '@/lib/store/pokerStore';

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

interface CardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceUp?: boolean;
}

function Card2D({ suit, rank, faceUp = true }: CardProps) {
  if (!faceUp) {
    return (
      <div className="w-16 h-24 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg border-2 border-blue-600 flex items-center justify-center shadow-lg">
        <div className="text-blue-400 text-2xl">🂠</div>
      </div>
    );
  }

  return (
    <div className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-between p-2 shadow-lg">
      <div className={`text-2xl font-bold ${suitColors[suit]}`}>
        {rank}
      </div>
      <div className={`text-3xl ${suitColors[suit]}`}>
        {suitSymbols[suit]}
      </div>
      <div className={`text-2xl font-bold ${suitColors[suit]} transform rotate-180`}>
        {rank}
      </div>
    </div>
  );
}

export default function PokerTable2D() {
  const { gameState } = usePokerStore();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Initializing game...</p>
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const aiPlayers = gameState.players.slice(1);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Poker Table */}
      <div className="relative w-full max-w-6xl h-full max-h-[600px]">
        {/* Table Felt */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 rounded-[50%] border-8 border-yellow-900 shadow-2xl" />

        {/* Community Cards - Center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 z-10">
          {gameState.communityCards.length > 0 ? (
            gameState.communityCards.map((card, index) => (
              <Card2D key={index} suit={card.suit} rank={card.rank} faceUp={true} />
            ))
          ) : (
            <div className="text-gray-400 text-lg">Community Cards</div>
          )}
        </div>

        {/* Pot - Above community cards */}
        {gameState.pot > 0 && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-yellow-600 text-white px-6 py-3 rounded-full shadow-lg border-2 border-yellow-400">
              <div className="text-center">
                <div className="text-sm font-semibold">POT</div>
                <div className="text-2xl font-bold">${gameState.pot}</div>
              </div>
            </div>
          </div>
        )}

        {/* Round Indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {gameState.round.toUpperCase().replace('_', ' ')}
          </div>
        </div>

        {/* Human Player - Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              {humanPlayer.hand.length > 0 && (
                <>
                  <Card2D
                    suit={humanPlayer.hand[0].suit}
                    rank={humanPlayer.hand[0].rank}
                    faceUp={!humanPlayer.folded}
                  />
                  {humanPlayer.hand.length > 1 && (
                    <Card2D
                      suit={humanPlayer.hand[1].suit}
                      rank={humanPlayer.hand[1].rank}
                      faceUp={!humanPlayer.folded}
                    />
                  )}
                </>
              )}
            </div>
            <div className={`bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg ${humanPlayer.folded ? 'opacity-50' : ''}`}>
              <div className="text-center">
                <div className="text-sm font-semibold">YOU</div>
                <div className="text-lg font-bold text-green-400">${humanPlayer.chips}</div>
                {humanPlayer.bet > 0 && (
                  <div className="text-sm text-yellow-400">Bet: ${humanPlayer.bet}</div>
                )}
                {humanPlayer.folded && (
                  <div className="text-sm text-red-400">FOLDED</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Players - Arranged around table */}
        {aiPlayers.map((player, index) => {
          // Position players around the table
          const positions = [
            { bottom: '50%', left: '8%', transform: 'translateY(50%)' }, // Left
            { top: '8%', left: '30%' }, // Top-left
            { top: '8%', right: '30%' }, // Top-right
          ];

          const pos = positions[index] || positions[0];

          return (
            <div
              key={player.id}
              className="absolute z-10"
              style={pos}
            >
              <div className="flex flex-col items-center gap-2">
                {!player.folded && player.hand.length > 0 && (
                  <div className="flex gap-2">
                    <Card2D suit="hearts" rank="A" faceUp={false} />
                    <Card2D suit="hearts" rank="A" faceUp={false} />
                  </div>
                )}
                <div className={`bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg ${player.folded ? 'opacity-50' : ''}`}>
                  <div className="text-center">
                    <div className="text-xs font-semibold">AI {index + 1}</div>
                    <div className="text-sm font-bold text-green-400">${player.chips}</div>
                    {player.bet > 0 && (
                      <div className="text-xs text-yellow-400">Bet: ${player.bet}</div>
                    )}
                    {player.folded && (
                      <div className="text-xs text-red-400">FOLDED</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
