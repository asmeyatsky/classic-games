/**
 * Backgammon Types and Interfaces
 *
 * Comprehensive type definitions for the Backgammon game engine
 * Following DDD and SKILL.md principles
 */

export type BackgammonPlayer = 'white' | 'black';
export type GamePhase = 'rolling' | 'moving' | 'doubling' | 'finished';

/**
 * Represents the complete game state
 * Immutable: creates new state object on each update
 */
export interface BackgammonGameState {
  // Board: 24 points, index 0-23
  // positive number = white pieces, negative = black pieces
  board: number[];

  // Pieces captured/sent to bar
  bar: { white: number; black: number };

  // Pieces successfully borne off the board
  bornOff: { white: number; black: number };

  // Current dice roll
  dice: [number, number];

  // Which dice have been used in moves
  diceUsed: [boolean, boolean];

  // Whose turn it is
  currentPlayer: BackgammonPlayer;

  // Doubling cube value
  doubleValue: number;

  // Player who has doubling cube (can offer double)
  doublePlayer: BackgammonPlayer | null;

  // Current phase of play
  gamePhase: GamePhase;
}

/**
 * Represents a single move
 */
export interface BackgammonMove {
  from: number; // Point number 0-23, or -1 for bar
  to: number; // Point number 0-23, or 25 for bearing off
  dieIndex: number; // Which die was used (0 or 1)
}

/**
 * Game result
 */
export interface BackgammonResult {
  winner: BackgammonPlayer;
  loser: BackgammonPlayer;
  points: number; // 1 (normal), 2 (gammon), 3 (backgammon)
}

export enum BackgammonPieceColor {
  WHITE = 'white',
  BLACK = 'black',
}

export { BackgammonGame } from './BackgammonGame';
