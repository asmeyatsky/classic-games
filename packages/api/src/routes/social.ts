/**
 * Social Routes
 * Handles friends, clans, and social features
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
 * POST /api/social/friends/:userId/add - Send friend request
 */
router.post(
  '/friends/:userId/add',
  requireAuth,
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const requesterId = req.user?.uid;
    const { userId } = req.params;

    if (!requesterId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (requesterId === userId) {
      res.status(400).json({ error: 'Cannot add yourself as friend' });
      return;
    }

    // Check if already friends or request exists
    const existing = await db`
      SELECT status FROM friends
      WHERE (user_id = ${requesterId} AND friend_id = ${userId})
         OR (user_id = ${userId} AND friend_id = ${requesterId})
    `;

    if (existing.length > 0) {
      res.status(400).json({ error: 'Already friends or request pending' });
      return;
    }

    // Create friend request
    await db`
      INSERT INTO friends (user_id, friend_id, status, created_at)
      VALUES (${requesterId}, ${userId}, 'pending', NOW())
    `;

    res.status(200).json({
      success: true,
      message: 'Friend request sent',
    });

    logger.info('Friend request sent', { requesterId, userId });
  })
);

/**
 * POST /api/social/friends/:requesterId/accept - Accept friend request
 */
router.post(
  '/friends/:requesterId/accept',
  requireAuth,
  validateParams(z.object({ requesterId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { requesterId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Update friend request to accepted
    await db`
      UPDATE friends
      SET status = 'accepted'
      WHERE user_id = ${requesterId} AND friend_id = ${userId} AND status = 'pending'
    `;

    res.json({
      success: true,
      message: 'Friend request accepted',
    });

    logger.info('Friend request accepted', { userId, requesterId });
  })
);

/**
 * POST /api/social/friends/:userId/remove - Remove friend
 */
router.post(
  '/friends/:userId/remove',
  requireAuth,
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const currentUserId = req.user?.uid;
    const { userId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Delete friendship both ways
    await db`
      DELETE FROM friends
      WHERE (user_id = ${currentUserId} AND friend_id = ${userId})
         OR (user_id = ${userId} AND friend_id = ${currentUserId})
    `;

    res.json({
      success: true,
      message: 'Friend removed',
    });

    logger.info('Friend removed', { currentUserId, userId });
  })
);

/**
 * GET /api/social/friends - Get friends list
 */
router.get(
  '/friends',
  requireAuth,
  validateQuery(
    z.object({
      status: z.enum(['pending', 'accepted']).optional().default('accepted'),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { status } = req.query as any;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const friends = await db`
      SELECT
        CASE
          WHEN f.user_id = ${userId} THEN f.friend_id
          ELSE f.user_id
        END as friend_id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.rating,
        f.status,
        f.created_at
      FROM friends f
      JOIN users u ON (
        CASE
          WHEN f.user_id = ${userId} THEN f.friend_id = u.id
          ELSE f.user_id = u.id
        END
      )
      WHERE (f.user_id = ${userId} OR f.friend_id = ${userId})
        AND f.status = ${status}
      ORDER BY f.created_at DESC
    `;

    res.json({
      userId,
      status,
      total: friends.length,
      friends: friends.map((f: any) => ({
        userId: f.friend_id,
        username: f.username,
        displayName: f.display_name,
        avatar: f.avatar_url,
        rating: f.rating,
        status: f.status,
        addedAt: f.created_at,
      })),
    });

    logger.debug('Friends list retrieved', { userId });
  })
);

/**
 * POST /api/social/block/:userId - Block user
 */
router.post(
  '/block/:userId',
  requireAuth,
  validateParams(z.object({ userId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const currentUserId = req.user?.uid;
    const { userId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if already blocked
    const existing = await db`
      SELECT id FROM blocked_users
      WHERE user_id = ${currentUserId} AND blocked_user_id = ${userId}
    `;

    if (existing.length > 0) {
      res.status(400).json({ error: 'User already blocked' });
      return;
    }

    // Block user
    await db`
      INSERT INTO blocked_users (user_id, blocked_user_id, created_at)
      VALUES (${currentUserId}, ${userId}, NOW())
    `;

    res.json({
      success: true,
      message: 'User blocked',
    });

    logger.info('User blocked', { currentUserId, blockedUserId: userId });
  })
);

/**
 * POST /api/social/clans - Create clan
 */
router.post(
  '/clans',
  requireAuth,
  validateBody(
    z.object({
      name: z.string().min(1).max(50),
      description: z.string().optional(),
      isPublic: z.boolean().default(true),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { name, description, isPublic } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Create clan
    const clans = await db`
      INSERT INTO clans (name, description, is_public, founder_id, created_at)
      VALUES (${name}, ${description || null}, ${isPublic}, ${userId}, NOW())
      RETURNING *
    `;

    const clan = clans[0];

    // Add founder as member
    await db`
      INSERT INTO clan_members (clan_id, user_id, role, joined_at)
      VALUES (${clan.id}, ${userId}, 'founder', NOW())
    `;

    res.status(201).json({
      id: clan.id,
      name: clan.name,
      description: clan.description,
      isPublic: clan.is_public,
      founderId: clan.founder_id,
      memberCount: 1,
      createdAt: clan.created_at,
    });

    logger.info('Clan created', { clanId: clan.id, founderId: userId });
  })
);

/**
 * GET /api/social/clans - List clans
 */
router.get(
  '/clans',
  validateQuery(
    z.object({
      isPublic: z.enum(['true', 'false']).optional(),
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      offset: z.coerce.number().min(0).optional().default(0),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { isPublic, limit, offset } = req.query as any;

    let query = db`
      SELECT
        c.*,
        COUNT(cm.id) as member_count
      FROM clans c
      LEFT JOIN clan_members cm ON c.id = cm.clan_id
      WHERE c.is_public = ${isPublic === 'false' ? false : true}
      GROUP BY c.id
      ORDER BY member_count DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const clans = await query;

    res.json({
      limit,
      offset,
      total: clans.length,
      clans: clans.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPublic: c.is_public,
        founderId: c.founder_id,
        memberCount: parseInt(c.member_count),
        createdAt: c.created_at,
      })),
    });

    logger.debug('Clans listed', { isPublic });
  })
);

/**
 * POST /api/social/clans/:clanId/join - Join clan
 */
router.post(
  '/clans/:clanId/join',
  requireAuth,
  validateParams(z.object({ clanId: z.string().uuid() })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;
    const { clanId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check already member
    const existing = await db`
      SELECT id FROM clan_members
      WHERE clan_id = ${clanId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      res.status(400).json({ error: 'Already a member of this clan' });
      return;
    }

    // Add member
    await db`
      INSERT INTO clan_members (clan_id, user_id, role, joined_at)
      VALUES (${clanId}, ${userId}, 'member', NOW())
    `;

    res.json({
      success: true,
      message: 'Joined clan',
    });

    logger.info('Player joined clan', { clanId, userId });
  })
);

export default router;
