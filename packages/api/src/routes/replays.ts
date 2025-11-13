/**
 * Game Replay Routes
 * Handles game replay viewing and sharing
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import { getLogger } from '@classic-games/logger';
import { validateParams, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * GET /api/replays/:gameId - Get game replay
 */
router.get(
  '/:gameId',
  validateParams(z.object({ gameId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameId } = req.params;

    // Get game session
    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const game = games[0];

    // Only show completed games
    if (game.status !== 'completed') {
      res.status(403).json({ error: 'Game is not completed yet' });
      return;
    }

    // Get all moves for this game
    const moves = await db`
      SELECT gm.*, u.username
      FROM game_moves gm
      JOIN users u ON gm.player_id = u.id
      WHERE gm.game_session_id = ${gameId}
      ORDER BY gm.move_number ASC
    `;

    // Get result information
    const results = await db`
      SELECT * FROM game_results WHERE game_session_id = ${gameId}
    `;

    // Get room/game info
    const rooms = await db`SELECT * FROM rooms WHERE id = ${game.room_id}`;

    const players = await db`
      SELECT rp.*, u.username, u.display_name, u.rating
      FROM room_players rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${game.room_id}
    `;

    res.json({
      gameId: game.id,
      gameType: game.game_type,
      status: game.status,
      duration: game.duration_seconds,
      moveCount: game.move_count,
      createdAt: game.created_at,
      completedAt: game.completed_at,
      room: {
        id: rooms[0].id,
        name: rooms[0].name,
      },
      result: results.length > 0 && {
        winnerId: results[0].winner_id,
        points: results[0].points ? JSON.parse(results[0].points) : {},
        prizePool: results[0].prize_pool,
      },
      players: players.map((p: any) => ({
        userId: p.user_id,
        username: p.username,
        displayName: p.display_name,
        rating: p.rating,
      })),
      moves: moves.map((m: any) => ({
        moveNumber: m.move_number,
        playerId: m.player_id,
        playerName: m.username,
        action: m.action,
        details: m.details ? JSON.parse(m.details) : null,
        duration: m.duration_seconds,
        timestamp: m.created_at,
      })),
    });

    logger.info('Game replay retrieved', { gameId });
  })
);

/**
 * GET /api/replays - Get user's game replays
 */
router.get(
  '/',
  requireAuth,
  validateQuery(
    z.object({
      gameType: z.enum(['poker', 'backgammon', 'scrabble']).optional(),
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      offset: z.coerce.number().min(0).optional().default(0),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { gameType, limit, offset } = req.query as any;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let query = db`
      SELECT
        gs.*,
        CASE
          WHEN gr.winner_id = ${userId} THEN true
          ELSE false
        END as is_winner,
        r.name as room_name
      FROM game_sessions gs
      LEFT JOIN game_results gr ON gs.id = gr.game_session_id
      LEFT JOIN rooms r ON gs.room_id = r.id
      WHERE gs.status = 'completed'
        AND gs.id IN (
          SELECT DISTINCT game_session_id
          FROM game_moves
          WHERE player_id = ${userId}
        )
    `;

    if (gameType) {
      query = db`${query} AND gs.game_type = ${gameType}`;
    }

    query = db`
      ${query}
      ORDER BY gs.completed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const games = await query;

    res.json({
      userId,
      gameType,
      limit,
      offset,
      total: games.length,
      replays: games.map((g: any) => ({
        gameId: g.id,
        gameType: g.game_type,
        roomName: g.room_name,
        isWinner: g.is_winner,
        duration: g.duration_seconds,
        moveCount: g.move_count,
        createdAt: g.created_at,
        completedAt: g.completed_at,
      })),
    });

    logger.debug('User replays retrieved', { userId, gameType });
  })
);

/**
 * POST /api/replays/:gameId/share - Create shareable replay link
 */
router.post(
  '/:gameId/share',
  requireAuth,
  validateParams(z.object({ gameId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { gameId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user was in the game
    const userInGame = await db`
      SELECT id FROM game_moves
      WHERE game_session_id = ${gameId} AND player_id = ${userId}
      LIMIT 1
    `;

    if (userInGame.length === 0) {
      res.status(403).json({ error: 'You were not a participant in this game' });
      return;
    }

    // Generate share token
    const shareToken = Buffer.from(`${gameId}:${userId}:${Date.now()}`).toString('base64');

    // Store share link (or just return the token for now)
    res.json({
      gameId,
      shareToken,
      shareUrl: `/replays/${gameId}?token=${shareToken}`,
      expiresIn: 2592000, // 30 days
    });

    logger.info('Replay shared', { gameId, userId });
  })
);

/**
 * GET /api/replays/:gameId/analysis - Get game analysis
 */
router.get(
  '/:gameId/analysis',
  validateParams(z.object({ gameId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameId } = req.params;

    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const game = games[0];

    // Get moves
    const moves = await db`
      SELECT * FROM game_moves
      WHERE game_session_id = ${gameId}
      ORDER BY move_number ASC
    `;

    // Get result
    const results = await db`
      SELECT * FROM game_results WHERE game_session_id = ${gameId}
    `;

    // Calculate statistics
    const movesByPlayer: Record<string, number> = {};
    const aveDurationByPlayer: Record<string, number> = {};
    let totalDuration = 0;

    moves.forEach((m: any) => {
      movesByPlayer[m.player_id] = (movesByPlayer[m.player_id] || 0) + 1;
      const duration = m.duration_seconds || 0;
      aveDurationByPlayer[m.player_id] = (aveDurationByPlayer[m.player_id] || 0) + duration;
      totalDuration += duration;
    });

    // Calculate average durations
    Object.keys(aveDurationByPlayer).forEach((playerId) => {
      aveDurationByPlayer[playerId] = Math.round(
        aveDurationByPlayer[playerId] / movesByPlayer[playerId]
      );
    });

    res.json({
      gameId,
      gameType: game.game_type,
      duration: game.duration_seconds,
      totalMoves: game.move_count,
      statistics: {
        movesByPlayer,
        averageMoveTimeByPlayer: aveDurationByPlayer,
        averageMoveTime: Math.round(totalDuration / moves.length),
      },
      result: results.length > 0 && {
        winnerId: results[0].winner_id,
        points: results[0].points ? JSON.parse(results[0].points) : {},
      },
    });

    logger.debug('Game analysis retrieved', { gameId });
  })
);

/**
 * GET /api/replays/:gameId/moves/:moveNumber - Get specific move
 */
router.get(
  '/:gameId/moves/:moveNumber',
  validateParams(z.object({ gameId: z.string().uuid(), moveNumber: z.coerce.number().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameId, moveNumber } = req.params;

    const move = await db`
      SELECT gm.*, u.username
      FROM game_moves gm
      JOIN users u ON gm.player_id = u.id
      WHERE gm.game_session_id = ${gameId} AND gm.move_number = ${moveNumber}
    `;

    if (move.length === 0) {
      res.status(404).json({ error: 'Move not found' });
      return;
    }

    const m = move[0];

    res.json({
      gameId,
      moveNumber: m.move_number,
      playerId: m.player_id,
      playerName: m.username,
      action: m.action,
      details: m.details ? JSON.parse(m.details) : null,
      duration: m.duration_seconds,
      timestamp: m.created_at,
    });

    logger.debug('Move retrieved', { gameId, moveNumber });
  })
);

export default router;
