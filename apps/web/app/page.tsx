import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#050508]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent"></div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-400/60 mb-4">
            Powered by AI Strategy Coach
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight text-white">
            Classic Games
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            3D games with real-time AI coaching. Learn strategy as you play against intelligent
            opponents.
          </p>
        </div>

        {/* AI Coach Feature Banner */}
        <div className="max-w-3xl mx-auto mb-16 bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-2xl p-8 border border-indigo-800/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-700/30 shrink-0">
              <span className="text-2xl">♠</span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-2">AI Strategy Coach</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every game includes a live AI coach that analyzes your position in real-time. Get
                hand strength evaluation, pot odds analysis, pip counts, rack assessments, and
                strategic recommendations - all instantly, as you play.
              </p>
            </div>
          </div>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          <GameCard
            title="Poker"
            subtitle="Texas Hold'em"
            description="Hand strength analysis, pot odds, and optimal action recommendations from your AI coach."
            href="/games/poker"
            icon="♠"
            accentColor="#10b981"
            tag="Most Popular"
          />
          <GameCard
            title="Backgammon"
            subtitle="Strategy Board Game"
            description="Pip count tracking, blot exposure analysis, and race advantage insights in real-time."
            href="/games/backgammon"
            icon="⚄"
            accentColor="#f59e0b"
            tag="Classic"
          />
          <GameCard
            title="Scrabble"
            subtitle="Word Challenge"
            description="Rack balance assessment, premium square targeting, and strategic word placement guidance."
            href="/games/scrabble"
            icon="W"
            accentColor="#6366f1"
            tag="Brain Game"
          />
        </div>

        {/* Features Grid */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: '3D Graphics', detail: 'Three.js powered' },
              { label: 'AI Coach', detail: 'Real-time analysis' },
              { label: 'Smart AI', detail: 'Adaptive opponents' },
              { label: 'Cross-Platform', detail: 'Web & mobile' },
            ].map((feature) => (
              <div key={feature.label} className="p-4">
                <p className="text-sm font-bold text-slate-300">{feature.label}</p>
                <p className="text-xs text-slate-600 mt-1">{feature.detail}</p>
              </div>
            ))}
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
  accentColor: string;
  tag: string;
}

function GameCard({ title, subtitle, description, href, icon, accentColor, tag }: GameCardProps) {
  return (
    <Link href={href}>
      <div
        className="group relative h-full p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        style={{ '--accent': accentColor } as React.CSSProperties}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 1px 0 ${accentColor}22, 0 0 40px ${accentColor}08` }}
        />

        <div className="relative z-10">
          {/* Tag */}
          <div className="flex justify-between items-start mb-6">
            <span
              className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full"
              style={{ color: accentColor, background: `${accentColor}15` }}
            >
              {tag}
            </span>
          </div>

          {/* Icon */}
          <div
            className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}22`,
              color: accentColor,
            }}
          >
            {icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-xs text-slate-500 mb-3">{subtitle}</p>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>

          {/* CTA */}
          <div
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: accentColor }}
          >
            Play Now
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
