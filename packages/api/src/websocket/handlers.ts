/**
 * WebSocket Event Handlers
 * Handles real-time game communication via Socket.io
 */

import { Socket } from 'socket.io';
import { getDatabase } from '@classic-games/database';
import { getLogger } from '@classic-games/logger';
import { trackGameEvent } from '@classic-games/analytics';

const logger = getLogger();

interface UserSocket {
  userId: string;
  roomId: string;
  gameId?: string;
}

/**
 * Handles user connection
 */
export function handleConnect(socket: Socket) {
  logger.debug('Client connected', { socketId: socket.id });
}

/**
 * Handles user disconnect
 */
export function handleDisconnect(socket: Socket, userSockets: Map<string, UserSocket>) {
  const socketData = userSockets.get(socket.id);

  if (socketData) {
    logger.info('Client disconnected', {
      socketId: socket.id,
      userId: socketData.userId,
      roomId: socketData.roomId,
    });

    // Notify room that player left
    socket.to(socketData.roomId).emit('player:left', {
      userId: socketData.userId,
      roomId: socketData.roomId,
      timestamp: new Date().toISOString(),
    });

    userSockets.delete(socket.id);
  }
}

/**
 * Handles player joining a room
 */
export function handleJoinRoom(
  socket: Socket,
  data: { userId: string; roomId: string },
  userSockets: Map<string, UserSocket>
) {
  const { userId, roomId } = data;

  // Store socket mapping
  userSockets.set(socket.id, { userId, roomId });

  // Join socket.io room
  socket.join(roomId);

  logger.info('Player joined room via WebSocket', { socketId: socket.id, userId, roomId });

  // Broadcast player joined event
  socket.to(roomId).emit('player:joined', {
    userId,
    roomId,
    timestamp: new Date().toISOString(),
  });

  // Confirm join to client
  socket.emit('room:joined', {
    success: true,
    roomId,
    socketId: socket.id,
  });
}

/**
 * Handles game state updates
 */
