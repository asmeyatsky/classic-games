/**
 * Poker AI Opponent Engine
 *
 * Implements advanced poker strategy with:
 * - Hand strength evaluation
 * - Position-based strategy
 * - Pot odds calculation
 * - Aggression modeling
 * - Bluff detection and adaptation
 */

import { Card } from '../poker/Card';
import { HandEvaluator } from '../poker/HandEvaluator';
import { PokerPlayer } from '../poker/PokerPlayer';
import { DifficultyLevel, AIMove, PokerEvaluation } from './types';

interface PokerGameState {
  players: PokerPlayer[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  round: string; // 'pre_flop' | 'flop' | 'turn' | 'river'
}

export class PokerAI {
  private bluffFrequency: Record<DifficultyLevel, number> = {
    [DifficultyLevel.EASY]: 0.05,
    [DifficultyLevel.MEDIUM]: 0.15,
    [DifficultyLevel.HARD]: 0.25,
  };

  /**
   * Decide AI player's action in poker
   *
   * @param player - AI player
   * @param gameState - Current game state
   * @param difficulty - AI difficulty level
   * @returns AI move decision
   */
  decideAction(
    player: PokerPlayer,
    gameState: PokerGameState,
    difficulty: DifficultyLevel
  ): AIMove {
    // Evaluate hand strength
    const allCards = [...player.hand, ...gameState.communityCards];
    const handEvaluation = HandEvaluator.evaluate(allCards);
    const handStrength = this.calculateHandStrengthPercentage(
      handEvaluation.rank,
      gameState.round,
      player.hand.length
    );

    // Calculate position
    const position = this.getPosition(gameState.currentPlayerIndex, gameState.players.length);

    // Calculate pot odds
    const potOdds = this.calculatePotOdds(
      player.chips,
      gameState.currentBet - player.bet,
      gameState.pot
    );

    // Determine action based on difficulty
    const evaluation = this.evaluatePosition(
      handStrength,
      potOdds,
      position,
      gameState.currentBet,
      player.bet,
      player.chips,
      difficulty,
      gameState.round
    );

    return this.selectAction(evaluation, difficulty);
  }

  /**
   * Calculate hand strength as percentage (0-100)
   *
   * @param rank - Hand rank from evaluator
   * @param round - Current betting round
   * @param holeCards - Number of hole cards
   * @returns Hand strength percentage
   */
  private calculateHandStrengthPercentage(
    rank: number,
    round: string,
    holeCards: number = 2
  ): number {
    // Hand rankings (lower is better):
    // 1 = High Card, 2 = Pair, 3 = Two Pair, 4 = Three of a Kind,
    // 5 = Straight, 6 = Flush, 7 = Full House, 8 = Four of a Kind,
    // 9 = Straight Flush, 10 = Royal Flush

    const rankStrengths: Record<number, number> = {
      1: 5,
      2: 25,
      3: 40,
      4: 50,
      5: 60,
      6: 65,
      7: 80,
      8: 85,
      9: 95,
      10: 100,
    };

    let strength = rankStrengths[rank] || 0;

    // Adjust for round
    if (round === 'pre_flop') {
      strength = Math.min(strength * 1.2, 100);
    } else if (round === 'river') {
      strength = Math.max(strength * 0.9, 5);
    }

    return strength;
  }

  /**
   * Get position index (0 = early, 6 = button)
   *
   * @param playerIndex - Current player index
   * @param totalPlayers - Total number of players
   * @returns Position index 0-6
   */
  private getPosition(playerIndex: number, totalPlayers: number): number {
    if (totalPlayers <= 3) return 0;
    if (totalPlayers <= 6) return Math.floor((playerIndex / totalPlayers) * 3);
    return Math.floor((playerIndex / totalPlayers) * 6);
  }

  /**
   * Calculate pot odds
   *
   * @param playerChips - Current chips
   * @param callAmount - Amount needed to call
   * @param pot - Current pot
   * @returns Pot odds ratio
   */
  private calculatePotOdds(playerChips: number, callAmount: number, pot: number): number {
    if (callAmount <= 0) return 1; // No call needed
    return pot / callAmount;
  }

  /**
   * Comprehensive position evaluation
   */
  private evaluatePosition(
    handStrength: number,
    potOdds: number,
    position: number,
    currentBet: number,
    playerBet: number,
    playerChips: number,
    difficulty: DifficultyLevel,
    round: string
  ): PokerEvaluation {
    const callCost = currentBet - playerBet;

    // Base score calculation
    let score = 0;
    let aggressiveness = 50;

    // Early position: play tighter
    if (position < 2) {
      aggressiveness -= 15;
    }
    // Late position: play wider
    else if (position >= 4) {
      aggressiveness += 10;
    }

    // Hand strength is primary factor
    score = handStrength * 0.6;

    // Pot odds influence
    if (potOdds > 2 && handStrength > 30) {
      score += 20; // Good odds to call
    }

    // Difficulty adjustments
    if (difficulty === DifficultyLevel.EASY) {
      score *= 0.8; // Weaker play
      aggressiveness *= 0.6;
    } else if (difficulty === DifficultyLevel.HARD) {
      score *= 1.1; // Stronger play
      aggressiveness *= 1.2;
    }

    // Stack size consideration
    if (playerChips < currentBet * 3) {
      aggressiveness += 20; // More willing to go all-in when short
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      moveQuality: handStrength,
      riskLevel: 100 - potOdds * 20, // Higher odds = lower risk
      reasoning: `Hand strength: ${handStrength.toFixed(0)}%, Pot odds: ${potOdds.toFixed(1)}:1, Position: ${position}`,
      handStrength,
      potOdds,
      position,
      aggressiveness: Math.max(10, Math.min(90, aggressiveness)),
    };
  }

  /**
   * Select action based on evaluation
   */
  private selectAction(evaluation: PokerEvaluation, difficulty: DifficultyLevel): AIMove {
    const { moveQuality, aggressiveness } = evaluation;
    const bluffChance = this.bluffFrequency[difficulty];

    // Fold threshold
    if (moveQuality < 15 && Math.random() > 0.3) {
      return {
        action: 'fold',
        details: {},
        confidence: 0.8,
        reasoning: 'Poor hand strength, folding',
      };
    }

    // Check threshold
    if (moveQuality < 35 && Math.random() < 0.6) {
      return {
        action: 'check',
        details: {},
        confidence: 0.6,
        reasoning: 'Weak hand, checking',
      };
    }

    // Call decision
    if (moveQuality < 60) {
      const shouldCall = moveQuality / 100 > Math.random();
      if (shouldCall) {
        return {
          action: 'call',
          details: {},
          confidence: moveQuality / 100,
          reasoning: 'Calling to see next card',
        };
      }
    }

    // Raise decision - based on hand strength and aggression
    if (moveQuality > 50 || (moveQuality > 25 && Math.random() < bluffChance)) {
      const raiseAmount = Math.floor((aggressiveness / 100) * 50 + Math.random() * 30);
      return {
        action: 'raise',
        details: { amount: raiseAmount },
        confidence: moveQuality / 100,
        reasoning: `Strong hand or bluff opportunity, raising ${raiseAmount}`,
      };
    }

    // Default: call
    return {
      action: 'call',
      details: {},
      confidence: 0.5,
      reasoning: 'Standard play',
    };
  }
}
