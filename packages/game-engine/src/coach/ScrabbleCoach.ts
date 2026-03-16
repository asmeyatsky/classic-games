/**
 * Scrabble Strategy Coach - Pure Domain Service
 *
 * Architectural Intent:
 * - Analyzes scrabble rack, board, and game state for strategic advice
 * - Pure functions: state in, immutable analysis out
 * - Rack quality, vowel balance, premium square opportunities
 *
 * Key Design Decisions:
 * 1. Rack assessment: vowel/consonant balance, high-value tiles, blanks
 * 2. Board analysis: premium square accessibility
 * 3. Endgame awareness: tile count, score differential
 * 4. No word-finding (that's the player's job) - strategic guidance only
 */

import { ScrabbleGameState, ScrabbleTile, TILE_VALUES } from '../scrabble';
import { GameAnalysis, MoveRecommendation, CoachInsight } from './GameAnalysis';

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export class ScrabbleCoach {
  /**
   * Analyze current scrabble position for a given player.
   */
  static analyze(state: ScrabbleGameState, playerIndex: number): GameAnalysis {
    const player = state.players[playerIndex];
    if (!player) {
      return {
        recommendation: {
          action: 'WAIT',
          confidence: 1,
          reasoning: 'Waiting for your turn',
          riskLevel: 'low',
        },
        insights: [],
        positionStrength: 0,
        stats: {},
      };
    }

    const rack = player.rack;
    const opponent = state.players.find((_, i) => i !== playerIndex);

    // Rack metrics
    const vowels = rack.filter((t) => VOWELS.has(t.letter)).length;
    const consonants = rack.filter((t) => !VOWELS.has(t.letter) && !t.isBlank).length;
    const blanks = rack.filter((t) => t.isBlank).length;
    const rackValue = rack.reduce((sum, t) => sum + t.value, 0);
    const highValueTiles = rack.filter((t) => t.value >= 4);

    // Balance ratio (ideal is ~0.6-0.8)
    const balance = consonants > 0 ? vowels / consonants : vowels > 0 ? 3 : 0;

    // Score differential
    const scoreDiff = opponent ? player.score - opponent.score : 0;

    // Board openness
    const openSpots = this.countOpenPremiumSquares(state.board);

    // Position strength
    let strength = 50;
    if (balance >= 0.4 && balance <= 1.2) strength += 10;
    else strength -= 10;
    if (blanks > 0) strength += 12;
    if (highValueTiles.length > 0 && openSpots > 0) strength += 8;
    if (scoreDiff > 0) strength += Math.min(scoreDiff / 4, 15);
    if (scoreDiff < 0) strength -= Math.min(Math.abs(scoreDiff) / 4, 15);
    if (rack.length >= 7) strength += 3; // Full rack = more options
    strength = Math.max(10, Math.min(90, Math.round(strength)));

    const insights = this.buildInsights(
      balance,
      vowels,
      consonants,
      blanks,
      highValueTiles,
      scoreDiff,
      state.tileBag,
      openSpots,
      rack
    );

    const recommendation = this.buildRecommendation(
      balance,
      highValueTiles,
      openSpots,
      scoreDiff,
      state.tileBag,
      rack
    );

    return {
      recommendation,
      insights,
      positionStrength: strength,
      stats: {
        'Rack Value': rackValue,
        Vowels: vowels,
        Consonants: consonants,
        'Score Lead': scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`,
        'Tiles Left': state.tileBag,
      },
    };
  }

  private static countOpenPremiumSquares(board: (ScrabbleTile | null)[][]): number {
    // Triple/double word score positions that are still empty
    const premiumPositions = [
      [0, 0],
      [0, 7],
      [0, 14],
      [7, 0],
      [7, 14],
      [14, 0],
      [14, 7],
      [14, 14], // TW
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [1, 13],
      [2, 12],
      [3, 11],
      [4, 10], // DW
      [13, 1],
      [12, 2],
      [11, 3],
      [10, 4],
      [13, 13],
      [12, 12],
      [11, 11],
      [10, 10],
    ];

    let open = 0;
    for (const [r, c] of premiumPositions) {
      if (!board[r]?.[c]) {
        // Check if adjacent to any placed tile
        const hasNeighbor =
          (r > 0 && board[r - 1]?.[c] !== null && board[r - 1]?.[c] !== undefined) ||
          (r < 14 && board[r + 1]?.[c] !== null && board[r + 1]?.[c] !== undefined) ||
          (c > 0 && board[r]?.[c - 1] !== null && board[r]?.[c - 1] !== undefined) ||
          (c < 14 && board[r]?.[c + 1] !== null && board[r]?.[c + 1] !== undefined);
        if (hasNeighbor) open++;
      }
    }
    return open;
  }

  private static buildInsights(
    balance: number,
    vowels: number,
    consonants: number,
    blanks: number,
    highValueTiles: ScrabbleTile[],
    scoreDiff: number,
    tilesLeft: number,
    openSpots: number,
    rack: ScrabbleTile[]
  ): CoachInsight[] {
    const insights: CoachInsight[] = [];

    // Rack balance
    if (balance < 0.3) {
      insights.push({
        category: 'Rack',
        message: `Only ${vowels} vowel(s) - consider exchanging for better balance`,
        importance: 'warning',
      });
    } else if (balance > 2) {
      insights.push({
        category: 'Rack',
        message: `Vowel-heavy rack (${vowels}V/${consonants}C) - look for vowel-heavy words`,
        importance: 'warning',
      });
    } else {
      insights.push({
        category: 'Rack',
        message: `Balanced rack (${vowels}V/${consonants}C)`,
        importance: 'info',
      });
    }

    // High value tiles
    if (highValueTiles.length > 0) {
      const letters = highValueTiles.map((t) => `${t.letter}(${t.value}pts)`).join(', ');
      insights.push({
        category: 'High Value',
        message: `Play ${letters} on premium squares for big points`,
        importance: 'tip',
      });
    }

    // Blanks
    if (blanks > 0) {
      insights.push({
        category: 'Blank',
        message: `${blanks} blank tile(s) - save for a 7-letter bingo (50pt bonus!)`,
        importance: 'tip',
      });
    }

    // Score differential
    if (scoreDiff > 30) {
      insights.push({
        category: 'Lead',
        message: 'Solid lead - play conservatively, avoid opening premium squares',
        importance: 'tip',
      });
    } else if (scoreDiff < -30) {
      insights.push({
        category: 'Behind',
        message: 'Need to catch up - look for high-scoring plays',
        importance: 'warning',
      });
    }

    // Endgame
    if (tilesLeft < 10) {
      insights.push({
        category: 'Endgame',
        message: `Only ${tilesLeft} tiles in bag - plan your final moves`,
        importance: 'critical',
      });
    }

    // Premium square opportunities
    if (openSpots > 3) {
      insights.push({
        category: 'Board',
        message: `${openSpots} reachable premium squares available`,
        importance: 'tip',
      });
    }

    // Duplicate letters
    const letterCounts: Record<string, number> = {};
    rack.forEach((t) => {
      letterCounts[t.letter] = (letterCounts[t.letter] || 0) + 1;
    });
    const duplicates = Object.entries(letterCounts).filter(([, c]) => c >= 3);
    if (duplicates.length > 0) {
      insights.push({
        category: 'Duplicates',
        message: `Too many ${duplicates.map(([l]) => l).join(', ')} - try to use them`,
        importance: 'warning',
      });
    }

    return insights;
  }

  private static buildRecommendation(
    balance: number,
    highValueTiles: ScrabbleTile[],
    openSpots: number,
    scoreDiff: number,
    tilesLeft: number,
    rack: ScrabbleTile[]
  ): MoveRecommendation {
    if (balance < 0.3 || balance > 2.5) {
      return {
        action: 'EXCHANGE',
        confidence: 0.6,
        reasoning: 'Unbalanced rack - exchanging tiles gives better word options',
        riskLevel: 'medium',
      };
    }

    if (highValueTiles.length > 0 && openSpots > 0) {
      return {
        action: 'TARGET PREMIUM',
        confidence: 0.7,
        reasoning: 'Place high-value tiles on premium squares for maximum points',
        riskLevel: 'low',
      };
    }

    if (rack.length === 7 && tilesLeft >= 7) {
      return {
        action: 'GO FOR BINGO',
        confidence: 0.5,
        reasoning: 'Full rack with tiles available - look for a 7-letter word (+50 bonus)',
        riskLevel: 'medium',
      };
    }

    if (scoreDiff < -20) {
      return {
        action: 'PLAY LONG',
        confidence: 0.6,
        reasoning: 'Behind on points - maximize word length for higher scores',
        riskLevel: 'medium',
      };
    }

    return {
      action: 'BEST WORD',
      confidence: 0.6,
      reasoning: 'Find the highest-scoring word you can make',
      riskLevel: 'low',
    };
  }
}
