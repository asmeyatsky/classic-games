/**
 * @classic-games/validation
 *
 * Request and response validation schemas using Zod
 *
 * Usage:
 * ```typescript
 * import { PokerMoveSchema, UserLoginSchema } from '@classic-games/validation';
 *
 * const moveData = { gameId: '123', playerId: 'p1', action: 'bet', amount: 100 };
 * const result = PokerMoveSchema.safeParse(moveData);
 *
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle validation errors
 * }
 * ```
 */

// Game Validation Schemas
export {
  PokerMoveSchema,
  PokerGameStateSchema,
  BackgammonMoveSchema,
  BackgammonGameStateSchema,
  ScrabblePlacementSchema,
  ScrabbleGameStateSchema,
  GameStartRequestSchema,
  GameActionRequestSchema,
  GameStateResponseSchema,
  validateGameMove,
  validateGameState,
  type PokerMove,
  type PokerGameState,
  type BackgammonMove,
  type BackgammonGameState,
  type ScrabblePlacement,
  type ScrabbleGameState,
  type GameStartRequest,
  type GameActionRequest,
  type GameStateResponse,
} from './game';

// User Validation Schemas
export {
  UserSignUpSchema,
  UserLoginSchema,
  UserProfileSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  UserStatisticsSchema,
  FriendRequestSchema,
  AchievementSchema,
  LeaderboardEntrySchema,
  type UserSignUp,
  type UserLogin,
  type UserProfile,
  type UpdateProfile,
  type ChangePassword,
  type UserStatistics,
  type FriendRequest,
  type Achievement,
  type LeaderboardEntry,
} from './user';

// Room Validation Schemas
export {
  CreateRoomSchema,
  JoinRoomSchema,
  RoomPlayerSchema,
  RoomSchema,
  RoomListFilterSchema,
  LeaveRoomSchema,
  KickPlayerSchema,
  InvitePlayerSchema,
  ChatMessageSchema,
  RoomEventSchema,
  SpectateRoomSchema,
  UpdateRoomSettingsSchema,
  type CreateRoom,
  type JoinRoom,
  type RoomPlayer,
  type Room,
  type RoomListFilter,
  type LeaveRoom,
  type KickPlayer,
  type InvitePlayer,
  type ChatMessage,
  type RoomEvent,
  type SpectateRoom,
  type UpdateRoomSettings,
} from './room';

// Utilities
export function validateRequest<T>(schema: any, data: unknown): { success: boolean; data?: T; errors?: any } {
  const result = schema.safeParse(data);
  return result.success ? { success: true, data: result.data } : { success: false, errors: result.error?.flatten() };
}

export function validateRequestThrow<T>(schema: any, data: unknown): T {
  const result = schema.parse(data);
  return result;
}
