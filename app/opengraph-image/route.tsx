import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');
    const fid = searchParams.get('fid');
    const username = searchParams.get('username');
    const displayName = searchParams.get('displayName');
    const pfpUrl = searchParams.get('pfpUrl');
    
    // Check referrer header for ref parameter (when shared link is opened)
    const referer = request.headers.get('referer') || '';
    const refererUrl = referer ? new URL(referer) : null;
    const refFromReferer = refererUrl?.searchParams.get('ref');
    
    // Use ref from query params or referer
    const finalRef = ref || refFromReferer;
    const finalFid = fid || (finalRef ? finalRef.replace('ref-', '') : null);
    
    // If ref parameter exists, show referrer's info
    const isReferralShare = finalRef && finalFid;
    
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

        {/* Referrer Info Section (if sharing with ref) */}
        {isReferralShare ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 80,
              gap: 20,
            }}
          >
            {/* "Deploy based like me!!" Text */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'system-ui, sans-serif',
                textAlign: 'center',
                letterSpacing: '-1px',
              }}
            >
              Deploy based like me!!
            </div>
            
            {/* Referrer Profile Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '20px 40px',
                backgroundColor: '#2a2a2a',
                borderRadius: 16,
                border: '3px solid #3a3a3a',
              }}
            >
              {/* Profile Picture */}
              {pfpUrl && decodeURIComponent(pfpUrl) !== 'null' && decodeURIComponent(pfpUrl) !== '' ? (
                <img
                  src={decodeURIComponent(pfpUrl)}
                  alt="Referrer"
                  width="80"
                  height="80"
                  style={{
                    borderRadius: '50%',
                    border: '3px solid #ffffff',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #ffffff',
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: '#1a1a1a',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {displayName ? decodeURIComponent(displayName)[0]?.toUpperCase() : (username && decodeURIComponent(username) !== 'null' ? decodeURIComponent(username)[0]?.toUpperCase() : finalFid?.[0] || 'U')}
                  </span>
                </div>
              )}
              
              {/* User Info */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {displayName && decodeURIComponent(displayName) !== 'null' ? decodeURIComponent(displayName) : (username && decodeURIComponent(username) !== 'null' && decodeURIComponent(username) !== '' ? decodeURIComponent(username) : `FID ${finalFid}`)}
                </div>
                {username && decodeURIComponent(username) !== 'null' && decodeURIComponent(username) !== '' && (
                  <div
                    style={{
                      fontSize: 24,
                      color: '#a0a0a0',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    @{decodeURIComponent(username)} • FID {finalFid}
                  </div>
                )}
                {(!username || decodeURIComponent(username) === 'null' || decodeURIComponent(username) === '') && (
                  <div
                    style={{
                      fontSize: 24,
                      color: '#a0a0a0',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    FID {finalFid}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Default Tagline (if no ref) */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 80,
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
        )}
      </div>
    ),
    {
      width: 1200,
      height: 800, // 3:2 aspect ratio (1200:800 = 3:2)
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    }
  );
  } catch (error) {
    console.error('Error generating opengraph image:', error);
    // Return a simple error image or redirect to a static fallback
    return new Response('Failed to generate image', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}











