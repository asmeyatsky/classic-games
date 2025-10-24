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

export interface Card3DProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceUp: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: () => void;
  hovered?: boolean;
  selected?: boolean;
}

export interface Chip3DProps {
  value: number;
  color: string;
  position: [number, number, number];
  count?: number;
  hovered?: boolean;
  onClick?: () => void;
}

export interface Table3DProps {
  seats: number;
  feltColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface DeckProps {
  position: [number, number, number];
  cardCount: number;
  faceUp?: boolean;
}

// Re-export from individual component files
export * from './Card3D';
export * from './Chip3D';
export * from './Table3D';
export * from './Deck3D';
