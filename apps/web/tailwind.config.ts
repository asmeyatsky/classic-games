import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Premium Dark Luxury Tailwind Configuration
 *
 * Architectural Intent:
 * - Provides comprehensive design system tokens via Tailwind
 * - Enables rapid component development with pre-defined animations
 * - Maintains consistency across the application
 * - Supports both web and exported mobile design systems
 *
 * Key Design Decisions:
 * 1. All animations follow premium timing curves
 * 2. Glow effects for premium UI elements
 * 3. Gradient utilities for rich visual design
 * 4. Game-specific color tokens for easy theming
 */

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Enhanced color palette
      colors: {
        // Brand colors
        primary: '#0066CC',
        'primary-light': '#3B82F6',
        'primary-dark': '#003A99',
        secondary: '#6B46C1',
        'secondary-light': '#8B5CF6',
        'secondary-dark': '#4C1D95',

        // Background layers
        background: '#0A0E1A',
        'background-light': '#131829',
        surface: '#1A1F2E',
        'surface-light': '#252D3D',
        'surface-hover': '#2F3847',
        'surface-active': '#3A4557',

        // Status colors
        success: '#10B981',
        'success-light': '#86EFAC',
        error: '#EF4444',
        'error-light': '#FCA5A5',
        warning: '#F59E0B',
        'warning-light': '#FCD34D',
        info: '#06B6D4',
        'info-light': '#67E8F9',

        // Luxury accents
        gold: '#F59E0B',
        silver: '#E5E7EB',
        bronze: '#B45309',
        neon: '#06B6D4',

        // Game-specific colors - Poker
        'poker-table': '#1A4D2E',
        'poker-felt': '#0F5132',
        'poker-felt-light': '#1B7741',
        'poker-chip': '#DC2626',
        'poker-chip-gold': '#F59E0B',
        'poker-chip-silver': '#E5E7EB',

        // Game-specific colors - Backgammon
        'backgammon-board': '#8B4513',
        'backgammon-light': '#DEB887',
        'backgammon-dark': '#654321',
        'backgammon-dark-light': '#8B6F47',
        'backgammon-checker': '#2D3142',

        // Game-specific colors - Scrabble
        'scrabble-board': '#006B3F',
        'scrabble-tile': '#F5DEB3',
        'scrabble-tile-light': '#FFFACD',
        'scrabble-double-word': '#FF6B9D',
        'scrabble-triple-word': '#E63946',
        'scrabble-double-letter': '#457B9D',
        'scrabble-triple-letter': '#1D3557',
      },

      // Enhanced typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        display: ['"Inter"', '"Helvetica Neue"', 'sans-serif'],
      },

      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },

      // Enhanced spacing
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },

      // Enhanced border radius
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },

      // Premium shadows
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(0, 102, 204, 0.15)',
        'glow-primary':
          '0 0 30px rgba(0, 102, 204, 0.25), 0 0 60px rgba(0, 102, 204, 0.15)',
        'glow-secondary':
          '0 0 30px rgba(107, 70, 193, 0.25), 0 0 60px rgba(107, 70, 193, 0.15)',
      },

      // Blur effects
      backdropBlur: {
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '40px',
      },

      // Premium animations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'fade-out': 'fadeOut 300ms ease-in forwards',
        'fade-in-slow': 'fadeIn 500ms ease-out forwards',

        // Slide animations
        'slide-in-from-left':
          'slideInFromLeft 500ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'slide-in-from-right':
          'slideInFromRight 500ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'slide-in-from-top':
          'slideInFromTop 500ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'slide-in-from-bottom':
          'slideInFromBottom 500ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards',

        // Scale animations
        'scale-in': 'scaleIn 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'scale-out': 'scaleOut 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'scale-in-slow':
          'scaleIn 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',

        // Bounce animations
        bounce: 'bounce 1200ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite',
        'bounce-once': 'bounce 1200ms cubic-bezier(0.34, 1.56, 0.64, 1) 1',

        // Pulse animations
        pulse: 'pulse 800ms cubic-bezier(0.42, 0, 0.58, 1) infinite',
        'pulse-slow': 'pulse 2000ms cubic-bezier(0.42, 0, 0.58, 1) infinite',

        // Rotation animations
        spin: 'spin 800ms linear infinite',
        'spin-slow': 'spin 2000ms linear infinite',

        // Game-specific animations
        'card-flip': 'cardFlip 500ms cubic-bezier(0.645, 0.045, 0.355, 1) forwards',
        'chip-stack': 'chipStack 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'dice-roll': 'diceRoll 1200ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'tile-place': 'tilePlace 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',

        // Micro interactions
        'button-press': 'buttonPress 150ms cubic-bezier(0.42, 0, 0.58, 1) forwards',
        'hover-lift': 'hoverLift 150ms ease-out forwards',

        // Glow effects
        'glow-pulse': 'glowPulse 2000ms ease-in-out infinite',
      },

      keyframes: {
        // Fade keyframes
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },

        // Slide keyframes
        slideInFromLeft: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromTop: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromBottom: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },

        // Scale keyframes
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },

        // Bounce keyframes
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },

        // Pulse keyframes
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },

        // Spin keyframes
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },

        // Game-specific keyframes
        cardFlip: {
          from: { transform: 'rotateY(0deg)' },
          to: { transform: 'rotateY(180deg)' },
        },
        chipStack: {
          from: { transform: 'translateY(0)', opacity: '0' },
          to: { transform: 'translateY(-8px)', opacity: '1' },
        },
        diceRoll: {
          '0%': { transform: 'rotateX(0) rotateY(0) rotateZ(0)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg) rotateZ(180deg)' },
        },
        tilePlace: {
          from: { transform: 'scale(0.8) rotate(45deg)', opacity: '0' },
          to: { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },

        // Micro interaction keyframes
        buttonPress: {
          from: { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          to: { transform: 'scale(1)' },
        },
        hoverLift: {
          from: { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
          to: { transform: 'translateY(-4px)', boxShadow: '0 10px 15px rgba(0,0,0,0.2)' },
        },

        // Glow effect keyframes
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 204, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 204, 0.3)' },
        },
      },

      // Gradient backgrounds
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0066CC 0%, #3B82F6 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)',
        'gradient-game': 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0E1A 0%, #131829 50%, #1A1F2E 100%)',
      },
    },
  },

  plugins: [
    // Custom plugin for advanced utilities
    plugin(function ({ addBase, addComponents, addUtilities, theme }) {
      // Glass morphism effects
      addUtilities({
        '.glass': {
          '@apply backdrop-blur-md bg-white/10': {},
        },
        '.glass-lg': {
          '@apply backdrop-blur-lg bg-white/5': {},
        },

        // Utility classes for elevation
        '.elevation-xs': {
          boxShadow: theme('boxShadow.xs'),
        },
        '.elevation-sm': {
          boxShadow: theme('boxShadow.sm'),
        },
        '.elevation-md': {
          boxShadow: theme('boxShadow.md'),
        },
        '.elevation-lg': {
          boxShadow: theme('boxShadow.lg'),
        },
        '.elevation-xl': {
          boxShadow: theme('boxShadow.xl'),
        },

        // Text utilities
        '.text-gradient': {
          '@apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary': {},
        },

        // Smooth transitions
        '.transition-smooth': {
          '@apply transition-all duration-300 ease-out': {},
        },
        '.transition-smooth-slow': {
          '@apply transition-all duration-500 ease-out': {},
        },

        // Disabled state utilities
        '.disabled-state': {
          '@apply opacity-50 cursor-not-allowed pointer-events-none': {},
        },
      });
    }),
  ],
};

export default config;
