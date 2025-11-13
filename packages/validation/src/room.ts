/**
 * Game Room and Session Validation Schemas
 */

import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  gameType: z.enum(['poker', 'backgammon', 'scrabble']),
  maxPlayers: z.number().int().min(2).max(6),
  isPrivate: z.boolean().optional(),
  password: z.string().min(4).optional(),
  minRating: z.number().int().min(0).optional(),
  timePerMove: z.number().int().min(10).max(300).optional(),
  autoStartTimeout: z.number().int().min(10).max(3600).optional(),
});

export type CreateRoom = z.infer<typeof CreateRoomSchema>;

export const JoinRoomSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  password: z.string().optional(),
});

export type JoinRoom = z.infer<typeof JoinRoomSchema>;

export const RoomPlayerSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
  rating: z.number().int().min(0),
  status: z.enum(['active', 'away', 'spectating', 'disconnected']),
  joinedAt: z.string().datetime(),
  isReady: z.boolean(),
});

export type RoomPlayer = z.infer<typeof RoomPlayerSchema>;

export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  gameType: z.enum(['poker', 'backgammon', 'scrabble']),
  host: z.string().uuid(),
  players: z.array(RoomPlayerSchema),
  spectators: z.array(
    z.object({
      userId: z.string().uuid(),
      username: z.string(),
    })
  ),
  maxPlayers: z.number().int().min(2).max(6),
  currentPlayers: z.number().int().min(0),
  isPrivate: z.boolean(),
  gameStarted: z.boolean(),
  createdAt: z.string().datetime(),
  startsAt: z.string().datetime().optional(),
  status: z.enum(['waiting', 'starting', 'in-progress', 'finished']),
  settings: z.object({
    timePerMove: z.number().int().min(10).optional(),
    minRating: z.number().int().min(0).optional(),
    autoStart: z.boolean().optional(),
  }),
});

export type Room = z.infer<typeof RoomSchema>;

export const RoomListFilterSchema = z.object({
  gameType: z.enum(['poker', 'backgammon', 'scrabble']).optional(),
  status: z.enum(['waiting', 'in-progress']).optional(),
  minPlayers: z.number().int().min(1).optional(),
  maxRating: z.number().int().min(0).optional(),
  hasPassword: z.boolean().optional(),
  sortBy: z.enum(['created', 'players', 'rating']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type RoomListFilter = z.infer<typeof RoomListFilterSchema>;

export const LeaveRoomSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  reason: z.enum(['disconnect', 'forfeit', 'normal']).optional(),
});

export type LeaveRoom = z.infer<typeof LeaveRoomSchema>;

export const KickPlayerSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  reason: z.string().max(200).optional(),
});

export type KickPlayer = z.infer<typeof KickPlayerSchema>;

export const InvitePlayerSchema = z.object({
  roomId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  message: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
});

export type InvitePlayer = z.infer<typeof InvitePlayerSchema>;

export const ChatMessageSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string(),
  message: z.string().min(1).max(500),
  timestamp: z.string().datetime(),
  type: z.enum(['message', 'system', 'emote']).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const RoomEventSchema = z.object({
  roomId: z.string().uuid(),
  type: z.enum([
    'player-joined',
    'player-left',
    'game-started',
    'game-ended',
    'settings-changed',
    'player-kicked',
    'message-posted',
  ]),
  userId: z.string().uuid().optional(),
  data: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export type RoomEvent = z.infer<typeof RoomEventSchema>;

export const SpectateRoomSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type SpectateRoom = z.infer<typeof SpectateRoomSchema>;

export const UpdateRoomSettingsSchema = z.object({
  roomId: z.string().uuid(),
  timePerMove: z.number().int().min(10).max(300).optional(),
  minRating: z.number().int().min(0).optional(),
  autoStart: z.boolean().optional(),
});

export type UpdateRoomSettings = z.infer<typeof UpdateRoomSettingsSchema>;
