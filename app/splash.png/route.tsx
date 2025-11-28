import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Base "B" stylized as the Base logo */}
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#1a1a1a',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: -4,
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
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: '#ffffff',
              border: '3px solid #1a1a1a',
              marginTop: -20,
              position: 'relative',
            }}
          >
            {/* Contract/Document Icon */}
            <svg
              width="28"
              height="28"
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
            marginTop: 24,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: -1,
            }}
          >
            Base Contract Deployer
          </span>
        </div>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}
