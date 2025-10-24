import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-4xl animate-fadeIn">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Classic Games
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          World-class 3D gaming with realistic graphics and online multiplayer
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GameCard
            title="Poker"
            description="Texas Hold'em with realistic 3D cards and chips"
            href="/games/poker"
            gradient="from-green-500 to-emerald-700"
            icon="🃏"
          />
          <GameCard
            title="Backgammon"
            description="Classic board game with physics-based dice"
            href="/games/backgammon"
            gradient="from-orange-500 to-red-700"
            icon="🎲"
            disabled
          />
          <GameCard
            title="Scrabble"
            description="Word game with 3D tiles and full dictionary"
            href="/games/scrabble"
            gradient="from-blue-500 to-indigo-700"
            icon="🔤"
            disabled
          />
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/games/poker" className="btn-primary">
            Play Poker Now
          </Link>
          <Link href="/lobby" className="btn-secondary">
            Multiplayer Lobby
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          <p>✨ Realistic 3D Graphics • 🌐 Cross-Platform • 🎮 Online Multiplayer</p>
        </div>
      </div>
    </main>
  );
}

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  gradient: string;
  icon: string;
  disabled?: boolean;
}

function GameCard({ title, description, href, gradient, icon, disabled }: GameCardProps) {
  const Card = (
    <div
      className={`
        relative p-6 rounded-xl bg-surface border border-gray-700
        transition-all duration-300 transform hover:scale-105
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
      `}
    >
      <div className={`text-5xl mb-4 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
      {disabled && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
          Coming Soon
        </div>
      )}
    </div>
  );

  return disabled ? (
    Card
  ) : (
    <Link href={href} className="block">
      {Card}
    </Link>
  );
}
