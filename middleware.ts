import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Remove any X-Frame-Options header that might block iframe embedding
  response.headers.delete('X-Frame-Options');
  
  // Set permissive Content-Security-Policy for frame-ancestors
  // This allows Farcaster to embed our app in an iframe
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://warpcast.com https://farcaster.xyz https://farcaster.xyz *; img-src 'self' blob: data:;"
  );

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};




