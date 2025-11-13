/**
 * Backgammon AI Opponent Engine
 *
 * Implements backgammon strategy with:
 * - Board position evaluation
 * - Piece safety assessment
 * - Running race calculations
 * - Blocking strategy
 * - Bearing off optimization
 */

import { DifficultyLevel, AIMove, BackgammonEvaluation } from './types';

interface BackgammonGameState {
  board: number[]; // 24 points, positive = white, negative = black
  bar: { white: number; black: number };
  bornOff: { white: number; black: number };
  dice: [number, number];
  diceUsed: [boolean, boolean];
  currentPlayer: 'white' | 'black';
  doubleValue: number;
}

interface BackgammonMove {
  from: number;
  to: number;
  dieIndex: number;
}

export class BackgammonAI {
  /**
   * Choose best move from available moves
   *
   * @param gameState - Current backgammon game state
   * @param availableMoves - List of possible moves
   * @param difficulty - AI difficulty level
   * @returns Selected move
   */
  chooseBestMove(
    gameState: BackgammonGameState,
    availableMoves: BackgammonMove[],
    difficulty: DifficultyLevel
  ): AIMove {
    if (availableMoves.length === 0) {
      return {
        action: 'pass',
        details: {},
        confidence: 1.0,
        reasoning: 'No moves available',
      };
    }

    // Evaluate each move
    const evaluations = availableMoves.map((move) =>
      this.evaluateMove(move, gameState, difficulty)
    );

    // Sort by quality
    const sorted = evaluations.sort((a, b) => b.moveQuality - a.moveQuality);
    const best = sorted[0];

    return {
      action: 'move',
      details: best.move,
      confidence: Math.min(best.moveQuality / 100, 1.0),
      reasoning: best.reasoning,
    };
  }

  /**
   * Evaluate a single move
   */
  private evaluateMove(
    move: BackgammonMove,
    gameState: BackgammonGameState,
    difficulty: DifficultyLevel
  ): {
    move: BackgammonMove;
    evaluation: BackgammonEvaluation;
    moveQuality: number;
    reasoning: string;
  } {
    // Simulate the move
    const simulatedState = this.simulateMove(move, gameState);

    // Evaluate resulting position
    const evaluation = this.evaluatePosition(simulatedState, gameState.currentPlayer, difficulty);

    let moveQuality = evaluation.moveQuality;

    // Apply difficulty scaling
    if (difficulty === DifficultyLevel.EASY) {
      moveQuality *= 0.7; // More random choices
    } else if (difficulty === DifficultyLevel.HARD) {
      moveQuality *= 1.2; // Stronger preference for best moves
    }

    // Add some randomness for non-hard difficulty
    if (difficulty !== DifficultyLevel.HARD) {
      moveQuality += (Math.random() - 0.5) * 20;
    }

    return {
      move,
      evaluation,
      moveQuality: Math.max(0, Math.min(100, moveQuality)),
      reasoning: evaluation.reasoning,
    };
  }

  /**
   * Simulate move and return new state
   */
  private simulateMove(move: BackgammonMove, gameState: BackgammonGameState): BackgammonGameState {
    const newBoard = [...gameState.board];
    const isWhite = gameState.currentPlayer === 'white';
    const direction = isWhite ? 1 : -1;

    // Move piece
    newBoard[move.from] -= direction;
    newBoard[move.to] += direction;

    // Handle captures
    const capturedCount = Math.abs(newBoard[move.to]);
    if (capturedCount > 1) {
      newBoard[move.to] = direction; // Reset to single piece
    }

    return {
      ...gameState,
      board: newBoard,
    };
  }

