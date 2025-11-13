/**
 * User and Authentication Validation Schemas
 */

import { z } from 'zod';

export const UserSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  displayName: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
});

export type UserSignUp = z.infer<typeof UserSignUpSchema>;

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional(),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
  avatar: z.string().url().nullable(),
  bio: z.string().max(500).optional(),
  level: z.number().int().min(1),
  totalGames: z.number().int().min(0),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  rating: z.number().int().min(0),
  stats: z.object({
    pokerWins: z.number().int().min(0),
    backgammonWins: z.number().int().min(0),
    scrabbleWins: z.number().int().min(0),
    totalChipsWon: z.number().min(0),
    longestStreak: z.number().int().min(0),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  confirmPassword: z.string().min(1),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

export const UserStatisticsSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  level: z.number().int().min(1),
  rating: z.number().int().min(0),
  totalGames: z.number().int().min(0),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
  favorites: z.array(
    z.enum(['poker', 'backgammon', 'scrabble'])
  ),
  achievements: z.array(z.string()).optional(),
});

export type UserStatistics = z.infer<typeof UserStatisticsSchema>;

export const FriendRequestSchema = z.object({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  message: z.string().max(200).optional(),
  timestamp: z.string().datetime(),
});

export type FriendRequest = z.infer<typeof FriendRequestSchema>;

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().url(),
  criteria: z.object({
    type: z.enum(['wins', 'streak', 'games', 'score', 'special']),
    value: z.number(),
  }),
  unlockedAt: z.string().datetime().nullable(),
  progress: z.number().min(0).max(100),
});

export type Achievement = z.infer<typeof AchievementSchema>;

export const LeaderboardEntrySchema = z.object({
  rank: z.number().int().min(1),
  userId: z.string().uuid(),
  username: z.string(),
  rating: z.number().int().min(0),
  totalWins: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
  recentActivity: z.string().datetime(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
