/**
 * Leaderboard Component - Ranked Player Display
 *
 * Handles:
 * - Ranked player list with positions
 * - Game-specific or global leaderboards
 * - Different time periods (daily, weekly, monthly, all-time)
 * - Player statistics display (wins, win rate, score)
 * - Scrollable table with hover effects
 * - Responsive design for mobile and desktop
 *
 * Architectural Intent:
 * - Beautiful leaderboard display with glass morphism
 * - Responsive table that works on all screen sizes
 * - Integration with UserManager leaderboard data
 * - Premium dark aesthetic with gradient accents
 */

import React, { useState } from 'react';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  wins: number;
  winRate: number;
}

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  gameType?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'allTime') => void;
  currentUserId?: string;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  gameType = 'All Games',
  period = 'allTime',
  onPeriodChange,
  currentUserId,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly' | 'allTime') => {
    setSelectedPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  return (
    <div className={`leaderboard ${className}`}>
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-content">
          <h2 className="title">{gameType} Leaderboard</h2>
          <p className="subtitle">Rankings by performance</p>
        </div>

        {/* Period Selector */}
        <div className="period-selector">
          {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`period-button ${selectedPeriod === p ? 'active' : ''}`}
              aria-label={`Show ${p} leaderboard`}
            >
              {p === 'daily' && 'Today'}
              {p === 'weekly' && 'Week'}
              {p === 'monthly' && 'Month'}
              {p === 'allTime' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table">
        {/* Column Headers */}
        <div className="table-header">
          <div className="col rank">Rank</div>
          <div className="col player">Player</div>
          <div className="col stat">Score</div>
          <div className="col stat">Wins</div>
          <div className="col stat">Win Rate</div>
        </div>

        {/* Entries */}
        <div className="table-body">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No players yet</p>
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`table-row ${isCurrentUser(entry.userId) ? 'current-user' : ''} ${
                  entry.rank <= 3 ? `top-${entry.rank}` : ''
                }`}
              >
                <div className="col rank">
                  <div className="rank-badge">{getRankBadge(entry.rank)}</div>
                </div>
                <div className="col player">
                  <div className="player-info">
                    <img src={entry.avatar} alt={entry.username} className="player-avatar" />
                    <div className="player-name">
                      <div className="username">{entry.username}</div>
                      {isCurrentUser(entry.userId) && <div className="you-badge">You</div>}
                    </div>
                  </div>
                </div>
                <div className="col stat">
                  <div className="stat-value">{entry.score.toLocaleString()}</div>
                </div>
                <div className="col stat">
                  <div className="stat-value">{entry.wins}</div>
                </div>
                <div className="col stat">
                  <div className="stat-value win-rate">{Math.round(entry.winRate * 100)}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
