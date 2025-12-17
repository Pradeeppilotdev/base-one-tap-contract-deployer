import { NextResponse } from 'next/server';
import { minikitConfig } from '../../../minikit.config';

export async function GET() {
  // Farcaster Mini App Manifest
  // See: https://miniapps.farcaster.xyz/docs/guides/publishing
  const appUrl = "https://base-one-tap-contract-deployer.vercel.app";
  
  const miniappConfig = {
    version: "1",
    name: "Base Contract Deployer",
    developer: "pradeep-pilot",
    iconUrl: `${appUrl}/icon.png`,
    homeUrl: appUrl,
    splashImageUrl: `${appUrl}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    webhookUrl: `${appUrl}/api/webhook`,
    subtitle: "1-Tap Deploy on Base",
    description: "Just deploy pre defined contracts in a click of a button and increase your wallet strength!!",
    primaryCategory: "developer-tools",
    screenshotUrls: [
      `${appUrl}/screenshot.png`
    ],
    heroImageUrl: `${appUrl}/opengraph-image`,
    tags: [
      "base",
      "contracts",
      "deploy",
      "ethereum",
      "web3"
    ],
    tagline: "contracts to Base in one tap",
    ogTitle: "Base Contract Deployer | 1-Tap Deploy",
    ogDescription: "Deploy smart contracts to Base blockchain with one tap. No code needed!",
    ogImageUrl: `${appUrl}/opengraph-image`,
    // Image URL for embed preview (must be set for embed tools)
    imageUrl: `${appUrl}/opengraph-image`,
    // Aspect ratio for embed image (3:2 ratio recommended)
    aspectRatio: "3:2",
    // Cast share URL for sharing casts to the mini app
    castShareUrl: `${appUrl}`,
    // Required chains: Base Mainnet (eip155:8453) and Base Sepolia (eip155:84532)
    requiredChains: ["eip155:8453", "eip155:84532"],
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
