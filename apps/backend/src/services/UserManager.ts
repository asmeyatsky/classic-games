/**
 * User Manager - Player Profile & Account Management
 *
 * Handles:
 * - User registration and authentication
 * - Player profiles and statistics
 * - Leaderboard management
 * - Achievement tracking
 * - Social features (friends, following)
 */

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  createdAt: number;
  updatedAt: number;
  statistics: PlayerStatistics;
  preferences: UserPreferences;
}

export interface PlayerStatistics {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalScore: number;
  averageScore: number;
  winRate: number;
  gameStats: {
    [gameType: string]: GameTypeStats;
  };
}

export interface GameTypeStats {
  games: number;
  wins: number;
  losses: number;
  highScore: number;
  averageScore: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  notifications: boolean;
  language: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'milestone' | 'challenge';
  unlockedAt?: number;
}

export interface Leaderboard {
  id: string;
  gameType: string;
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  updatedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  wins: number;
  winRate: number;
}

export class UserManager {
  private users: Map<string, UserProfile> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private friends: Map<string, Set<string>> = new Map();
  private following: Map<string, Set<string>> = new Map();

  /**
   * Create new user
   */
  createUser(
    username: string,
    email: string,
    displayName: string
  ): UserProfile {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const profile: UserProfile = {
      id: userId,
      username,
      email,
      displayName,
      avatar: `https://ui-avatars.com/api/?name=${displayName}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      statistics: {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        totalScore: 0,
        averageScore: 0,
        winRate: 0,
        gameStats: {}
      },
      preferences: {
        theme: 'dark',
        audioEnabled: true,
        hapticsEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        notifications: true,
        language: 'en'
      }
    };

    this.users.set(userId, profile);
    this.friends.set(userId, new Set());
    this.following.set(userId, new Set());
    this.achievements.set(userId, []);

    return profile;
  }

  /**
   * Get user profile
   */
  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null;
  }

  /**
   * Update user profile
   */
  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.users.get(userId);
    if (!user) return null;

    Object.assign(user, updates);
    user.updatedAt = Date.now();

    return user;
  }

  /**
   * Record game result
   */
  recordGameResult(
    userId: string,
    gameType: string,
    result: 'win' | 'loss' | 'draw',
    score: number
  ): void {
    const user = this.users.get(userId);
    if (!user) return;

    const stats = user.statistics;

    // Update total stats
    stats.totalGames++;
    stats.totalScore += score;
    stats.averageScore = stats.totalScore / stats.totalGames;

    if (result === 'win') {
      stats.totalWins++;
    } else if (result === 'loss') {
      stats.totalLosses++;
    } else {
      stats.totalDraws++;
    }

    stats.winRate = stats.totalWins / stats.totalGames;

    // Update game-specific stats
    if (!stats.gameStats[gameType]) {
      stats.gameStats[gameType] = {
        games: 0,
        wins: 0,
        losses: 0,
        highScore: 0,
        averageScore: 0
      };
    }

    const gameStats = stats.gameStats[gameType];
    gameStats.games++;
    gameStats.highScore = Math.max(gameStats.highScore, score);

    if (result === 'win') {
      gameStats.wins++;
    } else if (result === 'loss') {
      gameStats.losses++;
    }

    gameStats.averageScore = (gameStats.averageScore * (gameStats.games - 1) + score) / gameStats.games;

    user.updatedAt = Date.now();
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(gameType: string, period: 'daily' | 'weekly' | 'monthly' | 'allTime' = 'allTime'): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (const user of this.users.values()) {
      const gameStats = user.statistics.gameStats[gameType];
      if (!gameStats || gameStats.games === 0) continue;

      entries.push({
        rank: 0,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        score: gameStats.highScore,
        wins: gameStats.wins,
        winRate: gameStats.wins / gameStats.games
      });
    }

    // Sort by score
    entries.sort((a, b) => b.score - a.score);

    // Assign ranks
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return entries;
  }

  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard(): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (const user of this.users.values()) {
      const stats = user.statistics;
      if (stats.totalGames === 0) continue;

      entries.push({
        rank: 0,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        score: stats.totalScore,
        wins: stats.totalWins,
        winRate: stats.winRate
      });
    }

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return entries;
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(userId: string, achievementId: string): Achievement | null {
    const user = this.users.get(userId);
    if (!user) return null;

    const userAchievements = this.achievements.get(userId) || [];

    // Check if already unlocked
    if (userAchievements.some(a => a.id === achievementId)) {
      return null;
    }

    // Create achievement
    const achievement: Achievement = {
      id: achievementId,
      name: this.getAchievementName(achievementId),
      description: this.getAchievementDescription(achievementId),
      icon: this.getAchievementIcon(achievementId),
      category: this.getAchievementCategory(achievementId),
      unlockedAt: Date.now()
    };

    userAchievements.push(achievement);
    this.achievements.set(userId, userAchievements);

    return achievement;
  }

  /**
   * Get user achievements
   */
  getAchievements(userId: string): Achievement[] {
    return this.achievements.get(userId) || [];
  }

  /**
   * Add friend
   */
  addFriend(userId: string, friendId: string): boolean {
    const user = this.users.get(userId);
    const friend = this.users.get(friendId);

    if (!user || !friend) return false;

    const userFriends = this.friends.get(userId);
    if (userFriends) {
      userFriends.add(friendId);
    }

    // Bidirectional friendship
    const friendFriends = this.friends.get(friendId);
    if (friendFriends) {
      friendFriends.add(userId);
    }

    return true;
  }

  /**
   * Remove friend
   */
  removeFriend(userId: string, friendId: string): boolean {
    const userFriends = this.friends.get(userId);
    if (userFriends) {
      userFriends.delete(friendId);
    }

    const friendFriends = this.friends.get(friendId);
    if (friendFriends) {
      friendFriends.delete(userId);
    }

    return true;
  }

  /**
   * Get friends
   */
  getFriends(userId: string): UserProfile[] {
    const friendIds = this.friends.get(userId) || new Set();
    return Array.from(friendIds)
      .map(id => this.users.get(id))
      .filter((user): user is UserProfile => user !== null);
  }

  /**
   * Follow user
   */
  followUser(userId: string, targetId: string): boolean {
    const following = this.following.get(userId);
    if (following) {
      following.add(targetId);
      return true;
    }
    return false;
  }

  /**
   * Unfollow user
   */
  unfollowUser(userId: string, targetId: string): boolean {
    const following = this.following.get(userId);
    if (following) {
      following.delete(targetId);
      return true;
    }
    return false;
  }

  /**
   * Get followers count
   */
  getFollowersCount(userId: string): number {
    let count = 0;
    for (const [_, following] of this.following) {
      if (following.has(userId)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Search users
   */
  searchUsers(query: string, limit: number = 10): UserProfile[] {
    const results: UserProfile[] = [];
    const lowerQuery = query.toLowerCase();

    for (const user of this.users.values()) {
      if (
        user.username.toLowerCase().includes(lowerQuery) ||
        user.displayName.toLowerCase().includes(lowerQuery)
      ) {
        results.push(user);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Get achievement metadata
   */
  private getAchievementName(id: string): string {
    const names: Record<string, string> = {
      'first_game': 'First Step',
      'ten_wins': 'Victory Streak',
      'high_score': 'Master Score',
      'social_butterfly': 'Social Butterfly',
      'loyal_player': 'Loyal Player'
    };
    return names[id] || 'Achievement';
  }

  private getAchievementDescription(id: string): string {
    const descriptions: Record<string, string> = {
      'first_game': 'Complete your first game',
      'ten_wins': 'Achieve 10 victories',
      'high_score': 'Reach a score of 1000+',
      'social_butterfly': 'Add 5 friends',
      'loyal_player': 'Play 50 games'
    };
    return descriptions[id] || 'Unlock this achievement';
  }

  private getAchievementIcon(id: string): string {
    const icons: Record<string, string> = {
      'first_game': '🎮',
      'ten_wins': '🏆',
      'high_score': '⭐',
      'social_butterfly': '🦋',
      'loyal_player': '💎'
    };
    return icons[id] || '🎯';
  }

  private getAchievementCategory(id: string): 'gameplay' | 'social' | 'milestone' | 'challenge' {
    const categories: Record<string, any> = {
      'first_game': 'gameplay',
      'ten_wins': 'milestone',
      'high_score': 'challenge',
      'social_butterfly': 'social',
      'loyal_player': 'milestone'
    };
    return categories[id] || 'gameplay';
  }
}

// Singleton instance
export const userManager = new UserManager();
