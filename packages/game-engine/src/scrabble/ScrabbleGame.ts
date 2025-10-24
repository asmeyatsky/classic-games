import {
  ScrabbleGameState,
  ScrabblePlayerState,
  ScrabbleTile,
  WordPlacement,
  TILE_VALUES,
} from './index';
import { TileBag } from './TileBag';
import { ScrabbleDictionary } from './Dictionary';
import { ScrabbleBoard, getPremiumScore } from './ScrabbleBoard';

/**
 * ScrabbleGame - Core Game Engine
 *
 * Architectural Intent:
 * - Manages complete Scrabble game state and logic
 * - Validates word placements according to Scrabble rules
 * - Calculates scores with premium square multipliers
 * - Manages tile bag and player racks
 * - Provides AI opponent support
 *
 * Key Design Decisions:
 * 1. Immutable state management
 * 2. Separation of concerns (board, dictionary, tiles, scoring)
 * 3. Complete rule enforcement
 * 4. Extensible for AI opponents
 */

export interface MoveResult {
  valid: boolean;
  score: number;
  words: WordPlacement[];
  message: string;
}

export class ScrabbleGame {
  private state: ScrabbleGameState;
  private tileBag: TileBag;
  private dictionary: ScrabbleDictionary;
  private board: ScrabbleBoard;
  private moveHistory: Array<{ player: string; score: number; word: string }> = [];
  private consecutiveSkips = 0;
  private firstMove = true;

  constructor(playerIds: string[]) {
    this.tileBag = new TileBag();
    this.dictionary = new ScrabbleDictionary();
    this.board = new ScrabbleBoard();

    // Initialize players
    const players: ScrabblePlayerState[] = playerIds.map((id) => ({
      id,
      score: 0,
      rack: this.tileBag.drawTiles(7),
    }));

    this.state = {
      board: Array(15)
        .fill(null)
        .map(() => Array(15).fill(null)),
      players,
      tileBag: this.tileBag.getRemaining(),
      currentPlayerIndex: 0,
    };
  }

  /**
   * Place a word on the board
   */
  placeWord(placement: WordPlacement): MoveResult {
    const player = this.state.players[this.state.currentPlayerIndex];

    // Validate placement format
    if (!this.isValidPlacement(placement)) {
      return {
        valid: false,
        score: 0,
        words: [],
        message: 'Invalid placement format',
      };
    }

    // Check if word is in dictionary
    if (!this.dictionary.isValidWord(placement.word)) {
      return {
        valid: false,
        score: 0,
        words: [],
        message: `"${placement.word}" is not a valid word`,
      };
    }

    // Check if tiles are available in rack
    if (!this.hasTilesInRack(player, placement.tiles)) {
      return {
        valid: false,
        score: 0,
        words: [],
        message: 'Not enough tiles in rack',
      };
    }

    // Validate board placement
    const placements = this.getConnectedWords(placement);
    if (!placements.valid) {
      return {
        valid: false,
        score: 0,
        words: [],
        message: placements.message,
      };
    }

    // Validate all connected words
    for (const word of placements.words) {
      if (!this.dictionary.isValidWord(word.word)) {
        return {
          valid: false,
          score: 0,
          words: [],
          message: `"${word.word}" is not a valid word`,
        };
      }
    }

    // Calculate score
    const scoreResult = this.calculateScore(placements.words, player);

    // Apply the move
    this.applyMove(placement, placements.words, player, scoreResult.score);

    this.consecutiveSkips = 0;
    this.firstMove = false;

    return {
      valid: true,
      score: scoreResult.score,
      words: placements.words,
      message: `Placed "${placement.word}" for ${scoreResult.score} points`,
    };
  }

  /**
   * Skip the current player's turn
   */
  skipTurn(): boolean {
    this.consecutiveSkips++;

    if (this.consecutiveSkips >= this.state.players.length) {
      return true; // Game ends
    }

    this.endTurn();
    return false;
  }

