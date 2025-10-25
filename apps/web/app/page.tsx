'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#0f172a',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '56rem' }}>
        <h1 style={{
          fontSize: '3.75rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          background: 'linear-gradient(to right, #60a5fa, #a855f7)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}>
          Classic Games
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#d1d5db',
          marginBottom: '3rem',
        }}>
          World-class 3D gaming with realistic graphics and online multiplayer
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <GameCard
            title="Poker"
            description="Texas Hold'em with realistic 3D cards and chips"
            href="/games/poker"
            icon="🃏"
          />
          <GameCard
            title="Backgammon"
            description="Classic board game with physics-based dice"
            href="/games/backgammon"
            icon="🎲"
            disabled
          />
          <GameCard
            title="Scrabble"
            description="Word game with 3D tiles and full dictionary"
            href="/games/scrabble"
            icon="🔤"
            disabled
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/games/poker" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}>
            Play Poker Now
          </Link>
          <Link href="/lobby" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}>
            Multiplayer Lobby
          </Link>
        </div>

        <div style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
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
  icon: string;
  disabled?: boolean;
}

function GameCard({ title, description, href, icon, disabled }: GameCardProps) {
  const cardStyle = {
    position: 'relative' as const,
    padding: '1.5rem',
    borderRadius: '0.75rem',
    backgroundColor: '#1e293b',
    border: '1px solid #374151',
    transition: 'all 0.3s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const Card = (
    <div style={cardStyle}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        lineHeight: '1',
      }}>
        {icon}
      </div>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: 'white',
      }}>
        {title}
      </h2>
      <p style={{ color: '#9ca3af' }}>{description}</p>
      {disabled && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#eab308',
          color: 'black',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
        }}>
          Coming Soon
        </div>
      )}
    </div>
  );

  return disabled ? (
    Card
  ) : (
    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
      {Card}
    </Link>
  );
}
