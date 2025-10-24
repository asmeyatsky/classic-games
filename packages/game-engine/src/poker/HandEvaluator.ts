import { Card } from './Card';
import { PokerHandRank, EvaluatedHand } from './index';

export class HandEvaluator {
  static evaluate(cards: Card[]): EvaluatedHand {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Get all 5-card combinations from 7 cards
    const combinations = this.getCombinations(cards, 5);
    let bestHand: EvaluatedHand | null = null;

    for (const combo of combinations) {
      const hand = this.evaluateFiveCards(combo);
      if (!bestHand || this.compareHands(hand, bestHand) > 0) {
        bestHand = hand;
      }
    }

    return bestHand!;
  }

  private static evaluateFiveCards(cards: Card[]): EvaluatedHand {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    const values = sortedCards.map(c => c.value);
    const suits = sortedCards.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = this.isStraight(values);

    // Count rank occurrences
    const rankCounts = new Map<number, number>();
    values.forEach(v => rankCounts.set(v, (rankCounts.get(v) || 0) + 1));
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

    // Royal Flush
    if (isStraight && isFlush && values[0] === 14 && values[4] === 10) {
      return {
        rank: PokerHandRank.ROYAL_FLUSH,
        cards: sortedCards,
        kickers: [],
        description: 'Royal Flush'
      };
    }

    // Straight Flush
    if (isStraight && isFlush) {
      return {
        rank: PokerHandRank.STRAIGHT_FLUSH,
        cards: sortedCards,
        kickers: values,
        description: 'Straight Flush'
      };
    }

    // Four of a Kind
    if (counts[0] === 4) {
      return {
        rank: PokerHandRank.FOUR_OF_A_KIND,
        cards: sortedCards,
        kickers: this.getKickers(rankCounts, 4),
        description: 'Four of a Kind'
      };
    }

    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
      return {
        rank: PokerHandRank.FULL_HOUSE,
        cards: sortedCards,
        kickers: this.getKickers(rankCounts, 3, 2),
        description: 'Full House'
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: PokerHandRank.FLUSH,
        cards: sortedCards,
        kickers: values,
        description: 'Flush'
      };
    }

    // Straight
    if (isStraight) {
      return {
        rank: PokerHandRank.STRAIGHT,
        cards: sortedCards,
        kickers: values,
        description: 'Straight'
      };
    }

    // Three of a Kind
    if (counts[0] === 3) {
      return {
        rank: PokerHandRank.THREE_OF_A_KIND,
        cards: sortedCards,
        kickers: this.getKickers(rankCounts, 3),
        description: 'Three of a Kind'
      };
    }

    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      return {
        rank: PokerHandRank.TWO_PAIR,
        cards: sortedCards,
        kickers: this.getKickers(rankCounts, 2, 2),
        description: 'Two Pair'
      };
    }

    // Pair
    if (counts[0] === 2) {
      return {
        rank: PokerHandRank.PAIR,
        cards: sortedCards,
        kickers: this.getKickers(rankCounts, 2),
        description: 'Pair'
      };
    }

    // High Card
    return {
      rank: PokerHandRank.HIGH_CARD,
      cards: sortedCards,
      kickers: values,
      description: 'High Card'
    };
  }

  private static isStraight(values: number[]): boolean {
    // Check regular straight
    let isRegular = true;
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] - 1 !== values[i + 1]) {
        isRegular = false;
        break;
      }
    }
    if (isRegular) return true;

    // Check A-2-3-4-5 straight (wheel)
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4 &&
           sorted[3] === 5 && sorted[4] === 14;
  }

  private static getKickers(rankCounts: Map<number, number>, ...counts: number[]): number[] {
    const kickers: number[] = [];
    for (const count of counts) {
      for (const [rank, c] of Array.from(rankCounts.entries()).sort((a, b) => b[0] - a[0])) {
        if (c === count) {
          kickers.push(rank);
          break;
        }
      }
    }
    // Add remaining cards as kickers
    for (const [rank] of Array.from(rankCounts.entries()).sort((a, b) => b[0] - a[0])) {
      if (!kickers.includes(rank)) {
        kickers.push(rank);
      }
    }
    return kickers;
  }

  static compareHands(hand1: EvaluatedHand, hand2: EvaluatedHand): number {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank;
    }

    // Compare kickers
    for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
      const k1 = hand1.kickers[i] || 0;
      const k2 = hand2.kickers[i] || 0;
      if (k1 !== k2) return k1 - k2;
    }

    return 0; // Tie
  }

  private static getCombinations<T>(arr: T[], k: number): T[][] {
    const result: T[][] = [];

    function backtrack(start: number, combo: T[]) {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        backtrack(i + 1, combo);
        combo.pop();
      }
    }

    backtrack(0, []);
    return result;
  }
}
