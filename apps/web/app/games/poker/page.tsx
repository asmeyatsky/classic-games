'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import 3D components to prevent SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), {
  ssr: false,
});
const OrbitControls = dynamic(() => import('@react-three/drei').then((mod) => mod.OrbitControls), {
  ssr: false,
});
const Environment = dynamic(() => import('@react-three/drei').then((mod) => mod.Environment), {
  ssr: false,
});

// Dynamically import postprocessing components
const EffectComposer = dynamic(
  () => import('@react-three/postprocessing').then((mod) => mod.EffectComposer),
  { ssr: false }
);
const Bloom = dynamic(() => import('@react-three/postprocessing').then((mod) => mod.Bloom), {
  ssr: false,
});
const DepthOfField = dynamic(
  () => import('@react-three/postprocessing').then((mod) => mod.DepthOfField),
  { ssr: false }
);
const Vignette = dynamic(() => import('@react-three/postprocessing').then((mod) => mod.Vignette), {
  ssr: false,
});
const SMAA = dynamic(() => import('@react-three/postprocessing').then((mod) => mod.SMAA), {
  ssr: false,
});

type GameState = 'landing' | 'setup' | 'playing' | 'finished';

// Define types for our components
interface CardData {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceUp: boolean;
}

export default function PokerPage() {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [pot, setPot] = useState(250);
  const [playerChips, setPlayerChips] = useState(2500);
  const [playerBet, setPlayerBet] = useState(50);
  const [currentBet, setCurrentBet] = useState(50);
  const [phase, setPhase] = useState('flop');
  const [folded, setFolded] = useState(false);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const communityCards: CardData[] = [
    { suit: 'hearts', rank: 'K', faceUp: true },
    { suit: 'diamonds', rank: 'Q', faceUp: true },
    { suit: 'clubs', rank: 'J', faceUp: true },
  ];

  const playerHand: CardData[] = [
    { suit: 'spades', rank: 'A', faceUp: true },
    { suit: 'spades', rank: 'K', faceUp: true },
  ];

  const handleFold = () => {
    setFolded(true);
  };

  const handleCheck = () => {
    alert('Check - your turn complete');
  };

  const handleCall = () => {
    const callAmount = currentBet - playerBet;
    setPlayerBet(currentBet);
    setPot(pot + callAmount);
    setPlayerChips(playerChips - callAmount);
  };

  const handleRaise = (amount: number) => {
    const totalBet = currentBet + amount;
    const raiseAmount = totalBet - playerBet;
    setCurrentBet(totalBet);
    setPlayerBet(totalBet);
    setPot(pot + raiseAmount);
    setPlayerChips(playerChips - raiseAmount);
  };

  // LANDING SCREEN
  if (gameState === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl border-4 border-emerald-600 shadow-2xl p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-9xl mb-6">🃏</div>
              <h1 className="text-7xl font-bold mb-4 text-emerald-900">Texas Hold'em</h1>
              <div className="h-2 w-48 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
              <p className="mt-6 text-2xl text-emerald-800 font-semibold">
                Classic poker at its finest
              </p>
            </div>

            {/* Rules */}
            <div className="mb-10 bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-300">
              <h2 className="text-4xl font-bold text-emerald-900 mb-6 text-center">How to Play</h2>
              <div className="grid gap-5">
                {[
                  'Each player receives two private cards, five community cards are dealt face-up',
                  'Make the best five-card hand using any combination of your cards and community cards',
                  'Bet strategically in four rounds: Pre-flop, Flop, Turn, and River',
                  'Win by having the best hand at showdown or forcing all opponents to fold',
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 text-lg">
                    <span className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed text-slate-800 pt-2 text-xl">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-7 px-10 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-3xl rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              ✨ Start Playing ✨
            </button>

            <Link
              href="/"
              className="block text-center mt-6 text-emerald-700 hover:text-emerald-900 transition-colors text-lg font-semibold"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/80 backdrop-blur-xl border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Games
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-emerald-300">Texas Hold'em</h1>
            <p className="text-sm text-emerald-400">
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </p>
          </div>
          <div className="bg-emerald-900/60 px-6 py-3 rounded-xl border border-emerald-700/50">
            <p className="text-xs text-emerald-400">POT</p>
            <p className="text-2xl font-bold text-yellow-400">${pot}</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 3D Game Canvas */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl border-4 border-emerald-700/40 bg-gradient-to-br from-slate-900 to-emerald-950/30">
            {typeof window !== 'undefined' ? (
              <Canvas shadows camera={{ position: [0, 5, 8], fov: 50 }}>
                <Suspense fallback={null}>
                  {/* Enhanced Luxurious Casino Lighting */}
                  <ambientLight intensity={0.3} />
                  <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={20}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                  />
                  <directionalLight position={[-5, 8, -5]} intensity={0.7} color="#10b981" />
                  <pointLight
                    position={[0, 5, 0]}
                    intensity={1.0}
                    color="#10b981"
                    distance={20}
                    decay={2}
                  />
                  <spotLight
                    position={[0, 10, 0]}
                    angle={0.6}
                    intensity={0.7}
                    color="#34d399"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />

                  {/* Poker Table - Elliptical felt surface with enhanced materials */}
                  <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[3, 3, 0.15, 64]} />
                    <meshPhysicalMaterial
                      color="#0F5132"
                      roughness={0.4}
                      metalness={0.1}
                      clearcoat={0.5}
                      clearcoatRoughness={0.2}
                    />
                  </mesh>

                  {/* Table rail */}
                  <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[3, 0.15, 16, 64]} />
                    <meshPhysicalMaterial
                      color="#8B4513"
                      roughness={0.6}
                      metalness={0.2}
                      clearcoat={0.3}
                    />
                  </mesh>

                  {/* Community cards in center with enhanced materials */}
                  {communityCards.map((card, i) => (
                    <mesh key={`com-${i}`} position={[-1.5 + i * 0.8, 0.2, 0]}>
                      <boxGeometry args={[0.6, 0.02, 0.9]} />
                      <meshPhysicalMaterial
                        color="#FFFFFF"
                        roughness={0.2}
                        metalness={0.1}
                        clearcoat={0.8}
                      />
                    </mesh>
                  ))}

                  {/* Player hand cards with enhanced materials */}
                  {playerHand.map((card, i) => (
                    <mesh
                      key={`player-${i}`}
                      position={[-0.4 + i * 0.8, 0.2, 2.5]}
                      rotation={[0, Math.PI, 0]}
                    >
                      <boxGeometry args={[0.6, 0.02, 0.9]} />
                      <meshPhysicalMaterial
                        color="#FFFFFF"
                        roughness={0.2}
                        metalness={0.1}
                        clearcoat={0.8}
                      />
                    </mesh>
                  ))}

                  {/* Player chip stacks with enhanced materials */}
                  {[...Array(8)].map((_, i) => (
                    <mesh
                      key={`chip-${i}`}
                      position={[0.5 + i * 0.1, 0.05 + i * 0.04, 2]}
                      rotation={[-Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
                      <meshStandardMaterial
                        color="#F59E0B"
                        roughness={0.3}
                        metalness={0.8}
                        emissive="#F59E0B"
                        emissiveIntensity={0.1}
                      />
                    </mesh>
                  ))}

                  {/* Pot chips in center with enhanced materials */}
                  {[...Array(5)].map((_, i) => (
                    <mesh
                      key={`pot-${i}`}
                      position={[i * 0.1 - 0.2, 0.05 + i * 0.04, 0.8]}
                      rotation={[-Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
                      <meshStandardMaterial
                        color="#DC2626"
                        roughness={0.3}
                        metalness={0.8}
                        emissive="#DC2626"
                        emissiveIntensity={0.1}
                      />
                    </mesh>
                  ))}

                  <Environment preset="apartment" />
                  <EffectComposer>
                    <Bloom
                      intensity={0.4}
                      luminanceThreshold={0.3}
                      luminanceSmoothing={0.9}
                      height={300}
                    />
                    <DepthOfField focalLength={0.3} bokehScale={2.5} height={480} />
                    <Vignette eskil={false} offset={0.1} darkness={0.6} />
                    <SMAA />
                  </EffectComposer>
                  <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 2.2}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-800/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Loading 3D Table...</h3>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              </div>
            )}
          </div>

          {/* 2D info panel */}
          <div className="bg-emerald-900/40 backdrop-blur rounded-2xl p-6 border border-emerald-700/30 mb-8">
            <div className="text-center mb-4">
              <p className="text-emerald-300 text-sm mb-2">COMMUNITY CARDS</p>
              <div className="flex justify-center gap-2">
                {communityCards.map((card, i) => (
                  <div
                    key={`info-com-${i}`}
                    className="w-8 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center text-white text-xs"
                  >
                    {card.rank}
                    {card.suit === 'hearts'
                      ? '♥'
                      : card.suit === 'diamonds'
                        ? '♦'
                        : card.suit === 'clubs'
                          ? '♣'
                          : '♠'}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-emerald-300 text-sm mb-2">YOUR HAND</p>
              <div className="flex justify-center gap-2">
                {playerHand.map((card, i) => (
                  <div
                    key={`info-player-${i}`}
                    className="w-8 h-12 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded flex items-center justify-center text-white text-xs"
                  >
                    {card.rank}
                    {card.suit === 'hearts'
                      ? '♥'
                      : card.suit === 'diamonds'
                        ? '♦'
                        : card.suit === 'clubs'
                          ? '♣'
                          : '♠'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-900/40 rounded-2xl p-6 border border-emerald-700/30">
              <p className="text-emerald-400 text-sm mb-2">YOUR CHIPS</p>
              <p className="text-3xl font-bold text-green-400">${playerChips}</p>
              <p className="text-sm text-emerald-400 mt-3">Current Bet: ${playerBet}</p>
            </div>
            <div className="bg-emerald-900/40 rounded-2xl p-6 border border-emerald-700/30">
              <p className="text-emerald-400 text-sm mb-2">GAME STATUS</p>
              <p className={`text-xl font-bold ${folded ? 'text-red-400' : 'text-yellow-400'}`}>
                {folded ? 'FOLDED' : 'ACTIVE'}
              </p>
              <p className="text-sm text-emerald-400 mt-3">Min Bet: ${currentBet}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-700/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-emerald-400 mb-4">
            {folded ? 'You have folded. Waiting for hand to complete...' : 'Your turn to act'}
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleFold}
              disabled={folded}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              FOLD
            </button>

            <button
              onClick={handleCheck}
              disabled={folded || currentBet > playerBet}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                folded || currentBet > playerBet
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              CHECK
            </button>

            <button
              onClick={handleCall}
              disabled={folded || currentBet === playerBet}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                folded || currentBet === playerBet
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              CALL ${currentBet - playerBet}
            </button>

            <button
              onClick={() => handleRaise(50)}
              disabled={folded}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              RAISE $50
            </button>

            <button
              onClick={() => handleRaise(100)}
              disabled={folded}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                folded
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              RAISE $100
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
