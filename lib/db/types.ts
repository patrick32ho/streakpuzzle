import { GameMode, FeedbackType } from '../puzzle';

/**
 * Database types for Grid of the Day
 */

export interface GameResult {
  anonId: string;
  wallet?: string;
  dayId: number;
  mode: GameMode;
  solved: boolean;
  attemptsUsed: number;
  timeMs: number;
  guessHistory: string[]; // Each guess as "R,G,B,Y,P" format
  feedbackHistory: FeedbackType[][];
  submittedAt: number; // Unix timestamp
}

export interface UserStreak {
  anonId: string;
  wallet?: string;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDayId: number;
  totalGames: number;
  totalWins: number;
  hardModeWins: number;
}

export interface LeaderboardEntry {
  anonId: string;
  wallet?: string;
  displayName: string;
  solved: boolean;
  attemptsUsed: number;
  timeMs: number;
  mode: GameMode;
  streak: number;
}

export interface ClaimableRewards {
  dailyBadge?: boolean;
  weeklyStreakBadge?: number; // Tier: 7, 14, 30
  frames?: number[]; // Frame IDs earned
}

export interface SubmitResponse {
  accepted: boolean;
  solved: boolean;
  attemptsUsed: number;
  rank?: number;
  percentile?: number;
  streak: {
    current: number;
    best: number;
  };
  claimable: ClaimableRewards;
  share: {
    emojiGridText: string;
    shareLink: string;
  };
}

export interface DailyMetadata {
  dayId: number;
  tokenSetVersion: number;
  puzzleCommitment: string;
  issuedAt: number;
  signature: string;
}
