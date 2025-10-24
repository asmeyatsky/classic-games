'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import { PokerTable } from './PokerTable';
import { Card3D } from './Card3D';
import { Chip3D } from './Chip3D';
import { usePokerStore } from '@/lib/store/pokerStore';

export default function PokerScene() {
  const { gameState } = usePokerStore();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Initializing game...</p>
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const communityCards = gameState.communityCards;

  return (
    <Canvas shadows className="w-full h-full">
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[0, 15, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />

      {/* Environment */}
      <Environment preset="city" />

      {/* Game Elements */}
      <PokerTable />

      {/* Player's hole cards */}
      {humanPlayer.hand.length > 0 && (
        <>
          <Card3D
            suit={humanPlayer.hand[0].suit}
            rank={humanPlayer.hand[0].rank}
            position={[-0.5, 1.1, 4]}
            faceUp={!humanPlayer.folded}
          />
          {humanPlayer.hand.length > 1 && (
            <Card3D
              suit={humanPlayer.hand[1].suit}
              rank={humanPlayer.hand[1].rank}
              position={[0.5, 1.1, 4]}
              faceUp={!humanPlayer.folded}
            />
          )}
        </>
      )}

      {/* Community cards */}
      {communityCards.map((card, index) => (
        <Card3D
          key={`community-${index}`}
          suit={card.suit}
          rank={card.rank}
          position={[-2.5 + index * 1.2, 1.1, 0]}
          faceUp={true}
        />
      ))}

      {/* Pot chips in center */}
      {gameState.pot > 0 && (
        <>
          <Chip3D
            value={100}
            color="#F59E0B"
            position={[0, 1.05, -1.5]}
            count={Math.min(Math.floor(gameState.pot / 100), 10)}
          />
          <Text
            position={[0, 1.3, -1.5]}
            fontSize={0.3}
            color="#F59E0B"
            anchorX="center"
            anchorY="middle"
          >
            Pot: ${gameState.pot}
          </Text>
        </>
      )}

      {/* AI Players positions (showing face-down cards) */}
      {gameState.players.slice(1).map((player, index) => {
        const angle = (index * Math.PI * 2) / 3; // Distribute 3 AI players around table
        const radius = 5;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group key={player.id} position={[x, 1.1, z]}>
            {!player.folded && player.hand.length > 0 && (
              <>
                <Card3D
                  suit="hearts"
                  rank="A"
                  position={[-0.3, 0, 0]}
                  faceUp={false}
                />
                <Card3D
                  suit="hearts"
                  rank="A"
                  position={[0.3, 0, 0]}
                  faceUp={false}
                />
              </>
            )}
            {/* Player label */}
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.2}
              color={player.folded ? '#666' : '#FFF'}
              anchorX="center"
              anchorY="middle"
            >
              AI {index + 1}: ${player.chips}
              {player.folded && ' (Folded)'}
            </Text>
          </group>
        );
      })}

      {/* Round indicator */}
      <Text
        position={[0, 1.5, -4]}
        fontSize={0.4}
        color="#60A5FA"
        anchorX="center"
        anchorY="middle"
      >
        {gameState.round}
      </Text>

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
