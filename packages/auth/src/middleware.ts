/**
 * Express Middleware for Firebase Authentication
 */

import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from './server';
import { AuthenticationError, AuthorizationError } from '@classic-games/logger';
import { getLogger } from '@classic-games/logger';

/**
 * Express Request with auth info
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    customClaims?: Record<string, unknown>;
  };
  token?: string;
}

/**
 * Middleware to verify Firebase ID token
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const logger = getLogger();

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    req.token = token;

    // Token will be verified by verifyTokenMiddleware
    next();
  } catch (error) {
    logger.warn('Auth middleware error', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Middleware to verify and decode token
 */
export async function verifyTokenMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const logger = getLogger();

  try {
    if (!req.token) {
      throw new AuthenticationError('No token provided');
    }

    const decodedToken = await verifyIdToken(req.token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      customClaims: decodedToken as Record<string, unknown>,
    };

    next();
  } catch (error) {
    logger.warn('Token verification failed', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Combined auth middleware (extract + verify)
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    authMiddleware(req, res, () => {});
    await verifyTokenMiddleware(req, res, () => {});

    if (!req.user) {
      throw new AuthenticationError('Authentication failed');
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Require specific role/permission
 */
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const logger = getLogger();

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRoles = (req.user.customClaims?.roles as string[]) || [];
    const hasRole = userRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      logger.warn('Insufficient permissions', undefined, {
        uid: req.user.uid,
        requiredRoles: roles,
        userRoles,
      });
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}

/**
 * Optional auth middleware (doesn't fail if not authenticated)
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.token = token;

      try {
        const decodedToken = await verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          emailVerified: decodedToken.email_verified || false,
          customClaims: decodedToken as Record<string, unknown>,
        };
      } catch (error) {
        getLogger().debug('Optional token verification failed', error);
        // Continue without authentication
      }
    }

    next();
  } catch (error) {
    getLogger().error('Optional auth middleware error', error);
    next();
  }
}

/**
 * Rate limiting middleware for auth endpoints
 */
export function authRateLimit(windowMs: number = 60000, maxRequests: number = 5) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = attempts.get(identifier);

    if (!record) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (now > record.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    record.count++;

    if (record.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    next();
  };
}

/**
 * Middleware to attach user info to locals for templates
 */
export function attachUserInfo(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
}