  /**
   * Exchange tiles
   */
  exchangeTiles(tileIndices: number[]): boolean {
    const player = this.state.players[this.state.currentPlayerIndex];

    if (tileIndices.length === 0 || tileIndices.length > player.rack.length) {
      return false;
    }

    // Exchange tiles
    const tilesToExchange = tileIndices.map((i) => player.rack[i]);
    const newTiles = this.tileBag.drawTiles(tilesToExchange.length);

    // Update rack
    const newRack = player.rack.filter((_, i) => !tileIndices.includes(i));
    player.rack = [...newRack, ...newTiles];

    // Return tiles to bag
    tilesToExchange.forEach((tile) => this.tileBag.returnTile(tile));

    this.consecutiveSkips = 0;
    this.endTurn();
    return true;
  }

  /**
   * Get current game state
   */
  getState(): ScrabbleGameState {
    return {
      board: this.state.board.map((row) => [...row]),
      players: this.state.players.map((p) => ({ ...p })),
      tileBag: this.tileBag.getRemaining(),
      currentPlayerIndex: this.state.currentPlayerIndex,
    };
  }

  /**
   * Get current player's rack
   */
  getCurrentPlayerRack(): ScrabbleTile[] {
    return [...this.state.players[this.state.currentPlayerIndex].rack];
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    // Game ends when all tiles drawn and one player uses all tiles
    // Or when consecutive skip limit reached
    return this.consecutiveSkips >= this.state.players.length * 2 ||
      this.tileBag.getRemaining() === 0 &&
      this.state.players.some((p) => p.rack.length === 0);
  }

  /**
   * Get final scores (with rack deduction)
   */
  getFinalScores(): Array<{ id: string; score: number }> {
    const result = [...this.state.players];

    // Deduct unused tile values
    result.forEach((player) => {
      const rackValue = player.rack.reduce(
        (sum, tile) => sum + (tile.isBlank ? 0 : TILE_VALUES[tile.letter] || 0),
        0
      );
      player.score -= rackValue;
    });

    return result.map((p) => ({ id: p.id, score: p.score }));
  }

  /**
   * Validate placement format
   */
  private isValidPlacement(placement: WordPlacement): boolean {
    if (placement.startRow < 0 || placement.startRow >= 15) return false;
    if (placement.startCol < 0 || placement.startCol >= 15) return false;
    if (placement.tiles.length === 0) return false;

    const maxPos =
      placement.direction === 'horizontal'
        ? placement.startCol + placement.tiles.length
        : placement.startRow + placement.tiles.length;

    return maxPos <= 15;
  }

  /**
   * Check if player has required tiles in rack
   */
  private hasTilesInRack(player: ScrabblePlayerState, needed: ScrabbleTile[]): boolean {
    const rackCopy = [...player.rack];

    for (const tile of needed) {
      const index = rackCopy.findIndex(
        (t) =>
          (!tile.isBlank && t.letter === tile.letter && !t.isBlank) ||
          (tile.isBlank && t.isBlank)
      );

      if (index === -1) return false;
      rackCopy.splice(index, 1);
    }

    return true;
  }