  /**
   * Evaluate board position
   */
  private evaluatePosition(
    gameState: BackgammonGameState,
    player: 'white' | 'black',
    difficulty: DifficultyLevel
  ): BackgammonEvaluation {
    const isWhite = player === 'white';
    const direction = isWhite ? 1 : -1;

    // 1. Calculate piece advancement (pip count)
    let whiteAdvancement = 0;
    let blackAdvancement = 0;

    for (let i = 0; i < 24; i++) {
      const pieces = gameState.board[i];
      if (pieces > 0) {
        whiteAdvancement += pieces * (i + 1);
      } else if (pieces < 0) {
        blackAdvancement += Math.abs(pieces) * (24 - i);
      }
    }

    // 2. Calculate piece safety (how many pieces are under attack)
    const safety = this.calculatePieceSafety(gameState, isWhite);

    // 3. Calculate race position
    const raceWinning = this.calculateRacePosition(
      gameState,
      isWhite,
      whiteAdvancement,
      blackAdvancement
    );

    // 4. Evaluate blocking strategy
    const blockingScore = this.evaluateBlockingStrategy(gameState, isWhite);

    // 5. Evaluate bearing off progress
    const bearingOffScore = this.evaluateBearingOff(gameState, isWhite);

    // Combine scores
    let score = blockingScore * 0.3 + bearingOffScore * 0.3 + raceWinning * 0.2 + safety * 0.2;

    // Apply difficulty
    if (difficulty === DifficultyLevel.EASY) {
      score *= 0.8;
    } else if (difficulty === DifficultyLevel.HARD) {
      score *= 1.1;
    }

    const boardAdvantage = isWhite
      ? whiteAdvancement - blackAdvancement
      : blackAdvancement - whiteAdvancement;

    return {
      score: Math.max(-100, Math.min(100, score)),
      moveQuality: Math.max(20, Math.min(100, 50 + (boardAdvantage / 500) * 50)),
      riskLevel: 50 - safety * 50,
      reasoning: `Advancement: ${(boardAdvantage / 10).toFixed(0)} pips, Safety: ${safety.toFixed(0)}%, Race: ${raceWinning.toFixed(0)}%`,
      boardAdvantage: (boardAdvantage / 100) * 100,
      pieceSafety: safety * 100,
      raceBetting: raceWinning * 100,
    };
  }

  /**
   * Calculate piece safety (0-1, higher is safer)
   */
  private calculatePieceSafety(gameState: BackgammonGameState, isWhite: boolean): number {
    let safePieces = 0;
    let totalPieces = 0;

    for (let i = 0; i < 24; i++) {
      const pieces = gameState.board[i];
      if ((isWhite && pieces > 0) || (!isWhite && pieces < 0)) {
        totalPieces += Math.abs(pieces);
        // Pieces are safe in stacks of 2+ or in the home board
        if (Math.abs(pieces) >= 2 || i < 6) {
          safePieces += Math.abs(pieces);
        }
      }
    }

    return totalPieces > 0 ? safePieces / totalPieces : 0.5;
  }

  /**
   * Calculate winning chances in running race
   */
  private calculateRacePosition(
    gameState: BackgammonGameState,
    isWhite: boolean,
    whiteAdvancement: number,
    blackAdvancement: number
  ): number {
    const difference = whiteAdvancement - blackAdvancement;
    const winning = isWhite
      ? Math.max(0, Math.min(1, 0.5 + difference / 500))
      : Math.max(0, Math.min(1, 0.5 - difference / 500));

    return winning;
  }

  /**
   * Evaluate blocking strategy effectiveness
   */
  private evaluateBlockingStrategy(gameState: BackgammonGameState, isWhite: boolean): number {
    let blockingScore = 0;

    for (let i = 0; i < 24; i++) {
      const pieces = gameState.board[i];
      // Count consecutive blocked points (stacks of 2+)
      if (Math.abs(pieces) >= 2) {
        const myColor = isWhite ? pieces > 0 : pieces < 0;
        if (myColor) {
          blockingScore += 10;
        }
      }
    }

    return Math.min(blockingScore / 100, 1);
  }

  /**
   * Evaluate bearing off progress
   */
  private evaluateBearingOff(gameState: BackgammonGameState, isWhite: boolean): number {
    const allPiecesHome = this.countPiecesInHomeBoard(gameState, isWhite);
    const totalPieces = this.countTotalPieces(gameState, isWhite);

    if (totalPieces === 0) return 1; // All pieces off
    return allPiecesHome / totalPieces;
  }

  /**
   * Count pieces in home board (last 6 points)
   */
  private countPiecesInHomeBoard(gameState: BackgammonGameState, isWhite: boolean): number {
    let count = 0;
    const start = isWhite ? 18 : 0;
    const end = isWhite ? 24 : 6;

    for (let i = start; i < end; i++) {
      const pieces = gameState.board[i];
      if ((isWhite && pieces > 0) || (!isWhite && pieces < 0)) {
        count += Math.abs(pieces);
      }
    }

    count += isWhite ? gameState.bornOff.white : gameState.bornOff.black;
    return count;
  }

  /**
   * Count total pieces
   */
  private countTotalPieces(gameState: BackgammonGameState, isWhite: boolean): number {
    let count = 0;
    for (let i = 0; i < 24; i++) {
      const pieces = gameState.board[i];
      if ((isWhite && pieces > 0) || (!isWhite && pieces < 0)) {
        count += Math.abs(pieces);
      }
    }
    count += isWhite ? gameState.bornOff.white : gameState.bornOff.black;
    return count;
  }
}
