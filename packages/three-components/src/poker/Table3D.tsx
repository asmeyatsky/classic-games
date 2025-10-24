import React, { useRef } from 'react';
import { Group, Mesh } from 'three';

/**
 * Table3D Component
 *
 * Architectural Intent:
 * - Renders a complete 3D poker table with felt surface
 * - Supports variable player counts and table sizes
 * - Includes realistic materials and lighting
 * - Provides layout structure for card/chip positioning
 *
 * Key Design Decisions:
 * 1. Ellipse table shape (more realistic than rectangle)
 * 2. Felt material with appropriate roughness
 * 3. Wooden rail border for realistic look
 * 4. Cup holders and chip runnels (UI elements)
 * 5. Lighting setup optimized for poker visibility
 */

export interface Table3DProps {
  seats: number;
  feltColor?: string;
  size?: 'small' | 'medium' | 'large';
}

interface TableDimensions {
  width: number;
  length: number;
  height: number;
  railHeight: number;
  railWidth: number;
}

const TABLE_SIZES: Record<string, TableDimensions> = {
  small: {
    width: 3,
    length: 5,
    height: 0.75,
    railHeight: 0.05,
    railWidth: 0.1,
  },
  medium: {
    width: 4,
    length: 6,
    height: 0.75,
    railHeight: 0.06,
    railWidth: 0.12,
  },
  large: {
    width: 5,
    length: 8,
    height: 0.75,
    railHeight: 0.07,
    railWidth: 0.15,
  },
};

// Seat positions around the table (in radians from top, clockwise)
const SEAT_ANGLES: Record<number, number[]> = {
  1: [0],
  2: [0, Math.PI],
  3: [(-Math.PI * 2) / 6, 0, (Math.PI * 2) / 6],
  4: [(-Math.PI / 2), 0, (Math.PI / 2), Math.PI],
  5: [
    (-Math.PI * 2) / 5,
    (-Math.PI) / 5,
    0,
    (Math.PI) / 5,
    (Math.PI * 2) / 5,
  ],
  6: [
    (-Math.PI / 2),
    (-Math.PI / 3),
    (-Math.PI / 6),
    (Math.PI / 6),
    (Math.PI / 3),
    (Math.PI / 2),
  ],
  8: Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8 - Math.PI / 2),
  9: Array.from({ length: 9 }, (_, i) => (i * Math.PI * 2) / 9 - Math.PI / 2),
  10: Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10 - Math.PI / 2),
};

