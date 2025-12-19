/**
 * Database Schemas - Create all tables and indexes
 */

import { Sql } from '../client.js';
import * as users from './users.js';
import * as games from './games.js';

/**
 * Create all database tables and indexes
 */
export async function createAllTables(db: Sql): Promise<void> {
  console.log('Creating user tables...');
  await users.createUsersTable(db);
  await users.createGameStatsTable(db);
  await users.createFriendsTable(db);
  await users.createAchievementsTable(db);
  await users.createAuthTokensTable(db);

  console.log('Creating game tables...');
  await games.createRoomsTable(db);
  await games.createGameSessionsTable(db);
  await games.createGameMovesTable(db);
  await games.createGameResultsTable(db);
  await games.createRoomPlayersTable(db);
  await games.createTournamentTable(db);

  console.log('All tables created successfully');
}

/**
 * Drop all tables (development/testing only)
 */
export async function dropAllTables(db: Sql): Promise<void> {
  console.warn('Dropping all tables...');
  await games.dropGameTables(db);
  await users.dropUserTables(db);
  console.warn('All tables dropped');
}

export * from './users.js';
export * from './games.js';
