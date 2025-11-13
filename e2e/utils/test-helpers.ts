/**
 * Test helper utilities for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Mock authentication header
 */
const MOCK_USER_ID = 'test-user-' + Date.now();
const MOCK_AUTH_TOKEN = Buffer.from(MOCK_USER_ID).toString('base64');

/**
 * API request helper
 */
export async function apiRequest(
  page: Page,
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  headers?: Record<string, string>
) {
  const url = `${page.context().baseURL}${endpoint}`;

  const response = await page.evaluate(
    async ({ url, method, body, headers }) => {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return {
        status: res.status,
        ok: res.ok,
        data,
      };
    },
    { url, method, body, headers }
  );

  return response;
}

/**
 * Authenticated API request
 */
export async function authenticatedApiRequest(
  page: Page,
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  userId: string = MOCK_USER_ID
) {
  return apiRequest(page, method, endpoint, body, {
    Authorization: `Bearer ${Buffer.from(userId).toString('base64')}`,
  });
}

/**
 * Get or create test user
 */
export async function getTestUser(page: Page) {
  return MOCK_USER_ID;
}

/**
 * Create test room
 */
export async function createTestRoom(
  page: Page,
  gameType: 'poker' | 'backgammon' | 'scrabble' = 'poker'
) {
  const response = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
    name: `Test Room ${Date.now()}`,
    gameType,
    maxPlayers: 4,
    isPublic: true,
  });

  expect(response.ok).toBe(true);
  return response.data.room;
}

/**
 * Join test room
 */
export async function joinTestRoom(page: Page, roomId: string, userId: string = MOCK_USER_ID) {
  return authenticatedApiRequest(page, 'POST', `/api/rooms/${roomId}/join`, {}, userId);
}

/**
 * Create test game
 */
export async function createTestGame(page: Page, roomId: string, gameType: string = 'poker') {
  const response = await authenticatedApiRequest(page, 'POST', '/api/games', {
    roomId,
    gameType,
    players: [MOCK_USER_ID],
  });

  expect(response.ok).toBe(true);
  return response.data.game;
}

/**
 * Make test move
 */
export async function makeTestMove(
  page: Page,
  gameId: string,
  action: string,
  details?: Record<string, any>,
  userId: string = MOCK_USER_ID
) {
  return authenticatedApiRequest(
    page,
    'POST',
    `/api/games/${gameId}/move`,
    {
      action,
      details: details || {},
    },
    userId
  );
}

/**
 * Get game state
 */
export async function getGameState(page: Page, gameId: string) {
  const response = await apiRequest(page, 'GET', `/api/games/${gameId}`);
  expect(response.ok).toBe(true);
  return response.data;
}

/**
 * Assert API response
 */
export async function assertApiResponse(
  response: any,
  expectedStatus: number,
  expectedFields?: string[]
) {
  expect(response.status).toBe(expectedStatus);

  if (expectedFields) {
    for (const field of expectedFields) {
      expect(response.data).toHaveProperty(field);
    }
  }

  return response.data;
}

/**
 * Wait for condition
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Clear test data
 */
export async function clearTestData(page: Page) {
  // This would be implemented based on your test cleanup needs
  // For now, just a placeholder
  console.log('Test data cleared');
}
