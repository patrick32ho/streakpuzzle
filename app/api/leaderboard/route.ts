import { NextRequest, NextResponse } from 'next/server';
import { getDayId } from '@/lib/puzzle';
import { getDailyLeaderboard, getWeeklyLeaderboard } from '@/lib/db';

/**
 * GET /api/leaderboard?scope=daily|weekly&dayId=...
 * Returns leaderboard entries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'daily';
    const dayIdParam = searchParams.get('dayId');
    
    const currentDayId = getDayId();
    const dayId = dayIdParam ? parseInt(dayIdParam, 10) : currentDayId;
    
    // Validate dayId
    if (isNaN(dayId) || dayId < 1 || dayId > currentDayId) {
      return NextResponse.json(
        { error: 'Invalid dayId' },
        { status: 400 }
      );
    }
    
    let entries;
    
    if (scope === 'weekly') {
      entries = await getWeeklyLeaderboard(dayId, 50);
    } else {
      entries = await getDailyLeaderboard(dayId, 50);
    }
    
    return NextResponse.json({
      scope,
      dayId,
      entries,
      total: entries.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
