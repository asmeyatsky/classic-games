import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Card3D } from './Card3D';

/**
 * Deck3D Component
 *
 * Architectural Intent:
 * - Represents a shuffled deck of cards
 * - Supports dealing animations
 * - Shows card count visually
 * - Smooth shuffle and dealing effects
 *
 * Key Design Decisions:
 * 1. Stack representation (efficient rendering)
 * 2. Rotation for deck appearance
 * 3. Dealing animation with arc motion
 * 4. Card count indicator
 */

export interface DeckProps {
  position: [number, number, number];
  cardCount: number;
  faceUp?: boolean;
  onCardDealt?: (cardIndex: number) => void;
}

const CARD_WIDTH = 0.63;
const CARD_HEIGHT = 0.88;
const CARD_STACK_OFFSET = 0.002;

export const Deck3D: React.FC<DeckProps> = ({
  position,
  cardCount,
  faceUp = false,
  onCardDealt,
}) => {
  const groupRef = useRef<Group>(null);
  const [isShuffling, setIsShuffling] = React.useState(false);

  // Shuffle animation
  useFrame((state) => {
    if (groupRef.current) {
      if (isShuffling) {
        // Bobbing motion during shuffle
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 8) * 0.01;
        groupRef.current.rotation.z += 0.2;
      } else {
        // Gentle rotation at rest
        groupRef.current.rotation.z += 0.002;
      }
    }
  });

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 1000);
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Card stack representation */}
      {Array.from({ length: Math.min(cardCount, 10) }).map((_, index) => {
        const zOffset = index * CARD_STACK_OFFSET;
        const spread = Math.sin(index / cardCount * Math.PI) * 0.02;

        return (
          <mesh
            key={index}
            position={[spread, 0, zOffset]}
            rotation={[Math.random() * 0.05, 0, Math.random() * 0.05]}
          >
            <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, 0.01]} />
            <meshStandardMaterial
              color={faceUp ? '#FFFFFF' : '#DC2626'}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Deck label/indicator */}
      <mesh position={[0, -0.15, 0]}>
        <planeGeometry args={[0.3, 0.08]} />
        <meshStandardMaterial
          color="#1F2937"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Card count text (would be rendered on canvas) */}
      {/*
        Card count display:
        - Render card count on canvas texture
        - Update as cards are dealt
        - Show depletion visually
      */}
    </group>
  );
};

/**
 * CardDealingSequence - Animated dealing of multiple cards
 *
 * This component orchestrates dealing cards to multiple players
 */
export interface CardDealingSequenceProps {
  cards: Array<{
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: string;
  }>;
  dealPositions: Array<[number, number, number]>;
  dealDuration?: number;
  onSequenceComplete?: () => void;
}

export const CardDealingSequence: React.FC<CardDealingSequenceProps> = ({
  cards,
  dealPositions,
  dealDuration = 0.3,
  onSequenceComplete,
}) => {
  const [dealtCards, setDealtCards] = React.useState<number[]>([]);
  const sequenceRef = useRef<number | null>(null);

  React.useEffect(() => {
    let cardIndex = 0;

    const dealNextCard = () => {
      if (cardIndex < cards.length) {
        setDealtCards((prev) => [...prev, cardIndex]);
        cardIndex++;
        sequenceRef.current = window.setTimeout(dealNextCard, dealDuration * 1000);
      } else {
        if (onSequenceComplete) onSequenceComplete();
      }
    };

    dealNextCard();

    return () => {
      if (sequenceRef.current) clearTimeout(sequenceRef.current);
    };
  }, [cards.length, dealDuration, onSequenceComplete]);

  return (
    <group>
      {/* Dealt cards would be rendered here with animation */}
      {/* Using AnimatedCard component from Card3D.tsx */}
    </group>
  );
};

/**
 * DeckWithParticles - Advanced deck with dealing particle effects
 */
export const DeckWithParticles: React.FC<DeckProps> = (props) => {
  return (
    <group>
      <Deck3D {...props} />

      {/* Particle effects would go here */}
      {/*
        Particle system for dealing:
        1. Small card-shaped particles
        2. Arc from deck to player position
        3. Trail effect as card moves
        4. Sound effect trigger points

        This would be implemented with:
        - THREE.Points for particle system
        - Custom shader for efficient rendering
        - Lifecycle management for particles
      */}
    </group>
  );
};

/**
 * Utility function to generate a standard 52-card deck
 */
export const generateStandardDeck = () => {
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = [
    'hearts',
    'diamonds',
    'clubs',
    'spades',
  ];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
};

/**
 * Utility to shuffle deck using Fisher-Yates algorithm
 */
export const shuffleDeck = <T,>(deck: T[]): T[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
