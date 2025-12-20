'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ScrabbleGame } from '@classic-games/game-engine';

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

export default function ScrabblePage() {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [scrabbleGame, setScrabbleGame] = useState<ScrabbleGame | null>(null);
  const [gameStateData, setGameStateData] = useState<any>(null);
  const [playerId] = useState('player1');
  const [opponentId] = useState('opponent1');
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [wordPlacement, setWordPlacement] = useState({ row: 7, col: 7, direction: 'horizontal' });

  const handleStartGame = () => {
    const newGame = new ScrabbleGame([playerId, opponentId]);
    setScrabbleGame(newGame);
    setGameState('playing');
    setGameStateData(newGame.getState());
  };

  const handleTileSelect = (index: number) => {
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter((i) => i !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const handlePlayWord = () => {
    if (scrabbleGame && selectedTiles.length > 0) {
      // In a real implementation, we would get the actual word formed
      // For now, we'll use a placeholder word
      const placeholderWord = 'TEST'; // This would be calculated based on selected tiles and board position

      const result = scrabbleGame.placeWord({
        word: placeholderWord,
        startRow: wordPlacement.row,
        startCol: wordPlacement.col,
        direction: wordPlacement.direction,
        tiles: selectedTiles.map(
          (i) => getPlayerRack()[i] || { letter: 'A', value: 1, isBlank: false }
        ), // Use actual tiles from player's rack
      });

      if (result.valid) {
        setGameStateData(scrabbleGame.getState());
        setSelectedTiles([]);
      }
    }
  };

  const handlePass = () => {
    if (scrabbleGame) {
      scrabbleGame.skipTurn();
      setGameStateData(scrabbleGame.getState());
      setSelectedTiles([]);
    }
  };

  // Get current player's rack from the game state
  const getPlayerRack = () => {
    if (!gameStateData) return [];
    return gameStateData.players[gameStateData.currentPlayerIndex]?.rack || [];
  };

  // Get current player's score from the game state
  const getPlayerScore = () => {
    if (!gameStateData) return 0;
    return gameStateData.players[gameStateData.currentPlayerIndex]?.score || 0;
  };

  // Get opponent's score from the game state
  const getOpponentScore = () => {
    if (!gameStateData) return 0;
    const opponentIndex = (gameStateData.currentPlayerIndex + 1) % gameStateData.players.length;
    return gameStateData.players[opponentIndex]?.score || 0;
  };

  // Get board from the game state
  const getBoard = () => {
    if (!gameStateData)
      return Array(15)
        .fill(null)
        .map(() => Array(15).fill(null));
    return gameStateData.board;
  };

  // Get remaining tiles in bag from the game state
  const getTilesRemaining = () => {
    if (!gameStateData) return 0;
    return gameStateData.tileBag;
  };

  // LANDING SCREEN
  if (gameState === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl border-4 border-indigo-600 shadow-2xl p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-9xl mb-6">📝</div>
              <h1 className="text-7xl font-bold mb-4 text-indigo-900">Scrabble</h1>
              <div className="h-2 w-48 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <p className="mt-6 text-2xl text-indigo-800 font-semibold">
                The classic word-building game
              </p>
            </div>

            {/* Rules */}
            <div className="mb-10 bg-indigo-50 rounded-2xl p-8 border-2 border-indigo-300">
              <h2 className="text-4xl font-bold text-indigo-900 mb-6 text-center">How to Play</h2>
              <div className="grid gap-5">
                {[
                  'Use letter tiles to create words on the board, connecting to existing words',
                  'Each letter has a point value - longer and rarer words score more points',
                  'Take advantage of premium squares to double or triple your letter and word scores',
                  'First player to use all their tiles or highest score when tiles run out wins',
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 text-lg">
                    <span className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
              className="w-full py-7 px-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-3xl rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              ✨ Start Playing ✨
            </button>

            <Link
              href="/"
              className="block text-center mt-6 text-indigo-700 hover:text-indigo-900 transition-colors text-lg font-semibold"
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/80 backdrop-blur-xl border-b border-indigo-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
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
            <h1 className="text-3xl font-bold text-indigo-300">Scrabble</h1>
            <p className="text-sm text-indigo-400">
              {gameState === 'playing' ? 'Word Game' : 'Game Over'}
            </p>
          </div>
          <div className="bg-indigo-900/60 px-6 py-3 rounded-xl border border-indigo-700/50">
            <p className="text-xs text-indigo-400">TILES LEFT</p>
            <p className="text-xl font-bold text-cyan-400">{getTilesRemaining()}</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-28 pb-40 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* 3D Game Canvas */}
          <div className="relative h-[70vh] min-h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl border-4 border-indigo-700/40 bg-gradient-to-br from-slate-900 to-indigo-950/30">
            {typeof window !== 'undefined' && (
              <Canvas shadows camera={{ position: [0, 8, 6], fov: 50 }}>
                <Suspense fallback={null}>
                  {/* Enhanced Luxurious Game Lighting */}
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
                  <directionalLight position={[-5, 8, -5]} intensity={0.7} color="#818cf8" />
                  <pointLight
                    position={[0, 5, 0]}
                    intensity={1.0}
                    color="#818cf8"
                    distance={20}
                    decay={2}
                  />
                  <spotLight
                    position={[0, 10, 0]}
                    angle={0.6}
                    intensity={0.8}
                    color="#a78bfa"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />

                  {/* 3D Scrabble Board */}
                  <ScrabbleBoard3D size={1.2} />

                  {/* Player rack of tiles - based on actual game state */}
                  {getPlayerRack().map((tile: any, i: number) => (
                    <Tile3D
                      key={i}
                      letter={tile.letter}
                      value={tile.value}
                      position={[i * 0.12 - 0.36, 0.15, -0.9]}
                    />
                  ))}

                  {/* Placed tiles on board based on actual game state */}
                  {getBoard().map((row: any[], rowIndex: number) =>
                    row.map((tile: any, colIndex: number) => {
                      if (tile) {
                        return (
                          <Tile3D
                            key={`${rowIndex}-${colIndex}`}
                            letter={tile.letter}
                            value={tile.value}
                            position={[colIndex * 0.075 + 0.0375, 0.015, rowIndex * 0.075 + 0.0375]}
                          />
                        );
                      }
                      return null;
                    })
                  )}

                  <Environment preset="apartment" />
                  <EffectComposer>
                    <Bloom
                      intensity={0.5}
                      luminanceThreshold={0.2}
                      luminanceSmoothing={0.9}
                      height={300}
                    />
                    <DepthOfField focalLength={0.2} bokehScale={2} height={480} />
                    <Vignette eskil={false} offset={0.1} darkness={0.7} />
                    <SMAA />
                  </EffectComposer>
                  <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 2.2}
                  />
                </Suspense>
              </Canvas>
            )}
            {typeof window === 'undefined' && (
              <div className="flex items-center justify-center h-full bg-emerald-900/20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-emerald-300">Loading 3D Game...</p>
                </div>
              </div>
            )}
          </div>

          {/* Player Tiles and Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Your Rack Info (2D backup) */}
            <div className="bg-indigo-900/40 rounded-2xl p-6 border border-indigo-700/30">
              <p className="text-indigo-400 text-sm font-bold mb-4">YOUR TILES</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {getPlayerRack().map((tile: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleTileSelect(i)}
                    className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                      selectedTiles.includes(i)
                        ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                        : 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                    }`}
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>
              <p className="text-indigo-400 text-sm font-bold mb-2">YOUR SCORE</p>
              <p className="text-4xl font-bold text-cyan-400">{getPlayerScore()}</p>
            </div>

            {/* Opponent Info */}
            <div className="bg-indigo-900/40 rounded-2xl p-6 border border-indigo-700/30 opacity-60">
              <p className="text-indigo-400 text-sm font-bold mb-4">OPPONENT TILES</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {Array.from(
                  {
                    length:
                      gameStateData?.players?.[(gameStateData.currentPlayerIndex + 1) % 2]?.rack
                        ?.length || 7,
                  },
                  (_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg bg-gray-400 border border-gray-500"
                    />
                  )
                )}
              </div>
              <p className="text-indigo-400 text-sm font-bold mb-2">OPPONENT SCORE</p>
              <p className="text-4xl font-bold text-orange-400">{getOpponentScore()}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur-xl border-t border-indigo-700/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-indigo-400 mb-4">
            {selectedTiles.length > 0
              ? `${selectedTiles.length} tiles selected`
              : 'Select tiles to form a word'}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePlayWord}
              disabled={selectedTiles.length === 0}
              className={`px-8 py-4 rounded-lg font-bold transition-all ${
                selectedTiles.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              ✓ Play Word
            </button>

            <button
              onClick={handlePass}
              className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
            >
              Skip Turn
            </button>

            <button
              onClick={() => setSelectedTiles([])}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all hover:shadow-lg"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
