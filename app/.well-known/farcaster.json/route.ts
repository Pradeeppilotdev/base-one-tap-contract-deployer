import { NextResponse } from 'next/server';
import { minikitConfig } from '@/minikit.config';

export async function GET() {
  // Farcaster Mini App Manifest
  // See: https://miniapps.farcaster.xyz/docs/guides/publishing
  const miniappConfig = {
    version: "1",
    name: "Base Contract Deployer",
    iconUrl: "https://base-one-tap-contract-deployer.vercel.app/icon.png",
    homeUrl: "https://base-one-tap-contract-deployer.vercel.app",
    splashImageUrl: "https://base-one-tap-contract-deployer.vercel.app/splash.png",
    splashBackgroundColor: "#1a1a1a",
    webhookUrl: "https://base-one-tap-contract-deployer.vercel.app/api/webhook",
    subtitle: "1-Tap Deploy on Base",
    description: "Just deploy pre defined contracts in a click of a button and increase your wallet strength!!",
    primaryCategory: "developer-tools",
    screenshotUrls: [
      "https://base-one-tap-contract-deployer.vercel.app/screenshot.png"
    ],
    heroImageUrl: "https://base-one-tap-contract-deployer.vercel.app/og-image.png",
    tags: [
      "base",
      "contracts",
      "deploy",
      "ethereum",
      "web3"
    ],
    tagline: "contracts to Base in one tap",
    ogTitle: "contracts to Base in one tap",
    ogDescription: "Deploy smart contracts to Base blockchain with one tap. No code needed!",
    ogImageUrl: "https://base-one-tap-contract-deployer.vercel.app/og-image.png",
    // Deprecated properties for backward compatibility
    imageUrl: "https://base-one-tap-contract-deployer.vercel.app/og-image.png",
    buttonTitle: "Deploy Based!",
  };

  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    // miniapp property for new Mini App standard
    miniapp: miniappConfig,
    // frame property for backward compatibility
    frame: miniappConfig,
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
