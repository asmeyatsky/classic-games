/**
 * AI Strategy Coach Module
 *
 * Pure domain services providing real-time strategic analysis
 * for all classic games. Each coach is a stateless analyzer
 * that takes game state and returns immutable analysis objects.
 *
 * Architecture (skill2026.md):
 * - Domain Layer: pure analyzers, no infrastructure dependencies
 * - Value Objects: immutable GameAnalysis, MoveRecommendation, CoachInsight
 * - Ports: analyzers consume game state interfaces (defined in each game module)
 */

export * from './GameAnalysis';
export { PokerCoach } from './PokerCoach';
export { BackgammonCoach } from './BackgammonCoach';
export { ScrabbleCoach } from './ScrabbleCoach';
