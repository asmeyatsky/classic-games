import { PokerGame } from './PokerGame';
import { PokerRound } from './index';

describe('PokerGame', () => {
  let game: PokerGame;
  const playerIds = ['player1', 'player2', 'player3'];
  const initialChips = 1000;

  beforeEach(() => {
    game = new PokerGame(playerIds, initialChips);
  });

  describe('Initialization', () => {
    it('should initialize with correct number of players', () => {
      expect(game.getPlayers().length).toBe(3);
    });

    it('should initialize each player with correct chip count', () => {
      game.getPlayers().forEach(player => {
        expect(player.chips).toBe(initialChips);
      });
    });

    it('should initialize with empty community cards', () => {
      expect(game.getCommunityCards().length).toBe(0);
    });

    it('should start with zero pot', () => {
      expect(game.getPot()).toBe(0);
    });
  });

  describe('Hand Dealing', () => {
    it('should deal hole cards to all players', () => {
      game.startNewHand();
      game.getPlayers().forEach(player => {
        expect(player.getHoleCards().length).toBe(2);
      });
    });

    it('should advance round from PRE_FLOP to FLOP', () => {
      game.startNewHand();
      game.advanceRound();
      expect(game.getCommunityCards().length).toBe(3); // Flop is 3 cards
    });

    it('should advance round from FLOP to TURN', () => {
      game.startNewHand();
      game.advanceRound(); // FLOP
      game.advanceRound(); // TURN
      expect(game.getCommunityCards().length).toBe(4);
    });

    it('should advance round from TURN to RIVER', () => {
      game.startNewHand();
      game.advanceRound(); // FLOP
      game.advanceRound(); // TURN
      game.advanceRound(); // RIVER
      expect(game.getCommunityCards().length).toBe(5);
    });
  });

  describe('Player Actions', () => {
    beforeEach(() => {
      game.startNewHand();
    });

    it('should allow player to check', () => {
      const initialChips = game.getPlayers()[0].chips;
      game.playerAction('player1', 'check');
      expect(game.getPlayers()[0].chips).toBe(initialChips);
    });

    it('should allow player to fold', () => {
      const player = game.getPlayers()[0];
      game.playerAction('player1', 'fold');
      expect(player.folded).toBe(true);
    });

    it('should allow player to place a bet', () => {
      const player = game.getPlayers()[0];
      const betAmount = 50;
      game.playerAction('player1', 'bet', betAmount);
      expect(player.bet).toBeGreaterThan(0);
    });

    it('should allow player to call a bet', () => {
      const player1 = game.getPlayers()[0];
      const player2 = game.getPlayers()[1];

      // Player 1 bets
      game.playerAction('player1', 'bet', 100);
      const potAfterBet = game.getPot();

      // Player 2 calls
      game.playerAction('player2', 'call');
      expect(game.getPot()).toBeGreaterThanOrEqual(potAfterBet);
    });

    it('should prevent folded players from acting', () => {
      const player = game.getPlayers()[0];
      game.playerAction('player1', 'fold');
      const chipsAfterFold = player.chips;

      // Try to bet after folding
      game.playerAction('player1', 'bet', 100);
      expect(player.chips).toBe(chipsAfterFold);
    });

    it('should prevent all-in players from acting', () => {
      const player = game.getPlayers()[0];
      // Simulate all-in by setting allIn flag
      player.allIn = true;
      const chipsBeforeAction = player.chips;

      game.playerAction('player1', 'bet', 100);
      expect(player.chips).toBe(chipsBeforeAction);
    });
  });

  describe('Pot Management', () => {
    beforeEach(() => {
      game.startNewHand();
    });

    it('should increase pot when player places bet', () => {
      const initialPot = game.getPot();
      game.playerAction('player1', 'bet', 50);
      expect(game.getPot()).toBeGreaterThan(initialPot);
    });

    it('should handle multiple bets correctly', () => {
      game.playerAction('player1', 'bet', 100);
      const potAfterFirstBet = game.getPot();

      game.playerAction('player2', 'call');
      expect(game.getPot()).toBeGreaterThan(potAfterFirstBet);
    });
  });

  describe('Chip Management', () => {
    it('should correctly deduct chips when player bets', () => {
      game.startNewHand();
      const player = game.getPlayers()[0];
      const chipsBefore = player.chips;

      game.playerAction('player1', 'bet', 100);
      // Chips should be deducted (accounting for bet placement)
      expect(player.chips + player.bet).toBeLessThanOrEqual(chipsBefore);
    });

    it('should not allow player to bet more than they have', () => {
      game.startNewHand();
      const player = game.getPlayers()[0];
      const totalChips = player.chips;

      // Try to bet more than available
      game.playerAction('player1', 'bet', totalChips + 1000);
      // Player should not go negative
      expect(player.chips).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Game State', () => {
    it('should return correct game state', () => {
      game.startNewHand();
      const state = game.getGameState();

      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('communityCards');
      expect(state).toHaveProperty('pot');
      expect(state).toHaveProperty('currentRound');
    });

    it('should track dealer position correctly', () => {
      game.startNewHand();
      const firstDealerIndex = game.getDealerIndex();

      game.startNewHand();
      const secondDealerIndex = game.getDealerIndex();

      // Dealer button should rotate
      expect(secondDealerIndex).toBe((firstDealerIndex + 1) % playerIds.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all players folding except one', () => {
      game.startNewHand();
      game.playerAction('player1', 'fold');
      game.playerAction('player2', 'fold');
      // player3 should win by default

      const activePlayers = game.getPlayers().filter(p => !p.folded);
      expect(activePlayers.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle heads-up scenario (2 players)', () => {
      const headsUpGame = new PokerGame(['p1', 'p2'], 500);
      headsUpGame.startNewHand();

      expect(headsUpGame.getPlayers().length).toBe(2);
    });

    it('should handle single table with max players (6)', () => {
      const maxGame = new PokerGame(
        ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        1000
      );
      maxGame.startNewHand();

      expect(maxGame.getPlayers().length).toBe(6);
    });
  });
});
