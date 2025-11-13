/**
 * Request Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError, getLogger } from '@classic-games/logger';

/**
 * Validate request body against schema
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          error: 'Validation failed',
          issues,
        });
      } else {
        res.status(400).json({ error: 'Invalid request' });
      }
    }
  };
}

/**
 * Validate request query against schema
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid query parameters',
          issues: error.errors,
        });
      } else {
        res.status(400).json({ error: 'Invalid query' });
      }
    }
  };
}

/**
 * Validate request params against schema
 */
export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid URL parameters',
          issues: error.errors,
        });
      } else {
        res.status(400).json({ error: 'Invalid parameters' });
      }
    }
  };
}
