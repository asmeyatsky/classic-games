/**
 * Tournament Routes
 * Handles tournament management and progression
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import { getLogger } from '@classic-games/logger';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * POST /api/tournaments - Create new tournament
 */
router.post(
  '/',
  requireAuth,
  validateBody(
    z.object({
      name: z.string().min(1).max(100),
      gameType: z.enum(['poker', 'backgammon', 'scrabble']),
      maxPlayers: z.number().min(2).max(64),
      format: z.enum(['single_elimination', 'round_robin', 'swiss']),
      entryFee: z.number().min(0).optional(),
      prizePool: z.number().min(0).optional(),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, gameType, maxPlayers, format, entryFee, prizePool } = req.body;

    // Create tournament
    const tournaments = await db`
      INSERT INTO tournaments (
        name, game_type, host_id, max_players, format,
        entry_fee, prize_pool, status, created_at
      )
      VALUES (
        ${name}, ${gameType}, ${userId}, ${maxPlayers}, ${format},
        ${entryFee || 0}, ${prizePool || 0}, 'pending', NOW()
      )
      RETURNING *
    `;

    const tournament = tournaments[0];

    // Add host as participant
    await db`
      INSERT INTO tournament_participants (tournament_id, user_id, status, joined_at)
      VALUES (${tournament.id}, ${userId}, 'confirmed', NOW())
    `;

    res.status(201).json({
      id: tournament.id,
      name: tournament.name,
      gameType: tournament.game_type,
      hostId: tournament.host_id,
      maxPlayers: tournament.max_players,
      currentPlayers: 1,
      format: tournament.format,
      entryFee: tournament.entry_fee,
      prizePool: tournament.prize_pool,
      status: tournament.status,
      createdAt: tournament.created_at,
    });

    logger.info('Tournament created', {
      tournamentId: tournament.id,
      hostId: userId,
      gameType,
    });
  })
);

/**
 * GET /api/tournaments - List active tournaments
 */
router.get(
  '/',
  validateQuery(
    z.object({
      gameType: z.enum(['poker', 'backgammon', 'scrabble']).optional(),
      status: z.enum(['pending', 'active', 'completed']).optional().default('active'),
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      offset: z.coerce.number().min(0).optional().default(0),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameType, status, limit, offset } = req.query as any;

    let query = db`
      SELECT
        t.*,
        COUNT(tp.id) as current_players,
        u.username as host_name
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      LEFT JOIN users u ON t.host_id = u.id
      WHERE t.status = ${status}
    `;

    if (gameType) {
      query = db`${query} AND t.game_type = ${gameType}`;
    }

    query = db`
      ${query}
      GROUP BY t.id, u.username
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const tournaments = await query;

    res.json({
      status,
      limit,
      offset,
      total: tournaments.length,
      tournaments: tournaments.map((t: any) => ({
        id: t.id,
        name: t.name,
        gameType: t.game_type,
        hostId: t.host_id,
        hostName: t.host_name,
        maxPlayers: t.max_players,
        currentPlayers: parseInt(t.current_players),
        format: t.format,
        entryFee: t.entry_fee,
        prizePool: t.prize_pool,
        status: t.status,
        createdAt: t.created_at,
        startsAt: t.starts_at,
        endsAt: t.ends_at,
      })),
    });

    logger.debug('Tournaments listed', { status, gameType });
  })
);

/**
 * GET /api/tournaments/:tournamentId - Get tournament details
 */
router.get(
  '/:tournamentId',
  validateParams(z.object({ tournamentId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { tournamentId } = req.params;

    const tournaments = await db`SELECT * FROM tournaments WHERE id = ${tournamentId}`;

    if (tournaments.length === 0) {
      res.status(404).json({ error: 'Tournament not found' });
      return;
    }

    const tournament = tournaments[0];

    // Get participants
    const participants = await db`
      SELECT tp.*, u.username, u.display_name, u.rating
      FROM tournament_participants tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.tournament_id = ${tournamentId}
      ORDER BY tp.joined_at ASC
    `;

    // Get brackets/matchups
    const matchups = await db`
      SELECT
        tm.*,
        p1.username as player1_name,
        p2.username as player2_name,
        w.username as winner_name
      FROM tournament_matches tm
      LEFT JOIN users p1 ON tm.player1_id = p1.id
      LEFT JOIN users p2 ON tm.player2_id = p2.id
      LEFT JOIN users w ON tm.winner_id = w.id
      WHERE tm.tournament_id = ${tournamentId}
      ORDER BY tm.round, tm.match_number
    `;

    res.json({
      id: tournament.id,
      name: tournament.name,
      gameType: tournament.game_type,
      hostId: tournament.host_id,
      maxPlayers: tournament.max_players,
      format: tournament.format,
      entryFee: tournament.entry_fee,
      prizePool: tournament.prize_pool,
      status: tournament.status,
      currentPlayers: participants.length,
      createdAt: tournament.created_at,
      startsAt: tournament.starts_at,
      endsAt: tournament.ends_at,
      participants: participants.map((p: any) => ({
        userId: p.user_id,
        username: p.username,
        displayName: p.display_name,
        rating: p.rating,
        status: p.status,
        joinedAt: p.joined_at,
      })),
      matchups: matchups.map((m: any) => ({
        id: m.id,
        round: m.round,
        matchNumber: m.match_number,
        player1Id: m.player1_id,
        player1Name: m.player1_name,
        player2Id: m.player2_id,
        player2Name: m.player2_name,
        winnerId: m.winner_id,
        winnerName: m.winner_name,
        status: m.status,
        scheduledAt: m.scheduled_at,
      })),
    });

    logger.info('Tournament details retrieved', { tournamentId });
  })
);

/**
 * POST /api/tournaments/:tournamentId/join - Join tournament
 */
router.post(
  '/:tournamentId/join',
  requireAuth,
  validateParams(z.object({ tournamentId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { tournamentId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check tournament exists and is accepting players
    const tournaments = await db`
      SELECT *
      FROM tournaments
      WHERE id = ${tournamentId} AND status IN ('pending', 'active')
    `;

    if (tournaments.length === 0) {
      res.status(404).json({ error: 'Tournament not found or not accepting players' });
      return;
    }

    const tournament = tournaments[0];

    // Check capacity
    const participants = await db`
      SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ${tournamentId}
    `;

    if (parseInt(participants[0].count) >= tournament.max_players) {
      res.status(400).json({ error: 'Tournament is full' });
      return;
    }

    // Check already joined
    const existing = await db`
      SELECT id FROM tournament_participants
      WHERE tournament_id = ${tournamentId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      res.status(400).json({ error: 'Already joined this tournament' });
      return;
    }

    // Join tournament
    await db`
      INSERT INTO tournament_participants (tournament_id, user_id, status, joined_at)
      VALUES (${tournamentId}, ${userId}, 'confirmed', NOW())
    `;

    res.status(200).json({
      success: true,
      tournamentId,
      message: 'Successfully joined tournament',
    });

    logger.info('Player joined tournament', { tournamentId, userId });
  })
);

