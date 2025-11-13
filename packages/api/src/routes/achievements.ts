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
 * GET /api/achievements - Get all achievements
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
 * GET /api/achievements/:code - Get achievement details
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
 * GET /api/achievements/leaderboard - Get achievement leaderboard
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
 * GET /api/achievements/user/:userId - Get user achievements
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
 * GET /api/me/achievements - Get current user achievements
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
