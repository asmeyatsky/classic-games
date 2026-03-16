/**
 * Backgammon Strategy Coach - Pure Domain Service
 *
 * Architectural Intent:
 * - Analyzes backgammon position and provides strategic guidance
 * - Pure functions: game state in, immutable analysis out
 * - Pip count, blot exposure, race analysis, positional assessment
 *
 * Key Design Decisions:
 * 1. Position strength combines pip count, blots, bar, and bear-off progress
 * 2. Strategy classification: race, prime, blitz, or holding game
 * 3. No side effects - safe to call at any frequency
 */

import { BackgammonGameState, BackgammonMove } from '../backgammon';
import { GameAnalysis, MoveRecommendation, CoachInsight } from './GameAnalysis';

export class BackgammonCoach {
  /**
   * Analyze the current backgammon position.
   */
  static analyze(state: BackgammonGameState): GameAnalysis {
    const isWhite = state.currentPlayer === 'white';

    // Core metrics
    const whitePips = this.calculatePips(state.board, true);
    const blackPips = this.calculatePips(state.board, false);
    const playerPips = isWhite ? whitePips : blackPips;
    const opponentPips = isWhite ? blackPips : whitePips;
    const pipAdvantage = opponentPips - playerPips;

    const playerBlots = this.countBlots(state.board, isWhite);
    const opponentBlots = this.countBlots(state.board, !isWhite);

    const playerBornOff = isWhite ? state.bornOff.white : state.bornOff.black;
    const opponentBornOff = isWhite ? state.bornOff.black : state.bornOff.white;

    const playerBar = isWhite ? state.bar.white : state.bar.black;
    const opponentBar = isWhite ? state.bar.black : state.bar.white;

    const playerPrimes = this.countPrimes(state.board, isWhite);

    // Position strength (0-100)
    let strength = 50;
    strength += Math.min(Math.max(pipAdvantage / 8, -20), 20);
    strength += (opponentBlots - playerBlots) * 3;
    strength += (playerBornOff - opponentBornOff) * 4;
    strength -= playerBar * 10;
    strength += opponentBar * 5;
    strength += playerPrimes * 4;
    strength = Math.max(5, Math.min(95, Math.round(strength)));

    // Strategic insights
    const insights = this.buildInsights(
      playerBar,
      pipAdvantage,
      playerBlots,
      opponentBlots,
      playerBornOff,
      opponentBornOff,
      playerPrimes,
      state
    );

    // Recommendation
    const recommendation = this.buildRecommendation(
      playerBar,
      pipAdvantage,
      playerBlots,
      playerPrimes,
      playerBornOff
    );

    return {
      recommendation,
      insights,
      positionStrength: strength,
      stats: {
        'Your Pips': playerPips,
        'Opp Pips': opponentPips,
        'Pip Lead': pipAdvantage > 0 ? `+${pipAdvantage}` : `${pipAdvantage}`,
        Blots: playerBlots,
        'Borne Off': `${playerBornOff}/15`,
      },
    };
  }

  /**
   * Rank available moves for AI decision-making.
   * Returns moves sorted by estimated quality (best first).
   */
  static rankMoves(state: BackgammonGameState, availableMoves: BackgammonMove[]): BackgammonMove[] {
    if (availableMoves.length === 0) return [];

    const isWhite = state.currentPlayer === 'white';

    return [...availableMoves].sort((a, b) => {
      const scoreA = this.scoreMove(a, state, isWhite);
      const scoreB = this.scoreMove(b, state, isWhite);
      return scoreB - scoreA; // Higher score = better move
    });
  }

  private static scoreMove(
    move: BackgammonMove,
    state: BackgammonGameState,
    isWhite: boolean
  ): number {
    let score = 0;

    // Prefer bearing off
    if (move.to === 25) score += 50;

    // Prefer hitting opponent blots
    if (
      move.to >= 0 &&
      move.to <= 23 &&
      Math.abs(state.board[move.to]) === 1 &&
      ((isWhite && state.board[move.to] < 0) || (!isWhite && state.board[move.to] > 0))
    ) {
      score += 30;
    }

    // Prefer making points (landing on own pieces)
    if (
      move.to >= 0 &&
      move.to <= 23 &&
      ((isWhite && state.board[move.to] === 1) || (!isWhite && state.board[move.to] === -1))
    ) {
      score += 20;
    }

    // Prefer moving from bar
    if (move.from === -1) score += 40;

    // Prefer advancing (reducing pips)
    score += Math.abs(move.to - move.from) * 2;

    return score;
  }