export async function handleGameMove(
  socket: Socket,
  data: { gameId: string; move: any; userId: string },
  userSockets: Map<string, UserSocket>
) {
  const { gameId, move, userId } = data;
  const socketData = userSockets.get(socket.id);

  if (!socketData) {
    socket.emit('error', { message: 'Not connected to room' });
    return;
  }

  try {
    const db = getDatabase();

    // Get game session to find the room
    const games = await db`SELECT room_id FROM game_sessions WHERE id = ${gameId}`;

    if (games.length === 0) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const roomId = games[0].room_id;

    // Broadcast move to all players in room
    socket.to(roomId).emit('game:move', {
      gameId,
      move,
      playerId: userId,
      timestamp: new Date().toISOString(),
    });

    // Confirm move accepted
    socket.emit('game:move-acknowledged', {
      gameId,
      success: true,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Game move broadcast', { gameId, userId, roomId });
    trackGameEvent({
      gameId,
      eventType: 'move',
      playerId: userId,
      details: move,
    });
  } catch (error) {
    logger.error('Error handling game move', error);
    socket.emit('error', { message: 'Failed to process move' });
  }
}

/**
 * Handles chat messages in room
 */
export function handleRoomChat(
  socket: Socket,
  data: { message: string; userId: string; username: string },
  userSockets: Map<string, UserSocket>
) {
  const socketData = userSockets.get(socket.id);

  if (!socketData) {
    socket.emit('error', { message: 'Not connected to room' });
    return;
  }

  const { message, userId, username } = data;
  const { roomId } = socketData;

  // Validate message
  if (!message || message.trim().length === 0 || message.length > 500) {
    socket.emit('error', { message: 'Invalid message' });
    return;
  }

  const chatMessage = {
    userId,
    username,
    message: message.trim(),
    roomId,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to all in room (including sender)
  socket.to(roomId).emit('chat:message', chatMessage);
  socket.emit('chat:message-sent', { success: true, ...chatMessage });

  logger.debug('Chat message sent', { userId, roomId, messageLength: message.length });
}

/**
 * Handles player ready status in room
 */
export function handlePlayerReady(
  socket: Socket,
  data: { userId: string; isReady: boolean },
  userSockets: Map<string, UserSocket>
) {
  const socketData = userSockets.get(socket.id);

  if (!socketData) {
    socket.emit('error', { message: 'Not connected to room' });
    return;
  }

  const { userId, isReady } = data;
  const { roomId } = socketData;

  // Broadcast ready status
  socket.to(roomId).emit('player:ready-status', {
    userId,
    isReady,
    roomId,
    timestamp: new Date().toISOString(),
  });

  socket.emit('player:ready-acknowledged', {
    success: true,
    userId,
    isReady,
  });

  logger.debug('Player ready status', { userId, roomId, isReady });
}

/**
 * Handles game state requests
 */
export async function handleGameStateRequest(
  socket: Socket,
  data: { gameId: string; userId: string },
  userSockets: Map<string, UserSocket>
) {
  const { gameId, userId } = data;

  try {
    const db = getDatabase();

    // Get game state
    const games = await db`
      SELECT state, current_player_id, status, room_id
      FROM game_sessions
      WHERE id = ${gameId}
    `;

    if (games.length === 0) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const game = games[0];
    const gameState = JSON.parse(game.state);

    socket.emit('game:state', {
      gameId,
      state: gameState,
      currentPlayerId: game.current_player_id,
      status: game.status,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Game state sent', { gameId, userId });
  } catch (error) {
    logger.error('Error getting game state', error);
    socket.emit('error', { message: 'Failed to get game state' });
  }
}

/**
 * Handles spectator joining
 */
export function handleSpectate(
  socket: Socket,
  data: { gameId: string; userId: string; username: string },
  userSockets: Map<string, UserSocket>
) {
  const { gameId, userId, username } = data;

  // Join spectator room (gameId + ':spectators')
  const spectatorRoom = `${gameId}:spectators`;
  socket.join(spectatorRoom);

  userSockets.set(socket.id, { userId, roomId: spectatorRoom, gameId });

  // Notify other spectators
  socket.to(spectatorRoom).emit('spectator:joined', {
    userId,
    username,
    timestamp: new Date().toISOString(),
  });

  socket.emit('spectate:joined', {
    success: true,
    gameId,
    spectatorRoom,
  });

  logger.info('Spectator joined game', { socketId: socket.id, userId, gameId });
}

/**
 * Handles player leaving room/game
 */
export async function handleLeaveRoom(
  socket: Socket,
  data: { userId: string; roomId: string },
  userSockets: Map<string, UserSocket>
) {
  const { userId, roomId } = data;
  const socketData = userSockets.get(socket.id);

  if (socketData) {
    socket.leave(roomId);

    // Notify others
    socket.to(roomId).emit('player:left', {
      userId,
      roomId,
      timestamp: new Date().toISOString(),
    });

    userSockets.delete(socket.id);

    socket.emit('room:left', {
      success: true,
      roomId,
    });

    logger.info('Player left room via WebSocket', { userId, roomId });
  }
}

/**
 * Handles game completion notification
 */
export function handleGameEnd(
  socket: Socket,
  data: {
    gameId: string;
    winnerId: string;
    loserIds: string[];
    points: Record<string, number>;
  },
  io: any
) {
  const { gameId, winnerId, loserIds, points } = data;

  // Broadcast game end to all connected players
  io.emit('game:ended', {
    gameId,
    winnerId,
    loserIds,
    points,
    timestamp: new Date().toISOString(),
  });

  logger.info('Game ended notification broadcast', { gameId, winnerId });
  trackGameEvent({
    gameId,
    eventType: 'game_end',
    playerId: winnerId,
    details: { loserIds, points },
  });
}

/**
 * Handles player typing indicator
 */
export function handleTypingIndicator(
  socket: Socket,
  data: { userId: string; isTyping: boolean },
  userSockets: Map<string, UserSocket>
) {
  const socketData = userSockets.get(socket.id);

  if (!socketData) return;

  socket.to(socketData.roomId).emit('chat:typing', {
    userId: data.userId,
    isTyping: data.isTyping,
    roomId: socketData.roomId,
  });
}

/**
 * Handles connection error recovery
 */
export function handleReconnect(
  socket: Socket,
  data: { userId: string; previousSocketId: string },
  userSockets: Map<string, UserSocket>
) {
  const { userId } = data;

  logger.info('Player reconnected', { userId, newSocketId: socket.id });

  socket.emit('reconnect:success', {
    userId,
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });
}
