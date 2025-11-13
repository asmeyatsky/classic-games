/**
 * Classic Games API Server
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from '@classic-games/database';
import { initializeFirebaseAdmin } from '@classic-games/auth';
import { initializeSentry, initializeWebVitals } from '@classic-games/analytics';
import {
  initializeGlobalLogger,
  getLogger,
} from '@classic-games/logger';
import { SERVER_CONFIG } from '@classic-games/config';
import { errorHandler, notFoundHandler } from './middleware/error';
import { attachUserInfo, requireAuth } from '@classic-games/auth';
import userRoutes from './routes/users';
import roomRoutes from './routes/rooms';
import leaderboardRoutes from './routes/leaderboard';

// Initialize logger
const logger = initializeGlobalLogger({
  name: 'classic-games-api',
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
});

const app: Express = express();
const PORT = process.env.PORT || SERVER_CONFIG.PORTS.DEVELOPMENT;

/**
 * Initialize services
 */
async function initializeServices() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'classic_games',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
    logger.info('✓ Database initialized');

    // Initialize Firebase Admin
    if (process.env.FIREBASE_PROJECT_ID) {
      logger.info('Initializing Firebase Admin...');
      initializeFirebaseAdmin({
        projectId: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY || '',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
      });
      logger.info('✓ Firebase Admin initialized');
    }

    // Initialize Sentry
    if (process.env.SENTRY_DSN) {
      logger.info('Initializing Sentry...');
      initializeSentry({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
      });
      logger.info('✓ Sentry initialized');
    }
  } catch (error) {
    logger.fatal('Failed to initialize services', error);
    process.exit(1);
  }
}

/**
 * Middleware setup
 */
function setupMiddleware() {
  // Security
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8081'],
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logResponse(req.method, req.path, res.statusCode, duration);
    });

    next();
  });

  // Auth attachment
  app.use(attachUserInfo);
}

/**
 * Routes setup
 */
function setupRoutes() {
  // Health check
  app.get('/health', async (req: Request, res: Response) => {
    try {
      const { getHealthStatus } = await import('@classic-games/database');
      const health = await getHealthStatus();

      res.json({
        status: 'ok',
        database: health.status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Service unavailable',
      });
    }
  });

  // API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);
}

/**
 * Start server
 */
async function start() {
  try {
    await initializeServices();
    setupMiddleware();
    setupRoutes();

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        nodeEnv: process.env.NODE_ENV,
      });
    });
  } catch (error) {
    logger.fatal('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
start();

export default app;
