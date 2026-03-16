/**
 * Poker Strategy Coach - Pure Domain Service
 *
 * Architectural Intent:
 * - Analyzes poker game state and provides strategic recommendations
 * - Pure functions with no side effects - ideal for testing
 * - Uses existing HandEvaluator for post-flop analysis
 * - Provides both player coaching and AI decision-making
 *
 * Key Design Decisions:
 * 1. Pre-flop: tiered starting hand rankings
 * 2. Post-flop: HandEvaluator rank mapped to strength %
 * 3. Pot odds vs hand strength for action recommendations
 * 4. Same analysis drives both coaching UI and AI opponent
 */

import { HandEvaluator } from '../poker/HandEvaluator';
import { Card as CardClass } from '../poker/Card';
import { PokerGameState, PokerRound, Card, PokerHandRank } from '../poker';
import { GameAnalysis, MoveRecommendation, CoachInsight } from './GameAnalysis';

const RANK_VALUES: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function getHandKey(cards: Card[]): string {
  if (cards.length !== 2) return '';
  const sorted = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const suited = sorted[0].suit === sorted[1].suit;
  if (sorted[0].rank === sorted[1].rank) return `${sorted[0].rank}${sorted[1].rank}`;
  return `${sorted[0].rank}${sorted[1].rank}${suited ? 's' : 'o'}`;
}

// Tiered starting hand rankings (standard poker strategy)
const TIER1 = new Set(['AA', 'KK', 'QQ', 'AKs']);
const TIER2 = new Set(['JJ', 'TT', 'AQs', 'AJs', 'KQs', 'AKo']);
const TIER3 = new Set(['99', '88', 'ATs', 'KJs', 'QJs', 'JTs', 'AQo']);
const TIER4 = new Set(['77', '66', '55', 'KTs', 'QTs', 'T9s', '98s', 'AJo', 'KQo']);

export class PokerCoach {
  /**
   * Analyze current game state for a specific player.
   * Returns immutable GameAnalysis with recommendation, insights, and stats.
   */
  static analyze(state: PokerGameState, playerId: string): GameAnalysis {
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.folded) {
      return {
        recommendation: {
          action: 'WAIT',
          confidence: 1,
          reasoning: 'You folded this hand',
          riskLevel: 'low',
        },
        insights: [
          {
            category: 'Status',
            message: 'Waiting for next hand',
            importance: 'info',
          },
        ],
        positionStrength: 0,
        stats: {},
      };
    }

    const hand = player.hand;
    const community = state.communityCards;

    // Calculate hand strength
    const { strength, description } = this.evaluateStrength(hand, community);

    // Pot odds
    const costToCall = state.currentBet - player.bet;
    const potOdds = costToCall > 0 ? (costToCall / (state.pot + costToCall)) * 100 : 0;

    // Build recommendation
    const recommendation = this.recommend(strength, costToCall, potOdds, player.chips, state);

    // Build insights
    const insights = this.buildInsights(
      strength,
      description,
      costToCall,
      potOdds,
      hand,
      community,
      state
    );

    const stats: Record<string, string | number> = {
      'Hand Strength': `${Math.round(strength)}%`,
      'Pot Odds': costToCall > 0 ? `${Math.round(potOdds)}%` : 'Free',
      Pot: `$${state.pot}`,
      'To Call': `$${costToCall}`,
    };

