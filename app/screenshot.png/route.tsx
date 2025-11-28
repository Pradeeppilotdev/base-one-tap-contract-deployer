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
          backgroundColor: '#1a1a1a',
          padding: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 60,
          }}
        >
          {/* Logo Container - Base Logo with Contract Symbol */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            {/* Base Circle Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#ffffff',
              }}
            >
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: '#1a1a1a',
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '-3px',
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
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#ffffff',
                border: '3px solid #1a1a1a',
                marginTop: -16,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.5"
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

          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Base Contract Deployer
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#a0a0a0',
              marginTop: 12,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Deploy smart contracts with one tap
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#2a2a2a',
            border: '3px solid #3a3a3a',
            borderRadius: 16,
            padding: 40,
          }}
        >
          {/* Contract Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['String Storage', 'Calculator', 'Simple Counter'].map((name, i) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 24,
                  border: i === 0 ? '3px solid #ffffff' : '2px solid #4a4a4a',
                  borderRadius: 12,
                  backgroundColor: i === 0 ? '#3a3a3a' : '#2a2a2a',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    border: '3px solid #ffffff',
                    backgroundColor: i === 0 ? '#ffffff' : 'transparent',
                    marginRight: 16,
                  }}
                />
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: 600, 
                  color: '#ffffff',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Deploy Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 40,
              padding: 24,
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              fontSize: 24,
              fontWeight: 700,
              borderRadius: 12,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Deploy Contract to Base
          </div>
        </div>
      </div>
    ),
    {
      width: 1284,
      height: 2778,
    }
  );
}
