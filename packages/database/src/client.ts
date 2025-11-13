/**
 * PostgreSQL Database Client
 *
 * Provides connection management, pooling, and query utilities
 */

import postgres, { Sql } from 'postgres';
import { getLogger } from '@classic-games/logger';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutSeconds?: number;
  connectionTimeoutSeconds?: number;
}

let dbInstance: Sql | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(config: DatabaseConfig): Promise<Sql> {
  if (dbInstance) {
    return dbInstance;
  }

  const logger = getLogger();

  try {
    dbInstance = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      max: config.max || 20,
      idle_timeout: config.idleTimeoutSeconds || 30,
      connect_timeout: config.connectionTimeoutSeconds || 5,
      ssl: false, // Set to true in production
      onnotice: (notice) => {
        logger.debug(`Database Notice: ${notice.message}`);
      },
    });

    // Test connection
    await dbInstance`SELECT 1`;
    logger.info('Database connected successfully');

    return dbInstance;
  } catch (error) {
    logger.fatal('Failed to connect to database', error);
    throw error;
  }
}

/**
 * Get database instance (must be initialized first)
 */
export function getDatabase(): Sql {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Execute raw SQL query
 */
export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const db = getDatabase();
  return db.unsafe(sql, values) as Promise<T[]>;
}

/**
 * Begin transaction
 */
export async function transaction<T>(
  callback: (sql: Sql) => Promise<T>
): Promise<T> {
  const db = getDatabase();
  const logger = getLogger();

  try {
    const result = await db.begin(callback);
    logger.debug('Transaction committed');
    return result;
  } catch (error) {
    logger.error('Transaction failed', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    const logger = getLogger();
    try {
      await dbInstance.end();
      dbInstance = null;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database', error);
    }
  }
}

/**
 * Get database health status
 */
export async function getHealthStatus(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
  try {
    const start = performance.now();
    await query('SELECT 1');
    const latency = Math.round(performance.now() - start);
    return { status: 'healthy', latency };
  } catch (error) {
    return { status: 'unhealthy', latency: -1 };
  }
}

/**
 * Export Sql type for schema definitions
 */
export type { Sql };

/**
 * Helper to ensure SQL is properly formatted
 */
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const db = getDatabase();
  return db(strings, ...values);
}
