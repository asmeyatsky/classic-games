import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-900/70"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              animation: `pulse ${Math.random() * 10 + 10}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Classic Games
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-4">
            World-class 3D gaming with realistic graphics and immersive gameplay
          </p>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Play against intelligent AI opponents in stunning 3D environments
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <GameCard
            title="Poker"
            subtitle="Texas Hold'em"
            description="Play realistic 3D poker with AI opponents and strategy-based gameplay. Experience premium card graphics and smooth animations."
            href="/games/poker"
            icon="🃏"
            color="from-blue-600 to-blue-500"
          />
          <GameCard
            title="Backgammon"
            subtitle="Classic Board Game"
            description="Master the ancient game of strategy with physics-based dice and piece movement. Feel the satisfying tactile feedback."
            href="/games/backgammon"
            icon="🎲"
            color="from-amber-600 to-amber-500"
          />
          <GameCard
            title="Scrabble"
            subtitle="Word Challenge"
            description="Challenge your vocabulary with 3D tiles and intelligent word validation. Build words in a beautiful 3D environment."
            href="/games/scrabble"
            icon="🔤"
            color="from-emerald-600 to-emerald-500"
          />
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-slate-200 mb-8">Ready to start playing?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games/poker"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-blue-500/20 text-center"
            >
              Play Poker Now
            </Link>
            <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 font-bold rounded-xl transition-all duration-300 border border-slate-600 backdrop-blur-sm">
              Multiplayer Lobby
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-slate-300 mb-6">Premium Gaming Experience</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <span>✨</span> Realistic 3D Graphics
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🌐</span> Cross-Platform
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🎮</span> Online Multiplayer
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🤖</span> Intelligent AI
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🎨</span> Stunning Visuals
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>⚡</span> Optimized Performance
            </div>
          </div>
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
      <div className="group relative h-full p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer overflow-hidden">
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        ></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform duration-300 mb-6">
            {icon}
          </div>

          {/* Title and Subtitle */}
          <h2 className="text-2xl font-bold text-slate-200 mb-2 text-center">{title}</h2>
          <p className="text-sm text-slate-400 text-center mb-4">{subtitle}</p>

          {/* Description */}
          <p className="text-slate-300 text-center text-sm leading-relaxed mb-6">{description}</p>

          {/* CTA */}
          <div className="text-center">
            <span
              className={`inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${color} transition-all duration-300`}
            >
              Play Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
