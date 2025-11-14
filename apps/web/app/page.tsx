import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-game flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Classic Games
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            World-class 3D gaming with realistic graphics
          </p>
          <p className="text-lg text-gray-400">Play against intelligent AI opponents</p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GameCard
            title="Poker"
            subtitle="Texas Hold'em"
            description="Play realistic 3D poker with AI opponents and strategy-based gameplay"
            href="/games/poker"
            icon="🃏"
            color="from-blue-600 to-blue-400"
          />
          <GameCard
            title="Backgammon"
            subtitle="Classic Board Game"
            description="Master the ancient game of strategy with physics-based dice"
            href="/games/backgammon"
            icon="🎲"
            color="from-amber-600 to-amber-400"
          />
          <GameCard
            title="Scrabble"
            subtitle="Word Challenge"
            description="Challenge your vocabulary with 3D tiles and intelligent word validation"
            href="/games/scrabble"
            icon="🔤"
            color="from-green-600 to-green-400"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/games/poker"
            className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-center"
          >
            Play Poker Now
          </Link>
          <button className="px-8 py-3 bg-surface hover:bg-surface-hover text-primary font-bold rounded-lg transition-all duration-200 border-2 border-primary">
            Multiplayer Lobby
          </button>
        </div>

        {/* Features */}
        <div className="text-center space-y-2 text-sm text-gray-400">
          <p>✨ Realistic 3D Graphics • 🌐 Cross-Platform • 🎮 Online Multiplayer</p>
          <p>🤖 Intelligent AI • 🎨 Stunning Visuals • ⚡ Optimized Performance</p>
        </div>
      </div>
    </main>
  );
}

interface GameCardProps {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

function GameCard({ title, subtitle, description, href, icon, color }: GameCardProps) {
  return (
    <Link href={href}>
      <div className="h-full p-6 rounded-lg bg-surface hover:bg-surface-hover border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer group">
        {/* Icon */}
        <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-2xl font-bold text-white mb-1 text-center">{title}</h2>
        <p className="text-sm text-gray-400 text-center mb-3">{subtitle}</p>

        {/* Divider */}
        <div className="h-0.5 bg-gradient-to-r via-gray-600 mb-4"></div>

        {/* Description */}
        <p className="text-gray-300 text-center text-sm leading-relaxed mb-4">{description}</p>

        {/* CTA */}
        <div className="text-center">
          <span
            className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          >
            Play Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
