/**
 * WebSocket Server Setup
 * Real-time game communication using Socket.io
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getLogger } from '@classic-games/logger';
import {
  handleConnect,
  handleDisconnect,
  handleJoinRoom,
  handleGameMove,
  handleRoomChat,
  handlePlayerReady,
  handleGameStateRequest,
  handleSpectate,
  handleLeaveRoom,
  handleGameEnd,
  handleTypingIndicator,
  handleReconnect,
} from './handlers';

const logger = getLogger();

interface UserSocket {
  userId: string;
  roomId: string;
  gameId?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, UserSocket> = new Map();
  private gameSubscriptions: Map<string, Set<string>> = new Map(); // gameId -> socketIds

  constructor(httpServer: HTTPServer, corsOrigins: string[]) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      maxHttpBufferSize: 1e6, // 1MB
      pingInterval: 25000,
      pingTimeout: 20000,
    });

    this.setupMiddleware();
    this.setupEventListeners();
    this.setupErrorHandling();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware() {
    this.io.use((socket, next) => {
      const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!userId) {
        return next(new Error('Authentication error: Missing userId'));
      }

      // Attach userId to socket for later reference
      (socket.data as any).userId = userId;
      (socket.data as any).token = token;

      logger.debug('Socket authenticated', { socketId: socket.id, userId });
      next();
    });
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    this.io.on('connection', (socket: Socket) => {
      handleConnect(socket);

      // Game room events
      socket.on('room:join', (data: { userId: string; roomId: string }) =>
        handleJoinRoom(socket, data, this.userSockets)
      );

      socket.on('room:leave', (data: { userId: string; roomId: string }) =>
        handleLeaveRoom(socket, data, this.userSockets)
      );

      // Game events
      socket.on('game:move', (data: any) => handleGameMove(socket, data, this.userSockets));

      socket.on('game:state-request', (data: any) =>
        handleGameStateRequest(socket, data, this.userSockets)
      );

      socket.on('game:end', (data: any) => handleGameEnd(socket, data, this.io));

      // Chat events
      socket.on('chat:message', (data: any) => handleRoomChat(socket, data, this.userSockets));

      socket.on('chat:typing', (data: any) =>
        handleTypingIndicator(socket, data, this.userSockets)
      );

      // Player status events
      socket.on('player:ready', (data: any) => handlePlayerReady(socket, data, this.userSockets));

      // Spectator events
      socket.on('spectate:join', (data: any) => handleSpectate(socket, data, this.userSockets));

      // Connection recovery
      socket.on('connection:reconnect', (data: any) =>
        handleReconnect(socket, data, this.userSockets)
      );

      // Disconnect
      socket.on('disconnect', () => handleDisconnect(socket, this.userSockets));
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling() {
    this.io.on('error', (error: Error) => {
      logger.error('Socket.io error', error);
    });
  }

  /**
   * Broadcast game state update to specific game
   */
  public broadcastGameState(gameId: string, gameState: any) {
    this.io.to(gameId).emit('game:state-update', {
      gameId,
      state: gameState,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Game state broadcast', { gameId });
  }

  /**
   * Broadcast move to specific game
   */
  public broadcastMove(gameId: string, playerId: string, move: any) {
    this.io.to(gameId).emit('game:move-broadcast', {
      gameId,
      playerId,
      move,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Move broadcast', { gameId, playerId });
  }

  /**
   * Notify players in room that game is starting
   */
  public notifyGameStart(roomId: string, gameId: string, playerIds: string[]) {
    this.io.to(roomId).emit('game:starting', {
      roomId,
      gameId,
      players: playerIds,
      timestamp: new Date().toISOString(),
    });

    logger.info('Game start notification sent', { roomId, gameId });
  }

  /**
   * Send notification to specific player
   */
  public notifyPlayer(userId: string, event: string, data: any) {
    // Find socket(s) for this user
    for (const [socketId, userData] of this.userSockets.entries()) {
      if (userData.userId === userId) {
        this.io.to(socketId).emit(event, data);
      }
    }

    logger.debug('Player notification sent', { userId, event });
  }

  /**
   * Send notification to all players in room
   */
  public notifyRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Room notification sent', { roomId, event });
  }

  /**
   * Get connected players in room
   */
  public getPlayersInRoom(roomId: string): Set<string> {
    const players = new Set<string>();

    for (const [_socketId, userData] of this.userSockets.entries()) {
      if (userData.roomId === roomId) {
        players.add(userData.userId);
      }
    }

    return players;
  }

  /**
   * Get room member count
   */
  public getRoomMemberCount(roomId: string): number {
    return this.getPlayersInRoom(roomId).size;
  }

  /**
   * Subscribe socket to game updates
   */
  public subscribeToGame(socketId: string, gameId: string) {
    if (!this.gameSubscriptions.has(gameId)) {
      this.gameSubscriptions.set(gameId, new Set());
    }

    this.gameSubscriptions.get(gameId)!.add(socketId);
  }

  /**
   * Unsubscribe socket from game updates
   */
  public unsubscribeFromGame(socketId: string, gameId: string) {
    const subs = this.gameSubscriptions.get(gameId);

    if (subs) {
      subs.delete(socketId);

      if (subs.size === 0) {
        this.gameSubscriptions.delete(gameId);
      }
    }
  }

  /**
   * Get IO instance for advanced usage
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Shutdown server
   */
  public async shutdown() {
    logger.info('Shutting down WebSocket server');
    await this.io.close();
  }
}

/**
 * Create and return WebSocket server instance
 */
export function initializeWebSocketServer(
  httpServer: HTTPServer,
  corsOrigins: string[]
): WebSocketServer {
  const wsServer = new WebSocketServer(httpServer, corsOrigins);
  logger.info('WebSocket server initialized');
  return wsServer;
}
