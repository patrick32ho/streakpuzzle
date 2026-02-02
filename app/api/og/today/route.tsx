import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Calculate dayId directly to avoid importing crypto module
function getDayIdEdge(): number {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const baseDate = new Date(Date.UTC(2024, 0, 1));
  const diffTime = utcDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export async function GET() {
  const dayId = getDayIdEdge();

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
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: color,
                    borderRadius: '8px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 16px 0',
              textAlign: 'center',
            }}
          >
            Grid of the Day
          </h1>

          {/* Day */}
          <p
            style={{
              fontSize: '36px',
              color: '#0052FF',
              margin: '0 0 32px 0',
            }}
          >
            #{dayId}
          </p>

          {/* CTA */}
          <div
            style={{
              backgroundColor: '#0052FF',
              padding: '16px 48px',
              borderRadius: '12px',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Play Today
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
