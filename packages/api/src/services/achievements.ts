/**
 * Achievements Service
 * Manages achievement unlocking and tracking
 */

import { getDatabase } from '@classic-games/database';
import { getLogger } from '@classic-games/logger';

const logger = getLogger();

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  iconUrl: string;
  points: number;
  unlockedAt?: string;
  progress?: number;
}

export interface AchievementUnlock {
  userId: string;
  achievementCode: string;
  unlockedAt: string;
  progress: number;
}

/**
 * Check and unlock achievements for a player after a game
 */
export async function checkAndUnlockAchievements(
  userId: string,
  gameType: string,
  isWinner: boolean,
  stats: { wins: number; losses: number; rating: number; totalGames: number }
): Promise<string[]> {
  const db = getDatabase();
  const unlockedAchievements: string[] = [];

  try {
    // Define all achievements
    const achievementChecks = [
      // Game-specific achievements
      {
        code: 'first_win',
        check: () => isWinner && stats.totalGames === 1,
        description: 'Win your first game',
      },
      {
        code: 'ten_wins',
        check: () => stats.wins === 10,
        description: 'Win 10 games',
      },
      {
        code: 'hundred_wins',
        check: () => stats.wins === 100,
        description: 'Win 100 games',
      },
      {
        code: 'novice',
        check: () => stats.rating >= 1100,
        description: 'Reach 1100 rating',
      },
      {
        code: 'intermediate',
        check: () => stats.rating >= 1400,
        description: 'Reach 1400 rating',
      },
      {
        code: 'expert',
        check: () => stats.rating >= 1700,
        description: 'Reach 1700 rating',
      },
      {
        code: 'master',
        check: () => stats.rating >= 2000,
        description: 'Reach 2000 rating',
      },
      {
        code: 'winning_streak_5',
        check: async () => {
          const userAchievements = await db`
            SELECT current_winning_streak FROM game_stats WHERE user_id = ${userId}
          `;
          return userAchievements.length > 0 && userAchievements[0].current_winning_streak >= 5;
        },
        description: '5 game winning streak',
      },
      {
        code: `${gameType}_specialist`,
        check: () => {
          const winColumn = `${gameType}_wins`;
          return (stats as any)[winColumn] === 10;
        },
        description: `Win 10 ${gameType} games`,
      },
    ];

    // Check each achievement
    for (const achievement of achievementChecks) {
      const isUnlocked = await achievement.check();

      if (isUnlocked) {
        // Check if already unlocked
        const existing = await db`
          SELECT id FROM achievements
          WHERE user_id = ${userId} AND achievement_code = ${achievement.code}
        `;

        if (existing.length === 0) {
          // Unlock the achievement
          await db`
            INSERT INTO achievements (user_id, achievement_code, unlocked_at)
            VALUES (${userId}, ${achievement.code}, NOW())
          `;

          unlockedAchievements.push(achievement.code);
          logger.info('Achievement unlocked', {
            userId,
            achievement: achievement.code,
          });
        }
      }
    }

    return unlockedAchievements;
  } catch (error) {
    logger.error('Error checking achievements', error);
    return [];
  }
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const db = getDatabase();

  const achievements = await db`
    SELECT
      a.id,
      a.achievement_code as code,
      a.title,
      a.description,
      a.icon_url as "iconUrl",
      a.points,
      ua.unlocked_at as "unlockedAt",
      ua.progress
    FROM achievement_definitions a
    LEFT JOIN achievements ua ON a.id = ua.achievement_id AND ua.user_id = ${userId}
    ORDER BY a.points DESC
  `;

  return achievements;
}

/**
 * Get achievement statistics for user
 */
export async function getUserAchievementStats(userId: string): Promise<{
  totalAchievements: number;
  unlockedCount: number;
  totalPoints: number;
  percentComplete: number;
}> {
  const db = getDatabase();

  const stats = await db`
    SELECT
      COUNT(DISTINCT a.id) as total,
      COUNT(DISTINCT ua.id) as unlocked,
      COALESCE(SUM(CASE WHEN ua.id IS NOT NULL THEN a.points ELSE 0 END), 0) as points
    FROM achievement_definitions a
    LEFT JOIN achievements ua ON a.id = ua.achievement_id AND ua.user_id = ${userId}
  `;

  const stat = stats[0];
  const total = parseInt(stat.total || 0);
  const unlocked = parseInt(stat.unlocked || 0);
  const points = parseInt(stat.points || 0);

  return {
    totalAchievements: total,
    unlockedCount: unlocked,
    totalPoints: points,
    percentComplete: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  };
}

/**
 * Get global achievement leaderboard
 */
export async function getAchievementLeaderboard(limit: number = 50): Promise<
  Array<{
    userId: string;
    username: string;
    unlockedCount: number;
    totalPoints: number;
  }>
> {
  const db = getDatabase();

  const leaderboard = await db`
    SELECT
      u.id,
      u.username,
      COUNT(DISTINCT a.id) as unlocked_count,
      COALESCE(SUM(ad.points), 0) as total_points
    FROM users u
    LEFT JOIN achievements a ON u.id = a.user_id
    LEFT JOIN achievement_definitions ad ON a.achievement_id = ad.id
    WHERE u.is_active = true
    GROUP BY u.id, u.username
    ORDER BY total_points DESC, unlocked_count DESC
    LIMIT ${limit}
  `;

  return leaderboard.map((row: any) => ({
    userId: row.id,
    username: row.username,
    unlockedCount: parseInt(row.unlocked_count),
    totalPoints: parseInt(row.total_points),
  }));
}

/**
 * Get achievement details
 */
export async function getAchievementDetails(code: string): Promise<Achievement | null> {
  const db = getDatabase();

  const achievements = await db`
    SELECT
      id,
      achievement_code as code,
      title,
      description,
      icon_url as "iconUrl",
      points
    FROM achievement_definitions
    WHERE achievement_code = ${code}
  `;

  return achievements.length > 0 ? achievements[0] : null;
}
