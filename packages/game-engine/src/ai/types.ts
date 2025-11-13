/**
 * AI Opponent Type Definitions
 * Provides type-safe interfaces for AI decision-making systems
 */

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface AIMove {
  action: string;
  details: Record<string, any>;
  confidence: number;
  reasoning: string;
}

export interface GameEvaluation {
  score: number; // Higher is better for the AI
  moveQuality: number; // 0-100
  riskLevel: number; // 0-100
  reasoning: string;
}

export interface PokerEvaluation extends GameEvaluation {
  handStrength: number; // 0-100, hand strength percentage
  potOdds: number; // Ratio of call cost to pot
  position: number; // 0-6, 0=early, 6=button/blind
  aggressiveness: number; // How aggressive AI should be 0-100
}

export interface BackgammonEvaluation extends GameEvaluation {
  boardAdvantage: number; // Position strength -100 to 100
  pieceSafety: number; // How many pieces are safe
  raceBetting: number; // Winning chances in race
}

export interface ScrabbleEvaluation extends GameEvaluation {
  wordScore: number; // Points the word would score
  boardControl: number; // Control of board -100 to 100
  rackTiles: number; // Quality of remaining tiles after move
  futureOpportunities: number; // Potential for future moves
}

export interface AIDecision {
  type: 'action' | 'move' | 'pass' | 'fold' | 'raise' | 'place_word' | 'pass_turn';
  details: any;
  confidence: number;
  difficulty: DifficultyLevel;
}
