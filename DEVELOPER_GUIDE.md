# Classic Games - Developer Guide

Complete guide for developers working on the Classic Games platform.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Architecture Overview](#architecture-overview)
5. [API Development](#api-development)
6. [Services & Utilities](#services--utilities)
7. [Database](#database)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
classic-games/
├── apps/
│   ├── backend/          # Node.js API server
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── api/              # Express API server
│   ├── database/         # PostgreSQL integration
│   ├── auth/             # Firebase authentication
│   ├── game-engine/      # Game logic (Poker, Backgammon, Scrabble)
│   ├── logger/           # Structured logging
│   ├── validation/       # Zod validation schemas
│   ├── config/           # Configuration management
│   ├── analytics/        # Sentry & monitoring
│   ├── utils/            # Utility functions
│   ├── shared-ui/        # React components
│   └── three-components/ # 3D game components
├── e2e/                  # End-to-end tests
├── playwright.config.ts  # Playwright configuration
├── tsconfig.json         # TypeScript configuration
├── turbo.json            # Turbo monorepo config
└── package.json          # Root package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 13+
- Redis (optional, for caching)
- Firebase account
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/anthropics/classic-games.git
cd classic-games

# Install dependencies
npm install

# Install Playwright browsers for E2E tests
npx playwright install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run backend -- init-db

# Start development
npm run dev
```

### Environment Variables

Create `.env` file in root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=classic_games
DB_USER=postgres
DB_PASSWORD=password

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email

# API
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Cache
REDIS_URL=redis://localhost:6379

# Analytics
SENTRY_DSN=your-sentry-dsn
```

---

## Development Workflow

### Running Services

```bash
# Start all services in development mode
npm run dev

# Start specific service
npm run backend        # API server
npm run web           # Web app
npm run mobile        # Mobile app

# Start with hot reload
cd apps/backend && npm run dev

# Build for production
npm run build
```

### Code Quality

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui      # Interactive UI
npm run test:e2e:debug   # Debug mode
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push and create pull request
git push origin feature/my-feature

# After review, merge to main
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
```

---

## Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────┐
│       Express API Routes            │  Request handlers, validation
├─────────────────────────────────────┤
│       Services / Business Logic     │  Achievement, Tournament, Social
├─────────────────────────────────────┤
│       Database & Cache Layer        │  PostgreSQL, Redis
├─────────────────────────────────────┤
│       Game Engines                  │  Poker, Backgammon, Scrabble
├─────────────────────────────────────┤
│       Event Bus (Async)             │  Decoupled event handling
└─────────────────────────────────────┘
```

### Key Components

#### 1. API Routes (`packages/api/src/routes/`)

- REST endpoints for each feature
- Request validation with Zod
- Async error handling
- Logging at each step

#### 2. Services (`packages/api/src/services/`)

- Business logic implementation
- Database queries
- Cache management
- Event emission

#### 3. EventBus (`services/eventBus.ts`)

- Publish-subscribe for loose coupling
- Priority-based handler execution
- Event history and filtering
- Async queue processing

#### 4. Game Engines (`packages/game-engine/`)

- Poker, Backgammon, Scrabble logic
- Move validation
- Game state management
- Fully tested

#### 5. Database (`packages/database/`)

- PostgreSQL connection
- Query builder wrapper
- Health checks
- Connection pooling

---

## API Development

### Adding a New Endpoint

#### 1. Create Route File

```typescript
// packages/api/src/routes/myfeature.ts
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/myfeature
 * Create a new feature item
 *
 * @route POST /api/myfeature
 * @param {string} name - Item name
 * @returns {Object} 201 - Created item
 */
router.post(
  '/',
  validateBody(
    z.object({
      name: z.string().min(1).max(100),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    // Implementation
    res.status(201).json({ item: { id: '...', name } });
  })
);

export default router;
```

#### 2. Add to Main API

```typescript
// packages/api/src/index.ts
import myfeatureRoutes from './routes/myfeature';

// In setupRoutes()
app.use('/api/myfeature', myfeatureRoutes);
```

#### 3. Add JSDoc Comments

- Use `@route` to describe endpoint
- Include `@param` for all parameters
- Document `@returns` for all responses
- Add `@example` with request/response

### Validation Pattern

```typescript
// Route level validation
router.post(
  '/users/:userId',
  requireAuth,
  validateParams(
    z.object({
      userId: z.string().uuid(),
    })
  ),
  validateBody(
    z.object({
      email: z.string().email(),
      username: z.string().min(3),
    })
  ),
  asyncHandler(async (req, res) => {
    // Implementation
  })
);
```

### Error Handling

```typescript
// Async handler automatically catches errors
asyncHandler(async (req, res) => {
  if (!item) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.json(item);
});

// Custom errors
throw new ValidationError('Invalid input');
throw new NotFoundError('Resource not found');
throw new UnauthorizedError('Auth required');
```

---

## Services & Utilities

### Event Bus Usage

```typescript
import { emit, on, off } from '@classic-games/eventBus';

// Subscribe to events
const subId = on(
  'game:ended',
  async (event) => {
    console.log('Game ended:', event.data);
    await updateLeaderboard(event.userId);
  },
  { priority: 10 }
);

// Emit events
await emit({
  type: 'game:ended',
  userId: 'user-123',
  gameId: 'game-456',
  data: { winnerId: 'player-1' },
});

// Unsubscribe
off(subId);

// Get history
const history = getEventBus().getHistory({
  eventType: 'game:ended',
  limit: 10,
});
```

### Cache Usage

```typescript
import { getCached, setCache, invalidateCache } from '@classic-games/cache';

// Get from cache or compute
const leaderboard = await getCached(
  'leaderboard:global',
  async () => {
    return await db`SELECT * FROM leaderboards ORDER BY rating DESC`;
  },
  3600 // TTL in seconds
);

// Invalidate cache
await invalidateCache('leaderboard:*');
```

### Database Usage

```typescript
import { getDatabase } from '@classic-games/database';

const db = getDatabase();

// Simple query
const user = await db`SELECT * FROM users WHERE id = ${userId}`;

// Insert
const inserted = await db`
  INSERT INTO users (username, email)
  VALUES (${username}, ${email})
  RETURNING *
`;

// Update
await db`UPDATE users SET rating = ${rating} WHERE id = ${userId}`;

// Transaction
const result = await db.transaction(async (sql) => {
  await sql`UPDATE users SET balance = balance - ${amount}`;
  await sql`UPDATE account SET balance = balance + ${amount}`;
});
```

### Logger Usage

```typescript
import { getLogger } from '@classic-games/logger';

const logger = getLogger();

logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { userId: '123' });
logger.warn('Warning message', { issue: 'problem' });
logger.error('Error message', error);
logger.fatal('Fatal message', error);
```

---

## Database

### Schema Design

Tables for Phase 4 features:

```sql
-- Achievements
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY,
  achievement_code VARCHAR UNIQUE,
  title VARCHAR,
  description TEXT,
  points INTEGER,
  created_at TIMESTAMP
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR,
  game_type VARCHAR,
  format VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP
);

-- Social
CREATE TABLE friends (
  user_id UUID,
  friend_id UUID,
  status VARCHAR,
  created_at TIMESTAMP
);

-- Clans
CREATE TABLE clans (
  id UUID PRIMARY KEY,
  name VARCHAR,
  founder_id UUID,
  is_public BOOLEAN,
  created_at TIMESTAMP
);
```

### Migrations

```bash
# Create migration
npm run db:migrate:create -- create_achievements

# Run migrations
npm run db:migrate:up

# Rollback
npm run db:migrate:down
```

---

## Testing

### Unit Tests

```typescript
// tests/services/achievements.test.ts
describe('Achievements Service', () => {
  it('should unlock achievement', async () => {
    const result = await checkAndUnlockAchievements('user-123', 'poker', {
      wins: 1,
    });

    expect(result).toContain('first_win');
  });
});
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- e2e/tests/games.spec.ts

# Run with UI
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug -- e2e/tests/games.spec.ts
```

### Test Helpers

```typescript
import {
  createTestRoom,
  createTestGame,
  makeTestMove,
  authenticatedApiRequest,
} from '../../e2e/utils/test-helpers';

// Create test resources
const room = await createTestRoom(page, 'poker');
const game = await createTestGame(page, room.id, 'poker');
await makeTestMove(page, game.id, 'fold', {});
```

---

## Deployment

### Production Build

```bash
# Build all packages
npm run build

# Check for errors
npm run lint

# Run tests
npm run test:e2e
```

### Environment-Specific Config

```typescript
// Development
if (process.env.NODE_ENV === 'development') {
  // Dev configuration
}

// Staging
if (process.env.NODE_ENV === 'staging') {
  // Staging configuration
}

// Production
if (process.env.NODE_ENV === 'production') {
  // Prod configuration
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "packages/api/dist/index.js"]
```

---

## Best Practices

### Code Style

1. **Naming**
   - Use camelCase for variables/functions
   - Use PascalCase for classes/components
   - Use SCREAMING_SNAKE_CASE for constants

2. **TypeScript**
   - No `any` types (100% strict mode)
   - Export types from files
   - Use interfaces for contracts
   - Generic types for reusability

3. **Error Handling**
   - Always handle async errors with asyncHandler
   - Return appropriate HTTP status codes
   - Log errors with context
   - Include error messages in responses

4. **Comments**
   - Use JSDoc for public APIs
   - Explain "why", not "what"
   - Keep comments updated
   - Remove commented code

### Performance

1. **Database**
   - Use indexes on frequently queried columns
   - Limit result sets with LIMIT/OFFSET
   - Use prepared statements
   - Monitor slow queries

2. **Cache**
   - Cache frequently accessed data
   - Use appropriate TTL values
   - Invalidate cache on updates
   - Monitor cache hit rates

3. **API**
   - Implement pagination for lists
   - Use eager loading to avoid N+1
   - Compress responses
   - Cache static content

### Security

1. **Authentication**
   - Validate Firebase tokens
   - Check user authorization
   - Use HTTPS in production
   - Implement rate limiting

2. **Data**
   - Validate all inputs
   - Use parameterized queries
   - Sanitize outputs
   - Hash sensitive data

3. **Dependencies**
   - Keep dependencies updated
   - Run security audits
   - Use pinned versions
   - Review changelogs

---

## Troubleshooting

### Common Issues

#### Build Fails with TypeScript Errors

```bash
# Clear build cache
npm run clean

# Rebuild
npm run build

# Check TypeScript config
npx tsc --version
```

#### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres

# Verify connection string
echo $DB_HOST $DB_PORT $DB_NAME

# Test connection
psql -h localhost -U postgres -d classic_games
```

#### Tests Failing

```bash
# Clear test cache
npm run clean

# Run tests with verbose output
npm run test -- --verbose

# Run specific test
npm run test -- --testNamePattern="my test"
```

#### API Server Won't Start

```bash
# Check port is available
lsof -i :3001

# Kill process on port
kill -9 <PID>

# Check environment variables
env | grep NODE_ENV

# View logs
npm run backend -- --verbose
```

#### Cache Not Working

```bash
# Verify Redis is running
redis-cli ping

# Check Redis configuration
redis-cli INFO

# Clear cache
redis-cli FLUSHALL
```

---

## Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **E2E Tests**: See `e2e/README.md`
- **Completion Report**: See `PHASE_4_COMPLETION.md`
- **Database Schema**: See `packages/database/schema.sql`
- **Game Engine**: See `packages/game-engine/README.md`

---

**Last Updated**: November 13, 2024
**Version**: 1.0.0

For questions or issues, contact the development team.
