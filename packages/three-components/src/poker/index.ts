/**
 * Poker 3D Components
 *
 * Architectural Intent:
 * - Provides realistic 3D components for poker gameplay
 * - Built with Three.js and React Three Fiber
 * - Smooth animations and physics-based interactions
 * - Game-specific visual feedback
 *
 * Key Design Decisions:
 * 1. Modular components for cards, chips, table
 * 2. Physics-based movement and stacking
 * 3. Realistic materials (felt, plastic, wood)
 * 4. Particle effects for dealing and shuffling
 */

// Re-export components and types from individual files
export { Card3D } from './Card3D';
export type { Card3DProps } from './Card3D';

export { Chip3D } from './Chip3D';
export type { Chip3DProps } from './Chip3D';

export { Table3D } from './Table3D';
export type { Table3DProps } from './Table3D';

export { Deck3D } from './Deck3D';
export type { DeckProps } from './Deck3D';
