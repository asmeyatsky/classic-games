/**
 * Backgammon 3D Components
 *
 * Architectural Intent:
 * - Provides complete 3D backgammon game components
 * - Built with Three.js and React Three Fiber
 * - Physics-based dice rolling
 * - Proper checker stacking and movement
 * - Authentic wooden board design
 *
 * Key Design Decisions:
 * 1. Modular board with 24 points
 * 2. Stackable checker pieces
 * 3. Physics-based dice rolling
 * 4. Dice cup for shaking animation
 * 5. Real-world proportions and materials
 */

// Re-export components and types from individual files
export { Board3D } from './Board3D';
export type { Board3DProps } from './Board3D';

export { Checker3D } from './Checker3D';
export type { Checker3DProps } from './Checker3D';

export { Dice3D } from './Dice3D';
export type { Dice3DProps } from './Dice3D';
