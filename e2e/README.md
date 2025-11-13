# E2E Tests for Classic Games

Comprehensive end-to-end tests for the Classic Games API using Playwright.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- API server running on `http://localhost:3001`

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run tests in a specific file

```bash
npm run test:e2e -- e2e/tests/games.spec.ts
```

### Run tests with UI mode

```bash
npm run test:e2e:ui
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e -- --headed
```

### View test report

```bash
npm run test:e2e:report
```

## Test Organization

Tests are organized by feature area:

- **games.spec.ts** - Game creation, moves, and state management
- **achievements.spec.ts** - Achievement system and leaderboards
- **tournaments.spec.ts** - Tournament creation and management
- **social.spec.ts** - Friend requests, blocks, and clans
- **replays.spec.ts** - Game replay viewing and analysis
- **rooms.spec.ts** - Game room creation and management
- **leaderboard.spec.ts** - Player rankings and statistics

## Test Coverage

### Games (8 tests)

- Create new games
- Get game state
- Make moves
- Get game history
- Resign from game
- Parameter validation
- Non-existent game handling
- Concurrent move handling

### Achievements (7 tests)

- List all achievements
- Get achievement details
- Global achievement leaderboard
- User achievements
- Achievement progress tracking
- Invalid parameter validation
- Leaderboard pagination

### Tournaments (10 tests)

- Create tournaments
- List tournaments
- Get tournament details
- Join tournaments
- Start tournaments
- Complete tournaments
- Different tournament formats
- Parameter validation
- Full tournament support

### Social (14 tests)

- Send friend requests
- Accept/reject requests
- Remove friends
- Get friends list
- Block users
- Create clans
- List clans
- Join clans
- Clan filtering and pagination
- Parameter validation

### Replays (15 tests)

- Get game replays
- Filter replays by game type
- Paginate replays
- Create shareable links
- Get game analysis
- View specific moves
- Player information
- Room information

### Rooms (18 tests)

- Create rooms
- List rooms
- Get room details
- Join/leave rooms
- Prevent duplicate joins
- Different game types
- Filter by game type and status
- Pagination
- Player information

### Leaderboard (12 tests)

- Global leaderboard
- Game-specific leaderboards
- User ranking
- Rating tracking
- Win statistics
- Pagination
- Sorting verification

## Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3001
CI=false
```

## CI/CD Integration

The Playwright configuration automatically adapts for CI environments:

```bash
# Run in CI mode (single worker, 2 retries)
CI=true npm run test:e2e
```

## Test Helpers

Located in `e2e/utils/test-helpers.ts`, provides utilities:

- `apiRequest()` - Make unauthenticated API requests
- `authenticatedApiRequest()` - Make authenticated API requests
- `createTestRoom()` - Create a test game room
- `createTestGame()` - Create a test game
- `makeTestMove()` - Make a move in a game
- `getGameState()` - Get current game state
- `getTestUser()` - Get test user ID
- `waitForCondition()` - Wait for async conditions

## Best Practices

1. **Use test helpers** - Leverage utility functions for common operations
2. **Group related tests** - Use `test.describe()` for organization
3. **Clean up resources** - Use `test.afterEach()` for cleanup
4. **Meaningful assertions** - Check both status codes and response structure
5. **Test edge cases** - Include validation, error handling, and boundary tests
6. **Avoid flakiness** - Don't rely on timing, use proper waits
7. **Independent tests** - Each test should be self-contained

## Troubleshooting

### Tests timeout

- Check if API server is running on configured port
- Increase timeout in `playwright.config.ts`
- Check network connectivity

### Tests fail with 401 Unauthorized

- Verify authentication header is being sent correctly
- Check mock user IDs are valid UUIDs

### Port already in use

- Change `API_BASE_URL` to different port
- Kill existing process: `lsof -ti :3001 | xargs kill -9`

## Performance Considerations

- Tests run in parallel by default
- Use `test.serial()` for tests that must run sequentially
- Each test creates fresh resources (rooms, games, etc.)
- Test data is independent to prevent interference

## Future Improvements

- [ ] Screenshot on failure
- [ ] Video recordings for failed tests
- [ ] Load testing scenarios
- [ ] WebSocket integration tests
- [ ] Performance benchmarking
- [ ] Database state validation
- [ ] API contract testing
