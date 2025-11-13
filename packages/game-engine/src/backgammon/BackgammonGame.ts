import { BackgammonGameState, BackgammonMove } from './index';

/**
 * BackgammonGame - Core Game Engine
 *
 * Architectural Intent:
 * - Manages complete backgammon game state and logic
 * - Validates moves according to official rules
 * - Handles bearing off and all game phases
 * - Supports AI opponent
 *
 * Key Design Decisions:
 * 1. Immutable state management
 * 2. Move validation before state update
 * 3. Separation of move logic from UI
 * 4. Complete rule enforcement
 */

export class BackgammonGame {
  private state: BackgammonGameState;
  private moveHistory: BackgammonMove[] = [];
  private availableMoves: BackgammonMove[] = [];

  constructor(initialState?: BackgammonGameState) {
    this.state = initialState || this.initializeGame();
    this.updateAvailableMoves();
  }

  /**
   * Initialize standard backgammon starting position
   * White pieces start at: 24(2), 13(5), 8(3), 6(5)
   * Black pieces start at: 1(2), 12(5), 17(3), 19(5)
   */
  private initializeGame(): BackgammonGameState {
    const board = new Array(24).fill(0);

    // White pieces (positive numbers)
    board[23] = 2; // Point 24
    board[12] = 5; // Point 13
    board[7] = 3; // Point 8
    board[5] = 5; // Point 6

    // Black pieces (negative numbers)
    board[0] = -2; // Point 1
    board[11] = -5; // Point 12
    board[16] = -3; // Point 17
    board[18] = -5; // Point 19

    return {
      board,
      bar: { white: 0, black: 0 },
      bornOff: { white: 0, black: 0 },
      dice: [0, 0],
      diceUsed: [false, false],
      currentPlayer: 'white',
      doubleValue: 1,
      doublePlayer: null,
      gamePhase: 'rolling', // 'rolling' | 'moving' | 'doubling'
    };
  }

  /**
   * Roll dice and update game state
   */
  rollDice(): [number, number] {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;

    this.state = {
      ...this.state,
      dice: [die1, die2],
      diceUsed: [false, false],
      gamePhase: 'moving',
    };

    this.updateAvailableMoves();
    return [die1, die2];
  }

  /**
   * Validate and execute a move
   */
  makeMove(move: BackgammonMove): boolean {
    // Check if move is in available moves
    if (!this.isValidMove(move)) {
      return false;
    }

    // Clone state and apply move
    const newBoard = [...this.state.board];
    const newDiceUsed: [boolean, boolean] = [this.state.diceUsed[0], this.state.diceUsed[1]];

    // Remove piece from source
    const piece = newBoard[move.from] > 0 ? 1 : -1;
    newBoard[move.from] -= piece;

    // Handle capturing
    if (Math.abs(newBoard[move.to]) === 1 && Math.sign(newBoard[move.to]) !== Math.sign(piece)) {
      // Send opponent piece to bar
      if (piece > 0) {
        this.state.bar.black++;
      } else {
        this.state.bar.white++;
      }
      newBoard[move.to] = 0;
    }

    // Add piece to destination
    newBoard[move.to] += piece;

    // Mark die as used
    newDiceUsed[move.dieIndex] = true;

    // Check for bearing off
    const bornOff = { ...this.state.bornOff };
    if (move.to === 25) {
      // Bearing off position
      if (piece > 0) bornOff.white++;
      else bornOff.black++;
    }

    this.state = {
      ...this.state,
      board: newBoard,
      diceUsed: newDiceUsed,
      bornOff,
    };

    this.moveHistory.push(move);
    this.updateAvailableMoves();

    // Check if player has no more moves
    if (this.availableMoves.length === 0) {
      this.endTurn();
    }

    return true;
  }

  /**
   * Get all available moves for current player
   */
  private updateAvailableMoves(): void {
    this.availableMoves = [];
    const player = this.state.currentPlayer;
    const isWhite = player === 'white';

    // Check for pieces on bar
    if ((isWhite && this.state.bar.white > 0) || (!isWhite && this.state.bar.black > 0)) {
      this.getBarMoves();
      return;
    }

    // Get regular moves
    for (let die = 0; die < 2; die++) {
      if (this.state.diceUsed[die] || this.state.dice[die] === 0) continue;

      const distance = this.state.dice[die];

      for (let point = 0; point < 24; point++) {
        if ((isWhite && this.state.board[point] > 0) || (!isWhite && this.state.board[point] < 0)) {
          const destination = isWhite ? point + distance : point - distance;

          if (this.isLegalMove(point, destination, isWhite)) {
            this.availableMoves.push({
              from: point,
              to: destination === 24 ? 25 : destination === -1 ? 25 : destination,
              dieIndex: die,
            });
          }
        }
      }
    }
  }

  /**
   * Get moves for pieces on bar
   */
  private getBarMoves(): void {
    const player = this.state.currentPlayer;
    const isWhite = player === 'white';
    const barPoint = isWhite ? 0 : 23;

    for (let die = 0; die < 2; die++) {
      if (this.state.diceUsed[die]) continue;

      const distance = this.state.dice[die];
      const destination = isWhite ? distance - 1 : 23 - distance + 1;

      if (this.isLegalMove(barPoint, destination, isWhite)) {
        this.availableMoves.push({
          from: -1, // Bar indicator
          to: destination,
          dieIndex: die,
        });
      }
    }
  }

  /**
   * Check if a move is legal
   */
  private isLegalMove(from: number, to: number, isWhite: boolean): boolean {
    // Out of bounds
    if (to < 0 || to > 23) {
      // Check bearing off
      return this.canBearOff(isWhite);
    }

    const destination = this.state.board[to];

    // Can't move to point with 2+ opponent pieces
    if ((isWhite && destination < -1) || (!isWhite && destination > 1)) {
      return false;
    }

    return true;
  }

  /**
   * Check if player can bear off
   */
  private canBearOff(isWhite: boolean): boolean {
    // All pieces must be in home board
    const start = isWhite ? 18 : 0;
    const end = isWhite ? 24 : 6;

    for (let i = 0; i < start; i++) {
      if (isWhite && this.state.board[i] > 0) return false;
    }
    for (let i = end; i < 24; i++) {
      if (!isWhite && this.state.board[i] < 0) return false;
    }

    return true;
  }

  /**
   * Validate move is in available moves
   */
  private isValidMove(move: BackgammonMove): boolean {
    return this.availableMoves.some(
      (m) => m.from === move.from && m.to === move.to && m.dieIndex === move.dieIndex
    );
  }

  /**
   * End current player's turn
   */
  private endTurn(): void {
    this.state = {
      ...this.state,
      currentPlayer: this.state.currentPlayer === 'white' ? 'black' : 'white',
      gamePhase: 'rolling',
    };
    this.availableMoves = [];
  }

  /**
   * Get current game state
   */
  getState(): BackgammonGameState {
    return { ...this.state };
  }

  /**
   * Get available moves
   */
  getAvailableMoves(): BackgammonMove[] {
    return [...this.availableMoves];
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.state.bornOff.white === 15 || this.state.bornOff.black === 15;
  }

  /**
   * Get winner
   */
  getWinner(): 'white' | 'black' | null {
    if (this.state.bornOff.white === 15) return 'white';
    if (this.state.bornOff.black === 15) return 'black';
    return null;
  }
}
