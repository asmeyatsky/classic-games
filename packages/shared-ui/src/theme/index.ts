export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    backgroundLight: string;
    surface: string;
    surfaceLight: string;
    surfaceHover: string;
    surfaceActive: string;
    error: string;
    errorLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    accent: {
      gold: string;
      silver: string;
      bronze: string;
      neon: string;
    };
    gradient: {
      primary: string;
      secondary: string;
      premium: string;
      game: string;
    };
    game: {
      poker: {
        table: string;
        felt: string;
        felt_light: string;
        chip: string;
        chipGold: string;
        chipSilver: string;
      };
      backgammon: {
        board: string;
        light: string;
        dark: string;
        darkLight: string;
        checker: string;
      };
      scrabble: {
        board: string;
        tile: string;
        tileLight: string;
        premium: {
          doubleWord: string;
          tripleWord: string;
          doubleLetter: string;
          tripleLetter: string;
        };
      };
    };
  };
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
    xxxl: number;  // 64px
  };
  typography: {
    fontFamily: {
      regular: string;
      bold: string;
      mono: string;
      display: string;
    };
    fontSize: {
      xs: number;    // 12px
      sm: number;    // 14px
      md: number;    // 16px
      lg: number;    // 20px
      xl: number;    // 24px
      xxl: number;   // 32px
      xxxl: number;  // 48px
      display: number; // 64px
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    inner: string;
    glow: string;
    glow_primary: string;
    glow_secondary: string;
  };
  elevation: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  opacity: {
    disabled: number;
    hover: number;
    focus: number;
    active: number;
  };
}

/**
 * Premium Dark Luxury Theme
 *
 * Design Philosophy:
 * - Deep, sophisticated dark palette for premium feel
 * - Luxury accents (gold, silver) for special elements
 * - High contrast for accessibility
 * - Smooth gradients and layered shadows for depth
 * - Game-specific colors with subtle variations
 */
export const theme: Theme = {
  colors: {
    // Core brand colors with variations
    primary: '#0066CC',
    primaryLight: '#3B82F6',
    primaryDark: '#003A99',
    secondary: '#6B46C1',
    secondaryLight: '#8B5CF6',
    secondaryDark: '#4C1D95',

    // Background and surface layers
    background: '#0A0E1A',
    backgroundLight: '#131829',
    surface: '#1A1F2E',
    surfaceLight: '#252D3D',
    surfaceHover: '#2F3847',
    surfaceActive: '#3A4557',

    // Status colors with light variants
    error: '#EF4444',
    errorLight: '#FCA5A5',
    success: '#10B981',
    successLight: '#86EFAC',
    warning: '#F59E0B',
    warningLight: '#FCD34D',
    info: '#06B6D4',
    infoLight: '#67E8F9',

    // Text colors with proper contrast
    text: {
      primary: '#FFFFFF',
      secondary: '#B4BCC8',
      tertiary: '#7E8A9A',
      disabled: '#4B5563',
      inverse: '#0A0E1A',
    },

    // Luxury accents for premium elements
    accent: {
      gold: '#F59E0B',
      silver: '#E5E7EB',
      bronze: '#B45309',
      neon: '#06B6D4',
    },

    // Gradients for rich visual design
    gradient: {
      primary: 'linear-gradient(135deg, #0066CC 0%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)',
      premium: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
      game: 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 100%)',
    },

    // Game-specific color palettes
    game: {
      poker: {
        table: '#1A4D2E',
        felt: '#0F5132',
        felt_light: '#1B7741',
        chip: '#DC2626',
        chipGold: '#F59E0B',
        chipSilver: '#E5E7EB',
      },
      backgammon: {
        board: '#8B4513',
        light: '#DEB887',
        dark: '#654321',
        darkLight: '#8B6F47',
        checker: '#2D3142',
      },
      scrabble: {
        board: '#006B3F',
        tile: '#F5DEB3',
        tileLight: '#FFFACD',
        premium: {
          doubleWord: '#FF6B9D',
          tripleWord: '#E63946',
          doubleLetter: '#457B9D',
          tripleLetter: '#1D3557',
        },
      },
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  typography: {
    fontFamily: {
      regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Courier New", Courier, monospace',
      display: '"Inter", "Helvetica Neue", sans-serif',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 48,
      display: 64,
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    glow: '0 0 20px rgba(0, 102, 204, 0.15)',
    glow_primary: '0 0 30px rgba(0, 102, 204, 0.25), 0 0 60px rgba(0, 102, 204, 0.15)',
    glow_secondary: '0 0 30px rgba(107, 70, 193, 0.25), 0 0 60px rgba(107, 70, 193, 0.15)',
  },

  elevation: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 32,
  },

  blur: {
    sm: 'blur(4px)',
    md: 'blur(12px)',
    lg: 'blur(24px)',
    xl: 'blur(40px)',
  },

  opacity: {
    disabled: 0.5,
    hover: 0.8,
    focus: 0.9,
    active: 1,
  },
};
