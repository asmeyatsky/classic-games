# @classic-games/database

PostgreSQL database client, schemas, and migrations for the Classic Games platform.

## Overview

This package provides:

- **Database Client** - Connection pooling with health checks
- **Schema Management** - User, game, and tournament tables
- **Migration System** - Track and manage database schema changes
- **Query Utilities** - Helpers for transactions and queries

## Installation

This package is automatically included when you install the monorepo dependencies.

## Setup

### 1. Create Database

```bash
# Using PostgreSQL CLI
createdb classic_games -U postgres

# Or using Docker
docker run -d \
  --name classic-games-db \
  -e POSTGRES_DB=classic_games \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15
```

### 2. Configure Environment

Update `.env.local`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/classic_games
```

### 3. Run Migrations

```bash
npm run db:setup  # Initialize and run migrations
```

## Usage

### Initialize Connection

```typescript
import { initializeDatabase, migrateLatest } from '@classic-games/database';

const db = await initializeDatabase({
  host: 'localhost',
  port: 5432,
  database: 'classic_games',
  user: 'postgres',
  password: 'password',
});

// Run migrations
await migrateLatest(db);
```

### Query Database

```typescript
import { getDatabase } from '@classic-games/database';

const db = getDatabase();

// Simple query
const users = await db`SELECT * FROM users`;

// Parameterized query (safe from SQL injection)
const user = await db`SELECT * FROM users WHERE id = ${userId}`;

// Insert with returning
const result = await db`
  INSERT INTO users (email, username)
  VALUES (${email}, ${username})
  RETURNING *
`;
```

### Transactions

```typescript
import { transaction } from '@classic-games/database';

await transaction(async (db) => {
  await db`UPDATE users SET rating = rating + 10 WHERE id = ${userId}`;
  await db`INSERT INTO game_results (...) VALUES (...)`;
  // Automatic rollback on error
});
```

### Health Check

```typescript
import { getHealthStatus } from '@classic-games/database';

const { status, latency } = await getHealthStatus();
console.log(`Database: ${status} (${latency}ms)`);
```

## Database Schema

### User Tables

#### `users`
- `id` (UUID, PK)
- `email`, `username` (unique)
- `display_name`, `password_hash`
- `avatar_url`, `bio`
- `level`, `rating`, `total_games`, `wins`, `losses`
- `is_active`, `last_login`
- `created_at`, `updated_at`, `deleted_at`

#### `game_stats`
- Per-game statistics (poker, backgammon, scrabble)
- Rating, wins, losses for each game
- Total chips won, winning streaks
- Indexed by user_id and ratings

#### `friends`
- Bidirectional friendships
- Status: pending, accepted, blocked
- Indexes for efficient friend lookups

#### `achievements`
- Unlocked achievements per user
- Progress tracking (0-100%)
- Title, description, icon URL

#### `auth_tokens`
- Login tokens and refresh tokens
- Expiration and revocation tracking
- IP address and user agent logging

### Game Tables

#### `rooms`
- Game room/lobby information
- Host, max players, current players
- Privacy settings, rating requirements
- Game type and settings (time per move, etc.)
- Status: waiting, starting, in-progress, finished

#### `game_sessions`
- Active and completed games
- Game state (stored as JSONB)
- Move count, duration
- Winner tracking
- Status: active, completed

#### `game_moves`
- Individual moves within a game session
- Player, move number, action, details
- Duration per move
- Timestamps for replay

#### `game_results`
- Final game outcomes
- Winner and losers
- Point totals
- Rating changes
- Prize pool allocation

#### `room_players`
- Players in a game room
- Status: active, away, left
- Ready status
- Join/leave timestamps

#### `tournaments`
- Tournament metadata
- Game type, format, status
- Prize pool
- Start/end times
- Max players and registration tracking

## Indexes

Key indexes for performance:

- **User lookups**: email, username, rating, created_at
- **Game history**: game_type, status, winner_id, created_at
- **Room queries**: game_type, status, host_id, created_at
- **Move tracking**: game_session_id, move_number
- **Statistics**: user_id, rating columns

## Migrations

### Running Migrations

```bash
npm run migrate:latest   # Apply pending migrations
npm run migrate:rollback  # Undo last migration
```

### Migration Files

Located in `src/migrations/`:

```typescript
interface Migration {
  name: string;
  up: (db: Sql) => Promise<void>;
  down: (db: Sql) => Promise<void>;
}
```

### Checking Status

```typescript
import { getMigrationStatus } from '@classic-games/database';

