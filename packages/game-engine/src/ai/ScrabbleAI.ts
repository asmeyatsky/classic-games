/**
 * Scrabble AI Opponent Engine
 *
 * Implements Scrabble strategy with:
 * - Word scoring optimization
 * - Board control strategy
 * - Rack management
 * - High-value tile placement
 * - Defensive positioning
 */

import { DifficultyLevel, AIMove, ScrabbleEvaluation } from './types';
import type { WordPlacement } from '../scrabble';

import type { ScrabbleTile } from '../scrabble';

interface ScrabbleGameState {
  board: (ScrabbleTile | null)[][];
  players: Array<{
    id: string;
    score: number;
    rack: ScrabbleTile[];
  }>;
  currentPlayerIndex: number;
}

const TILE_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const PREMIUM_MULTIPLIERS = {
  DOUBLE_LETTER: 2,
  TRIPLE_LETTER: 3,
  DOUBLE_WORD: 2,
  TRIPLE_WORD: 3,
};

export class ScrabbleAI {
  /**
   * Generate and select best move
   */
  chooseBestMove(
    gameState: ScrabbleGameState,
    difficulty: DifficultyLevel,
    dictionary: Set<string> | string[]
  ): AIMove {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const rack = currentPlayer.rack;

    // Generate possible moves
    const possibleMoves = this.generatePossibleMoves(rack, gameState.board, difficulty, dictionary);

    if (possibleMoves.length === 0) {
      // No valid moves, must exchange or pass
      if (Math.random() < 0.7) {
        return {
          action: 'pass',
          details: {},
          confidence: 1.0,
          reasoning: 'No valid words found',
        };
      } else {
        return {
          action: 'exchange_tiles',
          details: { tiles: rack },
          confidence: 0.8,
          reasoning: 'Exchanging poor rack',
        };
      }
    }

    // Evaluate each move
    const evaluatedMoves = possibleMoves.map((move) =>
      this.evaluateMove(move, gameState, difficulty, rack)
    );

    // Sort by score
    evaluatedMoves.sort((a, b) => b.evaluation.wordScore - a.evaluation.wordScore);

    // Select based on difficulty
    let selected = evaluatedMoves[0];

    if (difficulty === DifficultyLevel.MEDIUM) {
      // Sometimes pick second or third best
      const index = Math.random() < 0.3 ? 1 : 0;
      if (evaluatedMoves[index]) {
        selected = evaluatedMoves[index];
      }
    } else if (difficulty === DifficultyLevel.EASY) {
      // Often pick weaker moves
      const index = Math.floor(Math.random() * Math.min(3, evaluatedMoves.length));
      selected = evaluatedMoves[index];
    }

    return {
      action: 'place_word',
      details: selected.move,
      confidence: Math.min(selected.evaluation.moveQuality / 100, 1.0),
      reasoning: selected.evaluation.reasoning,
    };
  }

