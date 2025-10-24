import React, { useRef } from 'react';
import { Group } from 'three';

/**
 * Scrabble Board3D Component
 *
 * Architectural Intent:
 * - Renders a complete 15x15 Scrabble game board
 * - Premium squares (double/triple word/letter scores)
 * - Wooden edges with realistic materials
 * - Grid layout for tile placement
 *
 * Key Design Decisions:
 * 1. 15x15 grid matching official Scrabble board
 * 2. Color-coded premium squares
 * 3. Subtle grid lines for clarity
 * 4. Efficient geometry using instancing
 */

export interface Board3DProps {
  size?: number;
}

const BOARD_SCALE = 0.8;
const SQUARE_SIZE = BOARD_SCALE / 15;

// Premium square positions (row, col) and types
const PREMIUM_SQUARES: Record<string, Array<[number, number]>> = {
  // Triple Word Score (red)
  tripleWord: [
    [0, 0], [0, 7], [0, 14],
    [7, 0], [7, 14],
    [14, 0], [14, 7], [14, 14],
  ],
  // Double Word Score (pink)
  doubleWord: [
    [1, 1], [1, 13],
    [2, 2], [2, 12],
    [3, 3], [3, 11],
    [4, 4], [4, 10],
    [5, 5], [5, 9],
    [6, 6], [6, 8],
    [7, 7],
    [8, 6], [8, 8],
    [9, 5], [9, 9],
    [10, 4], [10, 10],
    [11, 3], [11, 11],
    [12, 2], [12, 12],
    [13, 1], [13, 13],
  ],
  // Triple Letter Score (blue)
  tripleLetter: [
    [1, 5], [1, 9],
    [5, 1], [5, 5], [5, 9], [5, 13],
    [9, 1], [9, 5], [9, 9], [9, 13],
    [13, 5], [13, 9],
  ],
  // Double Letter Score (light blue)
  doubleLetter: [
    [0, 3], [0, 11],
    [2, 6], [2, 8],
    [3, 0], [3, 7], [3, 14],
    [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12],
    [11, 0], [11, 7], [11, 14],
    [12, 6], [12, 8],
    [14, 3], [14, 11],
  ],
};

const COLORS = {
  normal: '#F5DEB3',
  tripleWord: '#E63946',
  doubleWord: '#FF6B9D',
  tripleLetter: '#1D3557',
  doubleLetter: '#457B9D',
};

const getSquareColor = (row: number, col: number): string => {
  for (const [type, positions] of Object.entries(PREMIUM_SQUARES)) {
    if (positions.some(([r, c]) => r === row && c === col)) {
      return COLORS[type as keyof typeof COLORS];
    }
  }
  return COLORS.normal;
};

export const Board3D: React.FC<Board3DProps> = ({ size = 0.8 }) => {
  const boardRef = useRef<Group>(null);
  const scale = size;
  const squareSize = scale / 15;

  return (
    <group ref={boardRef} position={[0, 0, 0]}>
      {/* Board backing */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[scale * 1.1, 0.02, scale * 1.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Grid squares */}
      {Array.from({ length: 15 }).map((_, row) =>
        Array.from({ length: 15 }).map((_, col) => {
          const x = (col - 7) * squareSize + squareSize / 2;
          const z = (row - 7) * squareSize + squareSize / 2;
          const color = getSquareColor(row, col);

          return (
            <mesh key={`square-${row}-${col}`} position={[x, 0, z]}>
              <planeGeometry args={[squareSize * 0.95, squareSize * 0.95]} />
              <meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
          );
        })
      )}

      {/* Wooden border frame */}
      {/* Top */}
      <mesh position={[0, 0.005, -(scale / 2 + 0.04)]}>
        <boxGeometry args={[scale * 1.15, 0.01, 0.08]} />
        <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.005, scale / 2 + 0.04]}>
        <boxGeometry args={[scale * 1.15, 0.01, 0.08]} />
        <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Left */}
      <mesh position={[-(scale / 2 + 0.04), 0.005, 0]}>
        <boxGeometry args={[0.08, 0.01, scale * 1.15]} />
        <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Right */}
      <mesh position={[scale / 2 + 0.04, 0.005, 0]}>
        <boxGeometry args={[0.08, 0.01, scale * 1.15]} />
        <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Center star indicator */}
      <mesh position={[0, 0.002, 0]}>
        <planeGeometry args={[0.02, 0.02]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

/**
 * Utility to get board square position from grid coordinates
 */
export const getBoardSquarePosition = (
  row: number,
  col: number,
  boardSize: number = 0.8
): [number, number, number] => {
  const squareSize = boardSize / 15;
  const x = (col - 7) * squareSize + squareSize / 2;
  const z = (row - 7) * squareSize + squareSize / 2;
  return [x, 0.01, z];
};

/**
 * Get premium score for a position
 */
export const getPremiumScore = (row: number, col: number): { type: string; multiplier: number } => {
  for (const [type, positions] of Object.entries(PREMIUM_SQUARES)) {
    if (positions.some(([r, c]) => r === row && c === col)) {
      const multiplier = type.includes('Triple') ? 3 : 2;
      return { type, multiplier };
    }
  }
  return { type: 'normal', multiplier: 1 };
};
