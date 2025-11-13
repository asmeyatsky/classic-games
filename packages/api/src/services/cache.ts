/**
 * Redis Caching Service
 * Manages caching for frequently accessed data
 */

import { createClient, RedisClientType } from 'redis';
import { getLogger } from '@classic-games/logger';

const logger = getLogger();

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client
 */
export async function initializeCache(
  host: string = 'localhost',
  port: number = 6379,
  password?: string
): Promise<void> {
  try {
    redisClient = createClient({
      host,
      port,
      password,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();
    logger.info('Cache initialized', { host, port });
  } catch (error) {
    logger.warn('Failed to initialize Redis, running without cache', error);
    redisClient = null;
  }
}

/**
 * Get value from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const value = await redisClient.get(key);
    if (value) {
      logger.debug('Cache hit', { key });
      return JSON.parse(value) as T;
    }
    logger.debug('Cache miss', { key });
    return null;
  } catch (error) {
    logger.warn('Error getting from cache', error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    logger.debug('Value cached', { key, ttl: ttlSeconds });
  } catch (error) {
    logger.warn('Error setting cache', error);
  }
}

/**
 * Invalidate cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.del(key);
    logger.debug('Cache invalidated', { key });
  } catch (error) {
    logger.warn('Error invalidating cache', error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug('Cache pattern invalidated', { pattern, count: keys.length });
    }
  } catch (error) {
    logger.warn('Error invalidating cache pattern', error);
  }
}

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  // Leaderboards
  GLOBAL_LEADERBOARD: (limit: number) => `leaderboard:global:${limit}`,
  GAME_LEADERBOARD: (gameType: string, limit: number) => `leaderboard:${gameType}:${limit}`,
  USER_RANK: (userId: string, gameType?: string) =>
    `rank:${userId}${gameType ? `:${gameType}` : ''}`,

  // User data
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_STATS: (userId: string) => `user:${userId}:stats`,
  USER_ACHIEVEMENTS: (userId: string) => `user:${userId}:achievements`,

  // Game data
  GAME_STATE: (gameId: string) => `game:${gameId}:state`,
  ROOM_DETAILS: (roomId: string) => `room:${roomId}:details`,
  ACTIVE_ROOMS: (gameType?: string) => `rooms:active${gameType ? `:${gameType}` : ''}`,

  // Tournament data
  TOURNAMENT_DETAILS: (tournamentId: string) => `tournament:${tournamentId}:details`,
  ACTIVE_TOURNAMENTS: (gameType?: string) => `tournaments:active${gameType ? `:${gameType}` : ''}`,

  // Social data
  USER_FRIENDS: (userId: string) => `friends:${userId}:list`,
  FRIEND_REQUESTS: (userId: string) => `friends:${userId}:requests`,

  // Stats
  GAME_STATS: (gameType: string) => `stats:games:${gameType}`,
  PLAYER_STATS: (userId: string, gameType: string) => `stats:player:${userId}:${gameType}`,
};

/**
 * Shutdown cache
 */
export async function shutdownCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Cache shutdown');
    } catch (error) {
      logger.warn('Error shutting down cache', error);
    }
  }
}

/**
 * Get cache status
 */
export function isCacheAvailable(): boolean {
  return redisClient !== null;
}
