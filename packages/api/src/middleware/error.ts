/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import {
  ClassicGamesError,
  isClassicGamesError,
  extractErrorDetails,
  getLogger,
} from '@classic-games/logger';
import { captureException } from '@classic-games/analytics';

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
}

/**
 * Global error handler
 */
export function errorHandler(
  error: Error | unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const logger = getLogger();

  if (isClassicGamesError(error)) {
    // Game-specific error
    logger.warn(error.message, undefined, {
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    });

    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      ...(error.context && { context: error.context }),
    });
    return;
  }

  // Unknown error
  const details = extractErrorDetails(error);
  logger.error('Unhandled error', error);

  // Capture in Sentry
  if (error instanceof Error) {
    captureException(error, {
      path: req.path,
      method: req.method,
      userId: (req as any).user?.uid,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: details.message,
      stack: details.stack,
    }),
  });
}

/**
 * Async route handler wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