/**
 * POST /api/tournaments/:tournamentId/start - Start tournament
 */
router.post(
  '/:tournamentId/start',
  requireAuth,
  validateParams(z.object({ tournamentId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { tournamentId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tournaments = await db`
      SELECT * FROM tournaments WHERE id = ${tournamentId}
    `;

    if (tournaments.length === 0) {
      res.status(404).json({ error: 'Tournament not found' });
      return;
    }

    const tournament = tournaments[0];

    // Only host can start
    if (tournament.host_id !== userId) {
      res.status(403).json({ error: 'Only host can start tournament' });
      return;
    }

    // Update tournament status
    await db`
      UPDATE tournaments
      SET status = 'active', starts_at = NOW()
      WHERE id = ${tournamentId}
    `;

    res.json({
      success: true,
      tournamentId,
      status: 'active',
    });

    logger.info('Tournament started', { tournamentId });
  })
);

/**
 * POST /api/tournaments/:tournamentId/complete - Complete tournament
 */
router.post(
  '/:tournamentId/complete',
  requireAuth,
  validateParams(z.object({ tournamentId: z.string().uuid() })),
  validateBody(
    z.object({
      winnerId: z.string().uuid(),
      finalRankings: z.array(z.object({ userId: z.string().uuid(), rank: z.number() })),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { tournamentId } = req.params;
    const { winnerId, finalRankings } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tournaments = await db`
      SELECT * FROM tournaments WHERE id = ${tournamentId}
    `;

    if (tournaments.length === 0) {
      res.status(404).json({ error: 'Tournament not found' });
      return;
    }

    const tournament = tournaments[0];

    // Only host can complete
    if (tournament.host_id !== userId) {
      res.status(403).json({ error: 'Only host can complete tournament' });
      return;
    }

    // Update tournament status
    await db`
      UPDATE tournaments
      SET status = 'completed', ends_at = NOW(), winner_id = ${winnerId}
      WHERE id = ${tournamentId}
    `;

    // Record final rankings
    for (const ranking of finalRankings) {
      await db`
        UPDATE tournament_participants
        SET final_rank = ${ranking.rank}
        WHERE tournament_id = ${tournamentId} AND user_id = ${ranking.userId}
      `;
    }

    res.json({
      success: true,
      tournamentId,
      status: 'completed',
      winnerId,
    });

    logger.info('Tournament completed', { tournamentId, winnerId });
  })
);

export default router;