const status = await getMigrationStatus(db);
console.log(`Applied: ${status.applied.length}/${status.total}`);
console.log(`Pending: ${status.pending}`);
```

## Transactions

Automatic ACID compliance:

```typescript
import { transaction } from '@classic-games/database';

try {
  await transaction(async (db) => {
    // Both operations succeed or both rollback
    await db`UPDATE users SET rating = ${newRating} WHERE id = ${userId}`;
    await db`INSERT INTO rating_history VALUES (...)`;
  });
} catch (error) {
  // Automatic rollback occurred
  console.error('Transaction failed:', error);
}
```

## Performance Considerations

### Connection Pooling

- Default pool size: 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

Configure in initialization:

```typescript
await initializeDatabase({
  // ... config
  max: 50,              // Increase pool size
  idleTimeoutSeconds: 60,
  connectionTimeoutSeconds: 10,
});
```

### Query Optimization

```typescript
// ❌ Inefficient - N+1 queries
for (const userId of userIds) {
  const user = await db`SELECT * FROM users WHERE id = ${userId}`;
}

// ✅ Better - Single batch query
const users = await db`
  SELECT * FROM users
  WHERE id = ANY(${userIds}::uuid[])
`;
```

### Prepared Statements

SQL is automatically prepared for safety and performance:

```typescript
// Prepared statements prevent SQL injection
const user = await db`SELECT * FROM users WHERE email = ${email}`;
```

## Data Types

Supported PostgreSQL types:

- **Primitives**: text, varchar, int, bigint, numeric, boolean
- **Temporal**: timestamp, date, time, interval
- **UUID**: gen_random_uuid() for primary keys
- **JSON**: jsonb for flexible data storage
- **Arrays**: text[], uuid[], integer[] for collections

## Error Handling

```typescript
import { DatabaseError } from '@classic-games/logger';

try {
  await db`INSERT INTO users (email) VALUES (${email})`;
} catch (error) {
  if (error.code === '23505') { // Unique violation
    throw new Error('Email already exists');
  }
  throw new DatabaseError('Insert failed', { email });
}
```

## Development

### Reset Database

```typescript
import { dropAllTables, createAllTables } from '@classic-games/database';

const db = getDatabase();
await dropAllTables(db);    // ⚠️ Destructive!
await createAllTables(db);  // Recreate all
```

### Seed Data

```typescript
// Add to migrations or separate seed script
const newUser = await db`
  INSERT INTO users (email, username, display_name, password_hash)
  VALUES ('user@example.com', 'testuser', 'Test User', ${hash})
  RETURNING id, email, username
`;
```

## Connection Pooling Best Practices

1. **Initialize Once**: Call `initializeDatabase()` once at app startup
2. **Reuse Connection**: Use `getDatabase()` throughout app
3. **Close Gracefully**: Call `closeDatabase()` on shutdown
4. **Monitor Health**: Use `getHealthStatus()` for monitoring

## Production Checklist

- [ ] Use SSL for database connections (`ssl: true`)
- [ ] Set strong passwords
- [ ] Configure firewall rules
- [ ] Setup backups
- [ ] Monitor connection pool usage
- [ ] Enable query logging for slow queries
- [ ] Use read replicas for analytics
- [ ] Setup monitoring and alerting

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solutions:
- Check PostgreSQL is running: `pg_isready`
- Verify host/port in configuration
- Check firewall rules

### Too Many Connections

```
Error: remaining connection slots reserved for non-replication superuser
```

Solutions:
- Increase PostgreSQL `max_connections` setting
- Reduce pool size
- Ensure connections are being closed

### Query Timeout

```
Error: query timeout after 5000ms
```

Solutions:
- Increase `connectionTimeoutSeconds`
- Optimize slow queries with indexes
- Check database load

## Contributing

When adding new tables:

1. Create new file in `src/schemas/`
2. Define `createXyzTable()` function
3. Define `dropXyzTable()` function
4. Export from `src/schemas/index.ts`
5. Add to `createAllTables()` and `dropAllTables()`
6. Create migration in `src/migrations/`
7. Update this README

---

For more information, see the [main project README](../../README.md) and [Architecture Guide](../../ARCHITECTURE.md).
