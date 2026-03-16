'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BackgammonGame, BackgammonCoach } from '@classic-games/game-engine';

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

const Board3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Board3D), {
  ssr: false,
});
const Dice3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Dice3D), {
  ssr: false,
});
const Checker3D = dynamic(
  () => import('@classic-games/three-components').then((m) => m.Checker3D),
  { ssr: false }
);
const AICoach = dynamic(() => import('../../../components/AICoach'), { ssr: false });

type GamePhase = 'landing' | 'playing' | 'finished';

export default function BackgammonPage() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [game, setGame] = useState<BackgammonGame | null>(null);
  const [state, setState] = useState<any>(null);
  const [coachOpen, setCoachOpen] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const refreshState = useCallback(() => {
    if (!game) return null;
    const s = game.getState();
    setState(s);
    return s;
  }, [game]);

  // AI opponent turn
  useEffect(() => {
    if (!game || !state || phase !== 'playing') return;
    if (state.currentPlayer !== 'black') return; // AI plays black
    if (game.isGameOver()) {
      setPhase('finished');
      return;
    }

    setIsAIThinking(true);

    const runAITurn = async () => {
      // Step 1: Roll dice
      await new Promise((r) => setTimeout(r, 800));
      if (state.gamePhase === 'rolling') {
        game.rollDice();
        const s1 = game.getState();
        setState(s1);
        setLastAction(`AI rolled ${s1.dice[0]} and ${s1.dice[1]}`);

        // Step 2: Make moves
        await new Promise((r) => setTimeout(r, 600));
        let moves = game.getAvailableMoves();
        while (moves.length > 0) {
          const ranked = BackgammonCoach.rankMoves(game.getState(), moves);
          if (ranked.length > 0) {
            game.makeMove(ranked[0]);
          }
          await new Promise((r) => setTimeout(r, 400));
          setState(game.getState());
          moves = game.getAvailableMoves();
        }
      }

      const finalState = game.getState();
      setState(finalState);
      setIsAIThinking(false);

      if (game.isGameOver()) {
        setPhase('finished');
      }
    };

    const timer = setTimeout(runAITurn, 600);
    return () => clearTimeout(timer);
  }, [state?.currentPlayer, state?.gamePhase, game, phase]);

  const handleStartGame = () => {
    const newGame = new BackgammonGame();
    setGame(newGame);
    setState(newGame.getState());
    setPhase('playing');
  };

  const handleRollDice = () => {
    if (!game || isAIThinking || state?.currentPlayer !== 'white') return;
    game.rollDice();
    const s = refreshState();
    if (s) setLastAction(`You rolled ${s.dice[0]} and ${s.dice[1]}`);
  };

  const handleMove = (move: any) => {
    if (!game || isAIThinking) return;
    const success = game.makeMove(move);
    if (success) {
      refreshState();
      if (game.isGameOver()) setPhase('finished');
    }
  };

  const availableMoves = game ? game.getAvailableMoves() : [];
  const coachAnalysis = state ? BackgammonCoach.analyze(state) : null;
  const isMyTurn = state?.currentPlayer === 'white';

  const formatPoint = (point: number) => {
    if (point === -1) return 'Bar';
    if (point === 25) return 'Off';
    return `Pt ${point + 1}`;
  };

  // LANDING
  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-[#0a0806] text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 opacity-90">⚄</div>
            <h1 className="text-6xl font-black tracking-tight mb-3">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                Backgammon
              </span>
            </h1>
            <p className="text-slate-400 text-lg">with AI Strategy Coach</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-8 border border-amber-900/30 mb-8">
            <div className="grid gap-4 text-slate-300">
              {[
                'Move all 15 checkers around the board and bear them off before your opponent',
                'Roll two dice each turn to determine your moves',
                'Land on single opponent checkers to send them to the bar',
                'AI coach analyzes pip counts, blots, and race advantage in real-time',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xl rounded-xl transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: '0 0 40px rgba(245,158,11,0.2)' }}
          >
            Roll the Dice
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
    <div className="min-h-screen bg-[#0a0806] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#0a0806]/90 backdrop-blur-xl border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-500 hover:text-amber-400 transition-colors text-sm flex items-center gap-1.5"
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
              <p className={`text-sm font-bold ${isMyTurn ? 'text-amber-400' : 'text-red-400'}`}>
                {isMyTurn ? 'White (You)' : 'Black (AI)'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Dice</p>
              <p className="text-lg font-black text-amber-300">
                {state?.dice[0] > 0 ? `${state.dice[0]} - ${state.dice[1]}` : '--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Phase</p>
              <p className="text-sm font-bold text-slate-400 capitalize">
                {state?.gamePhase || 'rolling'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[10px] text-slate-600 uppercase">White Off</p>
              <p className="text-sm font-bold text-amber-300">{state?.bornOff?.white || 0}/15</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase">Black Off</p>
              <p className="text-sm font-bold text-red-400">{state?.bornOff?.black || 0}/15</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Canvas */}
      <main className="pt-16 pb-52" style={{ paddingRight: coachOpen ? '320px' : '0' }}>
        <div className="relative w-full h-[50vh] min-h-[350px]">
          {typeof window !== 'undefined' && (
            <Canvas shadows camera={{ position: [0, 9, 12], fov: 35 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.3} />
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={1.5}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <directionalLight position={[-5, 8, -5]} intensity={0.6} color="#fbbf24" />
                <pointLight position={[0, 5, 0]} intensity={0.8} color="#fbbf24" distance={18} />
                <spotLight
                  position={[0, 10, 0]}
                  angle={0.6}
                  intensity={0.6}
                  color="#fcd34d"
                  castShadow
                />

                <Board3D scale={[1.8, 1.8, 1.8]} />

                {state?.gamePhase === 'moving' && (
                  <>
                    <Dice3D value={state.dice[0]} position={[-1.2, 0.3, 0]} rolling={false} />
                    <Dice3D value={state.dice[1]} position={[-0.6, 0.3, 0]} rolling={false} />
                  </>
                )}

                {(state?.board || []).map((count: number, index: number) => {
                  if (count === 0) return null;
                  const isPositive = count > 0;
                  const absCount = Math.abs(count);
                  const x = ((index % 12) - 5.5) * 0.8;
                  const z = index < 12 ? 1.35 : -1.35;
                  return Array.from({ length: absCount }, (_, i) => (
                    <Checker3D
                      key={`c-${index}-${i}`}
                      color={isPositive ? 'white' : 'black'}
                      position={[x, 0.05 + i * 0.04, z]}
                      stackIndex={i}
                    />
                  ));
                })}

                {/* Bar checkers */}
                {Array.from({ length: state?.bar?.white || 0 }, (_, i) => (
                  <Checker3D
                    key={`bw-${i}`}
                    color="white"
                    position={[0, 0.05 + i * 0.04, 0.5]}
                    stackIndex={i}
                  />
                ))}
                {Array.from({ length: state?.bar?.black || 0 }, (_, i) => (
                  <Checker3D
                    key={`bb-${i}`}
                    color="black"
                    position={[0, 0.05 + i * 0.04, -0.5]}
                    stackIndex={i}
                  />
                ))}

                <Environment preset="sunset" />
                <EffectComposer>
                  <Bloom
                    intensity={0.3}
                    luminanceThreshold={0.3}
                    luminanceSmoothing={0.9}
                    height={300}
                  />
                  <Vignette eskil={false} offset={0.1} darkness={0.7} />
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

        {/* Last Action */}
        {lastAction && (
          <div className="text-center mt-3">
            <p className="text-xs text-amber-400/70">{lastAction}</p>
          </div>
        )}

        {/* Available Moves */}
        {isMyTurn && state?.gamePhase === 'moving' && availableMoves.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 mt-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 text-center">
              Available Moves
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {availableMoves.map((move: any, i: number) => (
                <button
                  key={i}
                  onClick={() => handleMove(move)}
                  className="px-4 py-2 rounded-lg bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/50 text-amber-300 text-sm font-medium transition-all active:scale-95"
                >
                  {formatPoint(move.from)} → {formatPoint(move.to)}
                  <span className="text-amber-500/60 ml-1.5 text-xs">
                    (die {state.dice[move.dieIndex]})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Over */}
        {phase === 'finished' && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ right: coachOpen ? '320px' : '0' }}
          >
            <div className="bg-slate-900 border border-amber-800/50 rounded-2xl p-10 text-center max-w-md mx-4">
              <div className="text-5xl mb-4">{game?.getWinner() === 'white' ? '🏆' : '😤'}</div>
              <h2 className="text-3xl font-black mb-4">
                {game?.getWinner() === 'white' ? (
                  <span className="text-amber-400">You Win!</span>
                ) : (
                  <span className="text-red-400">AI Wins</span>
                )}
              </h2>
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Action Bar */}
      <footer
        className="fixed bottom-0 left-0 z-30 bg-[#0a0806]/95 backdrop-blur-xl border-t border-amber-900/30 py-5 px-4"
        style={{ right: coachOpen ? '320px' : '0' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {isAIThinking ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
              <p className="text-amber-400/70 text-sm">AI is thinking...</p>
            </div>
          ) : isMyTurn && state?.gamePhase === 'rolling' ? (
            <button
              onClick={handleRollDice}
              className="px-12 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 rounded-xl font-bold text-lg transition-all active:scale-95"
              style={{ boxShadow: '0 0 30px rgba(245,158,11,0.25)' }}
            >
              Roll Dice
            </button>
          ) : isMyTurn && state?.gamePhase === 'moving' && availableMoves.length === 0 ? (
            <p className="text-amber-400/70 text-sm">
              No moves available - turn passes automatically
            </p>
          ) : (
            <p className="text-slate-500 text-sm">
              {isMyTurn ? 'Select a move above' : 'Waiting for AI...'}
            </p>
          )}
        </div>
      </footer>

      {/* AI Coach */}
      <AICoach
        analysis={coachAnalysis}
        gameType="backgammon"
        isOpen={coachOpen}
        onToggle={() => setCoachOpen(!coachOpen)}
      />
    </div>
  );
}
