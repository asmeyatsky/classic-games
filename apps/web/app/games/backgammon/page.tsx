'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BackgammonGame } from '@classic-games/game-engine';

// Dynamically import Three.js components to prevent SSR issues
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

export default function BackgammonPage() {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [backgammonGame, setBackgammonGame] = useState<BackgammonGame | null>(null);
  const [gameStateData, setGameStateData] = useState<any>(null);
  const [playerId] = useState('player1');
  const [opponentId] = useState('opponent1');

  const handleStartGame = () => {
    const newGame = new BackgammonGame();
    setBackgammonGame(newGame);
    setGameState('playing');
    setGameStateData(newGame.getState());
  };

  const handleRollDice = () => {
    if (backgammonGame) {
      const dice = backgammonGame.rollDice();
      setGameStateData(backgammonGame.getState());
    }
  };

  const handleEndTurn = () => {
    // In the actual game engine, ending turn happens automatically after moves are made
    // This function is for UI purposes only
    if (backgammonGame) {
      setGameStateData(backgammonGame.getState());
    }
  };

  // Get current player from the game state
  const getCurrentPlayer = () => {
    if (!gameStateData) return 'white';
    return gameStateData.currentPlayer;
  };

  // Get dice from the game state
  const getDice = () => {
    if (!gameStateData) return [0, 0];
    return gameStateData.dice;
  };

  // Get board from the game state
  const getBoard = () => {
    if (!gameStateData) return Array(24).fill(0);
    return gameStateData.board;
  };

  // Get bar pieces from the game state
  const getBarPieces = () => {
    if (!gameStateData) return { white: 0, black: 0 };
    return gameStateData.bar;
  };

  // Get born off pieces from the game state
  const getBornOffPieces = () => {
    if (!gameStateData) return { white: 0, black: 0 };
    return gameStateData.bornOff;
  };

  // Get game phase from the game state
  const getGamePhase = () => {
    if (!gameStateData) return 'rolling';
    return gameStateData.gamePhase;
  };

  // LANDING SCREEN
  if (gameState === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl border-4 border-amber-600 shadow-2xl p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-9xl mb-6">🎲</div>
              <h1 className="text-7xl font-bold mb-4 text-amber-900">Backgammon</h1>
              <div className="h-2 w-48 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              <p className="mt-6 text-2xl text-amber-800 font-semibold">
                One of the world's oldest board games
              </p>
            </div>

            {/* Rules */}
            <div className="mb-10 bg-amber-50 rounded-2xl p-8 border-2 border-amber-300">
              <h2 className="text-4xl font-bold text-amber-900 mb-6 text-center">How to Play</h2>
              <div className="grid gap-5">
                {[
                  'Move all your checkers around the board and bear them off before your opponent',
                  'Roll two dice each turn to determine how many points you can move',
                  'Land on opponent pieces to send them back to the starting bar',
                  'First player to remove all their checkers wins the game',
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 text-lg">
                    <span className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
              className="w-full py-7 px-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-3xl rounded-2xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              ✨ Start Playing ✨
            </button>

            <Link
              href="/"
              className="block text-center mt-6 text-amber-700 hover:text-amber-900 transition-colors text-lg font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/50 to-slate-950 text-white">
      {/* Luxurious Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-950/95 via-yellow-900/95 to-amber-950/95 backdrop-blur-xl border-b-2 border-amber-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-amber-300 hover:text-amber-200 transition-colors group"
          >
            <svg
              className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back to Games</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-transparent bg-clip-text">
              Backgammon
            </h1>
            <p className="text-sm text-amber-400 mt-1">{getCurrentPlayer().toUpperCase()}'s Turn</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 px-8 py-4 rounded-xl border-2 border-amber-600/50 shadow-lg">
            <p className="text-xs text-amber-400 font-semibold">GAME STATUS</p>
            <p className="text-2xl font-bold text-yellow-300">In Progress</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-32 pb-48 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* 3D Game Canvas */}
          <div className="relative h-[70vh] min-h-[500px] rounded-3xl overflow-hidden mb-10 shadow-2xl border-4 border-amber-700/40 bg-gradient-to-br from-slate-900 to-amber-950/30">
            {typeof window !== 'undefined' && (
              <Canvas shadows camera={{ position: [0, 6, 10], fov: 45 }}>
                <Suspense fallback={null}>
                  {/* Enhanced Luxurious Lighting */}
                  <ambientLight intensity={0.3} />
                  <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={20}
                    shadow-camera-left={-8}
                    shadow-camera-right={8}
                    shadow-camera-top={8}
                    shadow-camera-bottom={-8}
                  />
                  <directionalLight position={[-5, 8, -5]} intensity={0.7} color="#fbbf24" />
                  <pointLight
                    position={[0, 5, 0]}
                    intensity={1.0}
                    color="#fbbf24"
                    distance={20}
                    decay={2}
                  />
                  <spotLight
                    position={[0, 10, 0]}
                    angle={0.6}
                    intensity={0.7}
                    color="#fcd34d"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />

                  <Board3D />

                  {/* Dice */}
                  {getGamePhase() === 'moving' && (
                    <>
                      <Dice3D value={getDice()[0]} position={[-1.2, 0.3, 0]} rolling={false} />
                      <Dice3D value={getDice()[1]} position={[-0.6, 0.3, 0]} rolling={false} />
                    </>
                  )}

                  {/* Checkers - positioned properly on the board based on game state */}
                  {getBoard().map((count, index) => {
                    if (count === 0) return null; // No checker at this position

                    const isPositive = count > 0;
                    const absCount = Math.abs(count);
                    const checkers = [];

                    // Position on the board (simplified for visualization)
                    const x = ((index % 12) - 5.5) * 0.8; // Spread checkers across the board
                    const z = index < 12 ? 1.35 : -1.35; // White on top, black on bottom

                    // Create multiple checkers if stacked
                    for (let i = 0; i < absCount; i++) {
                      checkers.push(
                        <Checker3D
                          key={`checker-${index}-${i}`}
                          color={isPositive ? 'white' : 'black'}
                          position={[x, 0.05 + i * 0.04, z]}
                          stackIndex={i}
                        />
                      );
                    }

                    return checkers;
                  })}

                  {/* Checkers on bar */}
                  {getBarPieces().white > 0 &&
                    Array.from({ length: getBarPieces().white }, (_, i) => (
                      <Checker3D
                        key={`bar-white-${i}`}
                        color="white"
                        position={[0, 0.05 + i * 0.04, 0.5]}
                        stackIndex={i}
                      />
                    ))}
                  {getBarPieces().black > 0 &&
                    Array.from({ length: getBarPieces().black }, (_, i) => (
                      <Checker3D
                        key={`bar-black-${i}`}
                        color="black"
                        position={[0, 0.05 + i * 0.04, -0.5]}
                        stackIndex={i}
                      />
                    ))}

                  <Environment preset="sunset" />
                  <EffectComposer>
                    <Bloom
                      intensity={0.5}
                      luminanceThreshold={0.2}
                      luminanceSmoothing={0.9}
                      height={300}
                    />
                    <DepthOfField focalLength={0.2} bokehScale={2} height={480} />
                    <Vignette eskil={false} offset={0.1} darkness={0.8} />
                    <SMAA />
                  </EffectComposer>
                  <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={15}
                    maxPolarAngle={Math.PI / 2.2}
                  />
                </Suspense>
              </Canvas>
            )}
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div
              className={`bg-gradient-to-br ${getCurrentPlayer() === 'white' ? 'from-amber-900/60 to-yellow-900/60 border-amber-500' : 'from-slate-800/60 to-slate-700/60 border-slate-600'} rounded-2xl p-8 border-2 shadow-xl transform transition-all ${getCurrentPlayer() === 'white' ? 'scale-105 shadow-amber-500/30' : ''}`}
            >
              <p className="text-amber-400 text-sm mb-2 font-bold uppercase tracking-wide">
                WHITE PLAYER
              </p>
              <p className="text-5xl font-bold text-yellow-300 mb-2">{getBornOffPieces().white}</p>
              <p className="text-sm text-amber-300/70">
                Checkers Borne Off: {getBornOffPieces().white}
              </p>
            </div>
            <div
              className={`bg-gradient-to-br ${getCurrentPlayer() === 'black' ? 'from-amber-900/60 to-yellow-900/60 border-amber-500' : 'from-slate-800/60 to-slate-700/60 border-slate-600'} rounded-2xl p-8 border-2 shadow-xl transform transition-all ${getCurrentPlayer() === 'black' ? 'scale-105 shadow-amber-500/30' : ''}`}
            >
              <p className="text-amber-400 text-sm mb-2 font-bold uppercase tracking-wide">
                BLACK PLAYER
              </p>
              <p className="text-5xl font-bold text-orange-400 mb-2">{getBornOffPieces().black}</p>
              <p className="text-sm text-amber-300/70">
                Checkers Borne Off: {getBornOffPieces().black}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Luxurious Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-950/98 via-yellow-900/98 to-amber-950/98 backdrop-blur-xl border-t-2 border-amber-700/50 py-8 px-8 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-amber-300 mb-6 text-lg">
            {getGamePhase() === 'rolling'
              ? '🎲 Roll the dice to begin your turn'
              : '♟️ Make your move'}
          </p>

          <div className="flex gap-4 justify-center">
            {getGamePhase() === 'rolling' ? (
              <button
                onClick={handleRollDice}
                className="px-12 py-5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-slate-900 rounded-xl font-bold text-xl transition-all hover:shadow-2xl shadow-amber-500/50 transform hover:scale-105 active:scale-95 border-2 border-amber-400/50"
              >
                🎲 Roll Dice
              </button>
            ) : (
              <button
                onClick={handleEndTurn}
                className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg transition-all hover:shadow-xl shadow-emerald-500/30 transform hover:scale-105 active:scale-95"
              >
                ✓ End Turn
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
