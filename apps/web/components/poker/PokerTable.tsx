import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PokerTable() {
  const tableRef = useRef<THREE.Group>(null);

  return (
    <group ref={tableRef} position={[0, 0, 0]}>
      {/* Table top - oval shape */}
      <mesh receiveShadow position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[5, 5, 0.2, 32]} />
        <meshStandardMaterial
          color="#0F5132"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Table edge/rail - wood */}
      <mesh castShadow position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[5.3, 5.3, 0.3, 32]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Table legs */}
      {[
        [-3, 0, -3],
        [3, 0, -3],
        [-3, 0, 3],
        [3, 0, 3],
      ].map((position, i) => (
        <mesh key={i} castShadow position={position as [number, number, number]}>
          <cylinderGeometry args={[0.2, 0.3, 1, 16]} />
          <meshStandardMaterial color="#654321" roughness={0.8} />
        </mesh>
      ))}

      {/* Floor */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1A1F2E" roughness={1} />
      </mesh>

      {/* Pot area marker (center circle) */}
      <mesh position={[0, 1.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          roughness={0.4}
          metalness={0.6}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
