import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Base On-Chain Resume';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: any }) {
  // This won't work for OG tags because we need URL params, not route params
  // We'll redirect to use the IPFS image directly
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafaf8',
        }}
      >
        <div style={{ fontSize: 40 }}>Loading...</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
