import { create } from 'zustand';
import { PokerGame, PokerGameState, PokerRound, Card } from '@classic-games/game-engine';

interface PokerStore {
  game: PokerGame | null;
  gameState: PokerGameState | null;
  playerIndex: number;
  betAmount: number;

  // Actions
  initGame: (playerCount: number) => void;
  startNewHand: () => void;
  performAction: (action: 'fold' | 'check' | 'call' | 'bet' | 'raise', amount?: number) => void;
  setBetAmount: (amount: number) => void;
  updateGameState: () => void;
}

export const usePokerStore = create<PokerStore>((set, get) => ({
  game: null,
  gameState: null,
  playerIndex: 0,
  betAmount: 0,

  initGame: (playerCount: number = 4) => {
    // Create player IDs - player 0 is human, others are AI
    const playerIds = Array.from({ length: playerCount }, (_, i) =>
      i === 0 ? 'human' : `ai-${i}`
    );

    const game = new PokerGame(playerIds, 1000);
    set({ game, playerIndex: 0 });

    // Start first hand
    game.startNewHand();
    get().updateGameState();
  },

  startNewHand: () => {
    const { game } = get();
    if (!game) return;

    game.startNewHand();
    get().updateGameState();
  },

  performAction: (action, amount) => {
    const { game, playerIndex, betAmount } = get();
    if (!game) return;

    const playerId = playerIndex === 0 ? 'human' : `ai-${playerIndex}`;

    switch (action) {
      case 'bet':
      case 'raise':
        game.playerAction(playerId, action, amount || betAmount);
        break;
      default:
        game.playerAction(playerId, action);
    }

    get().updateGameState();

    // Process AI turns
    setTimeout(() => {
      get().processAITurns();
    }, 1000);
  },

  setBetAmount: (amount: number) => {
    set({ betAmount: amount });
  },

  updateGameState: () => {
    const { game } = get();
    if (!game) return;

    const gameState = game.getState();
    set({ gameState });
  },

  // Helper method to process AI turns
  processAITurns: () => {
    const { game, gameState } = get();
    if (!game || !gameState) return;

    const currentPlayer = game.currentPlayer;

    // If current player is AI, make a decision
    if (currentPlayer.id.startsWith('ai-') && !currentPlayer.folded && !currentPlayer.allIn) {
      setTimeout(() => {
        // Simple AI logic
        const random = Math.random();
        const callAmount = gameState.currentBet - currentPlayer.bet;

        if (random < 0.2) {
          // 20% fold
          game.playerAction(currentPlayer.id, 'fold');
        } else if (random < 0.6 && callAmount === 0) {
          // 40% check when possible
          game.playerAction(currentPlayer.id, 'check');
        } else if (random < 0.9) {
          // 30% call
          game.playerAction(currentPlayer.id, 'call');
        } else {
          // 10% raise
          const raiseAmount = gameState.currentBet + Math.floor(currentPlayer.chips * 0.2);
          game.playerAction(currentPlayer.id, 'raise', raiseAmount);
        }

        get().updateGameState();

        // Continue processing AI turns
        get().processAITurns();
      }, 1500);
    }
  },
}));
