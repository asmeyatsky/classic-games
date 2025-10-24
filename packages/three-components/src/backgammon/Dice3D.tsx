import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Quaternion, Vector3 } from 'three';

/**
 * Dice3D Component
 *
 * Architectural Intent:
 * - Renders 3D dice with realistic physics-based rolling
 * - Smooth animation to final value
 * - Collision and bouncing effects
 * - Realistic materials and shadows
 * - Sound effect integration points
 *
 * Key Design Decisions:
 * 1. Cube geometry with numbered faces
 * 2. Angular velocity for spinning animation
 * 3. Easing to final rotation (landing)
 * 4. Physics-like gravity and bounce
 * 5. Face detection based on rotation
 */

export interface Dice3DProps {
  value: number;
  position: [number, number, number];
  rolling: boolean;
  onRollComplete?: (value: number) => void;
}

const DICE_SIZE = 0.04;

// Rotation angles for each face value (1-6)
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  2: [0, Math.PI / 2, 0],
  3: [0, 0, -Math.PI / 2],
  4: [0, 0, Math.PI / 2],
  5: [-Math.PI / 2, 0, 0],
  6: [Math.PI / 2, 0, 0],
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  position,
  rolling,
  onRollComplete,
}) => {
  const diceRef = useRef<Group>(null);
  const [targetRotation, setTargetRotation] = React.useState(FACE_ROTATIONS[value]);
  const [velocity, setVelocity] = React.useState({ x: 0, y: 0, z: 0 });
  const [bounceCount, setBounceCount] = React.useState(0);

  // Update target rotation when value changes
  React.useEffect(() => {
    setTargetRotation(FACE_ROTATIONS[value]);
  }, [value]);

  useFrame((state) => {
    if (!diceRef.current) return;

    if (rolling) {
      // Random spinning while rolling
      diceRef.current.rotation.x += (Math.random() - 0.5) * 0.3;
      diceRef.current.rotation.y += (Math.random() - 0.5) * 0.3;
      diceRef.current.rotation.z += (Math.random() - 0.5) * 0.3;

      // Gravity effect
      setVelocity((v) => ({
        x: v.x * 0.98,
        y: v.y - 0.01,
        z: v.z * 0.98,
      }));

      diceRef.current.position.y += velocity.y;

      // Bounce on ground
      if (diceRef.current.position.y < 0.02 && velocity.y < 0) {
        setVelocity((v) => ({ ...v, y: Math.abs(v.y) * 0.6 }));
        setBounceCount((c) => c + 1);
      }
    } else {
      // Smooth rotation to target
      const speed = 0.1;
      diceRef.current.rotation.x += (targetRotation[0] - diceRef.current.rotation.x) * speed;
      diceRef.current.rotation.y += (targetRotation[1] - diceRef.current.rotation.y) * speed;
      diceRef.current.rotation.z += (targetRotation[2] - diceRef.current.rotation.z) * speed;

      // If bounces have settled and not rolling, notify completion
      if (bounceCount > 0 && bounceCount <= 3) {
        // Check if rotation is close to target
        const threshold = 0.01;
        if (
          Math.abs(diceRef.current.rotation.x - targetRotation[0]) < threshold &&
          Math.abs(diceRef.current.rotation.y - targetRotation[1]) < threshold &&
          Math.abs(diceRef.current.rotation.z - targetRotation[2]) < threshold
        ) {
          if (onRollComplete) {
            onRollComplete(value);
          }
          setBounceCount(0);
        }
      }
    }
  });

  return (
    <group ref={diceRef} position={position}>
      {/* Main cube */}
      <mesh>
        <boxGeometry args={[DICE_SIZE, DICE_SIZE, DICE_SIZE]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Dice faces (simple colored indicators) */}
      {/* Face 1: Right - Red dot */}
      <mesh position={[DICE_SIZE / 2 + 0.001, 0, 0]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.5} />
      </mesh>

      {/* Face 2: Left - Blue dot */}
      <mesh position={[-DICE_SIZE / 2 - 0.001, 0, 0]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#0066CC" emissive="#0066CC" emissiveIntensity={0.5} />
      </mesh>

      {/* Face 3: Top - Green dot */}
      <mesh position={[0, DICE_SIZE / 2 + 0.001, 0]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.5} />
      </mesh>

      {/* Face 4: Bottom - Yellow dot */}
      <mesh position={[0, -DICE_SIZE / 2 - 0.001, 0]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.5} />
      </mesh>

      {/* Face 5: Front - Purple dot */}
      <mesh position={[0, 0, DICE_SIZE / 2 + 0.001]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.5} />
      </mesh>

      {/* Face 6: Back - Pink dot */}
      <mesh position={[0, 0, -DICE_SIZE / 2 - 0.001]}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={0.5} />
      </mesh>

      {/* Pip indicators (dots on faces for value 1-6) */}
      {/* This is where actual pip dots would be rendered */}
      {/*
        In a production implementation:
        1. Create canvas textures for each face
        2. Render pip patterns (1-6 dots arranged properly)
        3. Apply textures to box geometry
        4. Update based on rotation
      */}
    </group>
  );
};

/**
 * DiceCup Component - Container for shaking dice
 */
export interface DiceCupProps {
  position: [number, number, number];
  shaking: boolean;
}

export const DiceCup: React.FC<DiceCupProps> = ({ position, shaking }) => {
  const cupRef = useRef<Group>(null);

  useFrame((state) => {
    if (cupRef.current && shaking) {
      cupRef.current.rotation.x += (Math.random() - 0.5) * 0.4;
      cupRef.current.rotation.y += (Math.random() - 0.5) * 0.4;
      cupRef.current.rotation.z += (Math.random() - 0.5) * 0.4;

      // Bobbing motion
      cupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.02;
    }
  });

  return (
    <group ref={cupRef} position={position}>
      {/* Cup body */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.06, 0.1, 16]} />
        <meshStandardMaterial
          color="#654321"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Cup rim */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.062, 0.003, 8, 16]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Interior highlight */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.08, 16]} />
        <meshStandardMaterial
          color="#4B2F1A"
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

