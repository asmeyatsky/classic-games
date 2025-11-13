/**
 * Backgammon Game Configuration and Constants
 */

export const BACKGAMMON_CONFIG = {
  /**
   * Game Rules
   */
  RULES: {
    PLAYERS: 2,
    STARTING_PIECES: 15,
    BOARD_POINTS: 24,
    HOME_POINTS: 6,
    WINNING_SCORE: 1,
  },

  /**
   * Board Layout
   * Standard backgammon board configuration
   */
  BOARD: {
    TOTAL_POINTS: 24,
    HOME_SIDE_START: 18, // Points 19-24 are home
    HOME_SIDE_END: 24,
    STARTING_CONFIGURATION: {
      WHITE: {
        1: 2, // 2 pieces on point 1
        12: 5, // 5 pieces on point 12
        17: 3, // 3 pieces on point 17
        19: 5, // 5 pieces on point 19
      },
      BLACK: {
        6: 5, // 5 pieces on point 6
        8: 3, // 3 pieces on point 8
        13: 5, // 5 pieces on point 13
        24: 2, // 2 pieces on point 24
      },
    },
  },

  /**
   * Dice Configuration
   */
  DICE: {
    SIDES: 6,
    DICE_COUNT: 2,
    MIN_VALUE: 1,
    MAX_VALUE: 6,
  },

  /**
   * Game States
   */
  PHASES: {
    ROLL: 'roll',
    MOVE: 'move',
    END_TURN: 'end-turn',
    BEARING_OFF: 'bearing-off',
    GAME_OVER: 'game-over',
  },

  /**
   * Player Colors
   */
  COLORS: {
    WHITE: 'white',
    BLACK: 'black',
  },

  /**
   * Piece Movement
   */
  MOVEMENT: {
    DIRECTION_WHITE: 1, // White moves forward
    DIRECTION_BLACK: -1, // Black moves backward
    CAPTURE_MINIMUM_DISTANCE: 1,
  },

  /**
   * Special Rules
   */
  SPECIAL: {
    BLOT_PIECES: 1, // Pieces that can be captured
    SAFE_PIECES: 2, // Pieces that cannot be captured
    BEARING_OFF_REQUIRED: true,
  },

  /**
   * Animation Timings (milliseconds)
   */
  ANIMATION_TIMINGS: {
    DICE_ROLL: 600,
    PIECE_MOVE: 400,
    CAPTURE_ANIMATION: 500,
    BEARING_OFF_ANIMATION: 300,
    PHASE_TRANSITION: 500,
  },

  /**
   * Scoring
   */
  SCORING: {
    MATCH_WIN: 1,
    GAMMON: 2, // Win with opponent having pieces on bar or home
    BACKGAMMON: 3, // Win with opponent having pieces on bar
  },
} as const;

export type BackgammonColor = (typeof BACKGAMMON_CONFIG.COLORS)[keyof typeof BACKGAMMON_CONFIG.COLORS];
export type BackgammonPhase = (typeof BACKGAMMON_CONFIG.PHASES)[keyof typeof BACKGAMMON_CONFIG.PHASES];
