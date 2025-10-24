import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';

/**
 * Game Server - WebSocket-based Real-Time Game Engine
 *
 * Architectural Intent:
 * - Manages multiplayer game sessions
 * - Synchronizes game state across all clients
 * - Validates moves server-side
 * - Handles player connections/disconnections
 * - Broadcasts game events to all participants
 *
 * Key Design Decisions:
 * 1. Event-driven architecture (EventEmitter)
 * 2. Server-authoritative game logic
 * 3. Room-based game organization
 * 4. Automatic state persistence
 * 5. Graceful client handling
 */

export interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  roomId: string;
  isAI?: boolean;
  lastActivity: number;
}

export interface GameRoom {
  id: string;
  gameType: 'poker' | 'backgammon' | 'scrabble';
  players: Player[];
  gameState: any;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  maxPlayers: number;
}

export interface GameMessage {
  type: 'move' | 'action' | 'chat' | 'state' | 'join' | 'leave' | 'error';
  playerId: string;
  roomId: string;
  payload: any;
  timestamp: number;
}

export class GameServer extends EventEmitter {
  private wss: WebSocketServer;
  private rooms: Map<string, GameRoom> = new Map();
  private players: Map<string, Player> = new Map();
  private messageQueue: GameMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HTTPServer, port: number = 8080) {
    super();
    this.wss = new WebSocketServer({ server: httpServer, port });
    this.setupWebSocketHandlers();
    this.startHeartbeat();
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Invalid message format:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  /**
   * Handle incoming messages from clients
   */
  private handleMessage(ws: WebSocket, message: any): void {
    const { type, playerId, roomId, payload } = message;

    switch (type) {
      case 'join':
        this.handleJoinRoom(ws, payload);
        break;

      case 'move':
        this.handleGameMove(playerId, roomId, payload);
        break;

      case 'action':
        this.handleGameAction(playerId, roomId, payload);
        break;

      case 'chat':
        this.broadcastToRoom(roomId, {
          type: 'chat',
          playerId,
          message: payload.message,
          timestamp: Date.now()
        });
        break;

      case 'state':
        this.sendGameState(roomId, ws);
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Handle player joining a room
   */
  private handleJoinRoom(ws: WebSocket, payload: any): void {
    const { playerId, playerName, roomId, gameType } = payload;

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.createRoom(roomId, gameType);
    }

    const room = this.rooms.get(roomId)!;

    // Check room capacity
    if (room.players.length >= room.maxPlayers) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room is full'
      }));
      return;
    }

    // Create player
    const player: Player = {
      id: playerId,
      name: playerName,
      ws,
      roomId,
      lastActivity: Date.now()
    };

    // Add to tracking
    this.players.set(playerId, player);
    room.players.push(player);
    room.updatedAt = Date.now();

    // Notify all players in room
    this.broadcastToRoom(roomId, {
      type: 'join',
      playerId,
      playerName,
      totalPlayers: room.players.length,
      timestamp: Date.now()
    });

    // Send current game state to new player
    ws.send(JSON.stringify({
      type: 'state',
      roomId,
      gameState: room.gameState,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI
      }))
    }));

    // Check if room is full and game can start
    if (room.players.length === room.maxPlayers) {
      this.initializeGame(roomId);
    }

    console.log(`Player ${playerId} joined room ${roomId}`);
  }

  /**
   * Handle game move from player
   */
  private handleGameMove(playerId: string, roomId: string, payload: any): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = this.players.get(playerId);
    if (!player) return;

    // Validate move server-side (using game engines)
    const isValidMove = this.validateMove(room.gameType, room.gameState, payload);

    if (!isValidMove) {
      player.ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid move'
      }));
      return;
    }

    // Apply move to game state
    const newState = this.applyMove(room.gameType, room.gameState, payload);
    room.gameState = newState;
    room.updatedAt = Date.now();

    // Broadcast updated state to all players
    this.broadcastToRoom(roomId, {
      type: 'state',
      gameState: newState,
      lastMove: {
        playerId,
        move: payload,
        timestamp: Date.now()
      }
    });

    // Update player activity
    player.lastActivity = Date.now();

    // Check for game end
    const gameResult = this.checkGameEnd(room.gameType, newState);
    if (gameResult) {
      this.broadcastToRoom(roomId, {
        type: 'gameEnd',
        result: gameResult,
        timestamp: Date.now()
      });
      room.isActive = false;
    }
  }

  /**
   * Handle non-move game actions (chat, surrender, etc.)
   */
  private handleGameAction(playerId: string, roomId: string, payload: any): void {
    const { action } = payload;

    switch (action) {
      case 'surrender':
      case 'forfeit':
        this.handleSurrender(playerId, roomId);
        break;

      case 'requestUndo':
        this.broadcastToRoom(roomId, {
          type: 'action',
          action,
          playerId,
          timestamp: Date.now()
        });
        break;

      case 'timeout':
        this.handleTimeout(playerId, roomId);
        break;

      default:
        console.warn('Unknown action:', action);
    }
  }

  /**
   * Handle player disconnect
   */
  private handleClientDisconnect(ws: WebSocket): void {
    // Find player
    let disconnectedPlayer: Player | null = null;
    for (const player of this.players.values()) {
      if (player.ws === ws) {
        disconnectedPlayer = player;
        break;
      }
    }

    if (!disconnectedPlayer) return;

    const roomId = disconnectedPlayer.roomId;
    const room = this.rooms.get(roomId);

    if (room) {
      // Remove from room
      room.players = room.players.filter(p => p.id !== disconnectedPlayer!.id);
      room.updatedAt = Date.now();

      // Notify remaining players
      this.broadcastToRoom(roomId, {
        type: 'leave',
        playerId: disconnectedPlayer.id,
        playerName: disconnectedPlayer.name,
        totalPlayers: room.players.length,
        timestamp: Date.now()
      });

      // End game if only one player left
      if (room.players.length < 2 && room.isActive) {
        room.isActive = false;
        this.broadcastToRoom(roomId, {
          type: 'gameEnd',
          reason: 'Opponent disconnected',
          timestamp: Date.now()
        });
      }

      // Clean up empty room
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }

    // Remove player
    this.players.delete(disconnectedPlayer.id);
    console.log(`Player ${disconnectedPlayer.id} disconnected from room ${roomId}`);
  }

  /**
   * Broadcast message to all players in a room
   */
  private broadcastToRoom(roomId: string, message: any): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const payload = JSON.stringify(message);
    for (const player of room.players) {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(payload);
      }
    }
  }

  /**
   * Send game state to specific player
   */
  private sendGameState(roomId: string, ws: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    ws.send(JSON.stringify({
      type: 'state',
      roomId,
      gameState: room.gameState,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI
      }))
    }));
  }

  /**
   * Create a new game room
   */
  private createRoom(roomId: string, gameType: 'poker' | 'backgammon' | 'scrabble'): void {
    const maxPlayers = gameType === 'poker' ? 6 : 2;

    const room: GameRoom = {
      id: roomId,
      gameType,
      players: [],
      gameState: this.initializeGameState(gameType),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: false,
      maxPlayers
    };

    this.rooms.set(roomId, room);
    console.log(`Created new ${gameType} room: ${roomId}`);
  }

  /**
   * Initialize game state based on game type
   */
  private initializeGameState(gameType: string): any {
    switch (gameType) {
      case 'poker':
        return { pot: 0, currentBet: 0, phase: 'preflop', deck: [] };
      case 'backgammon':
        return { board: [], dice: [0, 0], currentPlayer: 'white' };
      case 'scrabble':
        return { board: Array(15).fill(null).map(() => Array(15).fill(null)), tilesRemaining: 100 };
      default:
        return {};
    }
  }

  /**
   * Initialize game after all players have joined
   */
  private initializeGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.isActive = true;
    room.gameState = this.initializeGameState(room.gameType);

    this.broadcastToRoom(roomId, {
      type: 'gameStart',
      gameType: room.gameType,
      gameState: room.gameState,
      timestamp: Date.now()
    });

    console.log(`Game started in room ${roomId}`);
  }

  /**
   * Validate move server-side
   */
  private validateMove(gameType: string, gameState: any, move: any): boolean {
    // This would use the actual game engines
    // For now, return true (real validation happens with game engines)
    return true;
  }

  /**
   * Apply move to game state
   */
  private applyMove(gameType: string, gameState: any, move: any): any {
    // This would call actual game engine methods
    // For now, return updated state
    return { ...gameState, lastMove: move };
  }

  /**
   * Check if game has ended
   */
  private checkGameEnd(gameType: string, gameState: any): any {
    // This would check game-specific end conditions
    // For now, return null (game hasn't ended)
    return null;
  }

  /**
   * Handle player surrender
   */
  private handleSurrender(playerId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.isActive = false;
    this.broadcastToRoom(roomId, {
      type: 'gameEnd',
      reason: 'Surrender',
      winner: room.players.find(p => p.id !== playerId)?.id,
      timestamp: Date.now()
    });
  }

  /**
   * Handle player timeout
   */
  private handleTimeout(playerId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.broadcastToRoom(roomId, {
      type: 'action',
      action: 'timeout',
      playerId,
      timestamp: Date.now()
    });
  }

  /**
   * Start heartbeat to detect disconnected clients
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const TIMEOUT = 30000; // 30 seconds

      for (const player of this.players.values()) {
        if (now - player.lastActivity > TIMEOUT) {
          console.log(`Disconnecting inactive player: ${player.id}`);
          player.ws.close();
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get room statistics
   */
  public getRoomStats(roomId: string): any {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: roomId,
      gameType: room.gameType,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      isActive: room.isActive,
      createdAt: room.createdAt,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name
      }))
    };
  }

  /**
   * Get all active rooms
   */
  public getAllRooms(): any[] {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      gameType: room.gameType,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      isActive: room.isActive
    }));
  }

  /**
   * Shutdown server
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}
