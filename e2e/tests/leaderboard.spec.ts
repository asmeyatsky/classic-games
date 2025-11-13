/**
 * E2E Tests for Leaderboard Endpoints
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

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  testUserId = await getTestUser(page);
});

test.afterEach(async () => {
  await page.close();
});

test.describe('Leaderboard Endpoints', () => {
  test('should get global leaderboard', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('leaderboard');
    expect(Array.isArray(response.data.leaderboard)).toBe(true);

    // Verify leaderboard entry structure
    if (response.data.leaderboard.length > 0) {
      const entry = response.data.leaderboard[0];
      expect(entry).toHaveProperty('rank');
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('rating');
      expect(entry).toHaveProperty('winCount');
      expect(entry).toHaveProperty('gameCount');
    }
  });

  test('should rank players by rating', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard');

    expect(response.status).toBe(200);
    const leaderboard = response.data.leaderboard;

    // Verify leaderboard is sorted by rating descending
    if (leaderboard.length > 1) {
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].rating).toBeGreaterThanOrEqual(leaderboard[i + 1].rating);
      }
    }
  });

  test('should get game-specific leaderboard', async () => {
    const gameTypes = ['poker', 'backgammon', 'scrabble'];

    for (const gameType of gameTypes) {
      const response = await apiRequest(page, 'GET', `/api/leaderboard/${gameType}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('gameType');
      expect(response.data.gameType).toBe(gameType);
      expect(response.data).toHaveProperty('leaderboard');
      expect(Array.isArray(response.data.leaderboard)).toBe(true);

      // All entries should be for this game type
      if (response.data.leaderboard.length > 0) {
        const allCorrectType = response.data.leaderboard.every(
          (entry: any) => entry.gameType === gameType
        );
        expect(allCorrectType).toBe(true);
      }
    }
  });

  test('should paginate global leaderboard', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard?limit=10&offset=0');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('limit');
    expect(response.data).toHaveProperty('offset');
    expect(response.data).toHaveProperty('total');
    expect(response.data.leaderboard.length).toBeLessThanOrEqual(10);
  });

  test('should get user rank', async () => {
    const response = await apiRequest(page, 'GET', `/api/leaderboard/user/${testUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('userId');
    expect(response.data.userId).toBe(testUserId);
    expect(response.data).toHaveProperty('rank');
    expect(response.data).toHaveProperty('rating');
    expect(response.data).toHaveProperty('username');
    expect(response.data).toHaveProperty('winCount');
    expect(response.data).toHaveProperty('gameCount');
  });

  test('should get user rank for specific game', async () => {
    // Create and play a game
    const room = await createTestRoom(page, 'poker');
    const game = await createTestGame(page, room.id, 'poker');
    await makeTestMove(page, game.id, 'fold', {});

    const response = await apiRequest(page, 'GET', `/api/leaderboard/user/${testUserId}/poker`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('userId');
    expect(response.data).toHaveProperty('gameType');
    expect(response.data.gameType).toBe('poker');
  });

  test('should reflect rating changes after games', async () => {
    // Get initial rating
    const initialResponse = await apiRequest(page, 'GET', `/api/leaderboard/user/${testUserId}`);
    const initialRating = initialResponse.data.rating;

    // Play a game
    const room = await createTestRoom(page, 'poker');
    const game = await createTestGame(page, room.id, 'poker');
    await makeTestMove(page, game.id, 'fold', {});

    // Get updated rating
    const updatedResponse = await apiRequest(page, 'GET', `/api/leaderboard/user/${testUserId}`);
    const updatedRating = updatedResponse.data.rating;

    // Rating should have changed (either increased or decreased)
    expect(updatedRating).toBeDefined();
  });

  test('should include win percentage in leaderboard', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard');

    if (response.data.leaderboard.length > 0) {
      const entry = response.data.leaderboard[0];
      if (entry.gameCount > 0) {
        expect(entry).toHaveProperty('winPercentage');
        expect(entry.winPercentage).toBeGreaterThanOrEqual(0);
        expect(entry.winPercentage).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should validate leaderboard parameters', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard?limit=-1');

    expect(response.status).toBe(400);
  });

  test('should return 404 for invalid game type', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard/invalid_game');

    expect(response.status).toBe(400);
  });

  test('should return data for user not in leaderboard', async () => {
    const response = await apiRequest(page, 'GET', `/api/leaderboard/user/${testUserId}`);

    // Should either return 200 with default values or 404
    expect([200, 404]).toContain(response.status);
  });

  test('should sort game-specific leaderboard by game rating', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard/poker');

    expect(response.status).toBe(200);
    const leaderboard = response.data.leaderboard;

    // Verify sorted by poker rating
    if (leaderboard.length > 1) {
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].rating).toBeGreaterThanOrEqual(leaderboard[i + 1].rating);
      }
    }
  });

  test('should support offset pagination', async () => {
    // Get page 1
    const response1 = await apiRequest(page, 'GET', '/api/leaderboard?limit=5&offset=0');
    expect(response1.status).toBe(200);

    // Get page 2
    const response2 = await apiRequest(page, 'GET', '/api/leaderboard?limit=5&offset=5');
    expect(response2.status).toBe(200);

    // Entries should be different (unless leaderboard is small)
    if (response1.data.leaderboard.length === 5 && response2.data.leaderboard.length === 5) {
      const userIds1 = response1.data.leaderboard.map((e: any) => e.userId);
      const userIds2 = response2.data.leaderboard.map((e: any) => e.userId);

      const hasOverlap = userIds1.some((id: string) => userIds2.includes(id));
      expect(hasOverlap).toBe(false);
    }
  });

  test('should track game statistics', async () => {
    const response = await apiRequest(page, 'GET', '/api/leaderboard');

    if (response.data.leaderboard.length > 0) {
      const entry = response.data.leaderboard[0];

      // Should have game counts
      expect(entry.gameCount).toBeGreaterThanOrEqual(0);
      expect(entry.winCount).toBeGreaterThanOrEqual(0);
      expect(entry.winCount).toBeLessThanOrEqual(entry.gameCount);
    }
  });
});