  private static calculatePips(board: number[], isWhite: boolean): number {
    let pips = 0;
    for (let i = 0; i < 24; i++) {
      if (isWhite && board[i] > 0) {
        pips += board[i] * (24 - i);
      } else if (!isWhite && board[i] < 0) {
        pips += Math.abs(board[i]) * (i + 1);
      }
    }
    return pips;
  }

  private static countBlots(board: number[], isWhite: boolean): number {
    let blots = 0;
    for (let i = 0; i < 24; i++) {
      if (isWhite && board[i] === 1) blots++;
      else if (!isWhite && board[i] === -1) blots++;
    }
    return blots;
  }

  private static countPrimes(board: number[], isWhite: boolean): number {
    let primes = 0;
    let consecutive = 0;
    for (let i = 0; i < 24; i++) {
      if ((isWhite && board[i] >= 2) || (!isWhite && board[i] <= -2)) {
        consecutive++;
        if (consecutive >= 3) primes++;
      } else {
        consecutive = 0;
      }
    }
    return primes;
  }

  private static buildInsights(
    playerBar: number,
    pipAdvantage: number,
    playerBlots: number,
    opponentBlots: number,
    playerBornOff: number,
    opponentBornOff: number,
    playerPrimes: number,
    state: BackgammonGameState
  ): CoachInsight[] {
    const insights: CoachInsight[] = [];

    if (playerBar > 0) {
      insights.push({
        category: 'Bar',
        message: `${playerBar} checker(s) on bar - must re-enter first`,
        importance: 'critical',
      });
    }

    if (pipAdvantage > 20) {
      insights.push({
        category: 'Race',
        message: `Strong lead (+${pipAdvantage} pips) - consider racing`,
        importance: 'tip',
      });
    } else if (pipAdvantage < -20) {
      insights.push({
        category: 'Race',
        message: `Behind by ${Math.abs(pipAdvantage)} pips - play for contact`,
        importance: 'warning',
      });
    } else {
      insights.push({
        category: 'Race',
        message: `Close race (${pipAdvantage >= 0 ? '+' : ''}${pipAdvantage} pips)`,
        importance: 'info',
      });
    }

    if (playerBlots > 2) {
      insights.push({
        category: 'Safety',
        message: `${playerBlots} exposed blots - prioritize making points`,
        importance: 'warning',
      });
    } else if (opponentBlots > 2) {
      insights.push({
        category: 'Attack',
        message: `Opponent has ${opponentBlots} blots - look to hit`,
        importance: 'tip',
      });
    }

    if (playerPrimes > 0) {
      insights.push({
        category: 'Position',
        message: `Strong prime formation - maintain blockade`,
        importance: 'tip',
      });
    }

    if (state.dice[0] === state.dice[1] && state.gamePhase === 'moving') {
      insights.push({
        category: 'Doubles',
        message: 'Doubles! You get 4 moves this turn',
        importance: 'tip',
      });
    }

    if (playerBornOff > 10) {
      insights.push({
        category: 'Endgame',
        message: `${15 - playerBornOff} checkers left to bear off`,
        importance: 'info',
      });
    }

    return insights;
  }

  private static buildRecommendation(
    playerBar: number,
    pipAdvantage: number,
    playerBlots: number,
    playerPrimes: number,
    playerBornOff: number
  ): MoveRecommendation {
    if (playerBar > 0) {
      return {
        action: 'RE-ENTER',
        confidence: 1,
        reasoning: 'Must bring checkers off the bar before any other moves',
        riskLevel: 'high',
      };
    }

    if (playerBornOff > 5) {
      return {
        action: 'BEAR OFF',
        confidence: 0.8,
        reasoning: 'Focus on bearing off remaining checkers efficiently',
        riskLevel: 'low',
      };
    }

    if (pipAdvantage > 15) {
      return {
        action: 'RACE',
        confidence: 0.7,
        reasoning: 'Push your racing advantage - avoid contact',
        riskLevel: 'low',
      };
    }

    if (playerBlots > 2) {
      return {
        action: 'SAFE PLAY',
        confidence: 0.7,
        reasoning: 'Reduce exposed blots by building connected points',
        riskLevel: 'medium',
      };
    }

    if (playerPrimes > 0) {
      return {
        action: 'HOLD PRIME',
        confidence: 0.7,
        reasoning: 'Maintain your prime to trap opponent checkers',
        riskLevel: 'low',
      };
    }

    return {
      action: 'BALANCED',
      confidence: 0.6,
      reasoning: 'Balance between advancing and building your position',
      riskLevel: 'medium',
    };
  }
}
