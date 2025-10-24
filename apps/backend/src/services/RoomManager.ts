/**
 * Room Manager - Game Session Management
 *
 * Handles:
 * - Room creation and destruction
 * - Player matchmaking
 * - AI opponent assignment
 * - Room availability tracking
 * - Statistics collection
 */

export interface RoomConfig {
  maxPlayers: number;
  minPlayers: number;
  timeoutSeconds: number;
  scoringMode: 'competitive' | 'casual' | 'practice';
}

export interface RoomStats {
  totalCreated: number;
  currentActive: number;
  totalGamesCompleted: number;
  averageGameDuration: number;
  totalPlayersServed: number;
}

const GAME_CONFIGS: Record<string, RoomConfig> = {
  poker: {
    maxPlayers: 6,
    minPlayers: 2,
    timeoutSeconds: 60,
    scoringMode: 'competitive'
  },
  backgammon: {
    maxPlayers: 2,
    minPlayers: 2,
    timeoutSeconds: 120,
    scoringMode: 'competitive'
  },
  scrabble: {
    maxPlayers: 4,
    minPlayers: 2,
    timeoutSeconds: 180,
    scoringMode: 'competitive'
  }
};

export class RoomManager {
  private rooms: Map<string, any> = new Map();
  private roomQueues: Map<string, string[]> = new Map(['poker', 'backgammon', 'scrabble'].map(game => [game, []]));
  private stats: RoomStats = {
    totalCreated: 0,
    currentActive: 0,
    totalGamesCompleted: 0,
    averageGameDuration: 0,
    totalPlayersServed: 0
  };

  /**
   * Create a new game room
   */
  createRoom(gameType: string): string {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = GAME_CONFIGS[gameType];

    const room = {
      id: roomId,
      gameType,
      config,
      players: [],
      aiOpponents: [],
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      gameState: null,
      isActive: false,
      status: 'waiting' // waiting, playing, completed
    };

    this.rooms.set(roomId, room);
    this.stats.totalCreated++;
    this.stats.currentActive++;

    return roomId;
  }

  /**
   * Add player to room queue (for matchmaking)
   */
  queuePlayer(gameType: string, playerId: string): string | null {
    const queue = this.roomQueues.get(gameType);
    if (!queue) return null;

    const config = GAME_CONFIGS[gameType];

    // Find matching room with space
    for (const [roomId, room] of this.rooms) {
      if (
        room.gameType === gameType &&
        room.status === 'waiting' &&
        room.players.length < config.maxPlayers
      ) {
        room.players.push(playerId);

        // Check if room can start
        if (room.players.length === config.minPlayers) {
          this.startRoom(roomId);
        }

        return roomId;
      }
    }

    // No suitable room found, create new one
    const newRoomId = this.createRoom(gameType);
    const newRoom = this.rooms.get(newRoomId);
    newRoom.players.push(playerId);

    // Add to queue if not full
    if (newRoom.players.length < config.maxPlayers) {
      queue.push(playerId);
    }

    return newRoomId;
  }

  /**
   * Start a room (begin the game)
   */
  startRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const config = GAME_CONFIGS[room.gameType];

    // Add AI opponents if needed
    while (room.players.length < config.minPlayers) {
      const aiId = `ai_${Date.now()}_${Math.random()}`;
      room.aiOpponents.push(aiId);
      room.players.push(aiId);
    }

    room.status = 'playing';
    room.isActive = true;
    room.startedAt = Date.now();

    return true;
  }

  /**
   * End a room (game finished)
   */
  endRoom(roomId: string, result: any): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.status = 'completed';
    room.isActive = false;
    room.endedAt = Date.now();

    // Update statistics
    this.stats.currentActive--;
    this.stats.totalGamesCompleted++;

    const duration = (room.endedAt - room.startedAt) / 1000 / 60; // minutes
    const totalDuration = this.stats.totalGamesCompleted * this.stats.averageGameDuration;
    this.stats.averageGameDuration = (totalDuration + duration) / this.stats.totalGamesCompleted;

    // Update players served
    const humanPlayers = room.players.filter(p => !p.startsWith('ai_')).length;
    this.stats.totalPlayersServed += humanPlayers;

    return true;
  }

  /**
   * Get room info
   */
  getRoom(roomId: string): any {
    return this.rooms.get(roomId);
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(gameType?: string): any[] {
    const active = Array.from(this.rooms.values()).filter(room => room.isActive);

    if (gameType) {
      return active.filter(room => room.gameType === gameType);
    }

    return active;
  }

  /**
   * Get room statistics
   */
  getStats(): RoomStats {
    return { ...this.stats };
  }

  /**
   * Get matchmaking queue stats
   */
  getQueueStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const [gameType, queue] of this.roomQueues) {
      stats[gameType] = queue.length;
    }

    return stats;
  }

  /**
   * Clean up old rooms
   */
  cleanupOldRooms(maxAgeHours: number = 24): number {
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    for (const [roomId, room] of this.rooms) {
      if (
        !room.isActive &&
        room.endedAt &&
        (now - room.endedAt) > maxAge
      ) {
        this.rooms.delete(roomId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get recommendation for next game
   */
  getRecommendation(playerId: string): { gameType: string; difficulty: string } {
    // This would use player history and ratings
    return {
      gameType: 'poker',
      difficulty: 'intermediate'
    };
  }
}

// Export singleton instance
export const roomManager = new RoomManager();
