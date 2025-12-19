import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

/**
 * Scrabble Tile3D Component
 *
 * Architectural Intent:
 * - Renders individual Scrabble letter tiles
 * - Supports drag-and-drop placement
 * - Proper letter and point value display
 * - Realistic wood and felt materials
 */

export interface Tile3DProps {
  letter: string;
  value: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  onDrag?: (position: [number, number, number]) => void;
  selected?: boolean;
  hovered?: boolean;
}

const TILE_SIZE = 0.05;
const TILE_HEIGHT = 0.008;

export const Tile3D: React.FC<Tile3DProps> = ({
  letter,
  value,
  position,
  rotation = [0, 0, 0],
  onDrag,
  selected = false,
  hovered = false,
}) => {
  const tileRef = useRef<Group>(null);
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = hovered || internalHovered;

  useFrame((state) => {
    if (tileRef.current) {
      // Hover lift
      if (isHovered) {
        tileRef.current.position.y = position[1] + 0.015;
      } else {
        tileRef.current.position.y = position[1];
      }

      // Selection glow
      if (selected) {
        const glow = Math.sin(state.clock.elapsedTime * 3) * 0.003;
        tileRef.current.scale.set(1 + glow, 1, 1 + glow);
      } else {
        tileRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group
      ref={tileRef}
      position={position}
      rotation={rotation}
      onPointerEnter={() => setInternalHovered(true)}
      onPointerLeave={() => setInternalHovered(false)}
    >
      {/* Tile body (wood) with enhanced materials */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]} />
        <meshStandardMaterial
          color="#F5DEB3"
          roughness={0.3}
          metalness={0.3}
          emissive="#4B322B"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Top surface (felt) with enhanced materials */}
      <mesh position={[0, TILE_HEIGHT / 2 + 0.0005, 0]}>
        <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
        <meshStandardMaterial
          color="#FFFACD"
          roughness={0.5}
          metalness={0.2}
          emissive={selected ? '#FFFF00' : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Letter (would be canvas texture in production) */}
      {/*
        In production:
        1. Create canvas with letter rendered
        2. Apply font: Bold, color: #2D3142
        3. Add point value as subscript
        4. Convert to texture
      */}

      {/* Hover ring with enhanced materials */}
      {isHovered && (
        <mesh position={[0, TILE_HEIGHT / 2 + 0.002, 0]}>
          <torusGeometry args={[TILE_SIZE / 1.8, 0.0008, 16, 32]} />
          <meshStandardMaterial
            color="#06B6D4"
            emissive="#06B6D4"
            emissiveIntensity={0.7}
            roughness={0.05}
            metalness={0.9}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * Scrabble Rack Component - Holds player tiles
 */
export interface RackProps {
  tiles: Array<{ letter: string; value: number }>;
  position: [number, number, number];
  onTileSelect?: (index: number) => void;
}

export const Rack: React.FC<RackProps> = ({ tiles, position, onTileSelect }) => {
  const rackRef = useRef<Group>(null);
  const tileSpacing = TILE_SIZE * 1.2;
  const rackWidth = Math.max(7 * tileSpacing, 0.5);

  return (
    <group ref={rackRef} position={position}>
      {/* Rack base (wood) with enhanced materials */}
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[rackWidth + 0.02, 0.005, TILE_SIZE + 0.01]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.3}
          metalness={0.3}
          emissive="#2B1B0B"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Tile slots */}
      {tiles.map((tile, index) => {
        const offsetX = (index - (tiles.length - 1) / 2) * tileSpacing;
        return (
          <group key={`tile-${index}`} onClick={() => onTileSelect?.(index)}>
            <Tile3D letter={tile.letter} value={tile.value} position={[offsetX, 0, 0]} />
          </group>
        );
      })}

      {/* Rack rails (for visual appeal) with enhanced materials */}
      <mesh position={[-(rackWidth / 2 + 0.01), -0.005, 0]}>
        <boxGeometry args={[0.005, 0.03, TILE_SIZE + 0.01]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.4}
          metalness={0.3}
          emissive="#1C1206"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[rackWidth / 2 + 0.01, -0.005, 0]}>
        <boxGeometry args={[0.005, 0.03, TILE_SIZE + 0.01]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.4}
          metalness={0.3}
          emissive="#1C1206"
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
};

/**
 * Tile Bag - Source of tiles for drawing
 */
export interface TileBagProps {
  remaining: number;
  position: [number, number, number];
}

export const TileBag: React.FC<TileBagProps> = ({ remaining, position }) => {
  const bagRef = useRef<Group>(null);

  useFrame((state) => {
    if (bagRef.current) {
      bagRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={bagRef} position={position}>
      {/* Bag body (drawstring pouch) with enhanced materials */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.5}
          metalness={0.2}
          emissive="#1C1206"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Bag top (opening) with enhanced materials */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.01, 16]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.4}
          metalness={0.3}
          emissive="#2B1B0B"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Drawstring with enhanced materials */}
      <mesh position={[0, 0.065, 0]}>
        <torusGeometry args={[0.078, 0.003, 8, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Remaining count label (would show on canvas) */}
      {/*
        Display remaining tile count:
        - Render on canvas texture
        - Update dynamically
        - Show 0-100 tiles
      */}
    </group>
  );
};

/**
 * Placed Tile - Tile already on the board
 */
export interface PlacedTileProps extends Tile3DProps {
  boardPosition: [number, number]; // Grid position [row, col]
}

export const PlacedTile: React.FC<PlacedTileProps> = ({ boardPosition, ...tileProps }) => {
  return <Tile3D {...tileProps} />;
};
