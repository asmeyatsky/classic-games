'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ScrabbleGame, ScrabbleCoach } from '@classic-games/game-engine';

const Canvas = dynamic(() => import('@react-three/fiber').then((m) => m.Canvas), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then((m) => m.OrbitControls), {
  ssr: false,
});
const Environment = dynamic(() => import('@react-three/drei').then((m) => m.Environment), {
  ssr: false,
});
const EffectComposer = dynamic(
  () => import('@react-three/postprocessing').then((m) => m.EffectComposer),
  { ssr: false }
);
const Bloom = dynamic(() => import('@react-three/postprocessing').then((m) => m.Bloom), {
  ssr: false,
});
const Vignette = dynamic(() => import('@react-three/postprocessing').then((m) => m.Vignette), {
  ssr: false,
});
const SMAA = dynamic(() => import('@react-three/postprocessing').then((m) => m.SMAA), {
  ssr: false,
});

const ScrabbleBoard3D = dynamic(
  () => import('@classic-games/three-components').then((m) => m.ScrabbleBoard3D),
  { ssr: false }
);
const Tile3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Tile3D), {
  ssr: false,
});
const AICoach = dynamic(() => import('../../../components/AICoach'), { ssr: false });

type GamePhase = 'landing' | 'playing' | 'finished';

// Common short words the AI can attempt
const AI_WORDS = [
  'AT',
  'TO',
  'IN',
  'IT',
  'IS',
  'ON',
  'NO',
  'DO',
  'GO',
  'SO',
  'UP',
  'AN',
  'OR',
  'IF',
  'AM',
  'HE',
  'ME',
  'WE',
  'BE',
  'AS',
  'OF',
  'BY',
  'MY',
  'US',
  'THE',
  'AND',
  'FOR',
  'ARE',
  'NOT',
  'YOU',
  'ALL',
  'CAN',
  'HER',
  'WAS',
  'ONE',
  'OUR',
  'OUT',
  'DAY',
  'HAD',
  'HAS',
  'HIS',
  'HOW',
  'ITS',
  'MAY',
  'NEW',
  'OLD',
  'SEE',
  'TWO',
  'WAY',
  'WHO',
  'DID',
  'GET',
  'LET',
  'SAY',
  'SHE',
  'TOO',
  'USE',
  'CAT',
  'DOG',
  'RUN',
  'SIT',
  'SET',
  'PUT',
  'TEN',
  'RED',
  'BIG',
  'BOX',
  'ATE',
  'AGE',
  'AID',
  'AIM',
  'AIR',
  'ADD',
  'ACE',
  'ART',
  'ARM',
  'AXE',
];

