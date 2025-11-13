/**
 * @classic-games/logger
 *
 * Structured logging and error handling for Classic Games
 * Provides custom error classes, Pino-based logging, and performance tracking.
 *
 * Usage:
 * ```typescript
 * import { createLogger, InvalidMoveError } from '@classic-games/logger';
 *
 * const logger = createLogger({ name: 'my-module' });
 * logger.info('Game started', { gameId: '123' });
 *
 * try {
 *   // game logic
 * } catch (error) {
 *   logger.error('Game error', error, { gameId: '123' });
 * }
 * ```
 */

export {
  ClassicGamesError,
  InvalidMoveError,
  GameStateError,
  GameNotFoundError,
  PlayerNotFoundError,
  InsufficientChipsError,
  PlayerAlreadyInGameError,
  RoomNotFoundError,
  RoomFullError,
  InvalidRoomPasswordError,
  ValidationError,
  InvalidInputError,
  WebSocketError,
  ConnectionLostError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  QueryError,
  ConfigurationError,
  isClassicGamesError,
  extractErrorDetails,
  type ClassicGamesError as IClassicGamesError,
} from './errors';

export {
  createLogger,
  StructuredLogger,
  initializeGlobalLogger,
  getLogger,
  PerformanceTimer,
  type LogLevel,
} from './logger';
