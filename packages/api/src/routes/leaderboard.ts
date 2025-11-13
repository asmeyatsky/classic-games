/**
 * Leaderboard Routes
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { getLogger } from '@classic-games/logger';
import { validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * GET /api/leaderboard - Get global leaderboard
 */
router.get(
  '/',
  validateQuery(
    z.object({
      gameType: z.enum(['poker', 'backgammon', 'scrabble']).optional(),
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      offset: z.coerce.number().min(0).optional().default(0),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameType, limit, offset } = req.query as any;

    let query;

    if (gameType === 'poker') {
      query = db`
        SELECT
          ROW_NUMBER() OVER (ORDER BY gs.poker_rating DESC) as rank,
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          gs.poker_rating as rating,
          gs.poker_wins as wins,
          gs.poker_losses as losses,
          u.updated_at as lastActivity
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.poker_wins > 0 OR gs.poker_rating > 1000
        ORDER BY gs.poker_rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (gameType === 'backgammon') {
      query = db`
        SELECT
          ROW_NUMBER() OVER (ORDER BY gs.backgammon_rating DESC) as rank,
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          gs.backgammon_rating as rating,
          gs.backgammon_wins as wins,
          gs.backgammon_losses as losses,
          u.updated_at as lastActivity
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.backgammon_wins > 0 OR gs.backgammon_rating > 1000
        ORDER BY gs.backgammon_rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (gameType === 'scrabble') {
      query = db`
        SELECT
          ROW_NUMBER() OVER (ORDER BY gs.scrabble_rating DESC) as rank,
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          gs.scrabble_rating as rating,
          gs.scrabble_wins as wins,
          gs.scrabble_losses as losses,
          u.updated_at as lastActivity
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.scrabble_wins > 0 OR gs.scrabble_rating > 1000
        ORDER BY gs.scrabble_rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Overall leaderboard
      query = db`
        SELECT
          ROW_NUMBER() OVER (ORDER BY u.rating DESC) as rank,
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.rating,
          u.wins,
          u.losses,
          u.updated_at as lastActivity
        FROM users u
        WHERE u.is_active = true
        ORDER BY u.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const entries = await query;

    res.json({
      gameType: gameType || 'overall',
      limit,
      offset,
      total: entries.length,
      entries: entries.map((e: any) => ({
        rank: e.rank,
        userId: e.id,
        username: e.username,
        displayName: e.display_name,
        avatar: e.avatar_url,
        rating: parseInt(e.rating),
        wins: parseInt(e.wins),
        losses: parseInt(e.losses),
        winRate: e.losses > 0 ? ((e.wins / (e.wins + e.losses)) * 100).toFixed(1) : 100,
        lastActivity: e.lastActivity,
      })),
    });

    logger.info('Leaderboard retrieved', { gameType, limit });
  })
);

/**
 * GET /api/leaderboard/user/:userId - Get user rank
 */
router.get(
  '/user/:userId',
  validateQuery(z.object({
    gameType: z.enum(['poker', 'backgammon', 'scrabble']).optional(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { userId } = req.params;
    const { gameType } = req.query as any;

    let ratingColumn;
    let winsColumn;

    if (gameType === 'poker') {
      ratingColumn = 'poker_rating';
      winsColumn = 'poker_wins';
    } else if (gameType === 'backgammon') {
      ratingColumn = 'backgammon_rating';
      winsColumn = 'backgammon_wins';
    } else if (gameType === 'scrabble') {
      ratingColumn = 'scrabble_rating';
      winsColumn = 'scrabble_wins';
    } else {
      ratingColumn = 'rating';
      winsColumn = 'wins';
    }

    let query;
    if (gameType) {
      query = db`
        SELECT
          (SELECT COUNT(*) + 1
           FROM game_stats
           WHERE ${db.raw(ratingColumn)} > (
             SELECT ${db.raw(ratingColumn)} FROM game_stats WHERE user_id = ${userId}
           )
          ) as rank,
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          gs.${db.raw(ratingColumn)} as rating,
          gs.${db.raw(winsColumn)} as wins
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.user_id = ${userId}
      `;
    } else {
      query = db`
        SELECT
          (SELECT COUNT(*) + 1
           FROM users
           WHERE rating > (SELECT rating FROM users WHERE id = ${userId})
             AND is_active = true
          ) as rank,
          id,
          username,
          display_name,
          avatar_url,
          rating,
          wins
        FROM users
        WHERE id = ${userId}
      `;
    }

    const result = await query;

    if (result.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result[0];
    res.json({
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar_url,
      rank: parseInt(user.rank),
      rating: parseInt(user.rating),
      wins: parseInt(user.wins),
    });

    logger.info('User rank retrieved', { userId, gameType });
  })
);

/**
 * GET /api/leaderboard/stats - Get leaderboard statistics
 */
router.get(
  '/stats/overview',
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();

    const stats = await db`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_players,
        (SELECT COUNT(*) FROM game_sessions WHERE status = 'completed') as total_games,
        (SELECT COUNT(*) FROM game_results) as total_results,
        (SELECT AVG(rating) FROM users WHERE is_active = true) as avg_rating
    `;

    const pokerStats = await db`
      SELECT
        COUNT(*) as total_games,
        AVG(poker_rating) as avg_rating,
        MAX(poker_rating) as max_rating
      FROM game_stats
      WHERE poker_wins > 0
    `;

    res.json({
      totalPlayers: parseInt(stats[0].total_players),
      totalGames: parseInt(stats[0].total_games),
      totalResults: parseInt(stats[0].total_results),
      avgRating: parseFloat(stats[0].avg_rating || 1000),
      byGame: {
        poker: {
          totalGames: parseInt(pokerStats[0].total_games),
          avgRating: parseFloat(pokerStats[0].avg_rating || 1000),
          maxRating: parseInt(pokerStats[0].max_rating || 1000),
        },
      },
    });

    logger.info('Leaderboard stats retrieved');
  })
);

export default router;
