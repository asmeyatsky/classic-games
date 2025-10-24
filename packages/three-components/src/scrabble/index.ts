/**
 * Scrabble 3D Components
 *
 * Architectural Intent:
 * - Complete 3D Scrabble game components
 * - 15x15 board with premium squares
 * - Draggable letter tiles
 * - Player tile rack
 * - Tile bag with draw animation
 */

export interface Board3DProps {
  size?: number;
}

export interface Tile3DProps {
  letter: string;
  value: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  onDrag?: (position: [number, number, number]) => void;
  selected?: boolean;
  hovered?: boolean;
}

export interface RackProps {
  tiles: Array<{ letter: string; value: number }>;
  position: [number, number, number];
  onTileSelect?: (index: number) => void;
}

export interface TileBagProps {
  remaining: number;
  position: [number, number, number];
}

// Re-export from individual files
export * from './Board3D';
export * from './Tile3D';
