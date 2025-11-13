/**
 * Scrabble Game Configuration and Constants
 */

export const SCRABBLE_CONFIG = {
  /**
   * Game Rules
   */
  RULES: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 4,
    BOARD_SIZE: 15,
    TILES_PER_PLAYER: 7,
    TOTAL_TILES: 100,
  },

  /**
   * Board Dimensions
   */
  BOARD: {
    WIDTH: 15,
    HEIGHT: 15,
    TOTAL_SQUARES: 225,
  },

  /**
   * Premium Square Types and Multipliers
   */
  PREMIUM_SQUARES: {
    DOUBLE_WORD: 'DW',
    TRIPLE_WORD: 'TW',
    DOUBLE_LETTER: 'DL',
    TRIPLE_LETTER: 'TL',
    CENTER_SQUARE: 'CENTER',
    NORMAL: 'NORMAL',
  },

  /**
   * Tile Values
   */
  TILE_VALUES: {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10,
    BLANK: 0,
  },

  /**
   * Tile Distribution (Standard English Scrabble)
   */
  TILE_DISTRIBUTION: {
    A: 9,
    B: 2,
    C: 2,
    D: 4,
    E: 12,
    F: 2,
    G: 3,
    H: 2,
    I: 9,
    J: 1,
    K: 1,
    L: 4,
    M: 2,
    N: 6,
    O: 8,
    P: 2,
    Q: 1,
    R: 6,
    S: 4,
    T: 6,
    U: 4,
    V: 2,
    W: 2,
    X: 1,
    Y: 2,
    Z: 1,
    BLANK: 2,
  },

  /**
   * Game Phases
   */
  PHASES: {
    PLACEMENT: 'placement',
    CHALLENGE: 'challenge',
    SCORING: 'scoring',
    EXCHANGE: 'exchange',
    PASS: 'pass',
    END_GAME: 'end-game',
  },

  /**
   * Placement Rules
   */
  PLACEMENT: {
    FIRST_WORD_MUST_CROSS_CENTER: true,
    MINIMUM_WORD_LENGTH: 2,
    FIRST_TURN_SKIP_ALLOWED: true,
    CONSECUTIVE_SKIPS_UNTIL_END: 3,
  },

  /**
   * Valid Direction for Words
   */
  DIRECTIONS: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
  },

  /**
   * Game-Ending Rules
   */
  END_GAME: {
    TILES_DRAWN_EMPTY: true,
    CANNOT_PLACE_TILES: true,
    FINAL_WORD_BONUS: 50, // Bonus for using all 7 tiles (bingo/bonus)
  },

  /**
   * Animation Timings (milliseconds)
   */
  ANIMATION_TIMINGS: {
    TILE_PLACE: 200,
    TILE_DRAG: 150,
    WORD_HIGHLIGHT: 300,
    SCORE_UPDATE: 400,
    CHALLENGE_ANIMATION: 500,
  },

  /**
   * Game Constants
   */
  CONSTANTS: {
    SKIP_LIMIT: 3, // Maximum consecutive passes before game ends
    DEFAULT_RACK_SIZE: 7,
    MAX_WORD_LENGTH: 15,
  },
} as const;

export type PremiumSquareType = (typeof SCRABBLE_CONFIG.PREMIUM_SQUARES)[keyof typeof SCRABBLE_CONFIG.PREMIUM_SQUARES];
export type ScrabbleDirection = (typeof SCRABBLE_CONFIG.DIRECTIONS)[keyof typeof SCRABBLE_CONFIG.DIRECTIONS];
export type ScrabblePhase = (typeof SCRABBLE_CONFIG.PHASES)[keyof typeof SCRABBLE_CONFIG.PHASES];
