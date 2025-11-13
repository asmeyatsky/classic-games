/**
 * Achievements Routes
 * Handles achievement retrieval and statistics
 */

import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import { getLogger } from '@classic-games/logger';
import { validateParams, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import {
  getUserAchievements,
  getUserAchievementStats,
  getAchievementLeaderboard,
  getAchievementDetails,
} from '../services/achievements';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * GET /api/achievements
 * Get all available achievements in the system
 *
 * @route GET /api/achievements
 * @returns {Object} 200 - List of all achievements
 * @returns {number} 200.total - Total number of achievements
 * @returns {Array} 200.achievements - Array of achievement objects
 * @returns {string} 200.achievements[].id - Achievement unique identifier
 * @returns {string} 200.achievements[].code - Achievement code (e.g., 'first_win')
 * @returns {string} 200.achievements[].title - Human-readable achievement title
 * @returns {string} 200.achievements[].description - Detailed achievement description
 * @returns {string} 200.achievements[].icon - Icon URL for the achievement
 * @returns {number} 200.achievements[].points - Points awarded for unlocking
 *
 * @example
 * // Request
 * GET /api/achievements
 *
 * // Response
 * {
 *   "total": 15,
 *   "achievements": [
 *     {
 *       "id": "ach_1",
 *       "code": "first_win",
 *       "title": "First Win",
 *       "description": "Win your first game",
 *       "icon": "https://...",
 *       "points": 10
 *     }
 *   ]
 * }
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const db = require('@classic-games/database').getDatabase();

    const achievements = await db`
      SELECT
        id,
        achievement_code as code,
        title,
        description,
        icon_url as "iconUrl",
        points
      FROM achievement_definitions
      ORDER BY points ASC
    `;

    res.json({
      total: achievements.length,
      achievements: achievements.map((a: any) => ({
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.iconUrl,
        points: a.points,
      })),
    });

    logger.debug('Achievements list retrieved');
  })
);

/**
 * GET /api/achievements/:code
 * Get detailed information about a specific achievement
 *
 * @route GET /api/achievements/:code
 * @param {string} code - Achievement code identifier (e.g., 'first_win')
 * @returns {Object} 200 - Achievement details
 * @returns {string} 200.id - Achievement unique identifier
 * @returns {string} 200.code - Achievement code
 * @returns {string} 200.title - Achievement title
 * @returns {string} 200.description - Detailed description
 * @returns {string} 200.icon - Icon URL
 * @returns {number} 200.points - Points value
 * @returns {string} 200.category - Achievement category (e.g., 'gameplay')
 * @returns {number} 200.rarity - Rarity percentage (0-100)
 *
 * @returns {Object} 404 - Achievement not found
 * @returns {string} 404.error - Error message
 *
 * @example
 * // Request
 * GET /api/achievements/first_win
 *
 * // Response
 * {
 *   "id": "ach_1",
 *   "code": "first_win",
 *   "title": "First Win",
 *   "description": "Win your first game",
 *   "icon": "https://...",
 *   "points": 10,
 *   "category": "gameplay",
 *   "rarity": 85
 * }
 */
router.get(
  '/:code',
  validateParams(z.object({ code: z.string() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;

    const achievement = await getAchievementDetails(code);

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    res.json(achievement);
    logger.debug('Achievement details retrieved', { code });
  })
);

/**
 * GET /api/achievements/leaderboard/global
 * Get the global achievement leaderboard showing top achievement hunters
 *
 * @route GET /api/achievements/leaderboard/global
 * @query {number} [limit=50] - Max results to return (1-100)
 * @returns {Object} 200 - Leaderboard data
 * @returns {number} 200.limit - Results limit used
 * @returns {number} 200.total - Total entries in leaderboard
 * @returns {Array} 200.entries - Array of leaderboard entries
 * @returns {number} 200.entries[].rank - Player rank (1-based)
 * @returns {string} 200.entries[].userId - User unique identifier
 * @returns {string} 200.entries[].username - Player username
 * @returns {number} 200.entries[].unlockedCount - Achievements unlocked
 * @returns {number} 200.entries[].totalPoints - Total achievement points
 *
 * @example
 * // Request
 * GET /api/achievements/leaderboard/global?limit=10
 *
 * // Response
 * {
 *   "limit": 10,
 *   "total": 1000,
 *   "entries": [
 *     {
 *       "rank": 1,
 *       "userId": "user-id",
 *       "username": "achievemaster",
 *       "unlockedCount": 15,
 *       "totalPoints": 500
 *     }
 *   ]
 * }
 */
router.get(
  '/leaderboard/global',
  validateQuery(
    z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(50),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query as any;

    const leaderboard = await getAchievementLeaderboard(limit);

    res.json({
      limit,
      total: leaderboard.length,
      entries: leaderboard.map((entry: any, index: number) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        unlockedCount: entry.unlockedCount,
        totalPoints: entry.totalPoints,
      })),
    });

    logger.debug('Achievement leaderboard retrieved', { limit });
  })
);