    return {
      recommendation,
      insights,
      positionStrength: Math.round(strength),
      stats,
    };
  }

  /**
   * Get AI opponent action based on analysis.
   * Reuses the same analysis logic for consistency.
   */
  static getAIAction(
    state: PokerGameState,
    playerId: string
  ): { action: 'fold' | 'check' | 'call' | 'raise'; amount?: number } {
    const analysis = this.analyze(state, playerId);
    const rec = analysis.recommendation.action;
    const player = state.players.find((p) => p.id === playerId);

    if (rec === 'RAISE') {
      const raiseAmount = state.currentBet + 50;
      return { action: 'raise', amount: raiseAmount };
    }
    if (rec === 'CALL') {
      return { action: 'call' };
    }
    if (rec === 'FOLD') {
      // Never fold when checking is free
      if (player && state.currentBet <= player.bet) {
        return { action: 'check' };
      }
      return { action: 'fold' };
    }
    return { action: 'check' };
  }

  private static evaluateStrength(
    hand: Card[],
    community: Card[]
  ): { strength: number; description: string } {
    if (community.length === 0) {
      return this.evaluatePreFlop(hand);
    }
    return this.evaluatePostFlop(hand, community);
  }

  private static evaluatePreFlop(hand: Card[]): { strength: number; description: string } {
    const key = getHandKey(hand);

    if (TIER1.has(key)) return { strength: 90, description: 'Premium hand' };
    if (TIER2.has(key)) return { strength: 72, description: 'Strong hand' };
    if (TIER3.has(key)) return { strength: 55, description: 'Solid hand' };
    if (TIER4.has(key)) return { strength: 40, description: 'Playable hand' };

    if (hand.length !== 2) return { strength: 15, description: 'Weak hand' };

    const suited = hand[0].suit === hand[1].suit;
    const gap = Math.abs(RANK_VALUES[hand[0].rank] - RANK_VALUES[hand[1].rank]);

    if (suited && gap <= 2) return { strength: 32, description: 'Suited connector' };
    if (suited) return { strength: 22, description: 'Suited cards' };
    if (gap <= 1) return { strength: 25, description: 'Connected cards' };

    const highCard = Math.max(RANK_VALUES[hand[0].rank], RANK_VALUES[hand[1].rank]);
    if (highCard >= 13) return { strength: 28, description: 'High card hand' };

    return { strength: 12, description: 'Weak hand' };
  }

  private static evaluatePostFlop(
    hand: Card[],
    community: Card[]
  ): { strength: number; description: string } {
    try {
      // Convert interface Cards to Card class instances for HandEvaluator
      const toCardClass = (c: Card) => new CardClass(c.suit, c.rank);
      const allCards = [...hand, ...community].map(toCardClass);
      if (allCards.length >= 5) {
        const evaluated = HandEvaluator.evaluate(allCards);
        return {
          strength: this.rankToStrength(evaluated.rank),
          description: evaluated.description,
        };
      }
    } catch {
      // Fall through to default
    }
    return { strength: 30, description: 'Developing hand' };
  }

  private static rankToStrength(rank: PokerHandRank): number {
    const map: Record<number, number> = {
      [PokerHandRank.HIGH_CARD]: 18,
      [PokerHandRank.PAIR]: 42,
      [PokerHandRank.TWO_PAIR]: 58,
      [PokerHandRank.THREE_OF_A_KIND]: 72,
      [PokerHandRank.STRAIGHT]: 80,
      [PokerHandRank.FLUSH]: 84,
      [PokerHandRank.FULL_HOUSE]: 90,
      [PokerHandRank.FOUR_OF_A_KIND]: 96,
      [PokerHandRank.STRAIGHT_FLUSH]: 98,
      [PokerHandRank.ROYAL_FLUSH]: 99,
    };
    return map[rank] ?? 20;
  }

  private static recommend(
    strength: number,
    costToCall: number,
    potOdds: number,
    chips: number,
    state: PokerGameState
  ): MoveRecommendation {
    // Free to check
    if (costToCall === 0) {
      if (strength > 70) {
        return {
          action: 'RAISE',
          confidence: 0.8,
          reasoning: 'Strong hand - build the pot while you can',
          riskLevel: 'medium',
        };
      }
      return {
        action: 'CHECK',
        confidence: 0.9,
        reasoning: 'No cost to stay in - see more cards for free',
        riskLevel: 'low',
      };
    }

    // Must pay to continue
    if (strength > 80) {
      return {
        action: 'RAISE',
        confidence: 0.85,
        reasoning: 'Very strong hand - extract maximum value',
        riskLevel: 'medium',
      };
    }
    if (strength > 55 && strength > potOdds) {
      return {
        action: 'CALL',
        confidence: 0.7,
        reasoning: 'Good hand with favorable pot odds',
        riskLevel: 'medium',
      };
    }
    if (strength > 35 && costToCall < chips * 0.1) {
      return {
        action: 'CALL',
        confidence: 0.5,
        reasoning: 'Small investment - hand has potential',
        riskLevel: 'low',
      };
    }
    return {
      action: 'FOLD',
      confidence: 0.7,
      reasoning: 'Weak hand against a bet - save chips for a better spot',
      riskLevel: 'low',
    };
  }

  private static buildInsights(
    strength: number,
    handDesc: string,
    costToCall: number,
    potOdds: number,
    hand: Card[],
    community: Card[],
    state: PokerGameState
  ): CoachInsight[] {
    const insights: CoachInsight[] = [
      {
        category: 'Hand',
        message: handDesc,
        importance: strength > 60 ? 'tip' : strength > 30 ? 'info' : 'warning',
      },
    ];

    if (costToCall > 0) {
      insights.push({
        category: 'Pot Odds',
        message: `Need ${Math.round(potOdds)}% equity to justify calling $${costToCall}`,
        importance: strength > potOdds ? 'tip' : 'warning',
      });
    }

    if (community.length >= 3) {
      // Flush draw detection
      const suits = [...hand, ...community].reduce(
        (acc, c) => {
          acc[c.suit] = (acc[c.suit] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      const maxSuit = Math.max(...Object.values(suits));
      if (maxSuit === 4) {
        insights.push({
          category: 'Draw',
          message: 'Flush draw detected - 4 to a flush',
          importance: 'tip',
        });
      }

      // Straight draw detection (simplified)
      const values = [...hand, ...community].map((c) => RANK_VALUES[c.rank]).sort((a, b) => a - b);
      const unique = [...new Set(values)];
      for (let i = 0; i <= unique.length - 4; i++) {
        if (unique[i + 3] - unique[i] === 4) {
          insights.push({
            category: 'Draw',
            message: 'Open-ended straight draw possible',
            importance: 'tip',
          });
          break;
        }
      }
    }

    if (state.round === PokerRound.RIVER) {
      insights.push({
        category: 'Stage',
        message: 'Final round - no more cards coming',
        importance: 'critical',
      });
    } else if (state.round === PokerRound.PRE_FLOP) {
      insights.push({
        category: 'Stage',
        message: 'Pre-flop - 5 community cards still to come',
        importance: 'info',
      });
    }

    return insights;
  }
}
