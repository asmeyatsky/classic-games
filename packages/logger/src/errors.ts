/**
 * Custom Error Classes for Classic Games
 *
 * Provides structured error handling with context-specific error types
 * for better debugging and error recovery strategies.
 */

/**
 * Base error class for all Classic Games errors
 */
export class ClassicGamesError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ClassicGamesError.prototype);
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Game Logic Errors
 */
export class InvalidMoveError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'INVALID_MOVE', 400, context);
    Object.setPrototypeOf(this, InvalidMoveError.prototype);
  }
}

export class GameStateError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'INVALID_GAME_STATE', 400, context);
    Object.setPrototypeOf(this, GameStateError.prototype);
  }
}

export class GameNotFoundError extends ClassicGamesError {
  constructor(gameId: string) {
    super(`Game not found: ${gameId}`, 'GAME_NOT_FOUND', 404, { gameId });
    Object.setPrototypeOf(this, GameNotFoundError.prototype);
  }
}

/**
 * Player Errors
 */
export class PlayerNotFoundError extends ClassicGamesError {
  constructor(playerId: string) {
    super(`Player not found: ${playerId}`, 'PLAYER_NOT_FOUND', 404, { playerId });
    Object.setPrototypeOf(this, PlayerNotFoundError.prototype);
  }
}

export class InsufficientChipsError extends ClassicGamesError {
  constructor(playerId: string, required: number, available: number) {
    super(
      `Insufficient chips: required ${required}, available ${available}`,
      'INSUFFICIENT_CHIPS',
      400,
      { playerId, required, available }
    );
    Object.setPrototypeOf(this, InsufficientChipsError.prototype);
  }
}

export class PlayerAlreadyInGameError extends ClassicGamesError {
  constructor(playerId: string, gameId: string) {
    super(
      `Player already in game: ${playerId}`,
      'PLAYER_ALREADY_IN_GAME',
      409,
      { playerId, gameId }
    );
    Object.setPrototypeOf(this, PlayerAlreadyInGameError.prototype);
  }
}

/**
 * Room/Session Errors
 */
export class RoomNotFoundError extends ClassicGamesError {
  constructor(roomId: string) {
    super(`Room not found: ${roomId}`, 'ROOM_NOT_FOUND', 404, { roomId });
    Object.setPrototypeOf(this, RoomNotFoundError.prototype);
  }
}

export class RoomFullError extends ClassicGamesError {
  constructor(roomId: string, maxPlayers: number) {
    super(
      `Room is full: ${roomId} (max ${maxPlayers})`,
      'ROOM_FULL',
      409,
      { roomId, maxPlayers }
    );
    Object.setPrototypeOf(this, RoomFullError.prototype);
  }
}

export class InvalidRoomPasswordError extends ClassicGamesError {
  constructor(roomId: string) {
    super(
      `Invalid room password: ${roomId}`,
      'INVALID_ROOM_PASSWORD',
      401,
      { roomId }
    );
    Object.setPrototypeOf(this, InvalidRoomPasswordError.prototype);
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class InvalidInputError extends ClassicGamesError {
  constructor(field: string, reason: string) {
    super(
      `Invalid input for ${field}: ${reason}`,
      'INVALID_INPUT',
      400,
      { field, reason }
    );
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}

/**
 * WebSocket/Network Errors
 */
export class WebSocketError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'WEBSOCKET_ERROR', 500, context);
    Object.setPrototypeOf(this, WebSocketError.prototype);
  }
}

export class ConnectionLostError extends ClassicGamesError {
  constructor(playerId: string) {
    super(
      `Connection lost for player: ${playerId}`,
      'CONNECTION_LOST',
      500,
      { playerId }
    );
    Object.setPrototypeOf(this, ConnectionLostError.prototype);
  }
}

export class TimeoutError extends ClassicGamesError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation timeout: ${operation} (${timeout}ms)`,
      'TIMEOUT',
      408,
      { operation, timeout }
    );
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Authentication Errors
 */
export class AuthenticationError extends ClassicGamesError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ClassicGamesError {
  constructor(message: string = 'Not authorized') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Database Errors
 */
export class DatabaseError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, context);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class QueryError extends ClassicGamesError {
  constructor(message: string, query: string) {
    super(
      `Query error: ${message}`,
      'QUERY_ERROR',
      500,
      { query, message }
    );
    Object.setPrototypeOf(this, QueryError.prototype);
  }
}

/**
 * Configuration Errors
 */
export class ConfigurationError extends ClassicGamesError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, context);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Check if error is a Classic Games error
 */
export function isClassicGamesError(error: unknown): error is ClassicGamesError {
  return error instanceof ClassicGamesError;
}

/**
 * Extract error details safely
 */
export function extractErrorDetails(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  context?: Record<string, unknown>;
  stack?: string;
} {
  if (isClassicGamesError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}
