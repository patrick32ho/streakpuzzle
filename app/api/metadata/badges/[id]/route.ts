import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// Badge type constants (matching contract)
const WEEKLY_STREAK_BASE = 1000000;
const BIWEEKLY_STREAK_BASE = 1000007;
const MONTHLY_STREAK_BASE = 1000014;

/**
 * GET /api/metadata/badges/[id]
 * Returns ERC-1155 metadata for badges
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tokenId = parseInt(id, 10);

  if (isNaN(tokenId) || tokenId < 1) {
    return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 });
  }

  let metadata;

  if (tokenId >= MONTHLY_STREAK_BASE) {
    // 30-day streak badge
    metadata = {
      name: '30-Day Streak Champion',
      description: 'Awarded for completing Grid of the Day puzzles for 30 consecutive days. True dedication!',
      image: `${APP_URL}/badges/streak-30.png`,
      attributes: [
        { trait_type: 'Type', value: 'Streak Badge' },
        { trait_type: 'Streak Days', value: 30 },
        { trait_type: 'Tier', value: 'Champion' },
        { trait_type: 'Transferable', value: 'No' },
      ],
    };
  } else if (tokenId >= BIWEEKLY_STREAK_BASE) {
    // 14-day streak badge
    metadata = {
      name: '14-Day Streak Master',
      description: 'Awarded for completing Grid of the Day puzzles for 14 consecutive days. Impressive!',
      image: `${APP_URL}/badges/streak-14.png`,
      attributes: [
        { trait_type: 'Type', value: 'Streak Badge' },
        { trait_type: 'Streak Days', value: 14 },
        { trait_type: 'Tier', value: 'Master' },
        { trait_type: 'Transferable', value: 'No' },
      ],
    };
  } else if (tokenId >= WEEKLY_STREAK_BASE) {
    // 7-day streak badge
    metadata = {
      name: '7-Day Streak Achiever',
      description: 'Awarded for completing Grid of the Day puzzles for 7 consecutive days. Great job!',
      image: `${APP_URL}/badges/streak-7.png`,
      attributes: [
        { trait_type: 'Type', value: 'Streak Badge' },
        { trait_type: 'Streak Days', value: 7 },
        { trait_type: 'Tier', value: 'Achiever' },
        { trait_type: 'Transferable', value: 'No' },
      ],
    };
  } else {
    // Daily completion badge
    metadata = {
      name: `Grid of the Day #${tokenId}`,
      description: `Completion badge for Grid of the Day puzzle #${tokenId}. Proves you solved this daily challenge!`,
      image: `${APP_URL}/badges/daily.png`,
      attributes: [
        { trait_type: 'Type', value: 'Daily Badge' },
        { trait_type: 'Day', value: tokenId },
        { trait_type: 'Transferable', value: 'No' },
      ],
    };
  }

  return NextResponse.json(metadata);
}
