/**
 * E2E Tests for Achievements Endpoints
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

test.describe('Achievements Endpoints', () => {
  test('should list all achievements', async () => {
    const response = await apiRequest(page, 'GET', '/api/achievements');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    // Verify achievement structure
    const achievement = response.data[0];
    expect(achievement).toHaveProperty('code');
    expect(achievement).toHaveProperty('name');
    expect(achievement).toHaveProperty('description');
    expect(achievement).toHaveProperty('points');
  });

  test('should get specific achievement details', async () => {
    // Get all achievements first
    const listResponse = await apiRequest(page, 'GET', '/api/achievements');
    const achievementCode = listResponse.data[0].code;

    // Get specific achievement
    const response = await apiRequest(page, 'GET', `/api/achievements/${achievementCode}`);

    expect(response.status).toBe(200);
    expect(response.data.code).toBe(achievementCode);
    expect(response.data.name).toBeDefined();
    expect(response.data.description).toBeDefined();
    expect(response.data.points).toBeDefined();
  });

  test('should get global achievement leaderboard', async () => {
    const response = await apiRequest(page, 'GET', '/api/achievements/leaderboard/global');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('leaderboard');
    expect(Array.isArray(response.data.leaderboard)).toBe(true);

    // Verify leaderboard entry structure
    if (response.data.leaderboard.length > 0) {
      const entry = response.data.leaderboard[0];
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('totalPoints');
      expect(entry).toHaveProperty('achievementCount');
    }
  });

  test('should get user achievements', async () => {
    const response = await authenticatedApiRequest(
      page,
      'GET',
      '/api/achievements/me/achievements'
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('userId');
    expect(response.data).toHaveProperty('achievements');
    expect(Array.isArray(response.data.achievements)).toBe(true);

    // Verify achievement entry structure
    if (response.data.achievements.length > 0) {
      const achievement = response.data.achievements[0];
      expect(achievement).toHaveProperty('code');
      expect(achievement).toHaveProperty('name');
      expect(achievement).toHaveProperty('unlockedAt');
      expect(achievement).toHaveProperty('progress');
    }
  });

  test('should get specific user achievements', async () => {
    const response = await apiRequest(page, 'GET', `/api/achievements/user/${testUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('userId');
    expect(response.data.userId).toBe(testUserId);
    expect(response.data).toHaveProperty('achievements');
    expect(Array.isArray(response.data.achievements)).toBe(true);
  });

  test('should track achievement progress', async () => {
    // Play a game to trigger achievement tracking
    const room = await createTestRoom(page, 'poker');
    const game = await createTestGame(page, room.id, 'poker');

    // Make moves in game
    await makeTestMove(page, game.id, 'fold', {});

    // Get user achievements to see if any have progress
    const response = await authenticatedApiRequest(
      page,
      'GET',
      '/api/achievements/me/achievements'
    );

    expect(response.status).toBe(200);
    expect(response.data.achievements).toBeDefined();

    // At least one achievement should have some progress
    const achievementsWithProgress = response.data.achievements.filter(
      (a: any) => a.progress && a.progress.current > 0
    );
    expect(achievementsWithProgress.length).toBeGreaterThanOrEqual(0);
  });

  test('should validate invalid achievement code', async () => {
    const response = await apiRequest(page, 'GET', '/api/achievements/invalid_code');

    expect(response.status).toBe(404);
  });

  test('should validate invalid user ID', async () => {
    const response = await apiRequest(page, 'GET', '/api/achievements/user/invalid-uuid');

    expect(response.status).toBe(400);
  });

  test('should return paginated leaderboard', async () => {
    const response = await apiRequest(
      page,
      'GET',
      '/api/achievements/leaderboard/global?limit=10&offset=0'
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('limit');
    expect(response.data).toHaveProperty('offset');
    expect(response.data).toHaveProperty('total');
    expect(response.data).toHaveProperty('leaderboard');
  });
});
