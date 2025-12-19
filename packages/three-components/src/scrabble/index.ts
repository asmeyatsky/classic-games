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

// Re-export components and types from individual files
export { Board3D as ScrabbleBoard3D } from './Board3D';
export type { Board3DProps as ScrabbleBoard3DProps } from './Board3D';

export { Tile3D } from './Tile3D';
export type { Tile3DProps } from './Tile3D';
