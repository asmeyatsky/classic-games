/**
 * User Management Routes
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import {
  UserProfileSchema,
  UpdateProfileSchema,
  UserStatisticsSchema,
} from '@classic-games/validation';
import { getLogger, PlayerNotFoundError } from '@classic-games/logger';
import { validateBody, validateParams } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { setUserContext, trackLogin } from '@classic-games/analytics';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * GET /api/users/:userId - Get user profile
 */
router.get(
  '/:userId',
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const { userId } = req.params;

    const users = await db`SELECT * FROM users WHERE id = ${userId}`;

    if (users.length === 0) {
      throw new PlayerNotFoundError(userId);
    }

    const user = users[0];
    const stats = await db`SELECT * FROM game_stats WHERE user_id = ${userId}`;

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar_url,
      bio: user.bio,
      level: user.level,
      rating: user.rating,
      totalGames: user.total_games,
      wins: user.wins,
      losses: user.losses,
      stats: stats[0] || null,
      createdAt: user.created_at,
    });

    logger.info('User profile retrieved', { userId });
  })
);

/**
 * PUT /api/users/:userId - Update user profile
 */
router.put(
  '/:userId',
  requireAuth,
  validateParams(z.object({ userId: z.string().uuid() })),
  validateBody(UpdateProfileSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const { userId } = req.params;
    const { displayName, bio, avatar } = req.body;

    // Verify ownership
    if (req.user?.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updated = await db`
      UPDATE users
      SET display_name = ${displayName || db.currentQuery},
          bio = ${bio || db.currentQuery},
          avatar_url = ${avatar || db.currentQuery},
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;

    if (updated.length === 0) {
      throw new PlayerNotFoundError(userId);
    }

    const user = updated[0];
    res.json({
      id: user.id,
      displayName: user.display_name,
      bio: user.bio,
      avatar: user.avatar_url,
      updatedAt: user.updated_at,
    });

    logger.info('User profile updated', { userId });
  })
);

/**
 * GET /api/users/:userId/stats - Get user game statistics
 */
router.get(
  '/:userId/stats',
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const { userId } = req.params;

    const stats = await db`
      SELECT * FROM game_stats WHERE user_id = ${userId}
    `;

    if (stats.length === 0) {
      // Return empty stats if not found
      res.json({
        userId,
        pokerWins: 0,
        pokerLosses: 0,
        pokerRating: 1000,
        backgammonWins: 0,
        backgammonLosses: 0,
        backgammonRating: 1000,
        scrabbleWins: 0,
        scrabbleLosses: 0,
        scrabbleRating: 1000,
        totalChipsWon: 0,
        longestWinningStreak: 0,
      });
      return;
    }

    const stat = stats[0];
    res.json({
      userId,
      pokerWins: stat.poker_wins,
      pokerLosses: stat.poker_losses,
      pokerRating: stat.poker_rating,
      backgammonWins: stat.backgammon_wins,
      backgammonLosses: stat.backgammon_losses,
      backgammonRating: stat.backgammon_rating,
      scrabbleWins: stat.scrabble_wins,
      scrabbleLosses: stat.scrabble_losses,
      scrabbleRating: stat.scrabble_rating,
      totalChipsWon: stat.total_chips_won,
      longestWinningStreak: stat.longest_winning_streak,
      currentWinningStreak: stat.current_winning_streak,
    });

    logger.info('User statistics retrieved', { userId });
  })
);

/**
 * GET /api/users/:userId/achievements - Get user achievements
 */
router.get(
  '/:userId/achievements',
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const { userId } = req.params;

    const achievements = await db`
      SELECT * FROM achievements
      WHERE user_id = ${userId}
      ORDER BY unlocked_at DESC
    `;

    res.json({
      userId,
      achievements: achievements.map((a: any) => ({
        id: a.id,
        code: a.achievement_code,
        title: a.title,
        description: a.description,
        icon: a.icon_url,
        unlockedAt: a.unlocked_at,
        progress: a.progress,
      })),
      totalUnlocked: achievements.length,
    });

    logger.info('User achievements retrieved', { userId });
  })
);

/**
 * GET /api/me - Get current user profile
 */
router.get(
  '/profile/me',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDatabase();
    const users = await db`SELECT * FROM users WHERE id = ${userId}`;

    if (users.length === 0) {
      throw new PlayerNotFoundError(userId);
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar_url,
      level: user.level,
      rating: user.rating,
    });

    // Track login
    trackLogin(userId);
    logger.info('Current user profile retrieved', { userId });
  })
);

export default router;
