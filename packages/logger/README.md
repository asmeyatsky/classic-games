# @classic-games/logger

Structured logging and error handling for the Classic Games platform.

## Overview

This package provides:

- **Custom Error Classes**: Game-specific errors with proper context and HTTP status codes
- **Structured Logging**: Pino-based logger with context tracking
- **Performance Monitoring**: Built-in performance timer utilities
- **Error Recovery**: Helper functions for safe error handling

## Installation

This package is automatically included when you install the monorepo dependencies.

## Usage

### Basic Logging

```typescript
import { createLogger } from '@classic-games/logger';

const logger = createLogger({ name: 'my-module' });

logger.info('Game started', { gameId: '123', players: 2 });
logger.warn('High latency detected', { latency: 250 });
logger.error('Move validation failed', error, { gameId: '123' });
```

### Error Handling

```typescript
import { InvalidMoveError, PlayerNotFoundError } from '@classic-games/logger';

try {
  if (!player) {
    throw new PlayerNotFoundError('p1');
  }

  if (!isValidMove(move)) {
    throw new InvalidMoveError('Move out of bounds', {
      move: move,
      boardSize: 15,
    });
  }
} catch (error) {
  if (isClassicGamesError(error)) {
    logger.error(error.message, error, {
      code: error.code,
      statusCode: error.statusCode,
    });
    // Send HTTP response with error.statusCode
  } else {
    logger.fatal('Unknown error', error);
  }
}
```

### Global Logger

```typescript
import { initializeGlobalLogger, getLogger } from '@classic-games/logger';

// Initialize once at app startup
initializeGlobalLogger({
  name: 'classic-games-app',
  environment: 'production',
});

// Use anywhere
const logger = getLogger();
logger.info('App started');
```

### Performance Tracking

```typescript
import { PerformanceTimer } from '@classic-games/logger';

const timer = new PerformanceTimer();

// ... do some work ...

timer.log('game-initialization', { playerCount: 4 });
// Output: Performance: game-initialization took 145ms

// Track multiple intervals
const elapsed1 = timer.log('phase-1');
const elapsed2 = timer.reset();
// ... more work ...
timer.log('phase-2');
```

### Game-Specific Logging

```typescript
const logger = createLogger({ name: 'poker-engine' });

// Log game events
logger.logGameEvent('game-123', 'hand-started', undefined, {
  dealer: 'p1',
  ante: 10,
});

// Log player actions
logger.logPlayerAction('game-123', 'p2', 'raise', {
  amount: 100,
  currentBet: 50,
});

// Log HTTP requests/responses
logger.logRequest('POST', '/api/games', { userId: 'u1' });
logger.logResponse('POST', '/api/games', 201, 45, { gameId: 'g1' });
```

### Child Loggers

```typescript
const logger = createLogger({ name: 'app' });

// Create a child logger with additional context
const gameLogger = logger.child({
  gameId: 'game-123',
  userId: 'user-456',
});

gameLogger.info('Move placed');
// Logs: { gameId: 'game-123', userId: 'user-456', msg: 'Move placed' }
```

## Error Classes

### Game Logic Errors

- `InvalidMoveError` - Move violates game rules
- `GameStateError` - Game in invalid state
- `GameNotFoundError` - Game doesn't exist

### Player Errors

- `PlayerNotFoundError` - Player doesn't exist
- `InsufficientChipsError` - Player doesn't have enough chips
- `PlayerAlreadyInGameError` - Player already in another game

### Room/Session Errors

- `RoomNotFoundError` - Room doesn't exist
- `RoomFullError` - Room is at max capacity
- `InvalidRoomPasswordError` - Incorrect room password

### Validation Errors

- `ValidationError` - Generic validation failure
- `InvalidInputError` - Invalid input parameter

### Network Errors

- `WebSocketError` - WebSocket operation failed
- `ConnectionLostError` - Connection dropped
- `TimeoutError` - Operation timed out

### Authentication Errors

- `AuthenticationError` - Authentication failed
- `AuthorizationError` - User not authorized

### Database Errors

- `DatabaseError` - Database operation failed
- `QueryError` - Database query error

### Configuration Errors

- `ConfigurationError` - Configuration is invalid

## Error Details

