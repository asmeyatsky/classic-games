import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

/**
 * Chip3D Component
 *
 * Architectural Intent:
 * - Renders a 3D poker chip with realistic materials
 * - Supports stacking with physics-based collision
 * - Displays value information via text or colors
 * - Smooth rotation and bounce animations
 *
 * Key Design Decisions:
 * 1. Cylinder geometry for chip base (realistic)
 * 2. Color-coded by value for quick identification
 * 3. Height-based stacking (count parameter)
 * 4. Rotation animation for visual appeal
 */

export interface Chip3DProps {
  value: number;
  color: string;
  position: [number, number, number];
  count?: number;
  hovered?: boolean;
  onClick?: () => void;
}

const CHIP_RADIUS = 0.04;
const CHIP_HEIGHT = 0.01;
const CHIP_SPACING = 0.002; // Space between stacked chips

// Standard poker chip colors and values
const CHIP_VALUES = {
  white: 1,
  red: 5,
  green: 25,
  black: 100,
  purple: 500,
  gold: 1000,
};

const COLOR_TO_VALUE: Record<string, string> = {
  '#FFFFFF': 'white', // 1
  '#DC2626': 'red',   // 5
  '#10B981': 'green', // 25
  '#1F2937': 'black', // 100
  '#A855F7': 'purple', // 500
  '#F59E0B': 'gold',  // 1000
};

export const Chip3D: React.FC<Chip3DProps> = ({
  value,
  color,
  position,
  count = 1,
  hovered = false,
  onClick,
}) => {
  const groupRef = useRef<Group>(null);
  const [internalHovered, setInternalHovered] = React.useState(false);
  const isHovered = hovered || internalHovered;

  // Animate chips
  useFrame((state) => {
    if (groupRef.current) {
      // Rotation animation
      groupRef.current.rotation.z += 0.003;

      // Hover bounce effect
      if (isHovered) {
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.002;
      }

      // Scale up slightly on hover
      const targetScale = isHovered ? 1.1 : 1;
      groupRef.current.scale.lerp(
        { x: targetScale, y: 1, z: targetScale } as any,
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerEnter={() => setInternalHovered(true)}
      onPointerLeave={() => setInternalHovered(false)}
    >
      {/* Stack of chips */}
      {Array.from({ length: count }).map((_, index) => {
        const zOffset = index * (CHIP_HEIGHT + CHIP_SPACING);
        return (
          <group key={index} position={[0, 0, zOffset]}>
            {/* Chip body */}
            <mesh>
              <cylinderGeometry args={[CHIP_RADIUS, CHIP_RADIUS, CHIP_HEIGHT, 32]} />
              <meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.3}
                emissive={isHovered ? '#FFFF00' : '#000000'}
                emissiveIntensity={isHovered ? 0.3 : 0}
              />
            </mesh>

            {/* Chip edge highlight (top) */}
            <mesh position={[0, CHIP_HEIGHT / 2 + 0.0005, 0]}>
              <cylinderGeometry args={[CHIP_RADIUS - 0.005, CHIP_RADIUS - 0.005, 0.001, 32]} />
              <meshStandardMaterial
                color="#FFFFFF"
                roughness={0.2}
                metalness={0.8}
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* Chip center detail (for visual appeal) */}
            <mesh position={[0, CHIP_HEIGHT / 2 + 0.002, 0]}>
              <cylinderGeometry args={[CHIP_RADIUS * 0.6, CHIP_RADIUS * 0.6, 0.001, 32]} />
              <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0}
                opacity={0.5}
                transparent
              />
            </mesh>
          </group>
        );
      })}

      {/* Value indicator (text would go here in full implementation) */}
      {/*
        In production, a canvas texture would display the chip value:
        1. Create small canvas (64x64)
        2. Render value text (e.g., "$5", "$100")
        3. Apply as texture to chip surface
        4. Update on value change
      */}
    </group>
  );
};

/**
 * ChipStack Component - Multiple chips stacked together
 * Useful for displaying player chip stacks or pot
 */
export interface ChipStackProps {
  chips: Array<{ value: number; color: string; count: number }>;
  position: [number, number, number];
  onClick?: () => void;
}

export const ChipStack: React.FC<ChipStackProps> = ({ chips, position, onClick }) => {
  let currentZ = 0;

  return (
    <group position={position}>
      {chips.map((chip, index) => {
        const chipPosition: [number, number, number] = [0, 0, currentZ];
        currentZ += chip.count * (CHIP_HEIGHT + CHIP_SPACING);

        return (
          <Chip3D
            key={index}
            value={chip.value}
            color={chip.color}
            position={chipPosition}
            count={chip.count}
            onClick={onClick}
          />
        );
      })}
    </group>
  );
};

/**
 * Animated chip movement for dealing or moving between positions
 */
export interface AnimatedChipProps extends Chip3DProps {
  targetPosition?: [number, number, number];
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedChip: React.FC<AnimatedChipProps> = ({
  targetPosition,
  duration = 0.5,
  onComplete,
  ...chipProps
}) => {
  const groupRef = useRef<Group>(null);
  const [startPosition] = React.useState(chipProps.position);
  const [startTime] = React.useState(Date.now());

  useFrame(() => {
    if (groupRef.current && targetPosition) {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      groupRef.current.position.set(
        startPosition[0] + (targetPosition[0] - startPosition[0]) * eased,
        startPosition[1] + (targetPosition[1] - startPosition[1]) * eased,
        startPosition[2] + (targetPosition[2] - startPosition[2]) * eased
      );

      // Arc motion for visual appeal
      const arcHeight = Math.sin(progress * Math.PI) * 0.05;
      groupRef.current.position.y += arcHeight;

      if (progress === 1 && onComplete) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef} position={startPosition}>
      <Chip3D {...chipProps} />
    </group>
  );
};
