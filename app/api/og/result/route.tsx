import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Define constants inline to avoid importing crypto module
type FeedbackType = 'correct' | 'wrongPos' | 'absent';
const FEEDBACK_COLORS: Record<FeedbackType, string> = {
  correct: '#22C55E',
  wrongPos: '#EAB308',
  absent: '#6B7280',
};
const MAX_ATTEMPTS = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const dayId = searchParams.get('dayId') || '1';
  const solved = searchParams.get('solved') === 'true';
  const tries = searchParams.get('tries') || '6';
  const streak = searchParams.get('streak') || '0';
  const mode = searchParams.get('mode') || 'normal';
  const grid = searchParams.get('grid') || '';

  // Parse grid string (e.g., "cwwaa,ccccc" -> feedback arrays)
  const rows = grid.split(',').filter(Boolean);
  const gridData: FeedbackType[][] = rows.map(row => 
    row.split('').map(char => {
      switch (char) {
        case 'c': return 'correct';
        case 'w': return 'wrongPos';
        default: return 'absent';
      }
    })
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 8px 0',
            }}
          >
            Grid of the Day #{dayId}
          </h1>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '32px',
              color: solved ? '#22C55E' : '#EF4444',
            }}
          >
            <span>{solved ? `${tries}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`}</span>
            {mode === 'hard' && <span style={{ color: '#F59E0B' }}>★ Hard</span>}
            {parseInt(streak) > 0 && (
              <span style={{ color: '#F97316' }}>🔥 {streak}</span>
            )}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {gridData.map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              {row.map((cell, cellIdx) => (
                <div
                  key={cellIdx}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: FEEDBACK_COLORS[cell],
                    borderRadius: '8px',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0052FF',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Play on Base
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
