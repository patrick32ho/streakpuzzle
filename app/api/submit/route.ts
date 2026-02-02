import { NextRequest, NextResponse } from 'next/server';
import {
  getDayId,
  generateDailySolution,
  verifyDailySignature,
  generatePuzzleCommitment,
  calculateFeedback,
  isWinningGuess,
  stringToGuess,
  validateHardMode,
  FEEDBACK_EMOJI,
  MAX_ATTEMPTS,
  SEQUENCE_LENGTH,
  FeedbackType,
  GameMode,
} from '@/lib/puzzle';
import {
  saveGameResult,
  getGameResult,
  updateUserStreak,
  calculateRankAndPercentile,
  ClaimableRewards,
  SubmitResponse,
} from '@/lib/db';

const DAILY_SECRET = process.env.DAILY_SECRET || 'CHANGEME_DAILY_SECRET';
const COMMITMENT_SALT = process.env.COMMITMENT_SALT || 'CHANGEME_COMMITMENT_SALT';
const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

interface SubmitRequest {
  anonId: string;
  wallet?: string;
  dayId: number;
  mode: GameMode;
  attemptsUsed: number;
  solved: boolean;
  timeMs: number;
  guessHistory: string[];
  clientProof?: string;
  dailySignature: string;
}

/**
 * Generate emoji grid for sharing
 */
function generateEmojiGrid(
  feedbackHistory: FeedbackType[][],
  dayId: number,
  attemptsUsed: number,
  solved: boolean,
  mode: GameMode,
  streak: number
): string {
  const header = `GridOfDay #${dayId} ${solved ? attemptsUsed : 'X'}/${MAX_ATTEMPTS}${mode === 'hard' ? '*' : ''}`;
  
  const grid = feedbackHistory
    .map(row => row.map(f => FEEDBACK_EMOJI[f]).join(''))
    .join('\n');
  
  const streakLine = streak > 0 ? `🔥 Streak ${streak}` : '';
  
  return `${header}\n${grid}${streakLine ? '\n' + streakLine : ''}`;
}

/**
 * Determine claimable rewards based on game result
 */
function determineClaimableRewards(
  solved: boolean,
  attemptsUsed: number,
  currentStreak: number
): ClaimableRewards {
  const rewards: ClaimableRewards = {};
  
  if (solved) {
    // Daily badge claimable if solved
    rewards.dailyBadge = true;
    
    // Weekly streak badges (tiers: 7, 14, 30)
    if (currentStreak >= 30) {
      rewards.weeklyStreakBadge = 30;
    } else if (currentStreak >= 14) {
      rewards.weeklyStreakBadge = 14;
    } else if (currentStreak >= 7) {
      rewards.weeklyStreakBadge = 7;
    }
    
    // Frames based on performance
    const frames: number[] = [];
    if (attemptsUsed === 1) {
      frames.push(1); // "Perfect" frame
    }
    if (attemptsUsed <= 2) {
      frames.push(2); // "Quick solver" frame
    }
    if (currentStreak >= 3) {
      frames.push(3); // "On fire" frame
    }
    if (frames.length > 0) {
      rewards.frames = frames;
    }
  }
  
  return rewards;
}

