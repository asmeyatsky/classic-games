/**
 * Shared UI Configuration and Constants
 */

export const UI_CONFIG = {
  /**
   * Layout Breakpoints (pixels)
   */
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1440,
  },

  /**
   * Colors - Design System Tokens
   */
  COLORS: {
    PRIMARY: '#2563eb',
    PRIMARY_DARK: '#1e40af',
    PRIMARY_LIGHT: '#60a5fa',
    SECONDARY: '#7c3aed',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    NEUTRAL_50: '#f9fafb',
    NEUTRAL_100: '#f3f4f6',
    NEUTRAL_200: '#e5e7eb',
    NEUTRAL_300: '#d1d5db',
    NEUTRAL_400: '#9ca3af',
    NEUTRAL_500: '#6b7280',
    NEUTRAL_600: '#4b5563',
    NEUTRAL_700: '#374151',
    NEUTRAL_800: '#1f2937',
    NEUTRAL_900: '#111827',
  },

  /**
   * Typography
   */
  TYPOGRAPHY: {
    FONT_FAMILY: {
      SANS: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      MONO: '"Fira Code", "Monaco", "Courier New", monospace',
    },
    FONT_SIZE: {
      XS: '0.75rem',
      SM: '0.875rem',
      BASE: '1rem',
      LG: '1.125rem',
      XL: '1.25rem',
      '2XL': '1.5rem',
      '3XL': '1.875rem',
      '4XL': '2.25rem',
    },
    FONT_WEIGHT: {
      LIGHT: 300,
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700,
      EXTRABOLD: 800,
    },
  },

  /**
   * Spacing Scale (pixels)
   */
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
    '3XL': '4rem',
    '4XL': '6rem',
  },

  /**
   * Border Radius
   */
  BORDER_RADIUS: {
    NONE: '0',
    SM: '0.125rem',
    BASE: '0.25rem',
    MD: '0.375rem',
    LG: '0.5rem',
    XL: '0.75rem',
    FULL: '9999px',
  },

  /**
   * Shadows
   */
  SHADOWS: {
    NONE: 'none',
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    BASE: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  /**
   * Z-Index Scale
   */
  ZINDEX: {
    HIDDEN: -1,
    BASE: 0,
    DROPDOWN: 1000,
    STICKY: 1100,
    FIXED: 1200,
    MODAL_BACKGROUND: 1300,
    MODAL: 1400,
    TOOLTIP: 1500,
    NOTIFICATION: 1600,
  },

  /**
   * Animation Durations (milliseconds)
   */
  ANIMATION_DURATION: {
    FAST: 150,
    BASE: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },

  /**
   * Transition Timings
   */
  TRANSITION: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    LINEAR: 'linear',
  },

  /**
   * Component Sizes
   */
  SIZES: {
    BUTTON_SM: '2rem',
    BUTTON_MD: '2.5rem',
    BUTTON_LG: '3rem',
    ICON_SM: '1rem',
    ICON_MD: '1.5rem',
    ICON_LG: '2rem',
    AVATAR_SM: '2rem',
    AVATAR_MD: '3rem',
    AVATAR_LG: '4rem',
  },

  /**
   * 3D Graphics Configuration
   */
  GRAPHICS_3D: {
    FIELD_OF_VIEW: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 1000,
    PIXEL_RATIO: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  },

  /**
   * Mobile-Specific Settings
   */
  MOBILE: {
    TOUCH_TARGET_SIZE: 48, // Minimum touch target size (pixels)
    SAFE_AREA_INSET_BOTTOM: 'env(safe-area-inset-bottom)',
    SAFE_AREA_INSET_TOP: 'env(safe-area-inset-top)',
    SAFE_AREA_INSET_LEFT: 'env(safe-area-inset-left)',
    SAFE_AREA_INSET_RIGHT: 'env(safe-area-inset-right)',
  },
} as const;

export const GAME_COLORS = {
  POKER: {
    TABLE_FELT: '#1a5f4a',
    CARD_BACK: '#003d66',
    CHIP_RED: '#ef4444',
    CHIP_BLUE: '#3b82f6',
    CHIP_WHITE: '#f5f5f5',
    CHIP_BLACK: '#1f2937',
  },
  BACKGAMMON: {
    LIGHT_POINT: '#d4a574',
    DARK_POINT: '#8b5a3c',
    BOARD_EDGE: '#3e2723',
    WHITE_PIECE: '#ffffff',
    BLACK_PIECE: '#000000',
    DICE_COLOR: '#ffffff',
  },
  SCRABBLE: {
    BOARD_BASE: '#e8c4a0',
    TILE_COLOR: '#e7d4b7',
    TILE_TEXT: '#3d3d3d',
    DOUBLE_WORD: '#8ac6d1',
    TRIPLE_WORD: '#d9534f',
    DOUBLE_LETTER: '#a3c5d4',
    TRIPLE_LETTER: '#3d7298',
  },
} as const;

export type Breakpoint = keyof typeof UI_CONFIG.BREAKPOINTS;
export type Color = keyof typeof UI_CONFIG.COLORS;
export type ZIndex = keyof typeof UI_CONFIG.ZINDEX;
