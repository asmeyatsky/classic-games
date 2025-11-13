/**
 * Game Routes - Handles game creation, moves, and state management
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '@classic-games/database';
import { requireAuth, AuthenticatedRequest } from '@classic-games/auth';
import {
  PokerMoveSchema,
  BackgammonMoveSchema,
  ScrabblePlacementSchema,
} from '@classic-games/validation';
import { getLogger, GameNotFoundError, InvalidMoveError } from '@classic-games/logger';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { trackGameStart, trackGameEnd, trackMove } from '@classic-games/analytics';
import { z } from 'zod';
import { PokerGame } from '@classic-games/game-engine';
import { BackgammonGame } from '@classic-games/game-engine';
import { ScrabbleGame } from '@classic-games/game-engine';

const router = Router();
const logger = getLogger();

/**
 * POST /api/games - Create and start a new game
 */
router.post(
  '/',
  requireAuth,
  validateBody(
    z.object({
      roomId: z.string().uuid(),
    })
  ),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { roomId } = req.body;

    // Get room details
    const rooms = await db`SELECT * FROM rooms WHERE id = ${roomId}`;

    if (rooms.length === 0) {
      throw new GameNotFoundError(roomId);
    }

    const room = rooms[0];

    // Get all players in room
    const players = await db`
      SELECT user_id FROM room_players
      WHERE room_id = ${roomId} AND status = 'active'
      ORDER BY joined_at ASC
    `;

    if (players.length < 2) {
      res.status(400).json({
        error: 'Not enough players to start game',
        required: 2,
        current: players.length,
      });
      return;
    }

    // Initialize game based on game type
    let gameState: any;
    let gameEngine: any;

    if (room.game_type === 'poker') {
      gameEngine = new PokerGame({
        playerCount: players.length,
        initialChips: 1000,
        smallBlind: 10,
        bigBlind: 20,
      });
      gameState = gameEngine.getState();
    } else if (room.game_type === 'backgammon') {
      gameEngine = new BackgammonGame();
      gameState = gameEngine.getState();
    } else if (room.game_type === 'scrabble') {
      gameEngine = new ScrabbleGame();
      gameState = gameEngine.getState();
    } else {
      throw new Error(`Unknown game type: ${room.game_type}`);
    }

    // Create game session
    const gameSessions = await db`
      INSERT INTO game_sessions (
        room_id, game_type, current_player_id, state, move_count, status, created_at
      )
      VALUES (
        ${roomId},
        ${room.game_type},
        ${players[0].user_id},
        ${JSON.stringify(gameState)},
        0,
        'active',
        NOW()
      )
      RETURNING *
    `;

    const gameSession = gameSessions[0];

    // Update room status
    await db`
      UPDATE rooms SET status = 'playing', started_at = NOW()
      WHERE id = ${roomId}
    `;

    // Track game start
    trackGameStart(
      gameSession.id,
      room.game_type,
      players.map((p: any) => p.user_id)
    );

    logger.info('Game created and started', {
      gameId: gameSession.id,
      gameType: room.game_type,
      playerCount: players.length,
      roomId,
    });

    res.status(201).json({
      gameId: gameSession.id,
      roomId,
      gameType: room.game_type,
      currentPlayerId: gameSession.current_player_id,
      status: gameSession.status,
      moveCount: 0,
      createdAt: gameSession.created_at,
      playerCount: players.length,
    });
  })
);

/**
 * GET /api/games/:gameId - Get game state
 */
router.get(
  '/:gameId',
  validateParams(z.object({ gameId: z.string().uuid() })),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameId } = req.params;

    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      throw new GameNotFoundError(gameId);
    }

    const game = games[0];

    // Get all moves for this game
    const moves = await db`
      SELECT * FROM game_moves
      WHERE game_session_id = ${gameId}
      ORDER BY move_number ASC
    `;

    // Get room info for player list
    const room = await db`SELECT * FROM rooms WHERE id = ${game.room_id}`;
    const players = await db`
      SELECT rp.user_id, u.username, u.display_name, rp.status
      FROM room_players rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${game.room_id}
      ORDER BY rp.joined_at ASC
    `;

    res.json({
      gameId: game.id,
      roomId: game.room_id,
      gameType: game.game_type,
      status: game.status,
      currentPlayerId: game.current_player_id,
      state: JSON.parse(game.state),
      moveCount: game.move_count,
      winnerId: game.winner_id,
      durationSeconds: game.duration_seconds,
      createdAt: game.created_at,
      startedAt: game.started_at,
      completedAt: game.completed_at,
      room: {
        id: room[0].id,
        name: room[0].name,
        maxPlayers: room[0].max_players,
      },
      players: players.map((p: any) => ({
        userId: p.user_id,
        username: p.username,
        displayName: p.display_name,
        status: p.status,
      })),
      moves: moves.map((m: any) => ({
        moveNumber: m.move_number,
        playerId: m.player_id,
        action: m.action,
        details: m.details ? JSON.parse(m.details) : null,
        durationSeconds: m.duration_seconds,
        timestamp: m.created_at,
      })),
    });

    logger.info('Game state retrieved', { gameId });
  })
);