/**
 * DiceRollSequence - Component for rolling two dice
 */
export interface DiceRollSequenceProps {
  rolling: boolean;
  onComplete?: (value1: number, value2: number) => void;
}

export const DiceRollSequence: React.FC<DiceRollSequenceProps> = ({
  rolling,
  onComplete,
}) => {
  const [dice1Value, setDice1Value] = React.useState(1);
  const [dice2Value, setDice2Value] = React.useState(1);
  const [dice1Complete, setDice1Complete] = React.useState(false);
  const [dice2Complete, setDice2Complete] = React.useState(false);

  // Generate random dice values when rolling starts
  React.useEffect(() => {
    if (rolling) {
      setDice1Value(Math.floor(Math.random() * 6) + 1);
      setDice2Value(Math.floor(Math.random() * 6) + 1);
      setDice1Complete(false);
      setDice2Complete(false);
    }
  }, [rolling]);

  // Notify when both dice have finished
  React.useEffect(() => {
    if (dice1Complete && dice2Complete && onComplete) {
      onComplete(dice1Value, dice2Value);
    }
  }, [dice1Complete, dice2Complete, dice1Value, dice2Value, onComplete]);

  return (
    <group>
      <Dice3D
        value={dice1Value}
        position={[-0.1, 0.1, 0]}
        rolling={rolling}
        onRollComplete={() => setDice1Complete(true)}
      />
      <Dice3D
        value={dice2Value}
        position={[0.1, 0.1, 0]}
        rolling={rolling}
        onRollComplete={() => setDice2Complete(true)}
      />
    </group>
  );
};

/**
 * Utility function to get dice face value from rotation
 * Determines which face is "up" based on rotation angles
 */
export const getDiceFaceValue = (
  rotationX: number,
  rotationY: number,
  rotationZ: number
): number => {
  // Normalize rotations to 0-2π
  const normalizeAngle = (angle: number): number => {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  };

  const x = normalizeAngle(rotationX);
  const y = normalizeAngle(rotationY);
  const z = normalizeAngle(rotationZ);

  // Simple face detection (could be more sophisticated)
  if (Math.abs(y - Math.PI / 2) < 0.2) return 2;
  if (Math.abs(z + Math.PI / 2) < 0.2) return 3;
  if (Math.abs(z - Math.PI / 2) < 0.2) return 4;
  if (Math.abs(x - Math.PI / 2) < 0.2) return 5;
  if (Math.abs(x + Math.PI / 2) < 0.2) return 6;
  return 1;
};
