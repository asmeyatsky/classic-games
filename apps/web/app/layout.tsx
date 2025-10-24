import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Classic Games - World-Class 3D Gaming',
  description: 'Play Poker, Backgammon, and Scrabble with stunning 3D graphics and online multiplayer',
  keywords: ['poker', 'backgammon', 'scrabble', '3D games', 'online games'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
