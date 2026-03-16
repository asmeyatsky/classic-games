'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PokerGame, PokerCoach } from '@classic-games/game-engine';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

const Card3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Card3D), {
  ssr: false,
});
const Chip3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Chip3D), {
  ssr: false,
});
const Table3D = dynamic(() => import('@classic-games/three-components').then((m) => m.Table3D), {
  ssr: false,
});
const AICoach = dynamic(() => import('../../../components/AICoach'), { ssr: false });

type GamePhase = 'landing' | 'playing' | 'hand-result';

interface HandResult {
  winnerId: string;
  reason: string;
  potWon: number;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};
const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-400',
  diamonds: 'text-red-400',
  clubs: 'text-white',
  spades: 'text-white',
};

export default function PokerPage() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [game, setGame] = useState<PokerGame | null>(null);
  const [state, setState] = useState<any>(null);
  const [coachOpen, setCoachOpen] = useState(true);
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(50);
  const chipsBefore = useRef<Record<string, number>>({});

  const playerId = 'player';
  const opponentId = 'ai-opponent';

  const refreshState = useCallback(() => {
    if (!game) return null;
    const s = game.getState();
    setState(s);
    return s;
  }, [game]);

  const checkHandComplete = useCallback((s: any): boolean => {
    if (!s) return false;
    const active = s.players.filter((p: any) => !p.folded);

    if (active.length <= 1) {
      const winner = active[0]?.id || playerId;
      const beforeChips = chipsBefore.current[winner] || 0;
      const afterChips = s.players.find((p: any) => p.id === winner)?.chips || 0;
      setHandResult({
        winnerId: winner,
        reason: 'Opponent folded',
        potWon: afterChips - beforeChips > 0 ? afterChips - beforeChips : s.pot,
      });
      setPhase('hand-result');
      return true;
    }

    if (s.round === 'showdown') {
      const playerChips = s.players.find((p: any) => p.id === playerId)?.chips || 0;
      const before = chipsBefore.current[playerId] || 0;
      const won = playerChips > before;
      setHandResult({
        winnerId: won ? playerId : opponentId,
        reason: 'Showdown',
        potWon: Math.abs(playerChips - before),
      });
      setPhase('hand-result');
      return true;
    }

    return false;
  }, []);

  // AI opponent turn
  useEffect(() => {
    if (!game || !state || phase !== 'playing') return;
    if (checkHandComplete(state)) return;

    const currentPlayer = game.currentPlayer;
    if (currentPlayer.id !== opponentId) return;
    if (currentPlayer.folded || currentPlayer.allIn) return;

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const aiAction = PokerCoach.getAIAction(state, opponentId);
      game.playerAction(opponentId, aiAction.action, aiAction.amount);
      const newState = refreshState();
      setIsAIThinking(false);

      if (newState) {
        // After AI acts, the round may have advanced.
        // If all players have matched bets, the engine auto-advances.
        // Check for hand completion after AI action.
        checkHandComplete(newState);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [state, game, phase, checkHandComplete, refreshState]);

  const startNewHand = useCallback(() => {
    if (!game) return;
    game.startNewHand();
    const s = game.getState();
    setState(s);
    chipsBefore.current = {};
    s.players.forEach((p: any) => {
      chipsBefore.current[p.id] = p.chips;
    });
    setHandResult(null);
    setPhase('playing');
    setHandsPlayed((h) => h + 1);
  }, [game]);

  const handleStartGame = () => {
    const newGame = new PokerGame([playerId, opponentId], 2500);
    setGame(newGame);
    newGame.startNewHand();
    const s = newGame.getState();
    setState(s);
    chipsBefore.current = {};
    s.players.forEach((p: any) => {
      chipsBefore.current[p.id] = p.chips;
    });
    setPhase('playing');
    setHandsPlayed(1);
  };

  const handleAction = (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => {
    if (!game || isAIThinking) return;
    game.playerAction(playerId, action, amount);
    const newState = refreshState();
    if (newState) checkHandComplete(newState);
  };

  // Derived state
  const player = state?.players?.find((p: any) => p.id === playerId);
  const opponent = state?.players?.find((p: any) => p.id === opponentId);
  const isMyTurn = game ? game.currentPlayer?.id === playerId : false;
  const costToCall = state ? state.currentBet - (player?.bet || 0) : 0;
  const coachAnalysis = state ? PokerCoach.analyze(state, playerId) : null;

  // LANDING
  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-[#060d0a] text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 opacity-90">♠</div>
            <h1 className="text-6xl font-black tracking-tight mb-3">
              <span className="bg-gradient-to-r from-emerald-400 to-green-300 text-transparent bg-clip-text">
                Texas Hold'em
              </span>
            </h1>
            <p className="text-slate-400 text-lg">with AI Strategy Coach</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-8 border border-emerald-900/30 mb-8">
            <div className="grid gap-4 text-slate-300">
              {[
                'Two private cards, five community cards - make the best five-card hand',
                'Four betting rounds: Pre-flop, Flop, Turn, River',
                'Real-time AI coach analyzes your position and suggests optimal plays',
                'AI opponent adapts its strategy based on hand strength and pot odds',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xl rounded-xl transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}
          >
            Deal Me In
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

  // GAME + HAND RESULT
  return (
    <div className="min-h-screen bg-[#060d0a] text-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#060d0a]/90 backdrop-blur-xl border-b border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-500 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1.5"
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
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Round</p>
              <p className="text-sm font-bold text-emerald-400">
                {state?.round?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                  'Pre Flop'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Pot</p>
              <p className="text-xl font-black text-amber-400">${state?.pot || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                Hand #{handsPlayed}
              </p>
              <p className="text-sm font-bold text-slate-400">
                {isAIThinking ? 'AI thinking...' : isMyTurn ? 'Your turn' : 'Waiting...'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[10px] text-slate-600 uppercase">You</p>
              <p className="text-sm font-bold text-emerald-400">${player?.chips || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase">AI</p>
              <p className="text-sm font-bold text-red-400">${opponent?.chips || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Canvas */}
      <main className="pt-16 pb-44 pr-0" style={{ paddingRight: coachOpen ? '320px' : '0' }}>
        <div className="relative w-full h-[55vh] min-h-[400px]">
          {typeof window !== 'undefined' && (
            <Canvas
              shadows
              camera={{ position: [0, 5.5, 7.5], fov: 42 }}
              gl={{ antialias: true, alpha: false }}
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <color attach="background" args={['#050a08']} />
                <fog attach="fog" args={['#050a08', 12, 28]} />

                <ambientLight intensity={0.35} color="#FFF5E6" />
                <spotLight
                  position={[0, 8, 0]}
                  angle={0.55}
                  penumbra={0.6}
                  intensity={2.2}
                  color="#FFF8DC"
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-bias={-0.0001}
                />
                <pointLight position={[4, 3.5, 4]} intensity={0.4} color="#FFD700" distance={12} />
                <pointLight
                  position={[-4, 3.5, -4]}
                  intensity={0.4}
                  color="#FFD700"
                  distance={12}
                />
                <directionalLight position={[-5, 5, -5]} intensity={0.2} color="#87CEEB" />

                <Table3D size="medium" />

                {/* Community cards */}
                {(state?.communityCards || []).map((card: any, i: number) => (
                  <Card3D
                    key={`com-${i}`}
                    suit={card.suit}
                    rank={card.rank}
                    faceUp={true}
                    position={[-1.4 + i * 0.7, 0.92, 0]}
                  />
                ))}

                {/* Player hand */}
                {(player?.hand || []).map((card: any, i: number) => (
                  <Card3D
                    key={`p-${i}`}
                    suit={card.suit}
                    rank={card.rank}
                    faceUp={true}
                    position={[-0.35 + i * 0.7, 0.92, 2.5]}
                  />
                ))}

                {/* Opponent hand (face down during play, face up at showdown) */}
                {(opponent?.hand || []).map((card: any, i: number) => (
                  <Card3D
                    key={`o-${i}`}
                    suit={card.suit}
                    rank={card.rank}
                    faceUp={state?.round === 'showdown'}
                    position={[-0.35 + i * 0.7, 0.92, -2.5]}
                  />
                ))}

                {/* Player chips */}
                <Chip3D
                  value={100}
                  color=""
                  position={[1.8, 0.92, 2.2]}
                  count={Math.min(Math.floor((player?.chips || 0) / 100), 8)}
                />
                <Chip3D
                  value={25}
                  color=""
                  position={[1.4, 0.92, 2.2]}
                  count={Math.min(Math.floor(((player?.chips || 0) % 100) / 25), 4)}
                />

                {/* Pot chips */}
                {(state?.pot || 0) > 0 && (
                  <>
                    <Chip3D
                      value={100}
                      color=""
                      position={[0.2, 0.92, -0.6]}
                      count={Math.min(Math.floor(state.pot / 100), 6)}
                    />
                    <Chip3D
                      value={25}
                      color=""
                      position={[-0.2, 0.92, -0.6]}
                      count={Math.min(Math.floor((state.pot % 100) / 25), 4)}
                    />
                  </>
                )}

                <Environment preset="night" />
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={5}
                  maxDistance={14}
                  maxPolarAngle={Math.PI / 2.3}
                  minPolarAngle={Math.PI / 5}
                  enableDamping
                  dampingFactor={0.05}
                />
              </Suspense>
            </Canvas>
          )}
        </div>

        {/* Card Info Bar */}
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div className="flex justify-center gap-8">
            {/* Your hand */}
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Your Hand</p>
              <div className="flex gap-1.5 justify-center">
                {(player?.hand || []).map((card: any, i: number) => (
                  <div
                    key={i}
                    className="w-11 h-16 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center"
                  >
                    <span className={`text-base font-bold ${SUIT_COLORS[card.suit]}`}>
                      {card.rank}
                    </span>
                    <span className={`text-sm ${SUIT_COLORS[card.suit]}`}>
                      {SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Community</p>
              <div className="flex gap-1.5 justify-center">
                {(state?.communityCards || []).map((card: any, i: number) => (
                  <div
                    key={i}
                    className="w-11 h-16 rounded-lg bg-slate-800/60 border border-slate-700/50 flex flex-col items-center justify-center"
                  >
                    <span className={`text-base font-bold ${SUIT_COLORS[card.suit]}`}>
                      {card.rank}
                    </span>
                    <span className={`text-sm ${SUIT_COLORS[card.suit]}`}>
                      {SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>
                ))}
                {Array.from({ length: 5 - (state?.communityCards?.length || 0) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-11 h-16 rounded-lg bg-slate-900/40 border border-slate-800/30"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hand Result Overlay */}
        {phase === 'hand-result' && handResult && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ right: coachOpen ? '320px' : '0' }}
          >
            <div
              className="bg-slate-900 border border-emerald-800/50 rounded-2xl p-10 text-center max-w-md mx-4"
              style={{ boxShadow: '0 0 60px rgba(16,185,129,0.15)' }}
            >
              <div className="text-5xl mb-4">{handResult.winnerId === playerId ? '🏆' : '😤'}</div>
              <h2 className="text-3xl font-black mb-2">
                {handResult.winnerId === playerId ? (
                  <span className="text-emerald-400">You Win!</span>
                ) : (
                  <span className="text-red-400">AI Wins</span>
                )}
              </h2>
              <p className="text-slate-400 mb-2">{handResult.reason}</p>
              {handResult.potWon > 0 && (
                <p className="text-2xl font-bold text-amber-400 mb-6">
                  {handResult.winnerId === playerId ? '+' : '-'}${handResult.potWon}
                </p>
              )}
              <button
                onClick={startNewHand}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Deal Next Hand
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Action Bar */}
      <footer
        className="fixed bottom-0 left-0 z-30 bg-[#060d0a]/95 backdrop-blur-xl border-t border-emerald-900/30 py-4 px-4"
        style={{ right: coachOpen ? '320px' : '0' }}
      >
        <div className="max-w-4xl mx-auto">
          {phase === 'playing' && (
            <>
              <div className="flex items-center justify-center gap-3 mb-3">
                {/* Fold */}
                <button
                  onClick={() => handleAction('fold')}
                  disabled={!isMyTurn || isAIThinking || player?.folded}
                  className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-red-900/50 hover:bg-red-800/60 text-red-300 border border-red-800/50 active:scale-95"
                >
                  FOLD
                </button>

                {/* Check */}
                <button
                  onClick={() => handleAction('check')}
                  disabled={!isMyTurn || isAIThinking || player?.folded || costToCall > 0}
                  className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600/50 active:scale-95"
                >
                  CHECK
                </button>

                {/* Call */}
                <button
                  onClick={() => handleAction('call')}
                  disabled={!isMyTurn || isAIThinking || player?.folded || costToCall <= 0}
                  className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800/50 active:scale-95"
                >
                  CALL ${costToCall}
                </button>

                {/* Raise */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction('raise', state?.currentBet + raiseAmount)}
                    disabled={!isMyTurn || isAIThinking || player?.folded}
                    className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-amber-900/50 hover:bg-amber-800/60 text-amber-300 border border-amber-800/50 active:scale-95"
                  >
                    RAISE ${raiseAmount}
                  </button>
                  <div className="flex gap-1">
                    {[25, 50, 100, 250].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setRaiseAmount(amt)}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                          raiseAmount === amt
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <p className="text-center text-xs text-slate-600">
                {player?.folded
                  ? 'You folded - waiting for next hand'
                  : isAIThinking
                    ? 'AI is thinking...'
                    : isMyTurn
                      ? 'Your turn to act'
                      : 'Waiting for action...'}
              </p>
            </>
          )}
        </div>
      </footer>

      {/* AI Coach Panel */}
      <AICoach
        analysis={coachAnalysis}
        gameType="poker"
        isOpen={coachOpen}
        onToggle={() => setCoachOpen(!coachOpen)}
      />
    </div>
  );
}