/**
 * POST /api/games/:gameId/move - Make a move in the game
 */
router.post(
  '/:gameId/move',
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

    // Get game session
    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      throw new GameNotFoundError(gameId);
    }

    const game = games[0];

    // Check if it's the current player's turn
    if (game.current_player_id !== userId) {
      throw new InvalidMoveError(`It is not your turn. Current player: ${game.current_player_id}`);
    }

    // Check game is active
    if (game.status !== 'active') {
      throw new InvalidMoveError(`Game is not active. Status: ${game.status}`);
    }

    const moveStartTime = Date.now();
    const { action, details } = req.body;

    // Validate move based on game type
    let validatedMove: any;

    if (game.game_type === 'poker') {
      validatedMove = PokerMoveSchema.parse({ action, details });
    } else if (game.game_type === 'backgammon') {
      validatedMove = BackgammonMoveSchema.parse({ action, details });
    } else if (game.game_type === 'scrabble') {
      validatedMove = ScrabblePlacementSchema.parse(details);
      validatedMove.action = 'placement';
    } else {
      throw new Error(`Unknown game type: ${game.game_type}`);
    }

    // Reconstruct game state from moves
    const previousMoves = await db`
      SELECT * FROM game_moves
      WHERE game_session_id = ${gameId}
      ORDER BY move_number ASC
    `;

    const gameState = JSON.parse(game.state);
    const gameEngine =
      game.game_type === 'poker'
        ? new PokerGame(gameState)
        : game.game_type === 'backgammon'
          ? new BackgammonGame(gameState)
          : new ScrabbleGame(gameState);

    // Apply the move
    const moveResult = gameEngine.makeMove(userId, validatedMove);

    if (!moveResult.valid) {
      throw new InvalidMoveError(moveResult.reason || 'Invalid move');
    }

    const moveDurationSeconds = Math.round((Date.now() - moveStartTime) / 1000);
    const newGameState = gameEngine.getState();

    // Store the move
    await db`
      INSERT INTO game_moves (
        game_session_id, player_id, move_number, action, details,
        duration_seconds, created_at
      )
      VALUES (
        ${gameId},
        ${userId},
        ${game.move_count + 1},
        ${validatedMove.action},
        ${JSON.stringify(validatedMove.details || validatedMove)},
        ${moveDurationSeconds},
        NOW()
      )
    `;

    // Update game session state
    const nextPlayer = newGameState.currentPlayer || null;
    const isGameOver = newGameState.isGameOver || false;

    await db`
      UPDATE game_sessions
      SET
        state = ${JSON.stringify(newGameState)},
        move_count = move_count + 1,
        current_player_id = ${nextPlayer},
        status = ${isGameOver ? 'completed' : 'active'},
        completed_at = ${isGameOver ? new Date() : null},
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))::int
      WHERE id = ${gameId}
    `;

    // If game is over, record results and update ratings
    if (isGameOver && newGameState.winner) {
      const winnerId = newGameState.winner;
      const loserIds = newGameState.players
        .filter((p: any) => p.id !== winnerId)
        .map((p: any) => p.id);
      const points = newGameState.points || {};

      await db`
        INSERT INTO game_results (
          game_session_id, winner_id, loser_ids, points, rating_change,
          prize_pool, created_at
        )
        VALUES (
          ${gameId},
          ${winnerId},
          ${JSON.stringify(loserIds)},
          ${JSON.stringify(points)},
          ${JSON.stringify(newGameState.ratingChanges || {})},
          ${newGameState.prizePool || 0},
          NOW()
        )
      `;

      // Update user stats
      const ratingColumn =
        game.game_type === 'poker'
          ? 'poker_rating'
          : game.game_type === 'backgammon'
            ? 'backgammon_rating'
            : 'scrabble_rating';

      const winsColumn =
        game.game_type === 'poker'
          ? 'poker_wins'
          : game.game_type === 'backgammon'
            ? 'backgammon_wins'
            : 'scrabble_wins';

      const lossesColumn =
        game.game_type === 'poker'
          ? 'poker_losses'
          : game.game_type === 'backgammon'
            ? 'backgammon_losses'
            : 'scrabble_losses';

      // Update winner
      await db`
        UPDATE game_stats
        SET ${db.raw(winsColumn)} = ${db.raw(winsColumn)} + 1,
            ${db.raw(ratingColumn)} = ${db.raw(ratingColumn)} + ${newGameState.ratingChanges?.[winnerId] || 0}
        WHERE user_id = ${winnerId}
      `;

      // Update losers
      for (const loserId of loserIds) {
        await db`
          UPDATE game_stats
          SET ${db.raw(lossesColumn)} = ${db.raw(lossesColumn)} + 1,
              ${db.raw(ratingColumn)} = ${db.raw(ratingColumn)} + ${newGameState.ratingChanges?.[loserId] || 0}
          WHERE user_id = ${loserId}
        `;
      }

      trackGameEnd(gameId, game.game_type, winnerId, loserIds);
    }

    trackMove(gameId, userId, validatedMove.action);

    logger.info('Move made in game', {
      gameId,
      playerId: userId,
      action: validatedMove.action,
      moveNumber: game.move_count + 1,
      gameOver: isGameOver,
    });

    res.json({
      success: true,
      gameId,
      moveNumber: game.move_count + 1,
      nextPlayerId: nextPlayer,
      gameOver: isGameOver,
      gameState: isGameOver ? null : newGameState,
      result: isGameOver
        ? {
            winnerId: newGameState.winner,
            loserIds: newGameState.players
              .filter((p: any) => p.id !== newGameState.winner)
              .map((p: any) => p.id),
            points: newGameState.points || {},
            ratingChanges: newGameState.ratingChanges || {},
          }
        : null,
    });
  })
);