export const Table3D: React.FC<Table3DProps> = ({
  seats = 6,
  feltColor = '#0F5132',
  size = 'medium',
}) => {
  const tableRef = useRef<Group>(null);
  const dimensions = TABLE_SIZES[size];

  // Calculate seat positions
  const getSeatPositions = () => {
    const angles = SEAT_ANGLES[Math.min(seats, 10)] || SEAT_ANGLES[6];
    const radiusX = (dimensions.width / 2) * 1.1;
    const radiusY = (dimensions.length / 2) * 1.1;

    return angles.slice(0, seats).map((angle) => ({
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
      angle,
    }));
  };

  const seatPositions = getSeatPositions();

  return (
    <group ref={tableRef} position={[0, 0, 0]}>
      {/* Table top (felt surface) */}
      <mesh position={[0, dimensions.height, 0]}>
        <planeGeometry args={[dimensions.width, dimensions.length]} />
        <meshStandardMaterial
          color={feltColor}
          roughness={0.95}
          metalness={0}
          side={2} // Double-sided
        />
      </mesh>

      {/* Felt edges (subtle) */}
      <mesh position={[0, dimensions.height + 0.001, 0]}>
        <boxGeometry
          args={[
            dimensions.width,
            dimensions.length,
            0.002,
          ]}
        />
        <meshStandardMaterial
          color={feltColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Table leg support (4 legs) */}
      {[
        [-dimensions.width / 3, -dimensions.length / 3],
        [dimensions.width / 3, -dimensions.length / 3],
        [-dimensions.width / 3, dimensions.length / 3],
        [dimensions.width / 3, dimensions.length / 3],
      ].map((pos, i) => (
        <mesh key={`leg-${i}`} position={[pos[0], dimensions.height / 2, pos[1]]}>
          <boxGeometry args={[0.08, dimensions.height, 0.08]} />
          <meshStandardMaterial
            color="#654321"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Table rail border (outer edge) */}
      <group>
        {/* Long sides */}
        <mesh position={[0, dimensions.height + 0.01, -dimensions.length / 2]}>
          <boxGeometry
            args={[dimensions.width + dimensions.railWidth * 2, dimensions.railHeight, dimensions.railWidth]}
          />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, dimensions.height + 0.01, dimensions.length / 2]}>
          <boxGeometry
            args={[dimensions.width + dimensions.railWidth * 2, dimensions.railHeight, dimensions.railWidth]}
          />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>

        {/* Short sides */}
        <mesh position={[-dimensions.width / 2, dimensions.height + 0.01, 0]}>
          <boxGeometry
            args={[dimensions.railWidth, dimensions.railHeight, dimensions.length]}
          />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[dimensions.width / 2, dimensions.height + 0.01, 0]}>
          <boxGeometry
            args={[dimensions.railWidth, dimensions.railHeight, dimensions.length]}
          />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Cup holders for drinks */}
      {seatPositions.map((seat, i) => (
        <mesh
          key={`cupholder-${i}`}
          position={[seat.x * 0.95, dimensions.height + 0.02, seat.y * 0.95]}
        >
          <cylinderGeometry args={[0.03, 0.035, 0.02, 16]} />
          <meshStandardMaterial
            color="#654321"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Chip/card area indicators (visual layout) */}
      {seatPositions.map((seat, i) => (
        <group
          key={`seat-${i}`}
          position={[seat.x * 0.85, dimensions.height + 0.01, seat.y * 0.85]}
        >
          {/* Chip runnel (slight depression for chips) */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.005, 32]} />
            <meshStandardMaterial
              color={feltColor}
              roughness={0.98}
              metalness={0}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Card position indicator */}
          <mesh position={[0, 0.001, -0.1]}>
            <planeGeometry args={[0.1, 0.15]} />
            <meshStandardMaterial
              color="#1F2937"
              roughness={0.9}
              metalness={0}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Center pot area indicator */}
      <mesh position={[0, dimensions.height + 0.005, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.001, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Ambient lighting data (actual lights managed at scene level) */}
      {/*
        The table should be lit with:
        1. Ambient light: 0.5 intensity (fills shadows)
        2. Directional light: 1.0 intensity from above
        3. Soft shadows enabled
        4. Optional: Spot light from above for dramatic effect

        These are typically set at the Canvas/Scene level.
      */}
    </group>
  );
};

/**
 * PokerTableLayout - Complete table with position metadata
 * Provides utilities for calculating card and chip positions
 */
export interface PokerTableLayoutProps {
  seats: number;
  size?: 'small' | 'medium' | 'large';
}

export const getPokerTableLayout = (props: PokerTableLayoutProps) => {
  const dimensions = TABLE_SIZES[props.size || 'medium'];
  const angles = SEAT_ANGLES[Math.min(props.seats, 10)] || SEAT_ANGLES[6];
  const radiusX = (dimensions.width / 2) * 1.1;
  const radiusY = (dimensions.length / 2) * 1.1;

  const seatPositions = angles.slice(0, props.seats).map((angle, index) => ({
    seatIndex: index,
    position: {
      x: Math.cos(angle) * radiusX,
      y: dimensions.height,
      z: Math.sin(angle) * radiusY,
    },
    cardPosition: {
      x: Math.cos(angle) * radiusX * 0.85,
      y: dimensions.height + 0.05,
      z: Math.sin(angle) * radiusY * 0.85 - 0.2,
    },
    chipPosition: {
      x: Math.cos(angle) * radiusX * 0.85,
      y: dimensions.height + 0.05,
      z: Math.sin(angle) * radiusY * 0.85,
    },
    angle,
  }));

  return {
    table: {
      width: dimensions.width,
      length: dimensions.length,
      height: dimensions.height,
    },
    seats: seatPositions,
    potPosition: {
      x: 0,
      y: dimensions.height + 0.05,
      z: 0,
    },
    communityCardPositions: {
      flop1: { x: -0.4, y: dimensions.height + 0.05, z: 0 },
      flop2: { x: 0, y: dimensions.height + 0.05, z: 0 },
      flop3: { x: 0.4, y: dimensions.height + 0.05, z: 0 },
      turn: { x: 0.8, y: dimensions.height + 0.05, z: 0 },
      river: { x: 1.2, y: dimensions.height + 0.05, z: 0 },
    },
  };
};
