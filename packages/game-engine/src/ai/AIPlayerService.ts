/**
 * AI Player Service - Main AI Coordinator
 *
 * Provides high-level AI decision-making for all game types
 * Manages AI difficulty levels and personality traits
 * Coordinates with game-specific AI engines
 */

import { GameType, Player } from '../types';
import { DifficultyLevel, AIMove, AIDecision } from './types';
import { PokerAI } from './PokerAI';
import { BackgammonAI } from './BackgammonAI';
import { ScrabbleAI } from './ScrabbleAI';

export class AIPlayerService {
  private pokerAI: PokerAI;
  private backgammonAI: BackgammonAI;
  private scrabbleAI: ScrabbleAI;

  constructor() {
    this.pokerAI = new PokerAI();
    this.backgammonAI = new BackgammonAI();
    this.scrabbleAI = new ScrabbleAI();
  }

  /**
   * Get AI move for current game state
   *
   * @param gameType - Type of game (poker, backgammon, scrabble)
   * @param gameState - Current game state
   * @param aiPlayer - AI player information
   * @param difficulty - AI difficulty level
   * @returns AI decision with move details
   *
   * @example
   * ```typescript
   * const aiService = new AIPlayerService();
   * const decision = aiService.getAIMove(
   *   GameType.POKER,
   *   pokerGameState,
   *   aiPlayer,
   *   DifficultyLevel.MEDIUM
   * );
   * ```
   */
  getAIMove(
    gameType: GameType,
    gameState: any,
    aiPlayer: Player,
    difficulty: DifficultyLevel
  ): AIDecision {
    // Validate AI player
    if (!aiPlayer.isAI) {
      throw new Error('Player is not an AI player');
    }

    try {
      let aiMove: AIMove;

      switch (gameType) {
        case GameType.POKER:
          aiMove = this.pokerAI.decideAction(gameState.currentPlayer, gameState, difficulty);
          return this.formatPokerDecision(aiMove, difficulty);

        case GameType.BACKGAMMON:
          aiMove = this.backgammonAI.chooseBestMove(
            gameState,
            gameState.availableMoves,
            difficulty
          );
          return this.formatBackgammonDecision(aiMove, difficulty);

        case GameType.SCRABBLE:
          aiMove = this.scrabbleAI.chooseBestMove(gameState, difficulty, gameState.dictionary);
          return this.formatScrabbleDecision(aiMove, difficulty);

        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }
    } catch (error) {
      console.error('Error in AI decision making:', error);
      // Return safe default move
      return {
        type: 'pass',
        details: {},
        confidence: 0.5,
        difficulty,
      };
    }
  }

  /**
   * Create AI player for game
   *
   * @param playerId - Unique player ID
   * @param name - AI player name
   * @param difficulty - AI difficulty level
   * @returns AI player configuration
   *
   * @example
   * ```typescript
   * const aiPlayer = AIPlayerService.createAIPlayer(
   *   'ai-player-1',
   *   'Computer Opponent',
   *   DifficultyLevel.HARD
   * );
   * ```
   */
  static createAIPlayer(
    playerId: string,
    name: string,
    difficulty: DifficultyLevel
  ): Player & { difficulty: DifficultyLevel } {
    // Select personality based on difficulty
    const personalities = {
      [DifficultyLevel.EASY]: ['Rookie', 'Beginner', 'Novice'],
      [DifficultyLevel.MEDIUM]: ['Challenger', 'Rival', 'Competitor'],
      [DifficultyLevel.HARD]: ['Master', 'Expert', 'Champion'],
    };

    const availableNames = personalities[difficulty];
    const selectedName = name || availableNames[Math.floor(Math.random() * availableNames.length)];

    // Select avatar based on difficulty
    const avatarMap = {
      [DifficultyLevel.EASY]: '🤖',
      [DifficultyLevel.MEDIUM]: '🦾',
      [DifficultyLevel.HARD]: '🧠',
    };

    return {
      id: playerId,
      name: selectedName,
      avatar: avatarMap[difficulty],
      isAI: true,
      connected: true,
      difficulty,
    };
  }

  /**
   * Get difficulty rating (0-100)
   *
   * @param difficulty - Difficulty level
   * @returns Numeric difficulty rating
   */
  static getDifficultyRating(difficulty: DifficultyLevel): number {
    const ratings = {
      [DifficultyLevel.EASY]: 25,
      [DifficultyLevel.MEDIUM]: 60,
      [DifficultyLevel.HARD]: 90,
    };
    return ratings[difficulty];
  }

  /**
   * Get difficulty description
   */
  static getDifficultyDescription(difficulty: DifficultyLevel): string {
    const descriptions = {
      [DifficultyLevel.EASY]: 'AI makes simple moves and occasional mistakes. Great for learning.',
      [DifficultyLevel.MEDIUM]: 'AI plays competently with good strategy. Competitive challenge.',
      [DifficultyLevel.HARD]: 'AI plays optimally with advanced strategy. Expert-level challenge.',
    };
    return descriptions[difficulty];
  }

  // Format helpers

  private formatPokerDecision(aiMove: AIMove, difficulty: DifficultyLevel): AIDecision {
    return {
      type: (aiMove.action as any) || 'action',
      details: aiMove.details,
      confidence: aiMove.confidence,
      difficulty,
    };
  }

  private formatBackgammonDecision(aiMove: AIMove, difficulty: DifficultyLevel): AIDecision {
    return {
      type: aiMove.action === 'pass' ? 'pass' : 'move',
      details: aiMove.details,
      confidence: aiMove.confidence,
      difficulty,
    };
  }

  private formatScrabbleDecision(aiMove: AIMove, difficulty: DifficultyLevel): AIDecision {
    return {
      type: (aiMove.action as any) || 'pass_turn',
      details: aiMove.details,
      confidence: aiMove.confidence,
      difficulty,
    };
  }
}

/**
 * Create AI player helper function
 *
 * @param difficulty - Difficulty level
 * @param gameType - Type of game (optional, for name suggestions)
 * @returns AI player configuration
 */
export function createAIOpponent(
  difficulty: DifficultyLevel,
  gameType?: GameType
): Player & { difficulty: DifficultyLevel } {
  const id = `ai-player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return AIPlayerService.createAIPlayer(id, '', difficulty);
}

/**
 * Create multiple AI opponents
 *
 * @param count - Number of AI opponents
 * @param difficulty - Difficulty level
 * @returns Array of AI player configurations
 */
export function createAIOpponents(
  count: number,
  difficulty: DifficultyLevel
): Array<Player & { difficulty: DifficultyLevel }> {
  const opponents: Array<Player & { difficulty: DifficultyLevel }> = [];

  for (let i = 0; i < count; i++) {
    opponents.push(createAIOpponent(difficulty));
  }

  return opponents;
}
