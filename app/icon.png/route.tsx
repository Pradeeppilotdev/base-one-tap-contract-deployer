import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const image = await new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Logo Container - Base Logo with Contract Symbol */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Base Circle Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 600,
              height: 600,
              borderRadius: 300,
              backgroundColor: '#ffffff',
            }}
          >
            {/* Base "B" stylized as the Base logo */}
            <span
              style={{
                fontSize: 380,
                fontWeight: 900,
                color: '#1a1a1a',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: '-20px',
              }}
            >
              B
            </span>
          </div>

          {/* Contract Symbol at bottom of logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 200,
              borderRadius: 32,
              backgroundColor: '#ffffff',
              border: '12px solid #1a1a1a',
              marginTop: -100,
            }}
          >
            {/* Contract/Document Icon */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="12" y2="17" />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );

  return new Response(image.body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
