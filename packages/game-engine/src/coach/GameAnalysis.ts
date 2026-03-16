/**
 * Game Analysis Value Objects (Immutable)
 *
 * Architectural Intent:
 * - Immutable value objects following DDD principles
 * - Shared across all game analyzers
 * - No dependencies on infrastructure or specific game types
 * - Pure data structures with no behavior
 */

export interface MoveRecommendation {
  readonly action: string;
  readonly confidence: number; // 0-1
  readonly reasoning: string;
  readonly riskLevel: 'low' | 'medium' | 'high';
}

export interface CoachInsight {
  readonly category: string;
  readonly message: string;
  readonly importance: 'info' | 'tip' | 'warning' | 'critical';
}

export interface GameAnalysis {
  readonly recommendation: MoveRecommendation;
  readonly insights: readonly CoachInsight[];
  readonly positionStrength: number; // 0-100
  readonly stats: Record<string, string | number>;
}
