import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface Chip3DProps {
  value: number;
  color: string;
  position: [number, number, number];
  count?: number;
}

export function Chip3D({ value, color, position, count = 1 }: Chip3DProps) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[0, i * 0.15, 0]}>
          {/* Chip body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </mesh>

          {/* Chip edge stripes */}
          <mesh>
            <cylinderGeometry args={[0.31, 0.31, 0.06, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.4} />
          </mesh>

          {/* Value on top (only on top chip) */}
          {i === count - 1 && (
            <>
              <Text
                position={[0, 0.06, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.12}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                ${value}
              </Text>
            </>
          )}

          {/* Inner ring decoration */}
          <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.2, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} opacity={0.5} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}
