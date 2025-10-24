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
  className = ''
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
          {(['daily', 'weekly', 'monthly', 'allTime'] as const).map(p => (
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
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="player-avatar"
                    />
                    <div className="player-name">
                      <div className="username">{entry.username}</div>
                      {isCurrentUser(entry.userId) && (
                        <div className="you-badge">You</div>
                      )}
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
                  <div className="stat-value win-rate">
                    {Math.round(entry.winRate * 100)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .leaderboard {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.6));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .leaderboard-header {
          padding: 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-content {
          flex: 1;
        }

        .title {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }

        .subtitle {
          margin: 0;
          font-size: 13px;
          color: #94a3b8;
        }

        .period-selector {
          display: flex;
          gap: 8px;
        }

        .period-button {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .period-button:hover {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          color: #60a5fa;
        }

        .period-button.active {
          border-color: #60a5fa;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2));
          color: #60a5fa;
        }

        .leaderboard-table {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
        }

        .table-header {
          display: grid;
          grid-template-columns: 50px 1fr 100px 80px 100px;
          gap: 16px;
          padding: 12px 24px;
          background: rgba(148, 163, 184, 0.05);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .table-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .table-body::-webkit-scrollbar {
          width: 8px;
        }

        .table-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .table-body::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
        }

        .table-body::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }

        .table-header .col {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-header .col.rank {
          text-align: center;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #64748b;
        }

        .empty-text {
          font-size: 14px;
          margin: 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 50px 1fr 100px 80px 100px;
          gap: 16px;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.05);
          align-items: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .table-row:hover {
          background: rgba(148, 163, 184, 0.08);
        }

        .table-row.current-user {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.05));
        }

        .table-row.top-1 {
          background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(251, 146, 60, 0.05));
        }

        .table-row.top-2 {
          background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), rgba(156, 163, 175, 0.05));
        }

        .table-row.top-3 {
          background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), rgba(217, 119, 6, 0.05));
        }

        .rank-badge {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #cbd5e1;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .player-avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          background: rgba(148, 163, 184, 0.1);
        }

        .player-name {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .username {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }

        .you-badge {
          font-size: 10px;
          color: #60a5fa;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .col {
          font-size: 13px;
          color: #cbd5e1;
        }

        .col.stat {
          text-align: right;
        }

        .stat-value {
          font-weight: 700;
          color: #ffffff;
        }

        .stat-value.win-rate {
          color: #60a5fa;
        }

        @media (max-width: 768px) {
          .leaderboard-header {
            flex-direction: column;
          }

          .table-header,
          .table-row {
            grid-template-columns: 40px 1fr 70px 70px;
            gap: 12px;
            padding: 12px 16px;
          }

          .table-header .col:nth-child(5),
          .table-row .col:nth-child(5) {
            display: none;
          }

          .player-avatar {
            width: 36px;
            height: 36px;
          }

          .rank-badge {
            font-size: 16px;
          }

          .username {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