/**
 * POST /api/submit
 * Submit game result for validation and scoring
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequest = await request.json();
    
    const {
      anonId,
      wallet,
      dayId,
      mode,
      attemptsUsed,
      solved: clientSolved,
      timeMs,
      guessHistory,
      dailySignature,
    } = body;
    
    // Basic validation
    if (!anonId || !dayId || !guessHistory || !dailySignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate dayId is current day
    const currentDayId = getDayId();
    if (dayId !== currentDayId) {
      return NextResponse.json(
        { error: 'Invalid dayId - must be today\'s puzzle' },
        { status: 400 }
      );
    }
    
    // Check if already submitted
    const existingResult = await getGameResult(anonId, dayId);
    if (existingResult) {
      return NextResponse.json(
        { error: 'Already submitted for today' },
        { status: 400 }
      );
    }
    
    // Validate signature
    const solution = generateDailySolution(dayId, DAILY_SECRET);
    const commitment = generatePuzzleCommitment(solution, dayId, COMMITMENT_SALT);
    if (!verifyDailySignature(dayId, commitment, dailySignature, DAILY_SECRET)) {
      return NextResponse.json(
        { error: 'Invalid daily signature' },
        { status: 400 }
      );
    }
    
    // Validate guess history
    if (guessHistory.length === 0 || guessHistory.length > MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: `Guess history must be 1-${MAX_ATTEMPTS} guesses` },
        { status: 400 }
      );
    }
    
    if (attemptsUsed !== guessHistory.length) {
      return NextResponse.json(
        { error: 'attemptsUsed does not match guessHistory length' },
        { status: 400 }
      );
    }
    
    // Validate time is reasonable (1 second to 10 minutes)
    if (timeMs < 1000 || timeMs > 600000) {
      return NextResponse.json(
        { error: 'Invalid time value' },
        { status: 400 }
      );
    }
    
    // Replay and verify all guesses
    const feedbackHistory: FeedbackType[][] = [];
    let serverSolved = false;
    
    for (let i = 0; i < guessHistory.length; i++) {
      const guess = stringToGuess(guessHistory[i]);
      
      // Validate guess format
      if (guess.length !== SEQUENCE_LENGTH) {
        return NextResponse.json(
          { error: `Invalid guess format at position ${i}` },
          { status: 400 }
        );
      }
      
      // Validate hard mode constraints
      if (mode === 'hard' && i > 0) {
        const previousGuesses = guessHistory.slice(0, i).map(stringToGuess);
        const validation = validateHardMode(previousGuesses, feedbackHistory, guess);
        if (!validation.valid) {
          return NextResponse.json(
            { error: `Hard mode violation: ${validation.error}` },
            { status: 400 }
          );
        }
      }
      
      // Calculate feedback
      const feedback = calculateFeedback(guess, solution);
      feedbackHistory.push(feedback);
      
      // Check if won
      if (isWinningGuess(feedback)) {
        serverSolved = true;
        // No more guesses should follow a winning guess
        if (i < guessHistory.length - 1) {
          return NextResponse.json(
            { error: 'Guesses continued after winning' },
            { status: 400 }
          );
        }
      }
    }
    
    // Verify client's solved status matches server verification
    if (clientSolved !== serverSolved) {
      return NextResponse.json(
        { error: 'Solved status mismatch' },
        { status: 400 }
      );
    }
    
    // Save game result
    await saveGameResult({
      anonId,
      wallet,
      dayId,
      mode,
      solved: serverSolved,
      attemptsUsed,
      timeMs,
      guessHistory,
      feedbackHistory,
      submittedAt: Date.now(),
    });
    
    // Update streak
    const streak = await updateUserStreak(anonId, dayId, serverSolved, mode, wallet);
    
    // Calculate rank and percentile
    const { rank, percentile } = await calculateRankAndPercentile(anonId, dayId);
    
    // Determine claimable rewards
    const claimable = determineClaimableRewards(serverSolved, attemptsUsed, streak.currentStreak);
    
    // Generate share content
    const emojiGridText = generateEmojiGrid(
      feedbackHistory,
      dayId,
      attemptsUsed,
      serverSolved,
      mode,
      streak.currentStreak
    );
    
    const shareLink = `${APP_URL}?d=${dayId}`;
    
    const response: SubmitResponse = {
      accepted: true,
      solved: serverSolved,
      attemptsUsed,
      rank: serverSolved ? rank : undefined,
      percentile: serverSolved ? percentile : undefined,
      streak: {
        current: streak.currentStreak,
        best: streak.bestStreak,
      },
      claimable,
      share: {
        emojiGridText,
        shareLink,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
