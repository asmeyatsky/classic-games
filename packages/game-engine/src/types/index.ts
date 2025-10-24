export enum GameType {
  POKER = 'poker',
  BACKGAMMON = 'backgammon',
  SCRABBLE = 'scrabble',
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isAI: boolean;
  connected: boolean;
}

export interface GameState<T = any> {
  id: string;
  type: GameType;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  gameData: T;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameAction {
  type: string;
  playerId: string;
  data: any;
  timestamp: Date;
}

export interface GameResult {
  winners: Player[];
  scores: Record<string, number>;
  finalState: GameState;
}
