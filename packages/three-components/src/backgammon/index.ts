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

export interface Board3DProps {
  woodTexture?: string;
  feltColor?: string;
}

export interface Checker3DProps {
  color: 'white' | 'black';
  position: [number, number, number];
  stackIndex?: number;
  onClick?: () => void;
  selected?: boolean;
  hovered?: boolean;
}

export interface Dice3DProps {
  value: number;
  position: [number, number, number];
  rolling: boolean;
  onRollComplete?: (value: number) => void;
}

export interface DiceCupProps {
  position: [number, number, number];
  shaking: boolean;
}

// Re-export from individual component files
export * from './Board3D';
export * from './Checker3D';
export * from './Dice3D';
