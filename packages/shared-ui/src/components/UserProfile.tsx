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
  className = '',
}) => {
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const winRatePercent = Math.round(profile.statistics.winRate * 100);
  const gamesWithoutDraws = profile.statistics.totalWins + profile.statistics.totalLosses;

  return (
    <div className={`user-profile ${className}`}>
      {/* Header Section */}
      <div className="profile-header">
        <img src={profile.avatar} alt={profile.displayName} className="avatar" />
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
          <div className="win-rate-fill" style={{ width: `${winRatePercent}%` }} />
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
    </div>
  );
};

export default UserProfileComponent;
