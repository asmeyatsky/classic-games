/**
 * E2E Tests for Game Endpoints
 */

import { test, expect, Page } from '@playwright/test';
import {
  authenticatedApiRequest,
  createTestRoom,
  createTestGame,
  makeTestMove,
  getGameState,
  getTestUser,
  apiRequest,
} from '../utils/test-helpers';

let page: Page;
let testUserId: string;
let testRoomId: string;
let testGameId: string;

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  testUserId = await getTestUser(page);

  // Create a test room for game tests
  const room = await createTestRoom(page, 'poker');
  testRoomId = room.id;
});

test.afterEach(async () => {
  await page.close();
});

test.describe('Game Endpoints', () => {
  test('should create a new game', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });

    expect(response.status).toBe(201);
    expect(response.data.game).toBeDefined();
    expect(response.data.game.id).toBeDefined();
    expect(response.data.game.status).toBe('active');
    expect(response.data.game.gameType).toBe('poker');

    testGameId = response.data.game.id;
  });

  test('should get game state', async () => {
    // First create a game
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });
    const gameId = createResponse.data.game.id;

    // Get game state
    const response = await apiRequest(page, 'GET', `/api/games/${gameId}`);

    expect(response.status).toBe(200);
    expect(response.data.gameId).toBe(gameId);
    expect(response.data.status).toBe('active');
    expect(response.data.gameType).toBe('poker');
    expect(response.data.state).toBeDefined();
    expect(response.data.moveCount).toBeGreaterThanOrEqual(0);
  });

  test('should make a valid move in poker game', async () => {
    // Create game
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });
    const gameId = createResponse.data.game.id;

    // Make a move
    const response = await authenticatedApiRequest(page, 'POST', `/api/games/${gameId}/move`, {
      action: 'fold',
      details: {},
    });

    expect(response.status).toBe(200);
    expect(response.data.game).toBeDefined();
    expect(response.data.game.moveCount).toBeGreaterThan(0);
  });

  test('should get game history', async () => {
    // Create game
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });
    const gameId = createResponse.data.game.id;

    // Make some moves
    await authenticatedApiRequest(page, 'POST', `/api/games/${gameId}/move`, {
      action: 'fold',
      details: {},
    });

    // Get history
    const response = await apiRequest(page, 'GET', `/api/games/${gameId}/history`);

    expect(response.status).toBe(200);
    expect(response.data.gameId).toBe(gameId);
    expect(response.data.moves).toBeDefined();
    expect(Array.isArray(response.data.moves)).toBe(true);
    expect(response.data.moves.length).toBeGreaterThan(0);
  });

  test('should resign from game', async () => {
    // Create game
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });
    const gameId = createResponse.data.game.id;

    // Resign
    const response = await authenticatedApiRequest(page, 'POST', `/api/games/${gameId}/resign`, {});

    expect(response.status).toBe(200);
    expect(response.data.game).toBeDefined();
    expect(response.data.game.status).toBe('completed');
  });

  test('should validate invalid game parameters', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: 'invalid-uuid',
      gameType: 'invalid',
      players: [],
    });

    expect(response.status).toBe(400);
  });

  test('should return 404 for non-existent game', async () => {
    const response = await apiRequest(
      page,
      'GET',
      '/api/games/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toBe(404);
  });

  test('should handle concurrent moves correctly', async () => {
    // Create game
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/games', {
      roomId: testRoomId,
      gameType: 'poker',
      players: [testUserId],
    });
    const gameId = createResponse.data.game.id;

    // Make multiple moves sequentially
    const move1 = await authenticatedApiRequest(page, 'POST', `/api/games/${gameId}/move`, {
      action: 'fold',
      details: {},
    });

    const move2 = await authenticatedApiRequest(page, 'POST', `/api/games/${gameId}/move`, {
      action: 'fold',
      details: {},
    });

    expect(move1.status).toBe(200);
    expect(move2.status).toBe(200);

    // Check game state
    const state = await getGameState(page, gameId);
    expect(state.moveCount).toBe(2);
  });

  test('should create different game types', async () => {
    const gameTypes = ['poker', 'backgammon', 'scrabble'];

    for (const gameType of gameTypes) {
      const response = await authenticatedApiRequest(page, 'POST', '/api/games', {
        roomId: testRoomId,
        gameType,
        players: [testUserId],
      });

      expect(response.status).toBe(201);
      expect(response.data.game.gameType).toBe(gameType);
    }
  });
});
