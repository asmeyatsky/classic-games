/**
 * User Profile Component - Player Profile Display
 *
 * Handles:
 * - Player information display (name, avatar, join date)
 * - Overall statistics (games, wins, losses, average score)
 * - Win rate visualization
 * - Game-specific breakdown
 * - Achievements summary
 * - Social stats (friends, followers)
 *
 * Architectural Intent:
 * - Beautiful display of player profile and achievements
 * - Responsive stats cards with gradient backgrounds
 * - Game-specific statistics breakdown
 * - Integration with UserManager data structure
 */

import React from 'react';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  createdAt: number;
  statistics: {
    totalGames: number;
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    totalScore: number;
    averageScore: number;
    winRate: number;
  };
}

export interface UserProfileProps {
  profile: UserProfile;
  achievementCount?: number;
  friendCount?: number;
  followerCount?: number;
  className?: string;
}

export const UserProfileComponent: React.FC<UserProfileProps> = ({
  profile,
  achievementCount = 0,
  friendCount = 0,
  followerCount = 0,
  className = ''
}) => {
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const winRatePercent = Math.round(profile.statistics.winRate * 100);
  const gamesWithoutDraws = profile.statistics.totalWins + profile.statistics.totalLosses;

  return (
    <div className={`user-profile ${className}`}>
      {/* Header Section */}
      <div className="profile-header">
        <img
          src={profile.avatar}
          alt={profile.displayName}
          className="avatar"
        />
        <div className="profile-info">
          <h1 className="display-name">{profile.displayName}</h1>
          <p className="username">@{profile.username}</p>
          <p className="join-date">Joined {joinDate}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card primary">
          <div className="stat-value">{profile.statistics.totalGames}</div>
          <div className="stat-label">Games Played</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{profile.statistics.totalWins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{profile.statistics.totalLosses}</div>
          <div className="stat-label">Losses</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-value">{profile.statistics.totalDraws}</div>
          <div className="stat-label">Draws</div>
        </div>
      </div>

      {/* Win Rate Progress */}
      <div className="win-rate-section">
        <div className="section-title">Win Rate</div>
        <div className="win-rate-bar">
          <div
            className="win-rate-fill"
            style={{ width: `${winRatePercent}%` }}
          />
        </div>
        <div className="win-rate-label">
          {winRatePercent}% ({profile.statistics.totalWins}/{gamesWithoutDraws} games)
        </div>
      </div>

      {/* Score Stats */}
      <div className="score-section">
        <div className="score-stat">
          <div className="score-label">Total Score</div>
          <div className="score-value">{profile.statistics.totalScore.toLocaleString()}</div>
        </div>
        <div className="score-stat">
          <div className="score-label">Average Score</div>
          <div className="score-value">{Math.round(profile.statistics.averageScore)}</div>
        </div>
      </div>

      {/* Social Stats */}
      <div className="social-stats">
        <div className="social-stat">
          <div className="social-icon">👥</div>
          <div className="social-info">
            <div className="social-value">{friendCount}</div>
            <div className="social-label">Friends</div>
          </div>
        </div>
        <div className="social-stat">
          <div className="social-icon">⭐</div>
          <div className="social-info">
            <div className="social-value">{followerCount}</div>
            <div className="social-label">Followers</div>
          </div>
        </div>
        <div className="social-stat">
          <div className="social-icon">🏆</div>
          <div className="social-info">
            <div className="social-value">{achievementCount}</div>
            <div className="social-label">Achievements</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-profile {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.6));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
        }

        .profile-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 12px;
          border: 2px solid rgba(148, 163, 184, 0.3);
          object-fit: cover;
          background: rgba(148, 163, 184, 0.1);
        }

        .profile-info {
          flex: 1;
        }

        .display-name {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .username {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #94a3b8;
        }

        .join-date {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .stat-card {
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1));
          border-color: rgba(59, 130, 246, 0.3);
        }

        .stat-card.success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(74, 222, 128, 0.1));
          border-color: rgba(34, 197, 94, 0.3);
        }

        .stat-card.danger {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
          border-color: rgba(239, 68, 68, 0.3);
        }

        .stat-card.secondary {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(196, 181, 253, 0.1));
          border-color: rgba(168, 85, 247, 0.3);
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .win-rate-section {
          margin-bottom: 28px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .win-rate-bar {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(148, 163, 184, 0.2);
          overflow: hidden;
          margin-bottom: 8px;
        }

        .win-rate-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .win-rate-label {
          font-size: 13px;
          color: #cbd5e1;
        }

        .score-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
          padding: 20px;
          background: rgba(148, 163, 184, 0.05);
          border-radius: 8px;
        }

        .score-stat {
          text-align: center;
        }

        .score-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .score-value {
          font-size: 20px;
          font-weight: 700;
          color: #60a5fa;
        }

        .social-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .social-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(148, 163, 184, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .social-icon {
          font-size: 20px;
        }

        .social-info {
          flex: 1;
        }

        .social-value {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
        }

        .social-label {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        @media (max-width: 640px) {
          .user-profile {
            padding: 20px;
          }

          .profile-header {
            gap: 16px;
            margin-bottom: 20px;
          }

          .avatar {
            width: 72px;
            height: 72px;
          }

          .display-name {
            font-size: 20px;
          }

          .quick-stats {
            gap: 8px;
          }

          .social-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfileComponent;
