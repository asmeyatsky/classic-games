/**
 * Game-related Zod Validation Schemas
 */

import { z } from 'zod';

// Poker Schemas
export const PokerMoveSchema = z.object({
  gameId: z.string().uuid(),
  playerId: z.string().min(1),
  action: z.enum(['fold', 'check', 'call', 'bet', 'raise', 'all-in']),
  amount: z.number().int().min(0).optional(),
  timestamp: z.number().optional(),
});

export type PokerMove = z.infer<typeof PokerMoveSchema>;

export const PokerGameStateSchema = z.object({
  gameId: z.string().uuid(),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      chips: z.number().min(0),
      bet: z.number().min(0),
      folded: z.boolean(),
      allIn: z.boolean(),
      position: z.enum(['dealer', 'small-blind', 'big-blind', 'early', 'middle', 'late']),
    })
  ),
  communityCards: z.array(
    z.object({
      suit: z.enum(['♠', '♥', '♦', '♣']),
      rank: z.enum(['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K']),
    })
  ),
  pot: z.number().min(0),
  currentBet: z.number().min(0),
  currentRound: z.enum(['pre-flop', 'flop', 'turn', 'river', 'showdown']),
  currentPlayerIndex: z.number().min(0),
  dealerIndex: z.number().min(0),
});

export type PokerGameState = z.infer<typeof PokerGameStateSchema>;

// Backgammon Schemas
export const BackgammonMoveSchema = z.object({
  gameId: z.string().uuid(),
  playerId: z.string().min(1),
  from: z.number().int().min(-1).max(24),
  to: z.number().int().min(-1).max(24),
  dice: z.number().int().min(1).max(6),
  timestamp: z.number().optional(),
});

export type BackgammonMove = z.infer<typeof BackgammonMoveSchema>;

export const BackgammonGameStateSchema = z.object({
  gameId: z.string().uuid(),
  board: z.array(z.number()).length(24),
  bar: z.object({
    white: z.number().min(0).max(15),
    black: z.number().min(0).max(15),
  }),
  bornOff: z.object({
    white: z.number().min(0).max(15),
    black: z.number().min(0).max(15),
  }),
  dice: z.tuple([z.number().min(1).max(6), z.number().min(1).max(6)]),
  currentPlayer: z.enum(['white', 'black']),
  doubleValue: z.number().min(1).max(64),
});

export type BackgammonGameState = z.infer<typeof BackgammonGameStateSchema>;

// Scrabble Schemas
export const ScrabblePlacementSchema = z.object({
  gameId: z.string().uuid(),
  playerId: z.string().min(1),
  word: z.string().min(2).max(15).toUpperCase(),
  startRow: z.number().int().min(0).max(14),
  startCol: z.number().int().min(0).max(14),
  direction: z.enum(['horizontal', 'vertical']),
  tiles: z.array(
    z.object({
      letter: z.string().length(1),
      value: z.number().int().min(0),
      premium: z.enum(['normal', 'double-letter', 'triple-letter', 'double-word', 'triple-word']).optional(),
    })
  ),
  timestamp: z.number().optional(),
});

export type ScrabblePlacement = z.infer<typeof ScrabblePlacementSchema>;

export const ScrabbleGameStateSchema = z.object({
  gameId: z.string().uuid(),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      rack: z.array(z.string()),
      score: z.number().min(0),
    })
  ),
  board: z.array(z.array(z.string().nullable())),
  tilesRemaining: z.number().min(0),
  currentPlayerIndex: z.number().min(0),
  consecutiveSkips: z.number().min(0),
  gameOver: z.boolean(),
});

export type ScrabbleGameState = z.infer<typeof ScrabbleGameStateSchema>;

// Generic Game Schemas
export const GameStartRequestSchema = z.object({
  gameType: z.enum(['poker', 'backgammon', 'scrabble']),
  players: z.array(z.string().min(1)),
  options: z.object({
    initialChips: z.number().int().min(10).optional(),
    timePerMove: z.number().int().min(10).optional(),
    maxTurns: z.number().int().min(1).optional(),
  }).optional(),
});

export type GameStartRequest = z.infer<typeof GameStartRequestSchema>;

export const GameActionRequestSchema = z.object({
  gameId: z.string().uuid(),
  playerId: z.string().min(1),
  action: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
  timestamp: z.number().optional(),
});

export type GameActionRequest = z.infer<typeof GameActionRequestSchema>;

export const GameStateResponseSchema = z.object({
  gameId: z.string().uuid(),
  status: z.enum(['waiting', 'active', 'paused', 'completed']),
  gameType: z.enum(['poker', 'backgammon', 'scrabble']),
  state: z.record(z.unknown()),
  currentPlayer: z.string().optional(),
  winner: z.string().optional(),
  timestamp: z.number(),
});

export type GameStateResponse = z.infer<typeof GameStateResponseSchema>;

/**
 * Validate game move request and return typed result
 */
export function validateGameMove(data: unknown, gameType: string) {
  switch (gameType) {
    case 'poker':
      return PokerMoveSchema.safeParse(data);
    case 'backgammon':
      return BackgammonMoveSchema.safeParse(data);
    case 'scrabble':
      return ScrabblePlacementSchema.safeParse(data);
    default:
      return { success: false, error: `Unknown game type: ${gameType}` };
  }
}

/**
 * Validate game state response
 */
export function validateGameState(data: unknown, gameType: string) {
  switch (gameType) {
    case 'poker':
      return PokerGameStateSchema.safeParse(data);
    case 'backgammon':
      return BackgammonGameStateSchema.safeParse(data);
    case 'scrabble':
      return ScrabbleGameStateSchema.safeParse(data);
    default:
      return { success: false, error: `Unknown game type: ${gameType}` };
  }
}
