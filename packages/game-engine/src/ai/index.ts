/**
 * AI Opponent Engine
 *
 * Comprehensive artificial intelligence system for classic games
 *
 * Features:
 * - Game-specific AI algorithms (Poker, Backgammon, Scrabble)
 * - Three difficulty levels (Easy, Medium, Hard)
 * - Strategic decision making with evaluations
 * - Extensible architecture for new game types
 *
 * @example
 * ```typescript
 * import { AIPlayerService, DifficultyLevel, createAIOpponent } from './ai';
 *
 * // Create AI opponent
 * const aiPlayer = createAIOpponent(DifficultyLevel.HARD);
 *
 * // Get AI move
 * const service = new AIPlayerService();
 * const decision = service.getAIMove(
 *   GameType.POKER,
 *   gameState,
 *   aiPlayer,
 *   DifficultyLevel.HARD
 * );
 * ```
 */

export * from './types';
export * from './PokerAI';
export * from './BackgammonAI';
export * from './ScrabbleAI';
export * from './AIPlayerService';
