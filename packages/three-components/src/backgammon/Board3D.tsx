import React, { useRef } from 'react';
import { Group } from 'three';

/**
 * Backgammon Board3D Component
 *
 * Architectural Intent:
 * - Renders a complete 3D backgammon board
 * - 24 points with proper positioning
 * - Wooden edges and realistic materials
 * - Color-coded points for visual clarity
 *
 * Key Design Decisions:
 * 1. Two rows of 12 points each
 * 2. Alternating point colors (light/dark)
 * 3. Wooden rail border
 * 4. Dice cup area
 * 5. Pip indicators for piece counting
 */

export interface Board3DProps {
  woodTexture?: string;
  feltColor?: string;
}

const BOARD_WIDTH = 1.5;
const BOARD_DEPTH = 2.0;
const POINT_HEIGHT = 0.3;
const POINT_WIDTH = 0.1;

export const Board3D: React.FC<Board3DProps> = ({
  woodTexture,
  feltColor = '#8B4513',
}) => {
  const boardRef = useRef<Group>(null);

  // Backgammon board layout: 24 points
  // Top row: points 13-24 (right to left when viewed from white side)
  // Bottom row: points 1-12 (left to right when viewed from white side)
  // Points alternate between two colors

  const pointPositions = [
    // Top row (points 13-24)
    ...Array.from({ length: 12 }, (_, i) => ({
      x: (11 - i) * (BOARD_WIDTH / 12),
      z: BOARD_DEPTH / 2 + 0.1,
      pointNumber: 24 - i,
      color: i % 2 === 0 ? '#DEB887' : '#654321', // Light/Dark alternating
    })),
    // Bottom row (points 1-12)
    ...Array.from({ length: 12 }, (_, i) => ({
      x: i * (BOARD_WIDTH / 12),
      z: -(BOARD_DEPTH / 2 + 0.1),
      pointNumber: i + 1,
      color: i % 2 === 0 ? '#654321' : '#DEB887', // Light/Dark alternating
    })),
  ];

  return (
    <group ref={boardRef} position={[0, 0, 0]}>
      {/* Main board surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[BOARD_WIDTH * 1.2, 0.05, BOARD_DEPTH * 1.2]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Center bar (divides board into two halves) */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.08, 0.02, BOARD_DEPTH]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Points (triangles) */}
      {pointPositions.map((point, index) => {
        const isTopPoint = point.z > 0;
        const rotation = isTopPoint ? 0 : Math.PI;

        return (
          <group
            key={`point-${point.pointNumber}`}
            position={[point.x - BOARD_WIDTH / 2, 0, point.z]}
            rotation={[0, 0, rotation]}
          >
            {/* Point triangle */}
            <mesh position={[0, 0.025, 0]}>
              <coneGeometry args={[POINT_WIDTH / 2, POINT_HEIGHT, 3]} />
              <meshStandardMaterial
                color={point.color}
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>

            {/* Point base circle (for visual clarity) */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[POINT_WIDTH / 2.5, POINT_WIDTH / 2.5, 0.002, 8]} />
              <meshStandardMaterial
                color="#FFFFFF"
                roughness={0.3}
                metalness={0.5}
                transparent
                opacity={0.3}
              />
            </mesh>

            {/* Point number label (would be rendered on canvas) */}
            {/*
              Point numbers 1-24 would be displayed on the board
              Numbers on bottom row: 1-12 (left to right)
              Numbers on top row: 13-24 (right to left)
            */}
          </group>
        );
      })}

      {/* Wooden rail border */}
      {/* Left rail */}
      <mesh position={[-BOARD_WIDTH / 2 - 0.05, 0, 0]}>
        <boxGeometry args={[0.08, 0.06, BOARD_DEPTH * 1.2]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Right rail */}
      <mesh position={[BOARD_WIDTH / 2 + 0.05, 0, 0]}>
        <boxGeometry args={[0.08, 0.06, BOARD_DEPTH * 1.2]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Top rail */}
      <mesh position={[0, 0, BOARD_DEPTH / 2 + 0.08]}>
        <boxGeometry args={[BOARD_WIDTH * 1.2, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Bottom rail */}
      <mesh position={[0, 0, -(BOARD_DEPTH / 2 + 0.08)]}>
        <boxGeometry args={[BOARD_WIDTH * 1.2, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Dice cup area (left side) */}
      <mesh position={[-(BOARD_WIDTH / 2 + 0.15), 0.02, -(BOARD_DEPTH / 2 + 0.15)]}>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      {/* Home area indicators */}
      {/* White's home (bottom right) */}
      <mesh position={[BOARD_WIDTH / 2 + 0.08, 0.015, -(BOARD_DEPTH / 2)]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.15, 0.03, BOARD_DEPTH / 2]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Black's home (bottom left) */}
      <mesh position={[-(BOARD_WIDTH / 2 + 0.08), 0.015, BOARD_DEPTH / 2]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.15, 0.03, BOARD_DEPTH / 2]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

/**
 * Utility function to get point positions for placing checkers
 */
export const getBackgammonPointPosition = (pointNumber: number): [number, number, number] => {
  const BOARD_WIDTH = 1.5;
  const BOARD_DEPTH = 2.0;

  let x: number;
  let z: number;

  if (pointNumber >= 13) {
    // Top row (points 13-24)
    const index = pointNumber - 13;
    x = (11 - index) * (BOARD_WIDTH / 12) - BOARD_WIDTH / 2;
    z = BOARD_DEPTH / 2 + 0.1;
  } else {
    // Bottom row (points 1-12)
    x = (pointNumber - 1) * (BOARD_WIDTH / 12) - BOARD_WIDTH / 2;
    z = -(BOARD_DEPTH / 2 + 0.1);
  }

  return [x, 0.05, z];
};