All errors include:

- `message` - Human-readable error message
- `code` - Machine-readable error code
- `statusCode` - HTTP status code (400, 401, 403, 404, 409, 500, etc.)
- `context` - Additional error context
- `timestamp` - When error occurred

```typescript
try {
  throw new InsufficientChipsError('p1', 100, 50);
} catch (error) {
  if (isClassicGamesError(error)) {
    console.log(error.code); // 'INSUFFICIENT_CHIPS'
    console.log(error.statusCode); // 400
    console.log(error.context); // { playerId: 'p1', required: 100, available: 50 }
  }
}
```

## Logger Options

```typescript
interface LoggerOptions {
  // Logger name (used in log output)
  name: string;

  // Log level ('debug', 'info', 'warn', 'error', 'fatal')
  level?: LogLevel;

  // Environment for formatting ('development', 'staging', 'production')
  environment?: 'development' | 'staging' | 'production';

  // Include stack traces in error logs
  enableStack?: boolean;
}
```

## Log Levels

- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages for potentially problematic situations
- `error` - Error messages for error conditions
- `fatal` - Fatal error messages causing application shutdown

In production, minimum level is `info`. In development, minimum level is `debug`.

## Output Formats

### Development

Logs are pretty-printed with colors for easy reading:

```
23:45:12.345 INF [my-module] Game started
   gameId: "123"
   players: 2
```

### Production

Logs are JSON for easy parsing and aggregation:

```json
{
  "level": 30,
  "time": 1234567890000,
  "pid": 12345,
  "hostname": "server-1",
  "name": "my-module",
  "gameId": "123",
  "players": 2,
  "msg": "Game started"
}
```

## Integration with Error Tracking

To send errors to Sentry or similar:

```typescript
import * as Sentry from '@sentry/node';
import { isClassicGamesError, extractErrorDetails } from '@classic-games/logger';

app.use((error, req, res, next) => {
  const errorDetails = extractErrorDetails(error);

  if (!isClassicGamesError(error)) {
    Sentry.captureException(error);
  }

  res.status(errorDetails.statusCode).json(errorDetails);
});
```

## Performance Considerations

- Logging is asynchronous in Pino for high performance
- Avoid logging sensitive data (passwords, tokens, etc.)
- Use appropriate log levels to reduce log volume
- Performance timer has minimal overhead

## Best Practices

1. **Use Structured Logging**: Include relevant context with every log
   ```typescript
   // ✅ Good
   logger.info('Player moved', { gameId, playerId, from, to });

   // ❌ Avoid
   logger.info('Player moved from ' + from + ' to ' + to);
   ```

2. **Use Specific Error Classes**: Catch and throw appropriate error types
   ```typescript
   // ✅ Good
   throw new InvalidMoveError('Move outside board', { move });

   // ❌ Avoid
   throw new Error('Invalid move');
   ```

3. **Include Context in Child Loggers**: Reduce repetition
   ```typescript
   // ✅ Good
   const gameLogger = logger.child({ gameId });
   gameLogger.info('Turn started'); // gameId automatically included

   // ❌ Avoid
   logger.info('Turn started', { gameId });
   logger.info('Move made', { gameId });
   ```

4. **Track Performance**: Monitor slow operations
   ```typescript
   // ✅ Good
   const timer = new PerformanceTimer(logger);
   const result = await expensiveOperation();
   timer.log('expensive-operation');

   // ❌ Avoid
   const start = Date.now();
   const result = await expensiveOperation();
   // No performance tracking
   ```

5. **Log at Appropriate Levels**: Use level hierarchy
   ```typescript
   logger.debug('User ID: u123');        // Dev debugging
   logger.info('Game started');          // Normal operation
   logger.warn('High latency: 500ms');   // Potentially problematic
   logger.error('Move validation failed', error); // Error condition
   logger.fatal('Database unavailable');  // System shutdown
   ```

## Contributing

When adding new error classes:

1. Extend `ClassicGamesError`
2. Provide meaningful error message
3. Set appropriate HTTP status code
4. Include relevant context
5. Add to exports in `index.ts`
6. Document in this README

---

For more information, see the [main project README](../../README.md) and [Architecture Guide](../../ARCHITECTURE.md).
