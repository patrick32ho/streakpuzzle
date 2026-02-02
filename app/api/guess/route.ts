import { NextRequest, NextResponse } from 'next/server';
import {
  getDayId,
  generateDailySolution,
  calculateFeedback,
  isWinningGuess,
  stringToGuess,
  SEQUENCE_LENGTH,
  FeedbackType,
} from '@/lib/puzzle';

const DAILY_SECRET = process.env.DAILY_SECRET || 'CHANGEME_DAILY_SECRET';

interface GuessRequest {
  dayId: number;
  guess: string; // "R,G,B,Y,P" format
}

interface GuessResponse {
  valid: boolean;
  feedback: FeedbackType[];
  solved: boolean;
  error?: string;
}

/**
 * POST /api/guess
 * Validate a single guess and return feedback
 * This is used during gameplay to get feedback without submitting final result
 */
export async function POST(request: NextRequest) {
  try {
    const body: GuessRequest = await request.json();
    const { dayId, guess: guessStr } = body;
    
    // Validate dayId
    const currentDayId = getDayId();
    if (dayId !== currentDayId) {
      return NextResponse.json(
        { valid: false, error: 'Invalid dayId' },
        { status: 400 }
      );
    }
    
    // Parse and validate guess
    const guess = stringToGuess(guessStr);
    if (guess.length !== SEQUENCE_LENGTH) {
      return NextResponse.json(
        { valid: false, error: 'Invalid guess format' },
        { status: 400 }
      );
    }
    
    // Get solution and calculate feedback
    const solution = generateDailySolution(dayId, DAILY_SECRET);
    const feedback = calculateFeedback(guess, solution);
    const solved = isWinningGuess(feedback);
    
    const response: GuessResponse = {
      valid: true,
      feedback,
      solved,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing guess:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to process guess' },
      { status: 500 }
    );
  }
}
