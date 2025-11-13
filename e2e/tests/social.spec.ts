/**
 * E2E Tests for Social Endpoints
 */

import { test, expect, Page } from '@playwright/test';
import { authenticatedApiRequest, apiRequest, getTestUser } from '../utils/test-helpers';

let page: Page;
let testUserId: string;
let clanId: string;

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  testUserId = await getTestUser(page);
});

test.afterEach(async () => {
  await page.close();
});

test.describe('Social Endpoints', () => {
  test('should send friend request', async () => {
    const targetUserId = 'test-user-friend-' + Date.now();

    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${targetUserId}/add`,
      {}
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('should prevent self-friend requests', async () => {
    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${testUserId}/add`,
      {}
    );

    expect(response.status).toBe(400);
    expect(response.data.error).toMatch(/Cannot add yourself/);
  });

  test('should accept friend request', async () => {
    const targetUserId = 'test-requester-' + Date.now();

    // Send friend request
    await authenticatedApiRequest(page, 'POST', `/api/social/friends/${targetUserId}/add`, {});

    // Accept request (as target user)
    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${testUserId}/accept`,
      {},
      targetUserId
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('should remove friend', async () => {
    const targetUserId = 'test-friend-' + Date.now();

    // Send and accept friend request
    await authenticatedApiRequest(page, 'POST', `/api/social/friends/${targetUserId}/add`, {});
    await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${testUserId}/accept`,
      {},
      targetUserId
    );

    // Remove friend
    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${targetUserId}/remove`,
      {}
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('should get friends list', async () => {
    const targetUserId = 'test-friend-list-' + Date.now();

    // Create a friend relationship
    await authenticatedApiRequest(page, 'POST', `/api/social/friends/${targetUserId}/add`, {});
    await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/friends/${testUserId}/accept`,
      {},
      targetUserId
    );

    // Get friends list
    const response = await authenticatedApiRequest(
      page,
      'GET',
      '/api/social/friends?status=accepted'
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('friends');
    expect(Array.isArray(response.data.friends)).toBe(true);

    // Should include our friend
    const friend = response.data.friends.find((f: any) => f.userId === targetUserId);
    expect(friend).toBeDefined();
  });

  test('should get pending friend requests', async () => {
    const targetUserId = 'test-pending-' + Date.now();

    // Send friend request
    await authenticatedApiRequest(page, 'POST', `/api/social/friends/${targetUserId}/add`, {});

    // Get pending requests (as target user)
    const response = await authenticatedApiRequest(
      page,
      'GET',
      '/api/social/friends?status=pending',
      undefined,
      targetUserId
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.friends)).toBe(true);
  });

  test('should block user', async () => {
    const targetUserId = 'test-blocked-' + Date.now();

    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/block/${targetUserId}`,
      {}
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('should prevent duplicate block', async () => {
    const targetUserId = 'test-block-dupe-' + Date.now();

    // Block user first time
    const response1 = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/block/${targetUserId}`,
      {}
    );
    expect(response1.status).toBe(200);

    // Try to block again
    const response2 = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/block/${targetUserId}`,
      {}
    );
    expect(response2.status).toBe(400);
  });

  test('should create clan', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Test Clan ${Date.now()}`,
      description: 'A test clan',
      isPublic: true,
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toMatch(/Test Clan/);
    expect(response.data.isPublic).toBe(true);
    expect(response.data.founderId).toBe(testUserId);
    expect(response.data.memberCount).toBe(1);

    clanId = response.data.id;
  });

  test('should list clans', async () => {
    // Create a clan
    await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Test Clan ${Date.now()}`,
      description: 'A test clan',
      isPublic: true,
    });

    // List clans
    const response = await apiRequest(page, 'GET', '/api/social/clans');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('clans');
    expect(Array.isArray(response.data.clans)).toBe(true);
    expect(response.data).toHaveProperty('total');
  });

  test('should filter clans by public status', async () => {
    // Create public clan
    await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Public Clan ${Date.now()}`,
      isPublic: true,
    });

    // Create private clan
    await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Private Clan ${Date.now()}`,
      isPublic: false,
    });

    // Get public clans
    const response = await apiRequest(page, 'GET', '/api/social/clans?isPublic=true');

    expect(response.status).toBe(200);
    const allPublic = response.data.clans.every((c: any) => c.isPublic === true);
    expect(allPublic).toBe(true);
  });

  test('should join clan', async () => {
    // Create clan as one user
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Join Test Clan ${Date.now()}`,
      isPublic: true,
    });

    const cId = createResponse.data.id;

    // Join as different user
    const joinResponse = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/clans/${cId}/join`,
      {},
      'test-user-joiner-' + Date.now()
    );

    expect(joinResponse.status).toBe(200);
    expect(joinResponse.data.success).toBe(true);
  });

  test('should prevent duplicate clan join', async () => {
    // Create clan
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: `Duplicate Join Test ${Date.now()}`,
      isPublic: true,
    });

    const cId = createResponse.data.id;

    // Creator is already a member, try to join again
    const response = await authenticatedApiRequest(
      page,
      'POST',
      `/api/social/clans/${cId}/join`,
      {}
    );

    expect(response.status).toBe(400);
    expect(response.data.error).toMatch(/Already a member/);
  });

  test('should paginate clan listings', async () => {
    // Create multiple clans
    for (let i = 0; i < 5; i++) {
      await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
        name: `Clan ${i} ${Date.now()}`,
        isPublic: true,
      });
    }

    // Get first page
    const response1 = await apiRequest(page, 'GET', '/api/social/clans?limit=2&offset=0');

    expect(response1.status).toBe(200);
    expect(response1.data.limit).toBe(2);
    expect(response1.data.offset).toBe(0);
    expect(response1.data.clans.length).toBeLessThanOrEqual(2);

    // Get second page
    const response2 = await apiRequest(page, 'GET', '/api/social/clans?limit=2&offset=2');

    expect(response2.status).toBe(200);
    expect(response2.data.offset).toBe(2);
  });

  test('should validate clan name', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/social/clans', {
      name: '',
      isPublic: true,
    });

    expect(response.status).toBe(400);
  });

  test('should return 404 for non-existent clan', async () => {
    const response = await apiRequest(
      page,
      'POST',
      '/api/social/clans/00000000-0000-0000-0000-000000000000/join',
      {}
    );

    expect([403, 404]).toContain(response.status);
  });
});
