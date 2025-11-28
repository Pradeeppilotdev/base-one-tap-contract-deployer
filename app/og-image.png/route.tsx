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
            marginBottom: 40,
          }}
        >
          {/* Base Circle Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Base "B" stylized as the Base logo */}
            <span
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: '#1a1a1a',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: -5,
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
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              border: '4px solid #1a1a1a',
              marginTop: -24,
              position: 'relative',
            }}
          >
            {/* Contract/Document Icon */}
            <svg
              width="32"
              height="32"
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

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-2px',
              marginBottom: 16,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Base Contract Deployer
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#a0a0a0',
              fontWeight: 500,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Deploy smart contracts with one tap
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 60,
            gap: 16,
            padding: '16px 32px',
            backgroundColor: '#ffffff',
            borderRadius: 100,
          }}
        >
          <span style={{ 
            fontSize: 24, 
            color: '#1a1a1a', 
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
          }}>
            No code needed • Instant deploy • On-chain in seconds
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
