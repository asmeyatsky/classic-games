/**
 * Structured Logger for Classic Games
 *
 * Provides structured logging using Pino with context tracking,
 * performance monitoring, and error reporting.
 */

import pino from 'pino';
import { isClassicGamesError, extractErrorDetails } from './errors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  [key: string]: unknown;
}

interface LoggerOptions {
  name: string;
  level?: LogLevel;
  environment?: 'development' | 'staging' | 'production';
  enableStack?: boolean;
}

/**
 * Create a structured logger instance
 */
export function createLogger(options: LoggerOptions) {
  const environment = options.environment || process.env.NODE_ENV || 'development';
  const isDevelopment = environment === 'development';

  const pinoLogger = pino({
    name: options.name,
    level: options.level || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    formatters: {
      level: (label) => ({
        level: label,
      }),
    },
  });

  return new StructuredLogger(pinoLogger, options.enableStack ?? true);
}

/**
 * Main Structured Logger Class
 */
export class StructuredLogger {
  private logger: pino.Logger;
  private enableStack: boolean;

  constructor(pinoLogger: pino.Logger, enableStack: boolean = true) {
    this.logger = pinoLogger;
    this.enableStack = enableStack;
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: LogContext) {
    this.logger.debug(context, message);
  }

  /**
   * Log at info level
   */
  info(message: string, context?: LogContext) {
    this.logger.info(context, message);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: LogContext) {
    this.logger.warn(context, message);
  }

  /**
   * Log at error level with error details
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorDetails = error ? extractErrorDetails(error) : {};

    this.logger.error(
      {
        ...context,
        error: errorDetails,
        stack: this.enableStack && error instanceof Error ? error.stack : undefined,
      },
      message
    );
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    const errorDetails = error ? extractErrorDetails(error) : {};

    this.logger.fatal(
      {
        ...context,
        error: errorDetails,
        stack: this.enableStack && error instanceof Error ? error.stack : undefined,
      },
      message
    );
  }

  /**
   * Log incoming HTTP request
   */
  logRequest(method: string, path: string, context?: LogContext) {
    this.info(`[${method}] ${path}`, {
      http: {
        method,
        path,
      },
      ...context,
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this.logger[level](
      {
        http: {
          method,
          path,
          statusCode,
        },
        duration,
        ...context,
      },
      `[${method}] ${path} ${statusCode}`
    );
  }

  /**
   * Log game event
   */
  logGameEvent(
    gameId: string,
    event: string,
    playerId?: string,
    context?: LogContext
  ) {
    this.info(`Game Event: ${event}`, {
      game: {
        id: gameId,
        event,
        playerId,
      },
      ...context,
    });
  }

  /**
   * Log player action
   */
  logPlayerAction(
    gameId: string,
    playerId: string,
    action: string,
    context?: LogContext
  ) {
    this.info(`Player Action: ${action}`, {
      game: {
        id: gameId,
        playerId,
        action,
      },
      ...context,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : 'debug';

    this.logger[level](
      {
        performance: {
          operation,
          duration,
          unit: 'ms',
        },
        ...context,
      },
      `Performance: ${operation} took ${duration}ms`
    );
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): StructuredLogger {
    const childLogger = this.logger.child(context);
    return new StructuredLogger(childLogger, this.enableStack);
  }

  /**
   * Get underlying Pino logger
   */
  getPinoLogger(): pino.Logger {
    return this.logger;
  }
}

/**
 * Global logger instance
 */
let globalLogger: StructuredLogger | null = null;

/**
 * Initialize global logger
 */
export function initializeGlobalLogger(options: LoggerOptions): StructuredLogger {
  globalLogger = createLogger(options);
  return globalLogger;
}

/**
 * Get global logger instance (must be initialized first)
 */
export function getLogger(): StructuredLogger {
  if (!globalLogger) {
    globalLogger = createLogger({
      name: 'classic-games',
      level: 'info',
    });
  }
  return globalLogger;
}

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.startTime = performance.now();
    this.logger = logger || getLogger();
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsed(): number {
    return Math.round(performance.now() - this.startTime);
  }

  /**
   * Log elapsed time
   */
  log(operation: string, context?: LogContext) {
    const elapsed = this.getElapsed();
    this.logger.logPerformance(operation, elapsed, context);
    return elapsed;
  }

  /**
   * Get elapsed and reset
   */
  reset(): number {
    const elapsed = this.getElapsed();
    this.startTime = performance.now();
    return elapsed;
  }
}
