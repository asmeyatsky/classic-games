/**
 * E2E Tests for Room Endpoints
 */

import { test, expect, Page } from '@playwright/test';
import {
  authenticatedApiRequest,
  createTestRoom,
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

test.describe('Room Endpoints', () => {
  test('should create a new room', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Test Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 4,
      isPublic: true,
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('room');
    expect(response.data.room).toHaveProperty('id');
    expect(response.data.room.name).toMatch(/Test Room/);
    expect(response.data.room.gameType).toBe('poker');
    expect(response.data.room.maxPlayers).toBe(4);
    expect(response.data.room.isPublic).toBe(true);
    expect(response.data.room.status).toBe('waiting');
  });

  test('should list available rooms', async () => {
    // Create a room first
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Test Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 4,
      isPublic: true,
    });

    // List rooms
    const response = await apiRequest(page, 'GET', '/api/rooms?gameType=poker');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('rooms');
    expect(Array.isArray(response.data.rooms)).toBe(true);

    // Should include the room we created
    const createdRoom = response.data.rooms.find((r: any) => r.id === createResponse.data.room.id);
    expect(createdRoom).toBeDefined();
  });

  test('should get room details', async () => {
    // Create room
    const createResponse = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Test Room ${Date.now()}`,
      gameType: 'backgammon',
      maxPlayers: 2,
      isPublic: true,
    });

    const roomId = createResponse.data.room.id;

    // Get details
    const response = await apiRequest(page, 'GET', `/api/rooms/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('room');
    expect(response.data.room.id).toBe(roomId);
    expect(response.data.room.gameType).toBe('backgammon');
    expect(response.data.room.maxPlayers).toBe(2);
  });

  test('should join room', async () => {
    // Create room
    const room = await createTestRoom(page, 'poker');

    // Join room
    const response = await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/join`, {});

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify player is in room
    const detailsResponse = await apiRequest(page, 'GET', `/api/rooms/${room.id}`);
    const hasPlayer = detailsResponse.data.room.playerCount > 0;
    expect(hasPlayer).toBe(true);
  });

  test('should leave room', async () => {
    // Create and join room
    const room = await createTestRoom(page, 'poker');
    await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/join`, {});

    // Leave room
    const response = await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/leave`, {});

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('should prevent joining full room', async () => {
    // Create room with maxPlayers=1
    const response1 = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Full Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 1,
      isPublic: true,
    });

    const roomId = response1.data.room.id;

    // Join as first player
    await authenticatedApiRequest(page, 'POST', `/api/rooms/${roomId}/join`, {});

    // Try to join as second player
    const response2 = await authenticatedApiRequest(
      page,
      'POST',
      `/api/rooms/${roomId}/join`,
      {},
      'test-second-player-' + Date.now()
    );

    expect(response2.status).toBe(400);
    expect(response2.data.error).toMatch(/full|no space|occupied/i);
  });

  test('should prevent duplicate room join', async () => {
    // Create room
    const room = await createTestRoom(page, 'poker');

    // Join once
    const response1 = await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/join`, {});
    expect(response1.status).toBe(200);

    // Try to join again
    const response2 = await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/join`, {});
    expect(response2.status).toBe(400);
  });

  test('should support different game types', async () => {
    const gameTypes = ['poker', 'backgammon', 'scrabble'];

    for (const gameType of gameTypes) {
      const response = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
        name: `Test ${gameType} Room ${Date.now()}`,
        gameType,
        maxPlayers: 4,
        isPublic: true,
      });

      expect(response.status).toBe(201);
      expect(response.data.room.gameType).toBe(gameType);
    }
  });

  test('should filter rooms by game type', async () => {
    // Create rooms for different games
    await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Poker Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 4,
      isPublic: true,
    });

    await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Scrabble Room ${Date.now()}`,
      gameType: 'scrabble',
      maxPlayers: 4,
      isPublic: true,
    });

    // Get poker rooms
    const response = await apiRequest(page, 'GET', '/api/rooms?gameType=poker');

    expect(response.status).toBe(200);
    const allPoker = response.data.rooms.every((r: any) => r.gameType === 'poker');
    expect(allPoker).toBe(true);
  });

  test('should filter rooms by status', async () => {
    const response = await apiRequest(page, 'GET', '/api/rooms?status=waiting');

    expect(response.status).toBe(200);
    if (response.data.rooms.length > 0) {
      const allWaiting = response.data.rooms.every((r: any) => r.status === 'waiting');
      expect(allWaiting).toBe(true);
    }
  });

  test('should list only public rooms by default', async () => {
    // Create both public and private rooms
    await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Public Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 4,
      isPublic: true,
    });

    await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: `Private Room ${Date.now()}`,
      gameType: 'poker',
      maxPlayers: 4,
      isPublic: false,
    });

    // List public rooms
    const response = await apiRequest(page, 'GET', '/api/rooms?isPublic=true');

    expect(response.status).toBe(200);
    if (response.data.rooms.length > 0) {
      const allPublic = response.data.rooms.every((r: any) => r.isPublic === true);
      expect(allPublic).toBe(true);
    }
  });

  test('should paginate room listings', async () => {
    // Create multiple rooms
    for (let i = 0; i < 5; i++) {
      await authenticatedApiRequest(page, 'POST', '/api/rooms', {
        name: `Room ${i} ${Date.now()}`,
        gameType: 'poker',
        maxPlayers: 4,
        isPublic: true,
      });
    }

    // Get first page
    const response1 = await apiRequest(page, 'GET', '/api/rooms?limit=2&offset=0');

    expect(response1.status).toBe(200);
    expect(response1.data).toHaveProperty('limit');
    expect(response1.data).toHaveProperty('offset');
    expect(response1.data).toHaveProperty('total');

    // Get second page
    const response2 = await apiRequest(page, 'GET', '/api/rooms?limit=2&offset=2');

    expect(response2.status).toBe(200);
    expect(response2.data.offset).toBe(2);
  });

  test('should validate room parameters', async () => {
    const response = await authenticatedApiRequest(page, 'POST', '/api/rooms', {
      name: '',
      gameType: 'invalid',
      maxPlayers: -1,
      isPublic: 'not-a-boolean',
    });

    expect(response.status).toBe(400);
  });

  test('should return 404 for non-existent room', async () => {
    const response = await apiRequest(
      page,
      'GET',
      '/api/rooms/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toBe(404);
  });

  test('should get room players', async () => {
    // Create and join room
    const room = await createTestRoom(page, 'poker');
    await authenticatedApiRequest(page, 'POST', `/api/rooms/${room.id}/join`, {});

    // Get room details
    const response = await apiRequest(page, 'GET', `/api/rooms/${room.id}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('players');
    expect(Array.isArray(response.data.players)).toBe(true);
    expect(response.data.players.length).toBeGreaterThan(0);

    // Verify player structure
    const player = response.data.players[0];
    expect(player).toHaveProperty('userId');
    expect(player).toHaveProperty('username');
    expect(player).toHaveProperty('rating');
  });
});
