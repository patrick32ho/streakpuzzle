import { promises as fs } from 'fs';
import path from 'path';
import { GameResult, UserStreak, LeaderboardEntry } from './types';

/**
 * Simple JSON file-based storage for MVP.
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 * 
 * Storage structure:
 * - data/results/{dayId}.json - Daily game results
 * - data/streaks.json - User streak data
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const RESULTS_DIR = path.join(DATA_DIR, 'results');
const STREAKS_FILE = path.join(DATA_DIR, 'streaks.json');

// Ensure data directories exist
async function ensureDataDirs(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(RESULTS_DIR, { recursive: true });
  } catch {
    // Directory exists, ignore
  }
}

/**
 * Save a game result
 */
export async function saveGameResult(result: GameResult): Promise<void> {
  await ensureDataDirs();
  
  const dayFile = path.join(RESULTS_DIR, `${result.dayId}.json`);
  
  // Read existing results for this day
  let dayResults: GameResult[] = [];
  try {
    const data = await fs.readFile(dayFile, 'utf-8');
    dayResults = JSON.parse(data);
  } catch {
    // File doesn't exist yet
  }
  
  // Check if user already submitted for this day
  const existingIndex = dayResults.findIndex(r => r.anonId === result.anonId);
  if (existingIndex >= 0) {
    // Don't allow re-submission
    throw new Error('Already submitted for this day');
  }
  
  dayResults.push(result);
  await fs.writeFile(dayFile, JSON.stringify(dayResults, null, 2));
}

/**
 * Get game result for a specific user and day
 */
export async function getGameResult(
  anonId: string,
  dayId: number
): Promise<GameResult | null> {
  try {
    const dayFile = path.join(RESULTS_DIR, `${dayId}.json`);
    const data = await fs.readFile(dayFile, 'utf-8');
    const dayResults: GameResult[] = JSON.parse(data);
    return dayResults.find(r => r.anonId === anonId) || null;
  } catch {
    return null;
  }
}

/**
 * Get all results for a day (for leaderboard)
 */
