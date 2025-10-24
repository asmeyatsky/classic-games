/**
 * Common 3D Utilities and Components
 *
 * Architectural Intent:
 * - Provides shared infrastructure for all 3D components
 * - Lighting setups optimized for different games
 * - Material presets for consistency
 * - Animation utilities for smooth transitions
 * - Camera configurations for various perspectives
 *
 * Key Design Decisions:
 * 1. Preset-based approach for quick configuration
 * 2. Game-specific lighting profiles
 * 3. PBR materials for realistic appearance
 * 4. Reusable utilities for common 3D operations
 */

export interface LightingSetup {
  ambient: { intensity: number; color: string };
  directional: { intensity: number; position: [number, number, number]; castShadow?: boolean };
  spotlight?: { intensity: number; position: [number, number, number]; target: [number, number, number] };
  shadows: boolean;
}

/**
 * Lighting configurations optimized for different games
 */
export const lightingProfiles = {
  poker: {
    ambient: { intensity: 0.6, color: '#ffffff' },
    directional: { intensity: 1.2, position: [5, 8, 5], castShadow: true },
    shadows: true,
  } as LightingSetup,

  backgammon: {
    ambient: { intensity: 0.5, color: '#ffffff' },
    directional: { intensity: 1.0, position: [4, 6, 4], castShadow: true },
    shadows: true,
  } as LightingSetup,

  scrabble: {
    ambient: { intensity: 0.7, color: '#ffffff' },
    directional: { intensity: 1.1, position: [3, 7, 3], castShadow: true },
    shadows: true,
  } as LightingSetup,
};

export const defaultLighting: LightingSetup = lightingProfiles.poker;

/**
 * Material presets using PBR (Physically Based Rendering)
 * All materials use realistic roughness and metalness values
 */
export const materials = {
  // Wood materials for table edges and legs
  wood: {
    color: '#8B4513',
    roughness: 0.8,
    metalness: 0.1,
  },
  'wood-light': {
    color: '#DEB887',
    roughness: 0.75,
    metalness: 0.05,
  },

  // Felt materials for table surfaces
  felt: {
    color: '#0F5132',
    roughness: 0.95,
    metalness: 0.0,
  },
  'felt-light': {
    color: '#1B7741',
    roughness: 0.9,
    metalness: 0.0,
  },

  // Plastic materials for chips and game pieces
  plastic: {
    color: '#FFFFFF',
    roughness: 0.3,
    metalness: 0.2,
  },
  'plastic-matte': {
    color: '#E0E0E0',
    roughness: 0.6,
    metalness: 0.0,
  },

  // Metal materials for accents and details
  metal: {
    color: '#C0C0C0',
    roughness: 0.2,
    metalness: 0.9,
  },
  'gold': {
    color: '#FFD700',
    roughness: 0.3,
    metalness: 0.8,
  },
  'silver': {
    color: '#E8E8E8',
    roughness: 0.15,
    metalness: 0.95,
  },
};

/**
 * Camera presets for different game perspectives
 */
export interface CameraSetup {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

export const cameraProfiles = {
  pokerTable: {
    position: [0, 5, 8] as [number, number, number],
    target: [0, 0.5, 0] as [number, number, number],
    fov: 50,
  } as CameraSetup,

  overhead: {
    position: [0, 10, 0.1] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    fov: 60,
  } as CameraSetup,

  closeup: {
    position: [2, 2, 3] as [number, number, number],
    target: [0, 0.5, 0] as [number, number, number],
    fov: 35,
  } as CameraSetup,
};

/**
 * Animation easing functions for smooth 3D animations
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Utility functions for 3D operations
 */
export const vector3Utils = {
  /**
   * Lerp between two 3D vectors
   */
  lerp: (
    a: [number, number, number],
    b: [number, number, number],
    t: number
  ): [number, number, number] => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ],

  /**
   * Distance between two 3D points
   */
  distance: (a: [number, number, number], b: [number, number, number]): number => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Normalize a vector
   */
  normalize: (v: [number, number, number]): [number, number, number] => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  },
};

/**
 * Physics-like simulation helpers
 */
export const physicsUtils = {
  /**
   * Apply gravity to a velocity
   */
  applyGravity: (velocity: [number, number, number], gravity = 0.01): [number, number, number] => [
    velocity[0],
    velocity[1] - gravity,
    velocity[2],
  ],

  /**
   * Apply damping to velocity
   */
  applyDamping: (
    velocity: [number, number, number],
    damping = 0.99
  ): [number, number, number] => [
    velocity[0] * damping,
    velocity[1] * damping,
    velocity[2] * damping,
  ],

  /**
   * Calculate arc trajectory for dealing cards
   */
  calculateCardArc: (
    startPos: [number, number, number],
    endPos: [number, number, number],
    progress: number
  ): [number, number, number] => {
    const height = Math.sin(progress * Math.PI) * 0.3;
    const x = startPos[0] + (endPos[0] - startPos[0]) * progress;
    const y = startPos[1] + (endPos[1] - startPos[1]) * progress + height;
    const z = startPos[2] + (endPos[2] - startPos[2]) * progress;
    return [x, y, z];
  },
};
