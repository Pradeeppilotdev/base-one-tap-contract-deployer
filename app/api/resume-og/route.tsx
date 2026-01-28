import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') || 'User';
    const contractCount = searchParams.get('contracts') || '0';
    const transactions = searchParams.get('transactions') || '0';
    const gasSpent = searchParams.get('gas') || '0.0000';
    const daysActive = searchParams.get('days') || '0';
    const strength = searchParams.get('strength') || 'MEDIUM';

    return new ImageResponse(
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f5f0 0%, #ebebdf 100%)',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#2a2a2a',
              marginBottom: '10px',
            }}
          >
            Base On-Chain Resume
          </div>

          <div
            style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '40px',
            }}
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '40px',
              flex: 1,
            }}
          >
            <div
              style={{
                border: '3px solid #2a2a2a',
                padding: '20px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                CONTRACTS
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#2a2a2a',
                }}
              >
                {contractCount}
              </div>
            </div>

            <div
              style={{
                border: '3px solid #2a2a2a',
                padding: '20px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                TRANSACTIONS
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#2a2a2a',
                }}
              >
                {transactions}
              </div>
            </div>

            <div
              style={{
                border: '3px solid #2a2a2a',
                padding: '20px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                DAYS ACTIVE
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#2a2a2a',
                }}
              >
                {daysActive}
              </div>
            </div>

            <div
              style={{
                border: '3px solid #2a2a2a',
                padding: '20px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                GAS SPENT
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#2a2a2a',
                }}
              >
                {gasSpent} ETH
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginTop: 'auto',
              paddingTop: '20px',
              borderTop: '3px solid #2a2a2a',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#2a2a2a',
              }}
            >
              Reward Strength: {strength}
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('Error generating resume OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