export async function getDayResults(dayId: number): Promise<GameResult[]> {
  try {
    const dayFile = path.join(RESULTS_DIR, `${dayId}.json`);
    const data = await fs.readFile(dayFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Get leaderboard for a specific day
 */
export async function getDailyLeaderboard(
  dayId: number,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const results = await getDayResults(dayId);
  const streaks = await getAllStreaks();
  
  // Sort: solved first, then by attempts (fewer is better), then by time
  const sorted = results
    .filter(r => r.solved)
    .sort((a, b) => {
      if (a.attemptsUsed !== b.attemptsUsed) {
        return a.attemptsUsed - b.attemptsUsed;
      }
      return a.timeMs - b.timeMs;
    });

  return sorted.slice(0, limit).map((r) => {
    const streak = streaks.find(s => s.anonId === r.anonId);
    return {
      anonId: r.anonId,
      wallet: r.wallet,
      displayName: r.wallet 
        ? `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`
        : `Player ${r.anonId.slice(0, 6)}`,
      solved: r.solved,
      attemptsUsed: r.attemptsUsed,
      timeMs: r.timeMs,
      mode: r.mode,
      streak: streak?.currentStreak || 0,
    };
  });
}

/**
 * Load all streaks
 */
async function getAllStreaks(): Promise<UserStreak[]> {
  try {
    const data = await fs.readFile(STREAKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Get or create user streak data
 */
export async function getUserStreak(anonId: string): Promise<UserStreak> {
  const streaks = await getAllStreaks();
  const existing = streaks.find(s => s.anonId === anonId);
  
  if (existing) {
    return existing;
  }
  
  // Create new streak entry
  const newStreak: UserStreak = {
    anonId,
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDayId: 0,
    totalGames: 0,
    totalWins: 0,
    hardModeWins: 0,
  };
  
  return newStreak;
}

/**
 * Update user streak after a game
 */
export async function updateUserStreak(
  anonId: string,
  dayId: number,
  solved: boolean,
  mode: 'normal' | 'hard',
  wallet?: string
): Promise<UserStreak> {
  await ensureDataDirs();
  
  const streaks = await getAllStreaks();
  let streak = streaks.find(s => s.anonId === anonId);
  
  if (!streak) {
    streak = {
      anonId,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDayId: 0,
      totalGames: 0,
      totalWins: 0,
      hardModeWins: 0,
    };
    streaks.push(streak);
  }

  // Update wallet if provided
  if (wallet) {
    streak.wallet = wallet;
  }

  // Update stats
  streak.totalGames++;
  
  if (solved) {
    streak.totalWins++;
    if (mode === 'hard') {
      streak.hardModeWins++;
    }
    
    // Update streak
    if (streak.lastPlayedDayId === dayId - 1 || streak.lastPlayedDayId === 0) {
      // Consecutive day or first game
      streak.currentStreak++;
    } else if (streak.lastPlayedDayId !== dayId) {
      // Streak broken
      streak.currentStreak = 1;
    }
    
    // Update best streak
    if (streak.currentStreak > streak.bestStreak) {
      streak.bestStreak = streak.currentStreak;
    }
  } else {
    // Lost - reset current streak
    streak.currentStreak = 0;
  }
  
  streak.lastPlayedDayId = dayId;
  
  // Save
  await fs.writeFile(STREAKS_FILE, JSON.stringify(streaks, null, 2));
  
  return streak;
}

/**
 * Get weekly leaderboard (aggregate of last 7 days)
 */
export async function getWeeklyLeaderboard(
  currentDayId: number,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const streaks = await getAllStreaks();
  
  // Get results from the last 7 days
  const aggregated: Map<string, {
    totalWins: number;
    totalAttempts: number;
    totalTime: number;
    streak: UserStreak;
  }> = new Map();
  
  for (let i = 0; i < 7; i++) {
    const dayId = currentDayId - i;
    const results = await getDayResults(dayId);
    
    for (const result of results) {
      if (!result.solved) continue;
      
      const existing = aggregated.get(result.anonId);
      const streak = streaks.find(s => s.anonId === result.anonId);
      
      if (existing) {
        existing.totalWins++;
        existing.totalAttempts += result.attemptsUsed;
        existing.totalTime += result.timeMs;
      } else {
        aggregated.set(result.anonId, {
          totalWins: 1,
          totalAttempts: result.attemptsUsed,
          totalTime: result.timeMs,
          streak: streak || {
            anonId: result.anonId,
            currentStreak: 0,
            bestStreak: 0,
            lastPlayedDayId: 0,
            totalGames: 0,
            totalWins: 0,
            hardModeWins: 0,
          },
        });
      }
    }
  }
  
  // Sort by total wins, then by average attempts
  const entries = Array.from(aggregated.entries())
    .sort((a, b) => {
      if (b[1].totalWins !== a[1].totalWins) {
        return b[1].totalWins - a[1].totalWins;
      }
      const avgA = a[1].totalAttempts / a[1].totalWins;
      const avgB = b[1].totalAttempts / b[1].totalWins;
      return avgA - avgB;
    })
    .slice(0, limit);
  
  return entries.map(([anonId, data]) => ({
    anonId,
    wallet: data.streak.wallet,
    displayName: data.streak.wallet
      ? `${data.streak.wallet.slice(0, 6)}...${data.streak.wallet.slice(-4)}`
      : `Player ${anonId.slice(0, 6)}`,
    solved: true,
    attemptsUsed: Math.round(data.totalAttempts / data.totalWins),
    timeMs: Math.round(data.totalTime / data.totalWins),
    mode: 'normal' as const,
    streak: data.streak.currentStreak,
  }));
}

/**
 * Calculate user's rank and percentile for a day
 */
export async function calculateRankAndPercentile(
  anonId: string,
  dayId: number
): Promise<{ rank: number; percentile: number }> {
  const results = await getDayResults(dayId);
  const userResult = results.find(r => r.anonId === anonId);
  
  if (!userResult || !userResult.solved) {
    return { rank: 0, percentile: 0 };
  }
  
  // Sort solved results
  const solvedResults = results
    .filter(r => r.solved)
    .sort((a, b) => {
      if (a.attemptsUsed !== b.attemptsUsed) {
        return a.attemptsUsed - b.attemptsUsed;
      }
      return a.timeMs - b.timeMs;
    });
  
  const rank = solvedResults.findIndex(r => r.anonId === anonId) + 1;
  const percentile = Math.round((1 - rank / solvedResults.length) * 100);
  
  return { rank, percentile };
}
