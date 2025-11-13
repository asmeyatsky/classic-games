/**
 * Game Event Tracking
 *
 * Track user actions and game events for analytics
 */

import { addBreadcrumb, setTag } from './client';
import { getLogger } from '@classic-games/logger';

/**
 * Event types for game analytics
 */
export enum GameEventType {
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  MOVE_MADE = 'move_made',
  PLAYER_FOLDED = 'player_folded',
  PLAYER_WON = 'player_won',
  TOURNAMENT_STARTED = 'tournament_started',
  TOURNAMENT_ENDED = 'tournament_ended',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

export enum UserEventType {
  SIGNUP = 'signup',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  FRIEND_ADDED = 'friend_added',
  FRIEND_REMOVED = 'friend_removed',
}

export interface GameEvent {
  type: GameEventType;
  gameId: string;
  playerId: string;
  gameType: 'poker' | 'backgammon' | 'scrabble';
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface UserEvent {
  type: UserEventType;
  userId: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Track game event
 */
export function trackGameEvent(event: GameEvent): void {
  const logger = getLogger();

  try {
    logger.logGameEvent(event.gameId, event.type, event.playerId, event.data);

    // Add breadcrumb for Sentry
    addBreadcrumb(`Game: ${event.type}`, 'game-event', {
      gameId: event.gameId,
      gameType: event.gameType,
      ...event.data,
    });

    // Set tags for filtering
    setTag('event_type', event.type);
    setTag('game_type', event.gameType);
  } catch (error) {
    logger.error('Failed to track game event', error);
  }
}

/**
 * Track user event
 */
export function trackUserEvent(event: UserEvent): void {
  const logger = getLogger();

  try {
    logger.info(`User Event: ${event.type}`, {
      userId: event.userId,
      ...event.data,
    });

    // Add breadcrumb
    addBreadcrumb(`User: ${event.type}`, 'user-event', {
      userId: event.userId,
      ...event.data,
    });

    // Set tag
    setTag('user_event', event.type);
  } catch (error) {
    logger.error('Failed to track user event', error);
  }
}

/**
 * Track game start
 */
export function trackGameStart(
  gameId: string,
  playerId: string,
  gameType: 'poker' | 'backgammon' | 'scrabble',
  playerCount: number
): void {
  trackGameEvent({
    type: GameEventType.GAME_STARTED,
    gameId,
    playerId,
    gameType,
    data: { playerCount },
    timestamp: Date.now(),
  });
}

/**
 * Track game end
 */
export function trackGameEnd(
  gameId: string,
  winnerId: string,
  gameType: 'poker' | 'backgammon' | 'scrabble',
  duration: number,
  finalScore: number
): void {
  trackGameEvent({
    type: GameEventType.GAME_ENDED,
    gameId,
    playerId: winnerId,
    gameType,
    data: {
      duration,
      finalScore,
      winner: winnerId,
    },
    timestamp: Date.now(),
  });
}

/**
 * Track move
 */
export function trackMove(
  gameId: string,
  playerId: string,
  gameType: 'poker' | 'backgammon' | 'scrabble',
  moveType: string,
  duration: number
): void {
  trackGameEvent({
    type: GameEventType.MOVE_MADE,
    gameId,
    playerId,
    gameType,
    data: { moveType, duration },
    timestamp: Date.now(),
  });
}

/**
 * Track player join
 */
export function trackPlayerJoined(
  gameId: string,
  playerId: string,
  gameType: 'poker' | 'backgammon' | 'scrabble'
): void {
  trackGameEvent({
    type: GameEventType.PLAYER_JOINED,
    gameId,
    playerId,
    gameType,
    timestamp: Date.now(),
  });
}

/**
 * Track achievement unlock
 */
export function trackAchievementUnlocked(
  userId: string,
  achievementId: string,
  achievementName: string
): void {
  trackUserEvent({
    type: UserEventType.SIGNUP, // Reuse enum, or create new one
    userId,
    data: {
      achievementId,
      achievementName,
    },
    timestamp: Date.now(),
  });
}

/**
 * Track user signup
 */
export function trackSignup(userId: string, email: string): void {
  trackUserEvent({
    type: UserEventType.SIGNUP,
    userId,
    data: { email },
    timestamp: Date.now(),
  });
}

/**
 * Track user login
 */
export function trackLogin(userId: string): void {
  trackUserEvent({
    type: UserEventType.LOGIN,
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Track user logout
 */
export function trackLogout(userId: string): void {
  trackUserEvent({
    type: UserEventType.LOGOUT,
    userId,
    timestamp: Date.now(),
  });
}
