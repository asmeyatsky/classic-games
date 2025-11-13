/**
 * Game Database Schemas
 */

import { Sql } from '../client';

export async function createRoomsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      game_type VARCHAR(20) NOT NULL,
      host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      max_players INTEGER NOT NULL,
      current_players INTEGER NOT NULL DEFAULT 1,
      is_private BOOLEAN NOT NULL DEFAULT false,
      password_hash VARCHAR(255),
      min_rating INTEGER,
      time_per_move INTEGER,
      auto_start_timeout INTEGER,
      status VARCHAR(20) NOT NULL DEFAULT 'waiting',
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_game_type ON rooms(game_type);
    CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
    CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);
  `;
}

export async function createGameSessionsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      game_type VARCHAR(20) NOT NULL,
      current_player_id UUID REFERENCES users(id),
      state JSONB NOT NULL,
      move_count INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      winner_id UUID REFERENCES users(id),
      started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP,
      duration_seconds INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
    CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
    CREATE INDEX IF NOT EXISTS idx_game_sessions_winner_id ON game_sessions(winner_id);
    CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
  `;
}

export async function createGameMovesTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS game_moves (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      move_number INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL,
      details JSONB,
      duration_seconds INTEGER,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_game_moves_game_session_id ON game_moves(game_session_id);
    CREATE INDEX IF NOT EXISTS idx_game_moves_player_id ON game_moves(player_id);
    CREATE INDEX IF NOT EXISTS idx_game_moves_move_number ON game_moves(game_session_id, move_number);
  `;
}

export async function createGameResultsTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS game_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE UNIQUE,
      game_type VARCHAR(20) NOT NULL,
      winner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      loser_ids UUID[] NOT NULL,
      winner_points INTEGER,
      loser_points INTEGER[],
      rating_change JSONB,
      prize_pool INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_game_results_game_session_id ON game_results(game_session_id);
    CREATE INDEX IF NOT EXISTS idx_game_results_winner_id ON game_results(winner_id);
    CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);
  `;
}

export async function createRoomPlayersTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS room_players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      is_ready BOOLEAN NOT NULL DEFAULT false,
      joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      left_at TIMESTAMP,
      UNIQUE(room_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
    CREATE INDEX IF NOT EXISTS idx_room_players_user_id ON room_players(user_id);
    CREATE INDEX IF NOT EXISTS idx_room_players_status ON room_players(status);
  `;
}

export async function createTournamentTable(db: Sql): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS tournaments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      game_type VARCHAR(20) NOT NULL,
      host_id UUID NOT NULL REFERENCES users(id),
      max_players INTEGER NOT NULL,
      current_players INTEGER NOT NULL DEFAULT 0,
      format VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'registration',
      prize_pool INTEGER,
      starts_at TIMESTAMP NOT NULL,
      ends_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON tournaments(game_type);
    CREATE INDEX IF NOT EXISTS idx_tournaments_host_id ON tournaments(host_id);
    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
    CREATE INDEX IF NOT EXISTS idx_tournaments_starts_at ON tournaments(starts_at);
  `;
}

/**
 * Drop all game-related tables (for development only)
 */
export async function dropGameTables(db: Sql): Promise<void> {
  await db`
    DROP TABLE IF EXISTS game_results CASCADE;
    DROP TABLE IF EXISTS game_moves CASCADE;
    DROP TABLE IF EXISTS game_sessions CASCADE;
    DROP TABLE IF EXISTS room_players CASCADE;
    DROP TABLE IF EXISTS tournaments CASCADE;
    DROP TABLE IF EXISTS rooms CASCADE;
  `;
}
