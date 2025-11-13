/**
 * @classic-games/database
 *
 * PostgreSQL database client, schemas, and migrations
 *
 * Usage:
 * ```typescript
 * import { initializeDatabase, getDatabase, migrateLatest } from '@classic-games/database';
 *
 * const db = await initializeDatabase({
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'classic_games',
 *   user: 'postgres',
 *   password: 'password',
 * });
 *
 * await migrateLatest(db);
 * ```
 */

export {
  initializeDatabase,
  getDatabase,
  query,
  transaction,
  closeDatabase,
  getHealthStatus,
  sql,
  type Sql,
} from './client';

export {
  createAllTables,
  dropAllTables,
  createUsersTable,
  createGameStatsTable,
  createFriendsTable,
  createAchievementsTable,
  createAuthTokensTable,
  dropUserTables,
  createRoomsTable,
  createGameSessionsTable,
  createGameMovesTable,
  createGameResultsTable,
  createRoomPlayersTable,
  createTournamentTable,
  dropGameTables,
} from './schemas';

export {
  migrateLatest,
  migrateRollback,
  getMigrationStatus,
  getAppliedMigrations,
  getPendingMigrations,
  createMigrationsTable,
  migrations,
} from './migrations';
