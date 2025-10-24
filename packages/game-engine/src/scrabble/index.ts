export interface ScrabbleGameState {
  board: (ScrabbleTile | null)[][];
  players: ScrabblePlayerState[];
  tileBag: number; // remaining tiles
  currentPlayerIndex: number;
}

export interface ScrabblePlayerState {
  id: string;
  score: number;
  rack: ScrabbleTile[];
}

export interface ScrabbleTile {
  letter: string;
  value: number;
  isBlank: boolean;
}

export interface WordPlacement {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  tiles: ScrabbleTile[];
}

export const TILE_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10, '_': 0
};
