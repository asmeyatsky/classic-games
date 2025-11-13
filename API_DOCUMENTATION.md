# Classic Games API - Complete Documentation

## Overview

The Classic Games API provides comprehensive endpoints for managing games, tournaments, achievements, social features, and more. All responses follow RESTful conventions with proper HTTP status codes.

## Base Configuration

- **Base URL**: `http://localhost:3001`
- **Protocol**: HTTP/REST
- **Response Format**: JSON
- **Authentication**: Bearer Token (Firebase)

## Authentication

Include the Authorization header with all authenticated endpoints:

```bash
Authorization: Bearer {firebase_token}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required/failed)
- `403` - Forbidden (not allowed)
- `404` - Not Found
- `500` - Internal Server Error

---

## Games API

### Create Game

```
POST /api/games
Authorization: Bearer {token}
Content-Type: application/json

{
  "roomId": "uuid",
  "gameType": "poker" | "backgammon" | "scrabble",
  "players": ["user-id-1", "user-id-2"]
}
```

**Response (201)**:

```json
{
  "game": {
    "id": "game-uuid",
    "roomId": "room-uuid",
    "gameType": "poker",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "moveCount": 0,
    "state": {
      "currentPlayer": 0,
      "deck": [...],
      "players": [...]
    }
  }
}
```

**Errors**:

- `400` - Invalid parameters
- `401` - Unauthorized
- `404` - Room not found

---

### Get Game State

```
GET /api/games/:gameId
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "status": "active",
  "gameType": "poker",
  "moveCount": 5,
  "state": {
    "currentPlayer": 1,
    "isGameOver": false,
    "deck": [...],
    "players": [...]
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errors**:

- `404` - Game not found

---

### Make Move

```
POST /api/games/:gameId/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "fold" | "check" | "raise" | ...,
  "details": {
    "amount": 100
  }
}
```

**Response (200)**:

```json
{
  "game": {
    "id": "game-uuid",
    "status": "active",
    "moveCount": 6,
    "state": {...},
    "lastMove": {
      "playerId": "user-id",
      "action": "fold",
      "timestamp": "2024-01-01T00:00:01Z"
    }
  }
}
```

**Errors**:

- `400` - Invalid move
- `401` - Unauthorized
- `404` - Game not found
- `403` - Not your turn

---

### Get Game History

```
GET /api/games/:gameId/history
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "moves": [
    {
      "moveNumber": 1,
      "playerId": "user-id",
      "action": "fold",
      "details": {},
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "totalMoves": 1
}
```

---

### Resign from Game

```
POST /api/games/:gameId/resign
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "game": {
    "id": "game-uuid",
    "status": "completed",
    "winnerId": "user-id-2",
    "completedAt": "2024-01-01T00:00:05Z"
  }
}
```

---

## Achievements API

### List All Achievements

```
GET /api/achievements
```

**Response (200)**:

```json
{
  "total": 15,
  "achievements": [
    {
      "id": "ach_1",
      "code": "first_win",
      "title": "First Win",
      "description": "Win your first game",
      "icon": "https://...",
      "points": 10
    }
  ]
}
```

---

### Get Achievement Details

```
GET /api/achievements/:code
```

**Response (200)**:

```json
{
  "id": "ach_1",
  "code": "first_win",
  "title": "First Win",
  "description": "Win your first game",
  "icon": "https://...",
  "points": 10,
  "category": "gameplay",
  "rarity": 85
}
```

**Errors**:

- `404` - Achievement not found

---

### Get User Achievements

```
GET /api/achievements/user/:userId
```

**Response (200)**:

```json
{
  "userId": "user-id",
  "stats": {
    "unlockedCount": 5,
    "totalAchievements": 15,
    "totalPoints": 150,
    "percentComplete": 33.33
  },
  "achievements": [
    {
      "id": "ach_1",
      "code": "first_win",
      "title": "First Win",
      "unlocked": true,
      "unlockedAt": "2024-01-01T00:00:00Z",
      "progress": {
        "current": 1,
        "required": 1
      }
    }
  ]
}
```

---

### Get Current User Achievements

```
GET /api/achievements/me/achievements
Authorization: Bearer {token}
```

Same response as Get User Achievements but for authenticated user.

---

### Get Achievement Leaderboard

```
GET /api/achievements/leaderboard/global?limit=50&offset=0
```

**Response (200)**:

```json
{
  "limit": 50,
  "offset": 0,
  "total": 1000,
  "entries": [
    {
      "rank": 1,
      "userId": "user-id",
      "username": "player1",
      "unlockedCount": 15,
      "totalPoints": 500
    }
  ]
}
```

---

## Tournaments API

### Create Tournament

```
POST /api/tournaments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Spring Tournament",
  "description": "A spring championship",
  "gameType": "poker",
  "format": "single_elimination" | "round_robin" | "swiss",
  "maxParticipants": 8,
  "entryFee": 10,
  "prizePool": 100,
  "isPublic": true
}
```

**Response (201)**:

```json
{
  "tournament": {
    "id": "tournament-uuid",
    "name": "Spring Tournament",
    "gameType": "poker",
    "format": "single_elimination",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    "createdBy": "user-id"
  }
}
```

---

### List Tournaments

```
GET /api/tournaments?gameType=poker&status=pending&limit=50&offset=0
```

**Response (200)**:

```json
{
  "limit": 50,
  "offset": 0,
  "total": 100,
  "tournaments": [
    {
      "id": "tournament-uuid",
      "name": "Spring Tournament",
      "gameType": "poker",
      "format": "single_elimination",
      "status": "pending",
      "participantCount": 5,
      "maxParticipants": 8,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Tournament Details

```
GET /api/tournaments/:tournamentId
```

**Response (200)**:

```json
{
  "tournament": {
    "id": "tournament-uuid",
    "name": "Spring Tournament",
    "gameType": "poker",
    "format": "single_elimination",
    "status": "active",
    "maxParticipants": 8,
    "prizePool": 100
  },
  "participants": [
    {
      "userId": "user-id",
      "username": "player1",
      "rating": 1600,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "matchups": [
    {
      "id": "match-uuid",
      "round": 1,
      "player1Id": "user-id-1",
      "player2Id": "user-id-2",
      "status": "pending"
    }
  ]
}
```

---

### Join Tournament

```
POST /api/tournaments/:tournamentId/join
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Joined tournament"
}
```

**Errors**:

- `400` - Already joined or tournament full
- `404` - Tournament not found

---

### Start Tournament

```
POST /api/tournaments/:tournamentId/start
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "tournament": {
    "id": "tournament-uuid",
    "status": "active"
  }
}
```

---

### Complete Tournament

```
POST /api/tournaments/:tournamentId/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "results": [
    {
      "participantId": "user-id-1",
      "placement": 1,
      "prizeAmount": 50
    }
  ]
}
```

**Response (200)**:

```json
{
  "tournament": {
    "id": "tournament-uuid",
    "status": "completed",
    "completedAt": "2024-01-01T00:00:00Z"
  },
  "results": [
    {
      "placement": 1,
      "participantId": "user-id-1",
      "prizeAmount": 50
    }
  ]
}
```

---

## Social API

### Send Friend Request

```
POST /api/social/friends/:userId/add
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Friend request sent"
}
```

**Errors**:

- `400` - Cannot add yourself or already friends
- `404` - User not found

---

### Accept Friend Request

```
POST /api/social/friends/:requesterId/accept
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Friend request accepted"
}
```

---

### Remove Friend

```
POST /api/social/friends/:userId/remove
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Friend removed"
}
```

---

### Get Friends List

```
GET /api/social/friends?status=accepted
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "userId": "user-id",
  "status": "accepted",
  "total": 25,
  "friends": [
    {
      "userId": "friend-id",
      "username": "friend1",
      "displayName": "Friend One",
      "avatar": "https://...",
      "rating": 1500,
      "status": "accepted",
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Block User

```
POST /api/social/block/:userId
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "User blocked"
}
```

**Errors**:

- `400` - User already blocked

---

### Create Clan

```
POST /api/social/clans
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dragon Slayers",
  "description": "A clan for experienced players",
  "isPublic": true
}
```

**Response (201)**:

```json
{
  "id": "clan-uuid",
  "name": "Dragon Slayers",
  "description": "A clan for experienced players",
  "isPublic": true,
  "founderId": "user-id",
  "memberCount": 1,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### List Clans

```
GET /api/social/clans?isPublic=true&limit=50&offset=0
```

**Response (200)**:

```json
{
  "limit": 50,
  "offset": 0,
  "total": 500,
  "clans": [
    {
      "id": "clan-uuid",
      "name": "Dragon Slayers",
      "description": "A clan for experienced players",
      "isPublic": true,
      "founderId": "user-id",
      "memberCount": 25,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Join Clan

```
POST /api/social/clans/:clanId/join
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Joined clan"
}
```

**Errors**:

- `400` - Already a member
- `404` - Clan not found

---

## Replays API

### Get Game Replay

```
GET /api/replays/:gameId
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "gameType": "poker",
  "status": "completed",
  "duration": 120,
  "moveCount": 15,
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:02:00Z",
  "room": {
    "id": "room-uuid",
    "name": "Poker Room 1"
  },
  "players": [
    {
      "userId": "user-id",
      "username": "player1",
      "displayName": "Player One",
      "rating": 1500
    }
  ],
  "moves": [
    {
      "moveNumber": 1,
      "playerId": "user-id",
      "playerName": "player1",
      "action": "fold",
      "details": {},
      "duration": 5,
      "timestamp": "2024-01-01T00:00:01Z"
    }
  ]
}
```

**Errors**:

- `404` - Game not found
- `403` - Game not completed

---

### Get User Replays

```
GET /api/replays?gameType=poker&limit=50&offset=0
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "userId": "user-id",
  "gameType": "poker",
  "limit": 50,
  "offset": 0,
  "total": 100,
  "replays": [
    {
      "gameId": "game-uuid",
      "gameType": "poker",
      "roomName": "Poker Room 1",
      "isWinner": true,
      "duration": 120,
      "moveCount": 15,
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:02:00Z"
    }
  ]
}
```

---

### Create Shareable Replay Link

```
POST /api/replays/:gameId/share
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "shareToken": "base64-encoded-token",
  "shareUrl": "/replays/game-uuid?token=base64-encoded-token",
  "expiresIn": 2592000
}
```

**Errors**:

- `403` - Not a game participant
- `404` - Game not found

---

### Get Game Analysis

```
GET /api/replays/:gameId/analysis
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "gameType": "poker",
  "duration": 120,
  "totalMoves": 15,
  "statistics": {
    "movesByPlayer": {
      "user-id-1": 8,
      "user-id-2": 7
    },
    "averageMoveTimeByPlayer": {
      "user-id-1": 10,
      "user-id-2": 8
    },
    "averageMoveTime": 9
  },
  "result": {
    "winnerId": "user-id-1",
    "points": {
      "user-id-1": 100,
      "user-id-2": 50
    }
  }
}
```

---

### Get Specific Move

```
GET /api/replays/:gameId/moves/:moveNumber
```

**Response (200)**:

```json
{
  "gameId": "game-uuid",
  "moveNumber": 1,
  "playerId": "user-id",
  "playerName": "player1",
  "action": "fold",
  "details": {},
  "duration": 5,
  "timestamp": "2024-01-01T00:00:01Z"
}
```

**Errors**:

- `404` - Move not found
- `400` - Invalid move number

---

## Rooms API

### Create Room

```
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Casual Poker",
  "gameType": "poker",
  "maxPlayers": 6,
  "isPublic": true
}
```

**Response (201)**:

```json
{
  "room": {
    "id": "room-uuid",
    "name": "Casual Poker",
    "gameType": "poker",
    "maxPlayers": 6,
    "isPublic": true,
    "status": "waiting",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### List Rooms

```
GET /api/rooms?gameType=poker&status=waiting&isPublic=true&limit=50&offset=0
```

**Response (200)**:

```json
{
  "limit": 50,
  "offset": 0,
  "total": 100,
  "rooms": [
    {
      "id": "room-uuid",
      "name": "Casual Poker",
      "gameType": "poker",
      "maxPlayers": 6,
      "playerCount": 3,
      "isPublic": true,
      "status": "waiting",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Room Details

```
GET /api/rooms/:roomId
```

**Response (200)**:

```json
{
  "room": {
    "id": "room-uuid",
    "name": "Casual Poker",
    "gameType": "poker",
    "maxPlayers": 6,
    "playerCount": 3,
    "isPublic": true,
    "status": "waiting"
  },
  "players": [
    {
      "userId": "user-id",
      "username": "player1",
      "displayName": "Player One",
      "rating": 1500
    }
  ]
}
```

---

### Join Room

```
POST /api/rooms/:roomId/join
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Joined room",
  "room": {
    "id": "room-uuid",
    "playerCount": 4
  }
}
```

**Errors**:

- `400` - Room full or already joined
- `404` - Room not found

---

### Leave Room

```
POST /api/rooms/:roomId/leave
Authorization: Bearer {token}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Left room"
}
```

---

## Leaderboard API

### Get Global Leaderboard

```
GET /api/leaderboard?limit=50&offset=0
```

**Response (200)**:

```json
{
  "limit": 50,
  "offset": 0,
  "total": 10000,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-id",
      "username": "topplayer",
      "rating": 2000,
      "gameCount": 500,
      "winCount": 300,
      "winPercentage": 60
    }
  ]
}
```

---

### Get Game-Specific Leaderboard

```
GET /api/leaderboard/:gameType?limit=50&offset=0
```

Game types: `poker`, `backgammon`, `scrabble`

**Response (200)**:

```json
{
  "gameType": "poker",
  "limit": 50,
  "offset": 0,
  "total": 5000,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-id",
      "username": "pokermaster",
      "rating": 1800,
      "gameCount": 250,
      "winCount": 150,
      "winPercentage": 60
    }
  ]
}
```

---

### Get User Ranking

```
GET /api/leaderboard/user/:userId
```

**Response (200)**:

```json
{
  "userId": "user-id",
  "username": "player1",
  "rank": 42,
  "rating": 1650,
  "gameCount": 100,
  "winCount": 55,
  "winPercentage": 55
}
```

---

### Get User Game-Specific Ranking

```
GET /api/leaderboard/user/:userId/:gameType
```

**Response (200)**:

```json
{
  "userId": "user-id",
  "username": "player1",
  "gameType": "poker",
  "rank": 25,
  "rating": 1700,
  "gameCount": 50,
  "winCount": 30,
  "winPercentage": 60
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Description of the error",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Error Codes

- `INVALID_PARAMETERS` - Validation error
- `UNAUTHORIZED` - Auth required or failed
- `FORBIDDEN` - Operation not allowed
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

API calls are rate-limited to:

- **Authenticated endpoints**: 100 requests per minute
- **Public endpoints**: 50 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Pagination

List endpoints support pagination with:

- `limit` (default: 50, max: 100) - Number of results
- `offset` (default: 0) - Starting position

---

## Filtering

Endpoints support various filters:

### Games

- `roomId` - Filter by room
- `gameType` - Filter by game type
- `status` - Filter by status (active, completed)

### Tournaments

- `gameType` - Filter by game type
- `status` - Filter by status (pending, active, completed)
- `format` - Filter by format

### Rooms

- `gameType` - Filter by game type
- `status` - Filter by status
- `isPublic` - Filter by public/private

### Leaderboards

- `gameType` - For game-specific boards
- `limit` - Result count

---

## WebSocket Events

Real-time updates via Socket.io on `/`:

### Game Events

- `game:state-updated` - Game state changed
- `game:move-made` - New move in game
- `game:ended` - Game completed

### Room Events

- `room:player-joined` - Player joined
- `room:player-left` - Player left
- `room:status-changed` - Room status changed

### Achievement Events

- `achievement:unlocked` - User unlocked achievement
- `achievement:progress-updated` - Achievement progress changed

---

## Examples

### Complete Game Flow

```bash
# 1. Create room
POST /api/rooms
{ "name": "Poker", "gameType": "poker", "maxPlayers": 2, "isPublic": true }

# 2. Join room
POST /api/rooms/:roomId/join

# 3. Create game
POST /api/games
{ "roomId": "...", "gameType": "poker", "players": ["user1", "user2"] }

# 4. Make moves
POST /api/games/:gameId/move
{ "action": "fold", "details": {} }

# 5. Get replay
GET /api/replays/:gameId
```

### Tournament Flow

```bash
# 1. Create tournament
POST /api/tournaments
{ "name": "Tournament", "gameType": "poker", "format": "single_elimination", ... }

# 2. Join tournament
POST /api/tournaments/:tournamentId/join

# 3. Start tournament
POST /api/tournaments/:tournamentId/start

# 4. Complete tournament
POST /api/tournaments/:tournamentId/complete
{ "results": [...] }
```

---

## Support

For API issues or questions:

- GitHub: https://github.com/anthropics/classic-games
- Email: support@classic-games.dev
- Discord: https://discord.gg/classic-games

---

**Last Updated**: November 13, 2024
**API Version**: 1.0.0
