/**
 * Database Migration Management
 */

import { Sql } from '../client';
import { getLogger } from '@classic-games/logger';

interface Migration {
  name: string;
  up: (db: Sql) => Promise<void>;
  down: (db: Sql) => Promise<void>;
}

const migrations: Migration[] = [
  {
    name: '001_initial_schema',
    up: async (db) => {
      const { createAllTables } = await import('../schemas');
      await createAllTables(db);
    },
    down: async (db) => {
      const { dropAllTables } = await import('../schemas');
      await dropAllTables(db);
    },
  },
];

/**
 * Create migrations table if not exists
 */
export async function createMigrationsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

/**
 * Get applied migrations
 */
export async function getAppliedMigrations(db: Sql): Promise<string[]> {
  const results = await db`SELECT name FROM migrations ORDER BY id ASC`;
  return results.map((row: any) => row.name);
}

/**
 * Get pending migrations
 */
export async function getPendingMigrations(db: Sql): Promise<Migration[]> {
  const applied = await getAppliedMigrations(db);
  return migrations.filter((m) => !applied.includes(m.name));
}

/**
 * Run pending migrations
 */
export async function migrateLatest(db: Sql): Promise<void> {
  const logger = getLogger();

  try {
    await createMigrationsTable(db);

    const pending = await getPendingMigrations(db);

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Running ${pending.length} pending migration(s)`);

    for (const migration of pending) {
      logger.info(`Running migration: ${migration.name}`);
      await migration.up(db);

      await db`
        INSERT INTO migrations (name) VALUES (${migration.name})
      `;

      logger.info(`Completed migration: ${migration.name}`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
}

/**
 * Rollback last migration
 */
export async function migrateRollback(db: Sql): Promise<void> {
  const logger = getLogger();

  try {
    const applied = await getAppliedMigrations(db);

    if (applied.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const lastApplied = applied[applied.length - 1];
    const migration = migrations.find((m) => m.name === lastApplied);

    if (!migration) {
      throw new Error(`Migration not found: ${lastApplied}`);
    }

    logger.info(`Rolling back migration: ${migration.name}`);
    await migration.down(db);

    await db`DELETE FROM migrations WHERE name = ${migration.name}`;

    logger.info(`Rolled back migration: ${migration.name}`);
  } catch (error) {
    logger.error('Rollback failed', error);
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(db: Sql): Promise<{
  applied: string[];
  pending: string[];
  total: number;
}> {
  const applied = await getAppliedMigrations(db);
  const pending = await getPendingMigrations(db);

  return {
    applied,
    pending: pending.map((m) => m.name),
    total: migrations.length,
  };
}

export { migrations };
