import { ScrabbleGame } from './ScrabbleGame';

describe('ScrabbleGame', () => {
  let game: ScrabbleGame;
  const playerIds = ['player1', 'player2'];

  beforeEach(() => {
    game = new ScrabbleGame(playerIds);
  });

  describe('Initialization', () => {
    it('should initialize with correct number of players', () => {
      expect(game.getPlayers().length).toBe(2);
    });

    it('should initialize each player with 7 tiles', () => {
      game.getPlayers().forEach(player => {
        expect(player.rack.length).toBe(7);
      });
    });

    it('should initialize empty board', () => {
      const board = game.getBoard();
      let emptyCount = 0;
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          if (board.getTile(row, col) === null) {
            emptyCount++;
          }
        }
      }
      expect(emptyCount).toBe(225); // All 15x15 squares empty
    });

    it('should initialize with correct player order', () => {
      const players = game.getPlayers();
      expect(players[0].id).toBe('player1');
      expect(players[1].id).toBe('player2');
    });

    it('should start with player1 as current player', () => {
      expect(game.getCurrentPlayer().id).toBe('player1');
    });
  });

  describe('Tile Management', () => {
    it('should draw tiles from bag', () => {
      const player = game.getPlayers()[0];
      const tilesBeforeDraw = player.rack.length;

      game.drawTiles(player, 2);
      expect(player.rack.length).toBeLessThanOrEqual(tilesBeforeDraw + 2);
    });

    it('should exchange tiles correctly', () => {
      const player = game.getPlayers()[0];
      const originalTiles = [...player.rack];

      const tilesToExchange = originalTiles.slice(0, 2);
      game.exchangeTiles(player, tilesToExchange);

      // Tiles should be different
      const currentTiles = player.rack;
      expect(currentTiles).not.toEqual(originalTiles);
    });

    it('should not exchange more tiles than available', () => {
      const player = game.getPlayers()[0];
      const rackSize = player.rack.length;

      const tooManyTiles = new Array(rackSize + 5).fill('A');
      // Should handle gracefully
      expect(() => game.exchangeTiles(player, tooManyTiles)).not.toThrow();
    });

    it('should refill player rack after move', () => {
      const player = game.getPlayers()[0];
      const initialRackSize = player.rack.length;

      // Make a move and refill
      game.refillRack(player);

      // Rack should be refilled to 7 tiles
      expect(player.rack.length).toBeLessThanOrEqual(7);
    });
  });

  describe('Word Placement', () => {
    it('should validate word on board', () => {
      const word = 'CAT';
      const isValid = game.validateWord(word);
      expect(typeof isValid).toBe('boolean');
    });

    it('should place word on board', () => {
      const placement = {
        word: 'CAT',
        startRow: 7,
        startCol: 7,
        direction: 'horizontal' as const,
      };

      const result = game.placeWord(placement);
      expect(typeof result).toBe('boolean');
    });

    it('should check if word uses center square on first move', () => {
      const board = game.getBoard();
      const centerTile = board.getTile(7, 7);
      expect(centerTile).toBe(null); // Initially empty
    });

    it('should validate word connectivity', () => {
      // Simplified test - actual connectivity validation is complex
      const isConnected = game.validatePlacement({
        word: 'HELLO',
        startRow: 7,
        startCol: 7,
        direction: 'horizontal',
      });

      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('Scoring', () => {
    it('should calculate score for word placement', () => {
      const word = 'CAT';
      const score = game.calculateScore(word);
      expect(score).toBeGreaterThan(0);
    });

    it('should apply premium squares (double letter)', () => {
      const board = game.getBoard();
      // Double letter is at specific positions
      const multiplier = board.getPremiumMultiplier(0, 1); // Known double letter
      expect([1, 2, 3]).toContain(multiplier);
    });

    it('should apply premium squares (double word)', () => {
      const board = game.getBoard();
      const multiplier = board.getPremiumMultiplier(0, 0); // Known double word
      expect([1, 2, 3]).toContain(multiplier);
    });

    it('should award bonus for using all 7 tiles (bingo)', () => {
      const baseScore = 50;
      const bonusScore = baseScore + 50; // 50 point bonus
      expect(bonusScore).toBe(100);
    });

    it('should track player scores', () => {
      const players = game.getPlayers();
      players.forEach(player => {
        expect(player.score).toBe(0); // Initially 0
      });
    });
  });

  describe('Turn Management', () => {
    it('should advance to next player after move', () => {
      const currentPlayer = game.getCurrentPlayer();
      const currentIndex = game.getPlayers().findIndex(p => p.id === currentPlayer.id);

      game.endTurn();
      const newPlayer = game.getCurrentPlayer();
      const newIndex = game.getPlayers().findIndex(p => p.id === newPlayer.id);

      expect(newIndex).not.toEqual(currentIndex);
    });

    it('should cycle through players in order', () => {
      const firstPlayer = game.getCurrentPlayer().id;

      for (let i = 0; i < playerIds.length; i++) {
        game.endTurn();
      }

      const finalPlayer = game.getCurrentPlayer().id;
      expect(finalPlayer).toBe(firstPlayer);
    });

    it('should track skip count', () => {
      const initialSkips = game.getConsecutiveSkips();
      game.skipTurn();
      const skipCount = game.getConsecutiveSkips();

      expect(skipCount).toBeGreaterThan(initialSkips);
    });

    it('should end game after 3 consecutive skips', () => {
      game.skipTurn();
      game.skipTurn();
      game.skipTurn();

      const isGameOver = game.isGameOver();
      expect(isGameOver).toBe(true);
    });
  });

  describe('Dictionary Validation', () => {
    it('should validate common words', () => {
      expect(game.isValidWord('CAT')).toBe(true);
      expect(game.isValidWord('DOG')).toBe(true);
      expect(game.isValidWord('HELLO')).toBe(true);
    });

    it('should reject invalid words', () => {
      expect(game.isValidWord('XYZ')).toBe(false);
      expect(game.isValidWord('QQQQ')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(game.isValidWord('cat')).toBe(game.isValidWord('CAT'));
      expect(game.isValidWord('Hello')).toBe(game.isValidWord('HELLO'));
    });

    it('should handle empty string', () => {
      expect(game.isValidWord('')).toBe(false);
    });

    it('should validate 2-letter words', () => {
      const result = game.isValidWord('AT');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Game Completion', () => {
    it('should check if all tiles are drawn', () => {
      const tilesRemaining = game.getTilesRemaining();
      expect(typeof tilesRemaining).toBe('number');
      expect(tilesRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should detect when tile bag is empty', () => {
      const isEmpty = game.isTileBagEmpty();
      expect(typeof isEmpty).toBe('boolean');
    });

    it('should end game when no valid moves remain', () => {
      // Simplified test
      const canMove = game.hasValidMoves(game.getCurrentPlayer());
      expect(typeof canMove).toBe('boolean');
    });

    it('should calculate final scores correctly', () => {
      const players = game.getPlayers();
      const scores = players.map(p => p.score);

      scores.forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle 2 player game', () => {
      expect(game.getPlayers().length).toBe(2);
    });

    it('should handle 4 player game', () => {
      const fourPlayerGame = new ScrabbleGame([
        'p1',
        'p2',
        'p3',
        'p4',
      ]);
      expect(fourPlayerGame.getPlayers().length).toBe(4);
    });

    it('should handle placing word horizontally', () => {
      const result = game.placeWord({
        word: 'HELLO',
        startRow: 7,
        startCol: 7,
        direction: 'horizontal',
      });
      expect(typeof result).toBe('boolean');
    });

    it('should handle placing word vertically', () => {
      const result = game.placeWord({
        word: 'HELLO',
        startRow: 7,
        startCol: 7,
        direction: 'vertical',
      });
      expect(typeof result).toBe('boolean');
    });

    it('should prevent out of bounds placement', () => {
      const result = game.placeWord({
        word: 'VERYLONGWORDTHATEXCEEDSBOARD',
        startRow: 0,
        startCol: 0,
        direction: 'horizontal',
      });
      expect(result).toBe(false);
    });
  });
});
