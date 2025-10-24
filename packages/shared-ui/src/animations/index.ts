/**
 * Animation System
 *
 * Architectural Intent:
 * - Provides a cohesive animation library for all platforms
 * - Encapsulates animation constants and easing functions
 * - Enables consistent, delightful micro-interactions
 * - Platform-agnostic animation definitions for web and mobile
 *
 * Key Design Decisions:
 * 1. Separation of animation timings from implementations (web CSS vs React Native)
 * 2. Named animations for semantic clarity and reusability
 * 3. Easing functions follow standard animation curves
 * 4. Duration constants scale from micro to macro interactions
 */

/**
 * Animation Duration Constants (milliseconds)
 * Organized by interaction type for semantic clarity
 */
export const AnimationDurations = {
  // Micro interactions: instant feedback
  instant: 100,

  // Quick interactions: button presses, toggles
  quick: 150,

  // Standard interactions: card reveals, transitions
  standard: 300,

  // Extended interactions: page transitions, major animations
  extended: 500,

  // Long interactions: complex sequences
  long: 800,

  // Very long: cinematic sequences
  cinematic: 1200,
} as const;

/**
 * Cubic Bezier Easing Functions
 * Standard easing curves for professional animations
 */
export const EasingFunctions = {
  // Linear: constant speed
  linear: 'cubic-bezier(0.25, 0.25, 0.75, 0.75)',

  // Ease In: slow start
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',

  // Ease Out: quick start, slow finish
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',

  // Ease In Out: slow start and finish
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',

  // Ease Back: anticipation effect
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Elastic: bouncy effect
  easeInElastic: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',
  easeOutElastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // For Spring-like animations
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

/**
 * Preset Animation Configurations
 * Complete animation definitions ready for implementation
 */
export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeOut,
  },
  fadeOut: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeIn,
  },

  // Slide animations
  slideInFromLeft: {
    duration: AnimationDurations.extended,
    easing: EasingFunctions.easeOutCubic,
  },
  slideInFromRight: {
    duration: AnimationDurations.extended,
    easing: EasingFunctions.easeOutCubic,
  },
  slideInFromTop: {
    duration: AnimationDurations.extended,
    easing: EasingFunctions.easeOutCubic,
  },
  slideInFromBottom: {
    duration: AnimationDurations.extended,
    easing: EasingFunctions.easeOutCubic,
  },

  // Scale animations
  scaleIn: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeOutBack,
  },
  scaleOut: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeInBack,
  },

  // Bounce animations
  bounce: {
    duration: AnimationDurations.cinematic,
    easing: EasingFunctions.spring,
  },

  // Pulse animations
  pulse: {
    duration: AnimationDurations.long,
    easing: EasingFunctions.easeInOut,
  },

  // Rotation animations
  spin: {
    duration: AnimationDurations.long,
    easing: EasingFunctions.linear,
  },

  // Game-specific animations
  cardFlip: {
    duration: AnimationDurations.extended,
    easing: EasingFunctions.easeInOutCubic,
  },
  chipStack: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeOutElastic,
  },
  diceRoll: {
    duration: AnimationDurations.cinematic,
    easing: EasingFunctions.easeOutCubic,
  },
  tilePlace: {
    duration: AnimationDurations.standard,
    easing: EasingFunctions.easeOutBack,
  },

  // Micro interactions
  buttonPress: {
    duration: AnimationDurations.quick,
    easing: EasingFunctions.easeInOut,
  },
  hover: {
    duration: AnimationDurations.quick,
    easing: EasingFunctions.easeOut,
  },
} as const;

/**
 * Transform utilities for animations
 * Provides common transformation presets
 */
export const Transforms = {
  scaleUp: 'scale(1.05)',
  scaleDown: 'scale(0.95)',
  translateLeft: 'translateX(-100%)',
  translateRight: 'translateX(100%)',
  translateUp: 'translateY(-100%)',
  translateDown: 'translateY(100%)',
  rotate90: 'rotate(90deg)',
  rotate180: 'rotate(180deg)',
  rotate360: 'rotate(360deg)',
} as const;

/**
 * Delay utility for staggered animations
 * Useful for animating multiple elements in sequence
 */
export const createAnimationDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Compose animation strings for inline styles
 * Platform-specific implementations will use these
 */
export const composeAnimation = (
  name: string,
  config: { duration: number; easing: string; delay?: number; iterationCount?: number }
): string => {
  const { duration, easing, delay = 0, iterationCount = 1 } = config;
  return `${name} ${duration}ms ${easing} ${delay}ms ${iterationCount === Infinity ? 'infinite' : `${iterationCount}`}`;
};