  /**
   * Get all connected words formed by placement
   */
  private getConnectedWords(
    placement: WordPlacement
  ): {
    valid: boolean;
    words: WordPlacement[];
    message: string;
  } {
    const words: WordPlacement[] = [placement];
    let touchesExistingTile = false;

    if (this.firstMove && (placement.startRow !== 7 || placement.startCol !== 7)) {
      return {
        valid: false,
        words: [],
        message: 'First word must cover center square',
      };
    }

    // Check for connected words
    const direction = placement.direction;
    const perpendicular = direction === 'horizontal' ? 'vertical' : 'horizontal';

    for (let i = 0; i < placement.tiles.length; i++) {
      const row =
        direction === 'horizontal' ? placement.startRow : placement.startRow + i;
      const col =
        direction === 'horizontal' ? placement.startCol + i : placement.startCol;

      // Check if position is already occupied
      if (
        this.state.board[row][col] &&
        this.state.board[row][col]?.letter !== placement.tiles[i].letter
      ) {
        return {
          valid: false,
          words: [],
          message: 'Space already occupied',
        };
      }

      if (this.state.board[row][col]) {
        touchesExistingTile = true;
      }

      // Check for perpendicular words
      const perpWord = this.getPerpendicularyWord(row, col, perpendicular);
      if (perpWord && perpWord.length > 1) {
        touchesExistingTile = true;
        words.push({
          word: perpWord,
          startRow: perpendicular === 'vertical' ? row - perpWord.length + 1 : row,
          startCol: perpendicular === 'horizontal' ? col - perpWord.length + 1 : col,
          direction: perpendicular,
          tiles: [],
        });
      }
    }

    if (!this.firstMove && !touchesExistingTile) {
      return {
        valid: false,
        words: [],
        message: 'Word must connect to existing tiles',
      };
    }

    return { valid: true, words, message: '' };
  }

  /**
   * Get word formed perpendicular to placement
   */
  private getPerpendicularyWord(row: number, col: number, direction: string): string {
    let word = '';
    if (direction === 'vertical') {
      for (let r = 0; r < 15; r++) {
        if (this.state.board[r][col]) {
          word += this.state.board[r][col]?.letter || '';
        }
      }
    } else {
      for (let c = 0; c < 15; c++) {
        if (this.state.board[row][c]) {
          word += this.state.board[row][c]?.letter || '';
        }
      }
    }
    return word;
  }

  /**
   * Calculate score with premium squares
   */
  private calculateScore(
    words: WordPlacement[],
    player: ScrabblePlayerState
  ): { score: number } {
    let totalScore = 0;

    for (const word of words) {
      let wordScore = 0;
      let wordMultiplier = 1;
      let isNewTile = false;

      for (let i = 0; i < word.tiles.length; i++) {
        const row =
          word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const col =
          word.direction === 'horizontal' ? word.startCol + i : word.startCol;

        const tile = word.tiles[i];
        const tileValue = tile.isBlank ? 0 : TILE_VALUES[tile.letter] || 0;

        // Check if it's a new tile (not already on board)
        if (!this.state.board[row][col]) {
          isNewTile = true;
          const premium = getPremiumScore(row, col);

          if (premium.type.includes('Letter')) {
            wordScore += tileValue * premium.multiplier;
          } else {
            wordScore += tileValue;
            wordMultiplier *= premium.multiplier;
          }
        } else {
          wordScore += tileValue;
        }
      }

      totalScore += wordScore * wordMultiplier;
    }

    return { score: totalScore };
  }

  /**
   * Apply the move to game state
   */
  private applyMove(
    placement: WordPlacement,
    words: WordPlacement[],
    player: ScrabblePlayerState,
    score: number
  ): void {
    // Place tiles on board
    for (let i = 0; i < placement.tiles.length; i++) {
      const row =
        placement.direction === 'horizontal'
          ? placement.startRow
          : placement.startRow + i;
      const col =
        placement.direction === 'horizontal'
          ? placement.startCol + i
          : placement.startCol;

      this.state.board[row][col] = placement.tiles[i];
    }

    // Update score
    player.score += score;

    // Remove tiles from rack
    for (const tile of placement.tiles) {
      const index = player.rack.findIndex(
        (t) =>
          t.letter === tile.letter &&
          t.isBlank === tile.isBlank &&
          t.value === tile.value
      );
      if (index !== -1) {
        player.rack.splice(index, 1);
      }
    }

    // Draw new tiles
    const newTiles = this.tileBag.drawTiles(placement.tiles.length);
    player.rack.push(...newTiles);

    // Record move
    this.moveHistory.push({
      player: player.id,
      score,
      word: placement.word,
    });

    this.endTurn();
  }

  /**
   * End current player's turn
   */
  private endTurn(): void {
    this.state.currentPlayerIndex =
      (this.state.currentPlayerIndex + 1) % this.state.players.length;
  }
}
