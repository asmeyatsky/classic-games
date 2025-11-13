/**
 * E2E Tests for Replay Endpoints
 */

import { test, expect, Page } from '@playwright/test';
import {
  authenticatedApiRequest,
  createTestRoom,
  createTestGame,
  makeTestMove,
  getTestUser,
  apiRequest,
} from '../utils/test-helpers';

let page: Page;
let testUserId: string;
let testGameId: string;

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  testUserId = await getTestUser(page);

  // Create and play a test game
  const room = await createTestRoom(page, 'poker');
  const game = await createTestGame(page, room.id, 'poker');
  testGameId = game.id;

  // Make some moves
  await makeTestMove(page, testGameId, 'fold', {});
  await makeTestMove(page, testGameId, 'fold', {});
});

test.afterEach(async () => {
  await page.close();
});

test.describe('Replay Endpoints', () => {
  test('should get game replay', async () => {
    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('gameId');
    expect(response.data.gameId).toBe(testGameId);
    expect(response.data).toHaveProperty('gameType');
    expect(response.data).toHaveProperty('status');
    expect(response.data).toHaveProperty('duration');
    expect(response.data).toHaveProperty('moveCount');
    expect(response.data).toHaveProperty('moves');
    expect(Array.isArray(response.data.moves)).toBe(true);

    // Verify move structure
    if (response.data.moves.length > 0) {
      const move = response.data.moves[0];
      expect(move).toHaveProperty('moveNumber');
      expect(move).toHaveProperty('playerId');
      expect(move).toHaveProperty('playerName');
      expect(move).toHaveProperty('action');
      expect(move).toHaveProperty('timestamp');
    }
  });

  test('should not get replay for incomplete game', async () => {
    // Create a new active game (not completed)
    const room = await createTestRoom(page, 'poker');
    const game = await createTestGame(page, room.id, 'poker');

    const response = await apiRequest(page, 'GET', `/api/replays/${game.id}`);

    // Should return 403 since game is not completed
    expect(response.status).toBe(403);
  });

  test('should get user replays', async () => {
    const response = await authenticatedApiRequest(page, 'GET', '/api/replays/');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('replays');
    expect(Array.isArray(response.data.replays)).toBe(true);

    // Verify replay entry structure
    if (response.data.replays.length > 0) {
      const replay = response.data.replays[0];
      expect(replay).toHaveProperty('gameId');
      expect(replay).toHaveProperty('gameType');
      expect(replay).toHaveProperty('duration');
      expect(replay).toHaveProperty('moveCount');
      expect(replay).toHaveProperty('createdAt');
    }
  });

  test('should filter replays by game type', async () => {
    const response = await authenticatedApiRequest(page, 'GET', '/api/replays/?gameType=poker');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('gameType');
    expect(response.data.gameType).toBe('poker');

    // All replays should be of poker type
    const allPoker = response.data.replays.every((r: any) => r.gameType === 'poker');
    expect(allPoker).toBe(true);
  });

  test('should paginate user replays', async () => {
    const response = await authenticatedApiRequest(page, 'GET', '/api/replays/?limit=10&offset=0');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('limit');
    expect(response.data).toHaveProperty('offset');
    expect(response.data).toHaveProperty('total');
  });

  test('should create shareable replay link', async () => {
    // Complete the game first
    await makeTestMove(page, testGameId, 'fold', {});
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    // Create shareable link
    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/replays/${testGameId}/share`,
      {}
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('shareToken');
    expect(response.data).toHaveProperty('shareUrl');
    expect(response.data).toHaveProperty('expiresIn');
    expect(response.data.shareUrl).toMatch(/\/replays\//);
    expect(response.data.shareUrl).toMatch(/token=/);
  });

  test('should not allow sharing replay if not participant', async () => {
    // Try to share game with different user
    const otherUserId = 'test-other-user-' + Date.now();

    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/replays/${testGameId}/share`,
      {},
      otherUserId
    );

    expect(response.status).toBe(403);
    expect(response.data.error).toMatch(/not a participant/);
  });

  test('should get game analysis', async () => {
    // Complete the game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}/analysis`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('gameId');
    expect(response.data).toHaveProperty('statistics');
    expect(response.data.statistics).toHaveProperty('movesByPlayer');
    expect(response.data.statistics).toHaveProperty('averageMoveTimeByPlayer');
    expect(response.data.statistics).toHaveProperty('averageMoveTime');
    expect(response.data).toHaveProperty('result');

    // Verify statistics are objects/numbers
    expect(typeof response.data.statistics.movesByPlayer).toBe('object');
    expect(typeof response.data.statistics.averageMoveTime).toBe('number');
  });

  test('should calculate move statistics correctly', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}/analysis`);

    expect(response.status).toBe(200);

    // Should have moves from our test game
    const movesByPlayer = response.data.statistics.movesByPlayer;
    expect(Object.keys(movesByPlayer).length).toBeGreaterThan(0);

    // Each player should have move counts
    for (const playerId in movesByPlayer) {
      expect(typeof movesByPlayer[playerId]).toBe('number');
      expect(movesByPlayer[playerId]).toBeGreaterThan(0);
    }
  });

  test('should get specific move details', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    // Get first move
    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}/moves/1`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('gameId');
    expect(response.data.gameId).toBe(testGameId);
    expect(response.data).toHaveProperty('moveNumber');
    expect(response.data.moveNumber).toBe(1);
    expect(response.data).toHaveProperty('playerId');
    expect(response.data).toHaveProperty('playerName');
    expect(response.data).toHaveProperty('action');
    expect(response.data).toHaveProperty('timestamp');
  });

  test('should return 404 for non-existent move', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    // Try to get move that doesn't exist
    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}/moves/999`);

    expect(response.status).toBe(404);
  });

  test('should return 404 for non-existent game replay', async () => {
    const response = await apiRequest(
      page,
      'GET',
      '/api/replays/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toBe(404);
  });

  test('should handle invalid move number', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}/moves/invalid`);

    expect(response.status).toBe(400);
  });

  test('should include player information in replay', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('players');
    expect(Array.isArray(response.data.players)).toBe(true);

    if (response.data.players.length > 0) {
      const player = response.data.players[0];
      expect(player).toHaveProperty('userId');
      expect(player).toHaveProperty('username');
      expect(player).toHaveProperty('rating');
    }
  });

  test('should include room information in replay', async () => {
    // Complete game
    await authenticatedApiRequest(page, 'POST', `/api/games/${testGameId}/resign`, {});

    const response = await apiRequest(page, 'GET', `/api/replays/${testGameId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('room');
    expect(response.data.room).toHaveProperty('id');
    expect(response.data.room).toHaveProperty('name');
  });
});
