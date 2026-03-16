'use client';

import { useState, useEffect, useRef } from 'react';

interface MoveRecommendation {
  readonly action: string;
  readonly confidence: number;
  readonly reasoning: string;
  readonly riskLevel: 'low' | 'medium' | 'high';
}

interface CoachInsight {
  readonly category: string;
  readonly message: string;
  readonly importance: 'info' | 'tip' | 'warning' | 'critical';
}

interface GameAnalysis {
  readonly recommendation: MoveRecommendation;
  readonly insights: readonly CoachInsight[];
  readonly positionStrength: number;
  readonly stats: Record<string, string | number>;
}

interface AICoachProps {
  analysis: GameAnalysis | null;
  gameType: 'poker' | 'backgammon' | 'scrabble';
  isOpen: boolean;
  onToggle: () => void;
}

const GAME_THEMES = {
  poker: {
    accent: '#10b981',
    accentLight: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)',
    label: 'Poker Coach',
  },
  backgammon: {
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.3)',
    label: 'Backgammon Coach',
  },
  scrabble: {
    accent: '#6366f1',
    accentLight: '#818cf8',
    glow: 'rgba(99, 102, 241, 0.3)',
    label: 'Word Coach',
  },
};

const IMPORTANCE_STYLES = {
  info: { bg: 'bg-slate-700/50', border: 'border-slate-600', icon: 'i' },
  tip: { bg: 'bg-emerald-900/40', border: 'border-emerald-700', icon: '!' },
  warning: { bg: 'bg-amber-900/40', border: 'border-amber-700', icon: '!' },
  critical: { bg: 'bg-red-900/40', border: 'border-red-700', icon: '!!' },
};

const RISK_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

export default function AICoach({ analysis, gameType, isOpen, onToggle }: AICoachProps) {
  const theme = GAME_THEMES[gameType];
  const prevStrength = useRef(0);
  const [animatedStrength, setAnimatedStrength] = useState(0);

  // Animate strength gauge
  useEffect(() => {
    if (!analysis) return;
    const target = analysis.positionStrength;
    const start = prevStrength.current;
    const duration = 600;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setAnimatedStrength(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevStrength.current = target;
    };
    requestAnimationFrame(animate);
  }, [analysis?.positionStrength]);

  // Toggle button (always visible)
  const toggleButton = (
    <button
      onClick={onToggle}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 px-2 py-6 rounded-l-xl transition-all duration-300 hover:px-3"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}88)`,
        boxShadow: `0 0 20px ${theme.glow}`,
        right: isOpen ? '320px' : '0px',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <svg
          className={`w-5 h-5 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span
          className="text-white text-xs font-bold tracking-wider"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          AI COACH
        </span>
        {analysis && !isOpen && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: `conic-gradient(${theme.accent} ${animatedStrength}%, transparent ${animatedStrength}%)`,
              boxShadow: `0 0 8px ${theme.glow}`,
            }}
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
              {animatedStrength}
            </div>
          </div>
        )}
      </div>
    </button>
  );

  if (!isOpen) return toggleButton;

  return (
    <>
      {toggleButton}
      <div
        className="fixed right-0 top-0 bottom-0 w-80 z-40 flex flex-col overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.95) 100%)',
          borderLeft: `1px solid ${theme.accent}33`,
          boxShadow: `-4px 0 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}44` }}
            >
              <span style={{ color: theme.accent }}>
                {gameType === 'poker' ? '♠' : gameType === 'backgammon' ? '⚄' : 'W'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{theme.label}</h3>
              <p className="text-slate-500 text-xs">Real-time strategy analysis</p>
            </div>
          </div>
        </div>

        {!analysis ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Analyzing position...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-5 space-y-5">
            {/* Strength Gauge */}
            <div className="text-center">
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${animatedStrength * 3.27} 327`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${theme.glow})`,
                      transition: 'stroke-dasharray 0.6s ease-out',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold text-white">{animatedStrength}</div>
                    <div className="text-xs text-slate-500">/ 100</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Position Strength</p>
            </div>

            {/* Recommendation */}
            <div
              className="rounded-xl p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}08)`,
                border: `1px solid ${theme.accent}33`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ background: `${theme.accent}22`, color: theme.accentLight }}
                >
                  {analysis.recommendation.action}
                </span>
                <span className={`text-xs ${RISK_COLORS[analysis.recommendation.riskLevel]}`}>
                  {analysis.recommendation.riskLevel} risk
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {analysis.recommendation.reasoning}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${analysis.recommendation.confidence * 100}%`,
                      background: theme.accent,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {Math.round(analysis.recommendation.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Stats */}
            {Object.keys(analysis.stats).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.stats).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                  >
                    <div className="text-xs text-slate-500 mb-1">{key}</div>
                    <div className="text-sm font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  Insights
                </h4>
                {analysis.insights.map((insight, i) => {
                  const style = IMPORTANCE_STYLES[insight.importance];
                  return (
                    <div key={i} className={`${style.bg} border ${style.border} rounded-lg p-3`}>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase shrink-0 mt-0.5">
                          {insight.category}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">AI-powered strategy analysis</p>
        </div>
      </div>
    </>
  );
}
