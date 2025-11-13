/**
 * User Database Schema
 */

import { Sql } from '../client';

export async function createUsersTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(30) UNIQUE NOT NULL,
      display_name VARCHAR(50) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(500),
      bio TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      rating INTEGER NOT NULL DEFAULT 1000,
      total_games INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
  `;
}

export async function createGameStatsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS game_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      poker_wins INTEGER NOT NULL DEFAULT 0,
      poker_losses INTEGER NOT NULL DEFAULT 0,
      poker_rating INTEGER NOT NULL DEFAULT 1000,
      backgammon_wins INTEGER NOT NULL DEFAULT 0,
      backgammon_losses INTEGER NOT NULL DEFAULT 0,
      backgammon_rating INTEGER NOT NULL DEFAULT 1000,
      scrabble_wins INTEGER NOT NULL DEFAULT 0,
      scrabble_losses INTEGER NOT NULL DEFAULT 0,
      scrabble_rating INTEGER NOT NULL DEFAULT 1000,
      total_chips_won BIGINT NOT NULL DEFAULT 0,
      longest_winning_streak INTEGER NOT NULL DEFAULT 0,
      current_winning_streak INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
    CREATE INDEX IF NOT EXISTS idx_game_stats_poker_rating ON game_stats(poker_rating DESC);
    CREATE INDEX IF NOT EXISTS idx_game_stats_backgammon_rating ON game_stats(backgammon_rating DESC);
    CREATE INDEX IF NOT EXISTS idx_game_stats_scrabble_rating ON game_stats(scrabble_rating DESC);
  `;
}

export async function createFriendsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS friends (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMP,
      CHECK (user_id_1 < user_id_2)
    );

    CREATE INDEX IF NOT EXISTS idx_friends_user_id_1 ON friends(user_id_1);
    CREATE INDEX IF NOT EXISTS idx_friends_user_id_2 ON friends(user_id_2);
    CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_friends_pair ON friends(user_id_1, user_id_2);
  `;
}

export async function createAchievementsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_code VARCHAR(100) NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      icon_url VARCHAR(500),
      unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_code)
    );

    CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(achievement_code);
    CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at DESC);
  `;
}

export async function createAuthTokensTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address VARCHAR(50)
    );

    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_type ON auth_tokens(type);
  `;
}

/**
 * Drop all user-related tables (for development only)
 */
export async function dropUserTables(db: Sql): Promise<void> {
  await db`
    DROP TABLE IF EXISTS auth_tokens CASCADE;
    DROP TABLE IF EXISTS achievements CASCADE;
    DROP TABLE IF EXISTS friends CASCADE;
    DROP TABLE IF EXISTS game_stats CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `;
}