/**
 * GET /api/games/:gameId/history - Get move history
 */
router.get(
  '/:gameId/history',
  validateParams(z.object({ gameId: z.string().uuid() })),
  validateQuery(
    z.object({
      limit: z.coerce.number().min(1).max(1000).optional().default(100),
      offset: z.coerce.number().min(0).optional().default(0),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDatabase();
    const { gameId } = req.params;
    const { limit, offset } = req.query as any;

    // Verify game exists
    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      throw new GameNotFoundError(gameId);
    }

    // Get moves with player info
    const moves = await db`
      SELECT
        gm.*,
        u.username,
        u.display_name
      FROM game_moves gm
      JOIN users u ON gm.player_id = u.id
      WHERE gm.game_session_id = ${gameId}
      ORDER BY gm.move_number ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json({
      gameId,
      totalMoves: games[0].move_count,
      limit,
      offset,
      moves: moves.map((m: any) => ({
        moveNumber: m.move_number,
        playerId: m.player_id,
        playerName: m.username,
        playerDisplayName: m.display_name,
        action: m.action,
        details: m.details ? JSON.parse(m.details) : null,
        durationSeconds: m.duration_seconds,
        timestamp: m.created_at,
      })),
    });

    logger.info('Game history retrieved', { gameId, limit, offset });
  })
);

/**
 * POST /api/games/:gameId/resign - Resign from game
 */
router.post(
  '/:gameId/resign',
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

    const games = await db`SELECT * FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      throw new GameNotFoundError(gameId);
    }

    const game = games[0];

    if (game.status === 'completed') {
      throw new InvalidMoveError('Game is already completed');
    }

    // Get all players
    const players = await db`
      SELECT user_id FROM room_players WHERE room_id = ${game.room_id}
    `;

    const winnerId = players.find((p: any) => p.user_id !== userId)?.user_id;
    const loserIds = [userId];

    // Record game result
    await db`
      INSERT INTO game_results (
        game_session_id, winner_id, loser_ids, created_at
      )
      VALUES (${gameId}, ${winnerId}, ${JSON.stringify(loserIds)}, NOW())
    `;

    // Update game session
    await db`
      UPDATE game_sessions
      SET status = 'completed', winner_id = ${winnerId}, completed_at = NOW(),
          duration_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))::int
      WHERE id = ${gameId}
    `;

    trackGameEnd(gameId, game.game_type, winnerId, loserIds);

    logger.info('Player resigned from game', {
      gameId,
      playerId: userId,
      winnerId,
    });

    res.json({
      success: true,
      gameId,
      winnerId,
      reason: 'Player resigned',
    });
  })
);

export default router;