/**
 * GET /api/achievements/user/:userId
 * Get achievements for a specific user with progress tracking
 *
 * @route GET /api/achievements/user/:userId
 * @param {string} userId - User's unique identifier (UUID)
 * @returns {Object} 200 - User achievements data
 * @returns {string} 200.userId - The queried user ID
 * @returns {Object} 200.stats - User's achievement statistics
 * @returns {number} 200.stats.unlockedCount - Number of unlocked achievements
 * @returns {number} 200.stats.totalAchievements - Total available achievements
 * @returns {number} 200.stats.totalPoints - Total points earned
 * @returns {number} 200.stats.percentComplete - Completion percentage (0-100)
 * @returns {Array} 200.achievements - All achievements with user progress
 * @returns {boolean} 200.achievements[].unlocked - Whether user has unlocked
 * @returns {string} 200.achievements[].unlockedAt - ISO timestamp of unlock
 * @returns {Object} 200.achievements[].progress - Progress towards unlock
 *
 * @example
 * // Request
 * GET /api/achievements/user/550e8400-e29b-41d4-a716-446655440000
 *
 * // Response
 * {
 *   "userId": "550e8400-e29b-41d4-a716-446655440000",
 *   "stats": {
 *     "unlockedCount": 5,
 *     "totalAchievements": 15,
 *     "totalPoints": 150,
 *     "percentComplete": 33.33
 *   },
 *   "achievements": [...]
 * }
 */
router.get(
  '/user/:userId',
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const achievements = await getUserAchievements(userId);
    const stats = await getUserAchievementStats(userId);

    res.json({
      userId,
      stats: {
        unlockedCount: stats.unlockedCount,
        totalAchievements: stats.totalAchievements,
        totalPoints: stats.totalPoints,
        percentComplete: stats.percentComplete,
      },
      achievements: achievements.map((a: any) => ({
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.iconUrl,
        points: a.points,
        unlocked: !!a.unlockedAt,
        unlockedAt: a.unlockedAt,
        progress: a.progress,
      })),
    });

    logger.info('User achievements retrieved', { userId });
  })
);

/**
 * GET /api/achievements/me/achievements
 * Get current authenticated user's achievements with full details
 *
 * Requires authentication. Returns the same data as GET /achievements/user/:userId
 * but for the authenticated user automatically.
 *
 * @route GET /api/achievements/me/achievements
 * @security Bearer Token required
 * @returns {Object} 200 - Current user's achievements (same as /user/:userId)
 *
 * @example
 * // Request
 * GET /api/achievements/me/achievements
 * Authorization: Bearer {token}
 *
 * // Response
 * {
 *   "userId": "current-user-id",
 *   "stats": {...},
 *   "achievements": [...]
 * }
 */
router.get(
  '/me/achievements',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await getUserAchievements(userId);
    const stats = await getUserAchievementStats(userId);

    res.json({
      userId,
      stats: {
        unlockedCount: stats.unlockedCount,
        totalAchievements: stats.totalAchievements,
        totalPoints: stats.totalPoints,
        percentComplete: stats.percentComplete,
      },
      achievements: achievements.map((a: any) => ({
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.iconUrl,
        points: a.points,
        unlocked: !!a.unlockedAt,
        unlockedAt: a.unlockedAt,
        progress: a.progress,
      })),
    });

    logger.info('Current user achievements retrieved', { userId });
  })
);

export default router;