  /**
   * Generate possible word placements
   */
  private generatePossibleMoves(
    rack: ScrabbleTile[],
    board: (ScrabbleTile | null)[][],
    difficulty: DifficultyLevel,
    dictionary: Set<string> | string[]
  ): WordPlacement[] {
    const moves: WordPlacement[] = [];
    const boardSize = board.length;

    // Find anchor points (existing tiles or empty spots)
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        // Try horizontal placements
        const hWords = this.findPlacements(rack, board, row, col, true, dictionary);
        moves.push(...hWords);

        // Try vertical placements
        const vWords = this.findPlacements(rack, board, row, col, false, dictionary);
        moves.push(...vWords);
      }
    }

    // Limit moves based on difficulty
    if (difficulty === DifficultyLevel.EASY) {
      return moves.slice(0, 5); // Only consider top 5 options
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      return moves.slice(0, 10); // Consider top 10 options
    }

    return moves; // Hard difficulty considers all options
  }

  /**
   * Find valid word placements from a position
   */
  private findPlacements(
    rack: ScrabbleTile[],
    board: (ScrabbleTile | null)[][],
    startRow: number,
    startCol: number,
    horizontal: boolean,
    dictionary: Set<string> | string[]
  ): WordPlacement[] {
    const placements: WordPlacement[] = [];
    const boardSize = board.length;

    // Try placing different length words
    const maxLength = horizontal ? boardSize - startCol : boardSize - startRow;

    for (let length = 2; length <= maxLength; length++) {
      const word = this.tryFormWord(
        rack,
        board,
        startRow,
        startCol,
        horizontal,
        length,
        dictionary
      );

      if (word) {
        placements.push(word);
      }
    }

    return placements;
  }

  /**
   * Attempt to form a word of specific length
   */
  private tryFormWord(
    rack: ScrabbleTile[],
    board: (ScrabbleTile | null)[][],
    row: number,
    col: number,
    horizontal: boolean,
    length: number,
    dictionary: Set<string> | string[]
  ): WordPlacement | null {
    const tiles: ScrabbleTile[] = [];
    const usedFromRack: ScrabbleTile[] = [];
    const word: string[] = [];

    // Build word
    for (let i = 0; i < length; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;

      const existing = board[r]?.[c];
      if (existing) {
        tiles.push(existing);
        word.push(existing.letter);
      } else {
        // Need to find from rack
        const available = rack.find((t) => !usedFromRack.includes(t) && !t.isBlank);
        if (!available) return null;

        tiles.push(available);
        word.push(available.letter);
        usedFromRack.push(available);
      }
    }

    const wordStr = word.join('').toUpperCase();

    // Validate word in dictionary
    const isValid = Array.isArray(dictionary)
      ? dictionary.includes(wordStr)
      : dictionary.has(wordStr);

    if (!isValid) return null;

    return {
      word: wordStr,
      startRow: row,
      startCol: col,
      direction: horizontal ? 'horizontal' : 'vertical',
      tiles: usedFromRack,
    };
  }

  /**
   * Evaluate a word placement
   */
  private evaluateMove(
    move: WordPlacement,
    gameState: ScrabbleGameState,
    difficulty: DifficultyLevel,
    rack: ScrabbleTile[]
  ): {
    move: WordPlacement;
    evaluation: ScrabbleEvaluation;
  } {
    // Calculate word score
    const wordScore = this.calculateWordScore(
      move,
      gameState.board,
      gameState.players[gameState.currentPlayerIndex].score
    );

    // Calculate board control impact
    const boardControl = this.evaluateBoardControl(move, gameState.board);

    // Evaluate remaining rack
    const remainingRack = rack.filter((t) => !move.tiles.includes(t));
    const rackQuality = this.evaluateRackQuality(remainingRack);

    // Evaluate future opportunities
    const futureOpportunities = this.evaluateFutureOpportunities(move, gameState.board);

    // Combine scores
    let moveQuality = 50;
    moveQuality += wordScore / 50; // Normalize word score
    moveQuality += boardControl * 10;
    moveQuality += rackQuality * 10;
    moveQuality += futureOpportunities * 10;

    // Apply difficulty adjustments
    if (difficulty === DifficultyLevel.EASY) {
      moveQuality *= 0.7;
    } else if (difficulty === DifficultyLevel.HARD) {
      moveQuality *= 1.2;
    }

    const evaluation: ScrabbleEvaluation = {
      score: wordScore,
      moveQuality: Math.max(0, Math.min(100, moveQuality)),
      riskLevel: 25, // Scrabble is lower risk
      wordScore,
      boardControl,
      rackTiles: rackQuality * 100,
      futureOpportunities,
      reasoning: `Word: "${move.word}" scores ${wordScore} pts, board control: ${(boardControl * 100).toFixed(0)}%, rack quality: ${(rackQuality * 100).toFixed(0)}%`,
    };

    return { move, evaluation };
  }

  /**
   * Calculate word score with premium squares
   */
  private calculateWordScore(
    move: WordPlacement,
    board: (ScrabbleTile | null)[][],
    playerScore: number
  ): number {
    let score = 0;

    for (let i = 0; i < move.word.length; i++) {
      const tile = move.tiles[i];
      const value = tile?.value || 0;

      const r = move.direction === 'horizontal' ? move.startRow : move.startRow + i;
      const c = move.direction === 'horizontal' ? move.startCol + i : move.startCol;

      // Apply premium if this is a new placement
      if (!board[r]?.[c]) {
        // Simulate board premiums (simplified)
        if ((r + c) % 4 === 0) {
          score += value * PREMIUM_MULTIPLIERS.DOUBLE_LETTER;
        } else {
          score += value;
        }
      } else {
        score += value;
      }
    }

    // Bonus for using all 7 tiles
    if (move.tiles.length >= 7) {
      score += 50;
    }

    return score;
  }

  /**
   * Evaluate impact on board control
   */
  private evaluateBoardControl(move: WordPlacement, board: (ScrabbleTile | null)[][]): number {
    // Evaluate how centrally the word is placed
    const boardSize = board.length;
    const centerRow = Math.floor(boardSize / 2);
    const centerCol = Math.floor(boardSize / 2);

    const distRow = Math.abs(move.startRow - centerRow);
    const distCol = Math.abs(move.startCol - centerCol);
    const maxDist = centerRow + centerCol;

    // Closer to center = better board control
    const controlScore = 1 - (distRow + distCol) / maxDist;

    return Math.max(-0.5, Math.min(1, controlScore));
  }

  /**
   * Evaluate quality of remaining rack
   */
  private evaluateRackQuality(remainingTiles: ScrabbleTile[]): number {
    let quality = 0;

    // Vowel/consonant balance
    const vowels = remainingTiles.filter((t) => 'AEIOU'.includes(t.letter.toUpperCase())).length;
    const balance = Math.abs(vowels - (remainingTiles.length - vowels));
    quality += (1 - balance / remainingTiles.length) * 0.5;

    // Variety of tiles
    const uniqueTiles = new Set(remainingTiles.map((t) => t.letter)).size;
    quality += (uniqueTiles / remainingTiles.length) * 0.5;

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Evaluate opportunities for future plays
   */
  private evaluateFutureOpportunities(
    move: WordPlacement,
    board: (ScrabbleTile | null)[][]
  ): number {
    let opportunities = 0;

    // Check for adjacent empty spaces (future word placement)
    const boardSize = board.length;

    if (move.direction === 'horizontal') {
      // Check above and below
      if (
        move.startRow > 0 &&
        !board[move.startRow - 1][move.startCol] &&
        move.startCol > 0 &&
        board[move.startRow - 1][move.startCol - 1]
      ) {
        opportunities += 1;
      }
      if (
        move.startRow < boardSize - 1 &&
        !board[move.startRow + 1][move.startCol] &&
        move.startCol > 0 &&
        board[move.startRow + 1][move.startCol - 1]
      ) {
        opportunities += 1;
      }
    } else {
      // Check left and right
      if (
        move.startCol > 0 &&
        !board[move.startRow][move.startCol - 1] &&
        move.startRow > 0 &&
        board[move.startRow - 1][move.startCol - 1]
      ) {
        opportunities += 1;
      }
      if (
        move.startCol < boardSize - 1 &&
        !board[move.startRow][move.startCol + 1] &&
        move.startRow > 0 &&
        board[move.startRow - 1][move.startCol + 1]
      ) {
        opportunities += 1;
      }
    }

    return Math.min(1, opportunities / 2);
  }
}
