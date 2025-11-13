/**
 * Poker Game Configuration and Constants
 */

export const POKER_CONFIG = {
  /**
   * Game Rules
   */
  RULES: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 6,
    STARTING_STACK: 1000,
    SMALL_BLIND: 10,
    BIG_BLIND: 20,
  },

  /**
   * Hand Rankings (highest to lowest)
   */
  HAND_RANKINGS: {
    ROYAL_FLUSH: {
      rank: 10,
      name: 'Royal Flush',
    },
    STRAIGHT_FLUSH: {
      rank: 9,
      name: 'Straight Flush',
    },
    FOUR_OF_A_KIND: {
      rank: 8,
      name: 'Four of a Kind',
    },
    FULL_HOUSE: {
      rank: 7,
      name: 'Full House',
    },
    FLUSH: {
      rank: 6,
      name: 'Flush',
    },
    STRAIGHT: {
      rank: 5,
      name: 'Straight',
    },
    THREE_OF_A_KIND: {
      rank: 4,
      name: 'Three of a Kind',
    },
    TWO_PAIR: {
      rank: 3,
      name: 'Two Pair',
    },
    ONE_PAIR: {
      rank: 2,
      name: 'One Pair',
    },
    HIGH_CARD: {
      rank: 1,
      name: 'High Card',
    },
  },

  /**
   * Card Values and Suits
   */
  CARDS: {
    SUITS: ['♠', '♥', '♦', '♣'] as const,
    RANKS: ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'] as const,
    CARDS_PER_SUIT: 13,
    TOTAL_CARDS: 52,
  },

  /**
   * Game Phases
   */
  PHASES: {
    PRE_FLOP: 'pre-flop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown',
  },

  /**
   * Action Types
   */
  ACTIONS: {
    CHECK: 'check',
    CALL: 'call',
    RAISE: 'raise',
    FOLD: 'fold',
    ALL_IN: 'all-in',
  },

  /**
   * Community Cards
   */
  COMMUNITY_CARDS: {
    FLOP_SIZE: 3,
    TURN_SIZE: 1,
    RIVER_SIZE: 1,
    TOTAL_SIZE: 5,
  },

  /**
   * Animation Timings (milliseconds)
   */
  ANIMATION_TIMINGS: {
    CARD_DEAL: 300,
    CARD_FLIP: 600,
    CHIP_MOVE: 400,
    PHASE_TRANSITION: 1000,
  },

  /**
   * UI Positions (for 6-player table)
   */
  TABLE_POSITIONS: {
    DEALER: 0,
    SMALL_BLIND: 1,
    BIG_BLIND: 2,
    EARLY: 3,
    MIDDLE: 4,
    LATE: 5,
  },
} as const;

export type PokerHandRank = keyof typeof POKER_CONFIG.HAND_RANKINGS;
export type PokerSuit = (typeof POKER_CONFIG.CARDS.SUITS)[number];
export type PokerRank = (typeof POKER_CONFIG.CARDS.RANKS)[number];
export type PokerPhase = (typeof POKER_CONFIG.PHASES)[keyof typeof POKER_CONFIG.PHASES];
export type PokerAction = (typeof POKER_CONFIG.ACTIONS)[keyof typeof POKER_CONFIG.ACTIONS];
