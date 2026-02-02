import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// Frame definitions
const FRAMES: Record<number, { name: string; description: string; image: string; rarity: string }> = {
  1: {
    name: 'Perfect Frame',
    description: 'Awarded for solving a Grid of the Day puzzle in just 1 attempt. Pure skill or pure luck?',
    image: `${APP_URL}/frames/perfect.png`,
    rarity: 'Legendary',
  },
  2: {
    name: 'Quick Solver Frame',
    description: 'Awarded for solving a Grid of the Day puzzle in 2 attempts or less. Speed demon!',
    image: `${APP_URL}/frames/quick.png`,
    rarity: 'Epic',
  },
  3: {
    name: 'On Fire Frame',
    description: 'Awarded for maintaining a streak of 3 or more days. Keep the flame alive!',
    image: `${APP_URL}/frames/fire.png`,
    rarity: 'Rare',
  },
};

/**
 * GET /api/metadata/frames/[id]
 * Returns ERC-1155 metadata for cosmetic frames
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const frameId = parseInt(id, 10);

  if (isNaN(frameId) || frameId < 1 || frameId > 100) {
    return NextResponse.json({ error: 'Invalid frame ID' }, { status: 400 });
  }

  const frame = FRAMES[frameId];

  if (!frame) {
    // Generic frame for undefined IDs
    return NextResponse.json({
      name: `Frame #${frameId}`,
      description: 'A cosmetic frame for your Grid of the Day profile.',
      image: `${APP_URL}/frames/default.png`,
      attributes: [
        { trait_type: 'Type', value: 'Frame' },
        { trait_type: 'ID', value: frameId },
        { trait_type: 'Transferable', value: 'Yes' },
      ],
    });
  }

  return NextResponse.json({
    name: frame.name,
    description: frame.description,
    image: frame.image,
    attributes: [
      { trait_type: 'Type', value: 'Frame' },
      { trait_type: 'Rarity', value: frame.rarity },
      { trait_type: 'ID', value: frameId },
      { trait_type: 'Transferable', value: 'Yes' },
    ],
  });
}
