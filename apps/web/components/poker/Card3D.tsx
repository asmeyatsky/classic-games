import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Card3DProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  position: [number, number, number];
  faceUp?: boolean;
  onClick?: () => void;
}

export function Card3D({ suit, rank, position, faceUp = true, onClick }: Card3DProps) {
  const cardRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Suit symbols
  const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  // Suit colors
  const suitColor = suit === 'hearts' || suit === 'diamonds' ? '#DC2626' : '#000000';

  // Display rank
  const displayRank = rank === 'T' ? '10' : rank;

  // Hover animation
  useFrame(() => {
    if (cardRef.current && hovered) {
      cardRef.current.position.y = position[1] + 0.2;
    } else if (cardRef.current) {
      cardRef.current.position.y = position[1];
    }
  });

  return (
    <group
      ref={cardRef}
      position={position}
      rotation={faceUp ? [0, 0, 0] : [0, Math.PI, 0]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.01, 0.9]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Card border */}
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[0.58, 0.011, 0.88]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Front face content */}
      {faceUp && (
        <>
          {/* Rank - top left */}
          <Text
            position={[-0.2, 0.011, -0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.15}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
          >
            {displayRank}
          </Text>

          {/* Suit - top left */}
          <Text
            position={[-0.2, 0.011, -0.15]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.15}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
          >
            {suitSymbols[suit]}
          </Text>

          {/* Center suit */}
          <Text
            position={[0, 0.011, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.3}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
          >
            {suitSymbols[suit]}
          </Text>

          {/* Rank - bottom right (upside down) */}
          <Text
            position={[0.2, 0.011, 0.3]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={0.15}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
          >
            {displayRank}
          </Text>

          {/* Suit - bottom right (upside down) */}
          <Text
            position={[0.2, 0.011, 0.15]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={0.15}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
          >
            {suitSymbols[suit]}
          </Text>
        </>
      )}

      {/* Back face (card back pattern) */}
      {!faceUp && (
        <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 0.85]} />
          <meshStandardMaterial color="#0066CC" roughness={0.5} metalness={0.3} />
        </mesh>
      )}
    </group>
  );
}
