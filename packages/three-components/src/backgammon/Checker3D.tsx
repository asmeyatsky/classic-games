import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

/**
 * Checker3D Component (Backgammon Piece)
 *
 * Architectural Intent:
 * - Renders a 3D backgammon checker/piece
 * - Supports stacking with collision detection
 * - Interactive hover and selection states
 * - Realistic materials and shadows
 *
 * Key Design Decisions:
 * 1. Cylinder geometry for disc shape
 * 2. Color-coded by player (white/black)
 * 3. Automatic stacking calculation
 * 4. Smooth rotation animations
 * 5. Selection ring indicator
 */

export interface Checker3DProps {
  color: 'white' | 'black';
  position: [number, number, number];
  stackIndex?: number;
  onClick?: () => void;
  selected?: boolean;
  hovered?: boolean;
}

const CHECKER_RADIUS = 0.045;
const CHECKER_HEIGHT = 0.015;
const CHECKER_STACK_OFFSET = 0.018;

const CHECKER_COLORS = {
  white: '#FFFFFF',
  black: '#2D3142',
};

const CHECKER_BORDER_COLORS = {
  white: '#F0F0F0',
  black: '#FFFFFF',
};

export const Checker3D: React.FC<Checker3DProps> = ({
  color,
  position,
  stackIndex = 0,
  onClick,
  selected = false,
  hovered = false,
}) => {
  const groupRef = useRef<Group>(null);
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = hovered || internalHovered;

  // Calculate stacked position
  const stackedY = position[1] + stackIndex * CHECKER_STACK_OFFSET;

  useFrame((state) => {
    if (groupRef.current) {
      // Rotation animation
      groupRef.current.rotation.z += 0.002;

      // Hover bounce
      if (isHovered) {
        groupRef.current.position.y = stackedY + Math.sin(state.clock.elapsedTime * 3) * 0.01;
      } else {
        groupRef.current.position.y = stackedY;
      }

      // Selection glow
      if (selected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        groupRef.current.scale.set(scale, 1, scale);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], stackedY, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerEnter={() => setInternalHovered(true)}
      onPointerLeave={() => setInternalHovered(false)}
    >
      {/* Main checker body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[CHECKER_RADIUS, CHECKER_RADIUS, CHECKER_HEIGHT, 32]} />
        <meshStandardMaterial
          color={CHECKER_COLORS[color]}
          roughness={0.5}
          metalness={0.2}
          emissive={selected ? '#FFFF00' : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Top edge highlight */}
      <mesh position={[0, CHECKER_HEIGHT / 2 + 0.001, 0]}>
        <cylinderGeometry args={[CHECKER_RADIUS - 0.005, CHECKER_RADIUS - 0.005, 0.002, 32]} />
        <meshStandardMaterial
          color={CHECKER_BORDER_COLORS[color]}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Center dot (for visual interest) */}
      <mesh position={[0, CHECKER_HEIGHT / 2 + 0.005, 0]}>
        <cylinderGeometry args={[CHECKER_RADIUS * 0.3, CHECKER_RADIUS * 0.3, 0.002, 16]} />
        <meshStandardMaterial
          color={color === 'white' ? '#000000' : '#FFFFFF'}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Hover ring (selection indicator) */}
      {(isHovered || selected) && (
        <mesh position={[0, CHECKER_HEIGHT / 2 + 0.007, 0]}>
          <torusGeometry args={[CHECKER_RADIUS + 0.01, 0.003, 16, 32]} />
          <meshStandardMaterial
            color={selected ? '#FFFF00' : '#06B6D4'}
            emissive={selected ? '#FFFF00' : '#06B6D4'}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      )}

      {/* Shadow disc underneath */}
      <mesh position={[0, -0.002, 0]}>
        <cylinderGeometry args={[CHECKER_RADIUS * 1.1, CHECKER_RADIUS * 1.1, 0.001, 32]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

/**
 * CheckerStack - Multiple checkers stacked on a point
 */
export interface CheckerStackProps {
  color: 'white' | 'black';
  count: number;
  position: [number, number, number];
  onClick?: () => void;
  selected?: boolean;
}

export const CheckerStack: React.FC<CheckerStackProps> = ({
  color,
  count,
  position,
  onClick,
  selected = false,
}) => {
  return (
    <group>
      {Array.from({ length: count }).map((_, index) => (
        <Checker3D
          key={`checker-${index}`}
          color={color}
          position={position}
          stackIndex={index}
          onClick={onClick}
          selected={selected && index === count - 1} // Only top checker can be selected
        />
      ))}

      {/* Count indicator for large stacks (5+) */}
      {count >= 5 && (
        <mesh position={[position[0], position[1] + count * CHECKER_STACK_OFFSET + 0.05, position[2]]}>
          <planeGeometry args={[0.04, 0.04]} />
          <meshStandardMaterial
            color={color === 'white' ? '#000000' : '#FFFFFF'}
            roughness={0.8}
            metalness={0}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * AnimatedChecker - Checker that moves smoothly between positions
 */
export interface AnimatedCheckerProps extends Checker3DProps {
  targetPosition?: [number, number, number];
  targetStackIndex?: number;
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedChecker: React.FC<AnimatedCheckerProps> = ({
  targetPosition,
  targetStackIndex = 0,
  duration = 0.5,
  onComplete,
  ...checkerProps
}) => {
  const groupRef = useRef<Group>(null);
  const [startPosition] = useState(checkerProps.position);
  const [startStackIndex] = useState(checkerProps.stackIndex || 0);
  const [startTime] = useState(Date.now());

  useFrame(() => {
    if (groupRef.current && targetPosition) {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      const currentPos: [number, number, number] = [
        startPosition[0] + (targetPosition[0] - startPosition[0]) * eased,
        startPosition[1] + (targetPosition[1] - startPosition[1]) * eased,
        startPosition[2] + (targetPosition[2] - startPosition[2]) * eased,
      ];

      // Arc animation (up then down)
      const arcHeight = Math.sin(progress * Math.PI) * 0.05;
      currentPos[1] += arcHeight;

      groupRef.current.position.set(...currentPos);

      if (progress === 1 && onComplete) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef} position={checkerProps.position}>
      <Checker3D {...checkerProps} />
    </group>
  );
};
