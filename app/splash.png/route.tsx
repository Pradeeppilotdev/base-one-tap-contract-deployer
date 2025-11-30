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
          flexDirection: 'column',
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
            position: 'relative',
          }}
        >
          {/* Base Circle Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Base "B" stylized as the Base logo */}
            <span
              style={{
                fontSize: 240,
                fontWeight: 900,
                color: '#1a1a1a',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: -12,
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
              width: 144,
              height: 144,
              borderRadius: 24,
              backgroundColor: '#ffffff',
              border: '8px solid #1a1a1a',
              marginTop: -64,
              position: 'relative',
            }}
          >
            {/* Contract/Document Icon */}
            <svg
              width="80"
              height="80"
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

        {/* App Name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 60,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: -2,
            }}
          >
            Base Contract Deployer
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: '#888888',
              fontFamily: 'system-ui, sans-serif',
              marginTop: 8,
            }}
          >
            Deploy smart contracts in one tap
          </span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
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
