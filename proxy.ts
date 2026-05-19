import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.delete('X-Frame-Options');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://warpcast.com https://farcaster.xyz https://farcaster.xyz *; img-src 'self' blob: data: https:;"
  );

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/:path*',
};
