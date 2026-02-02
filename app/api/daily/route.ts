import { NextResponse } from 'next/server';
import {
  getDayId,
  generateDailySolution,
  generatePuzzleCommitment,
  signDailyMetadata,
} from '@/lib/puzzle';
import type { DailyMetadata } from '@/lib/db';

const DAILY_SECRET = process.env.DAILY_SECRET || 'CHANGEME_DAILY_SECRET';
const COMMITMENT_SALT = process.env.COMMITMENT_SALT || 'CHANGEME_COMMITMENT_SALT';

/**
 * GET /api/daily
 * Returns daily puzzle metadata (signed) WITHOUT the solution.
 * The solution stays server-side for security.
 */
export async function GET() {
  try {
    const dayId = getDayId();
    
    // Generate solution (server-side only)
    const solution = generateDailySolution(dayId, DAILY_SECRET);
    
    // Generate commitment hash (proves solution existed)
    const puzzleCommitment = generatePuzzleCommitment(solution, dayId, COMMITMENT_SALT);
    
    // Sign the metadata
    const issuedAt = Date.now();
    const signature = signDailyMetadata(dayId, puzzleCommitment, DAILY_SECRET);
    
    const metadata: DailyMetadata = {
      dayId,
      tokenSetVersion: 1, // Version of the token set (in case we change tokens later)
      puzzleCommitment,
      issuedAt,
      signature,
    };
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating daily metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily puzzle' },
      { status: 500 }
    );
  }
}
