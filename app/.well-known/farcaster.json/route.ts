import { NextResponse } from 'next/server';
import { minikitConfig } from '@/minikit.config';

export async function GET() {
  // Farcaster Mini App Manifest
  // See: https://miniapps.farcaster.xyz/docs/guides/publishing
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    // frame property for backward compatibility
    frame: minikitConfig.frame,
    // miniapp property for new Mini App standard
    miniapp: minikitConfig.miniapp,
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