export default function ScrabblePage() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [game, setGame] = useState<ScrabbleGame | null>(null);
  const [state, setState] = useState<any>(null);
  const [coachOpen, setCoachOpen] = useState(true);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [placement, setPlacement] = useState({
    row: 7,
    col: 7,
    direction: 'horizontal' as 'horizontal' | 'vertical',
  });
  const [lastMessage, setLastMessage] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);

  const playerId = 'player';
  const opponentId = 'ai-opponent';

  const refreshState = useCallback(() => {
    if (!game) return null;
    const s = game.getState();
    setState(s);
    return s;
  }, [game]);

  // AI opponent turn
  useEffect(() => {
    if (!game || !state || phase !== 'playing') return;
    if (state.currentPlayerIndex !== 1) return; // AI is player index 1
    if (game.isGameOver()) {
      setPhase('finished');
      return;
    }

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const aiRack = state.players[1]?.rack || [];
      const aiLetters = aiRack.map((t: any) => t.letter);
      let played = false;

      // Try to find a word the AI can play
      for (const word of AI_WORDS) {
        const wordLetters = word.split('');
        const rackCopy = [...aiLetters];
        let canPlay = true;

        for (const letter of wordLetters) {
          const idx = rackCopy.indexOf(letter);
          if (idx === -1) {
            canPlay = false;
            break;
          }
          rackCopy.splice(idx, 1);
        }

        if (canPlay) {
          // Find a valid position
          const board = state.board;
          const isFirstMove = board.every((row: any[]) => row.every((cell: any) => cell === null));

          let startRow = 7;
          let startCol = isFirstMove ? 7 : -1;
          let direction: 'horizontal' | 'vertical' = 'horizontal';

          if (!isFirstMove) {
            // Find an open spot adjacent to existing tiles
            for (let r = 0; r < 15 && startCol === -1; r++) {
              for (let c = 0; c < 15 && startCol === -1; c++) {
                if (board[r][c] !== null) {
                  // Try horizontal
                  if (c + word.length <= 15) {
                    let fits = true;
                    for (let i = 0; i < word.length; i++) {
                      if (board[r][c + i] !== null) {
                        fits = false;
                        break;
                      }
                    }
                    if (fits) {
                      startRow = r;
                      startCol = c;
                      direction = 'horizontal';
                    }
                  }
                  // Try below
                  if (startCol === -1 && r + word.length <= 15) {
                    let fits = true;
                    for (let i = 0; i < word.length; i++) {
                      if (board[r + i][c] !== null) {
                        fits = false;
                        break;
                      }
                    }
                    if (fits) {
                      startRow = r;
                      startCol = c;
                      direction = 'vertical';
                    }
                  }
                }
              }
            }
          }

          if (startCol >= 0) {
            const tiles = wordLetters.map((letter) => {
              const tile = aiRack.find((t: any) => t.letter === letter);
              return tile || { letter, value: 1, isBlank: false };
            });

            const result = game.placeWord({
              word,
              startRow,
              startCol,
              direction,
              tiles,
            });

            if (result.valid) {
              setLastMessage(`AI played "${word}" for ${result.score} points`);
              played = true;
              break;
            }
          }
        }
      }

      if (!played) {
        game.skipTurn();
        setLastMessage('AI skipped their turn');
      }

      const newState = refreshState();
      setIsAIThinking(false);

      if (game.isGameOver()) {
        setPhase('finished');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [state?.currentPlayerIndex, game, phase, refreshState]);

  const handleStartGame = () => {
    const newGame = new ScrabbleGame([playerId, opponentId]);
    setGame(newGame);
    setState(newGame.getState());
    setPhase('playing');
    setLastMessage('');
  };

  const handleTileSelect = (index: number) => {
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter((i) => i !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const handlePlayWord = () => {
    if (!game || !wordInput.trim()) return;

    const rack = state.players[0]?.rack || [];
    const word = wordInput.toUpperCase();
    const tiles = word.split('').map((letter: string) => {
      const tile = rack.find((t: any) => t.letter === letter);
      return tile || { letter, value: 1, isBlank: false };
    });

    const result = game.placeWord({
      word,
      startRow: placement.row,
      startCol: placement.col,
      direction: placement.direction,
      tiles,
    });

    if (result.valid) {
      setLastMessage(`You played "${word}" for ${result.score} points!`);
      setWordInput('');
      setSelectedTiles([]);
    } else {
      setLastMessage(result.message);
    }

    refreshState();
    if (game.isGameOver()) setPhase('finished');
  };

  const handleSkip = () => {
    if (!game) return;
    game.skipTurn();
    setLastMessage('You skipped your turn');
    refreshState();
    if (game.isGameOver()) setPhase('finished');
  };

  const playerRack = state?.players?.[0]?.rack || [];
  const playerScore = state?.players?.[0]?.score || 0;
  const opponentScore = state?.players?.[1]?.score || 0;
  const isMyTurn = state?.currentPlayerIndex === 0;
  const coachAnalysis = state && isMyTurn ? ScrabbleCoach.analyze(state, 0) : null;

  // LANDING
  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-[#06060d] text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 opacity-90">W</div>
            <h1 className="text-6xl font-black tracking-tight mb-3">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-300 text-transparent bg-clip-text">
                Scrabble
              </span>
            </h1>
            <p className="text-slate-400 text-lg">with AI Word Coach</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-8 border border-indigo-900/30 mb-8">
            <div className="grid gap-4 text-slate-300">
              {[
                'Build words on the board connecting to existing tiles',
                'Each letter has a point value - longer and rarer words score more',
                'Premium squares multiply letter or word scores (2x and 3x)',
                'AI coach analyzes your rack balance, premium opportunities, and strategy',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xl rounded-xl transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: '0 0 40px rgba(99,102,241,0.2)' }}
          >
            Start Game
          </button>

          <Link
            href="/"
            className="block text-center mt-6 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  // GAME
  return (
    <div className="min-h-screen bg-[#06060d] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#06060d]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-500 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Exit
          </Link>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Turn</p>
              <p className={`text-sm font-bold ${isMyTurn ? 'text-indigo-400' : 'text-red-400'}`}>
                {isMyTurn ? 'Your Turn' : 'AI Turn'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Tiles Left</p>
              <p className="text-lg font-black text-purple-400">{state?.tileBag || 0}</p>
            </div>
          </div>

          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[10px] text-slate-600 uppercase">You</p>
              <p className="text-sm font-bold text-indigo-400">{playerScore}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase">AI</p>
              <p className="text-sm font-bold text-red-400">{opponentScore}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Canvas */}
      <main className="pt-16 pb-64" style={{ paddingRight: coachOpen ? '320px' : '0' }}>
        <div className="relative w-full h-[45vh] min-h-[300px]">
          {typeof window !== 'undefined' && (
            <Canvas shadows camera={{ position: [0, 11, 9], fov: 40 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.35} />
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={1.5}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <directionalLight position={[-5, 8, -5]} intensity={0.6} color="#818cf8" />
                <pointLight position={[0, 5, 0]} intensity={0.8} color="#818cf8" distance={18} />
                <spotLight
                  position={[0, 10, 0]}
                  angle={0.6}
                  intensity={0.7}
                  color="#a78bfa"
                  castShadow
                />

                <ScrabbleBoard3D size={2.0} />

                {playerRack.map((tile: any, i: number) => (
                  <Tile3D
                    key={`rack-${i}`}
                    letter={tile.letter}
                    value={tile.value}
                    position={[i * 0.2 - 0.7, 0.15, -1.5]}
                  />
                ))}

                {(state?.board || []).map((row: any[], ri: number) =>
                  row.map((tile: any, ci: number) =>
                    tile ? (
                      <Tile3D
                        key={`b-${ri}-${ci}`}
                        letter={tile.letter}
                        value={tile.value}
                        position={[(ci - 7) * 0.1 + 0.05, 0.015, (ri - 7) * 0.1 + 0.05]}
                      />
                    ) : null
                  )
                )}

                <Environment preset="apartment" />
                <EffectComposer>
                  <Bloom
                    intensity={0.3}
                    luminanceThreshold={0.3}
                    luminanceSmoothing={0.9}
                    height={300}
                  />
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
          )}
        </div>

        {/* Message */}
        {lastMessage && (
          <div className="text-center mt-3">
            <p className="text-xs text-indigo-400/70">{lastMessage}</p>
          </div>
        )}

        {/* Tile Rack */}
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 text-center">
            Your Rack
          </p>
          <div className="flex gap-2 justify-center mb-4">
            {playerRack.map((tile: any, i: number) => (
              <button
                key={i}
                onClick={() => handleTileSelect(i)}
                disabled={!isMyTurn || isAIThinking}
                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all relative disabled:opacity-50 ${
                  selectedTiles.includes(i)
                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 scale-110'
                    : 'bg-amber-100 text-slate-900 hover:bg-amber-200 hover:scale-105'
                }`}
              >
                {tile.letter}
                <span className="absolute bottom-0.5 right-1 text-[8px] opacity-60">
                  {tile.value}
                </span>
              </button>
            ))}
          </div>

          {/* Word Input */}
          {isMyTurn && !isAIThinking && (
            <div className="bg-slate-900/60 rounded-xl p-4 border border-indigo-900/30">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Word</label>
                  <input
                    type="text"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                    placeholder="Type word..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">Row</label>
                    <input
                      type="number"
                      min={0}
                      max={14}
                      value={placement.row}
                      onChange={(e) =>
                        setPlacement({ ...placement, row: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">Col</label>
                    <input
                      type="number"
                      min={0}
                      max={14}
                      value={placement.col}
                      onChange={(e) =>
                        setPlacement({ ...placement, col: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs text-slate-500">Direction:</label>
                <button
                  onClick={() => setPlacement({ ...placement, direction: 'horizontal' })}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    placement.direction === 'horizontal'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Horizontal →
                </button>
                <button
                  onClick={() => setPlacement({ ...placement, direction: 'vertical' })}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    placement.direction === 'vertical'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Vertical ↓
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Game Over */}
        {phase === 'finished' && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ right: coachOpen ? '320px' : '0' }}
          >
            <div className="bg-slate-900 border border-indigo-800/50 rounded-2xl p-10 text-center max-w-md mx-4">
              <div className="text-5xl mb-4">
                {playerScore > opponentScore ? '🏆' : playerScore === opponentScore ? '🤝' : '😤'}
              </div>
              <h2 className="text-3xl font-black mb-2">
                {playerScore > opponentScore ? (
                  <span className="text-indigo-400">You Win!</span>
                ) : playerScore === opponentScore ? (
                  <span className="text-amber-400">Tie Game!</span>
                ) : (
                  <span className="text-red-400">AI Wins</span>
                )}
              </h2>
              <p className="text-slate-400 mb-4">
                Final Score: You {playerScore} - AI {opponentScore}
              </p>
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Action Bar */}
      <footer
        className="fixed bottom-0 left-0 z-30 bg-[#06060d]/95 backdrop-blur-xl border-t border-indigo-900/30 py-4 px-4"
        style={{ right: coachOpen ? '320px' : '0' }}
      >
        <div className="max-w-4xl mx-auto">
          {isAIThinking ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
              <p className="text-indigo-400/70 text-sm">AI is thinking...</p>
            </div>
          ) : isMyTurn ? (
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePlayWord}
                disabled={!wordInput.trim()}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95"
              >
                Play Word
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 active:scale-95"
              >
                Skip Turn
              </button>
              <button
                onClick={() => {
                  setSelectedTiles([]);
                  setWordInput('');
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 active:scale-95"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-center text-slate-500 text-sm">Waiting for AI...</p>
          )}
        </div>
      </footer>

      {/* AI Coach */}
      <AICoach
        analysis={coachAnalysis}
        gameType="scrabble"
        isOpen={coachOpen}
        onToggle={() => setCoachOpen(!coachOpen)}
      />
    </div>
  );
}
