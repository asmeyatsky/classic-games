/**
 * Game Room Routes
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import {
  CreateRoomSchema,
  JoinRoomSchema,
  RoomListFilterSchema,
} from '@classic-games/validation';
import { getLogger, RoomNotFoundError, RoomFullError } from '@classic-games/logger';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { trackPlayerJoined } from '@classic-games/analytics';
import { z } from 'zod';

const router = Router();
const logger = getLogger();

/**
 * POST /api/rooms - Create new game room
 */
router.post(
  '/',
  requireAuth,
  validateBody(CreateRoomSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, gameType, maxPlayers, isPrivate, password, minRating, timePerMove } = req.body;

    const room = await db`
      INSERT INTO rooms (
        name, game_type, host_id, max_players, is_private,
        password_hash, min_rating, time_per_move, status, created_at
      )
      VALUES (
        ${name}, ${gameType}, ${userId}, ${maxPlayers}, ${isPrivate || false},
        ${password ? Buffer.from(password).toString('base64') : null},
        ${minRating || null}, ${timePerMove || null}, 'waiting', NOW()
      )
      RETURNING *
    `;

    // Add host to room_players
    await db`
      INSERT INTO room_players (room_id, user_id, status, is_ready)
      VALUES (${room[0].id}, ${userId}, 'active', false)
    `;

    res.status(201).json({
      id: room[0].id,
      name: room[0].name,
      gameType: room[0].game_type,
      hostId: room[0].host_id,
      maxPlayers: room[0].max_players,
      currentPlayers: 1,
      isPrivate: room[0].is_private,
      minRating: room[0].min_rating,
      status: room[0].status,
      createdAt: room[0].created_at,
    });

    logger.info('Room created', { roomId: room[0].id, userId, gameType });
  })
);

/**
 * GET /api/rooms - List available rooms
 */
router.get(
  '/',
  validateQuery(RoomListFilterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameType, status = 'waiting', minPlayers, maxRating } = req.query as any;

    let query = db`
      SELECT r.*, COUNT(rp.id) as current_players
      FROM rooms r
      LEFT JOIN room_players rp ON r.id = rp.room_id
      WHERE r.status = ${status}
        AND r.is_private = false
    `;

    if (gameType) {
      query = db`${query} AND r.game_type = ${gameType}`;
    }

    if (maxRating) {
      query = db`${query} AND (r.min_rating IS NULL OR r.min_rating <= ${maxRating})`;
    }

    query = db`${query} GROUP BY r.id ORDER BY r.created_at DESC LIMIT 50`;

    const rooms = await query;

    res.json({
      rooms: rooms.map((r: any) => ({
        id: r.id,
        name: r.name,
        gameType: r.game_type,
        hostId: r.host_id,
        maxPlayers: r.max_players,
        currentPlayers: parseInt(r.current_players),
        isPrivate: r.is_private,
        minRating: r.min_rating,
        status: r.status,
        createdAt: r.created_at,
      })),
      total: rooms.length,
    });

    logger.info('Rooms listed', { gameType, status });
  })
);

/**
 * GET /api/rooms/:roomId - Get room details
 */
router.get(
  '/:roomId',
  validateParams(z.object({ roomId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { roomId } = req.params;

    const rooms = await db`SELECT * FROM rooms WHERE id = ${roomId}`;

    if (rooms.length === 0) {
      throw new RoomNotFoundError(roomId);
    }

    const room = rooms[0];
    const players = await db`
      SELECT rp.*, u.username, u.display_name, u.avatar_url
      FROM room_players rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${roomId}
    `;

    res.json({
      id: room.id,
      name: room.name,
      gameType: room.game_type,
      hostId: room.host_id,
      maxPlayers: room.max_players,
      currentPlayers: players.length,
      isPrivate: room.is_private,
      minRating: room.min_rating,
      timePerMove: room.time_per_move,
      status: room.status,
      players: players.map((p: any) => ({
        userId: p.user_id,
        username: p.username,
        displayName: p.display_name,
        avatar: p.avatar_url,
        status: p.status,
        isReady: p.is_ready,
        joinedAt: p.joined_at,
      })),
      createdAt: room.created_at,
      startedAt: room.started_at,
    });

    logger.info('Room details retrieved', { roomId });
  })
);

/**
 * POST /api/rooms/:roomId/join - Join a room
 */
router.post(
  '/:roomId/join',
  requireAuth,
  validateParams(z.object({ roomId: z.string().uuid() })),
  validateBody(z.object({ password: z.string().optional() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { roomId } = req.params;
    const { password } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const rooms = await db`SELECT * FROM rooms WHERE id = ${roomId}`;

    if (rooms.length === 0) {
      throw new RoomNotFoundError(roomId);
    }

    const room = rooms[0];

    // Check password
    if (room.is_private && room.password_hash) {
      const providedHash = Buffer.from(password || '').toString('base64');
      if (providedHash !== room.password_hash) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    }

    // Check if room is full
    const players = await db`SELECT COUNT(*) as count FROM room_players WHERE room_id = ${roomId}`;
    const currentCount = parseInt(players[0].count);

    if (currentCount >= room.max_players) {
      throw new RoomFullError(roomId, room.max_players);
    }

    // Add player to room
    await db`
      INSERT INTO room_players (room_id, user_id, status)
      VALUES (${roomId}, ${userId}, 'active')
    `;

    res.status(200).json({
      roomId,
      message: 'Joined room successfully',
    });

    trackPlayerJoined(roomId, userId, room.game_type);
    logger.info('Player joined room', { roomId, userId });
  })
);

/**
 * POST /api/rooms/:roomId/leave - Leave a room
 */
router.post(
  '/:roomId/leave',
  requireAuth,
  validateParams(z.object({ roomId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { roomId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await db`
      UPDATE room_players
      SET status = 'left', left_at = NOW()
      WHERE room_id = ${roomId} AND user_id = ${userId}
    `;

    res.json({ message: 'Left room' });
    logger.info('Player left room', { roomId, userId });
  })
);

export default router;
