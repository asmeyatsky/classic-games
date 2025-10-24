/**
 * Scrabble Board - Premium Square Management
 *
 * Architectural Intent:
 * - Manages premium square definitions and scoring
 * - Provides utilities for board layout and validation
 * - Handles score multiplier calculations
 * - Supports standard Scrabble board (15x15)
 *
 * Key Design Decisions:
 * 1. Premium squares defined at initialization
 * 2. Symmetric board layout (corners and edges)
 * 3. Center square special designation
 * 4. Score multiplier types (word vs. letter)
 */

export interface PremiumSquare {
  type: 'tripleWord' | 'doubleWord' | 'tripleLetter' | 'doubleLetter' | 'center';
  multiplier: number;
}

export class ScrabbleBoard {
  private premiumSquares: Map<string, PremiumSquare> = new Map();

  constructor() {
    this.initializePremiumSquares();
  }

  /**
   * Initialize premium squares according to standard Scrabble board
   */
  private initializePremiumSquares(): void {
    // Triple Word Score (red) - top left quadrant, then mirror
    const tripleWordPositions = [
      [0, 0], [0, 7], [0, 14],
      [7, 0], [7, 14],
      [14, 0], [14, 7], [14, 14]
    ];

    // Double Word Score (pink)
    const doubleWordPositions = [
      [1, 1], [1, 13],
      [2, 2], [2, 12],
      [3, 3], [3, 11],
      [4, 4], [4, 10],
      [10, 4], [10, 10],
      [11, 3], [11, 11],
      [12, 2], [12, 12],
      [13, 1], [13, 13]
    ];

    // Triple Letter Score (blue)
    const tripleLetterPositions = [
      [1, 5], [1, 9],
      [5, 1], [5, 5], [5, 9], [5, 13],
      [9, 1], [9, 5], [9, 9], [9, 13],
      [13, 5], [13, 9]
    ];

    // Double Letter Score (light blue)
    const doubleLetterPositions = [
      [0, 3], [0, 11],
      [2, 6], [2, 8],
      [3, 0], [3, 7], [3, 14],
      [6, 2], [6, 6], [6, 8], [6, 12],
      [7, 3], [7, 11],
      [8, 2], [8, 6], [8, 8], [8, 12],
      [11, 0], [11, 7], [11, 14],
      [12, 6], [12, 8],
      [14, 3], [14, 11]
    ];

    // Add all premium squares
    tripleWordPositions.forEach(([r, c]) => {
      this.premiumSquares.set(`${r},${c}`, {
        type: 'tripleWord',
        multiplier: 3
      });
    });

    doubleWordPositions.forEach(([r, c]) => {
      this.premiumSquares.set(`${r},${c}`, {
        type: 'doubleWord',
        multiplier: 2
      });
    });

    tripleLetterPositions.forEach(([r, c]) => {
      this.premiumSquares.set(`${r},${c}`, {
        type: 'tripleLetter',
        multiplier: 3
      });
    });

    doubleLetterPositions.forEach(([r, c]) => {
      this.premiumSquares.set(`${r},${c}`, {
        type: 'doubleLetter',
        multiplier: 2
      });
    });

    // Center square
    this.premiumSquares.set('7,7', {
      type: 'center',
      multiplier: 1
    });
  }

  /**
   * Get premium score for a board position
   */
  getPremiumScore(row: number, col: number): PremiumSquare {
    const key = `${row},${col}`;
    return this.premiumSquares.get(key) || {
      type: 'doubleLetter',
      multiplier: 1
    };
  }

  /**
   * Check if position is a premium square
   */
  isPremiumSquare(row: number, col: number): boolean {
    const key = `${row},${col}`;
    return this.premiumSquares.has(key);
  }

  /**
   * Get all premium squares (for 3D board rendering)
   */
  getAllPremiumSquares(): Array<{
    row: number;
    col: number;
    type: string;
    multiplier: number;
  }> {
    const squares = [];
    for (const [key, square] of this.premiumSquares) {
      const [row, col] = key.split(',').map(Number);
      squares.push({
        row,
        col,
        type: square.type,
        multiplier: square.multiplier
      });
    }
    return squares;
  }

  /**
   * Validate board placement (bounds checking)
   */
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 15 && col >= 0 && col < 15;
  }

  /**
   * Get board center position
   */
  getCenterPosition(): { row: number; col: number } {
    return { row: 7, col: 7 };
  }
}

/**
 * Export utility function for getting premium score
 */
export function getPremiumScore(row: number, col: number): PremiumSquare {
  const board = new ScrabbleBoard();
  return board.getPremiumScore(row, col);
}
