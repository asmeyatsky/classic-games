'use client';

import { motion } from 'framer-motion';

interface GameLandingProps {
  gameName: string;
  gameIcon: string;
  rules: string[];
  onStartGame: () => void;
}

export default function GameLanding({ gameName, gameIcon, rules, onStartGame }: GameLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900"
    >
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-950/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-amber-600/30 shadow-2xl p-12"
        >
          {/* Game Title */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{gameIcon}</div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mb-2">
              {gameName}
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
          </div>

          {/* Rules */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-amber-300 mb-4 text-center">How to Play</h2>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 text-amber-100/90"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300 font-semibold">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed pt-1">{rule}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartGame}
            className="w-full py-5 px-8 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-900 font-bold text-xl rounded-xl shadow-lg shadow-amber-500/50 hover:shadow-amber-400/60 transition-all duration-300 border-2 border-amber-400/50"
          >
            Start Playing
          </motion.button>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
