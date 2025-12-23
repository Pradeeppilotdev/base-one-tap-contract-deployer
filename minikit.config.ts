const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjc4NzgzNywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDk2YzdhQjhiNGQ4ZDY0N0RGNWYxZTJiODRmOWJmODBGODQyRjFmNDMifQ",
    "payload": "eyJkb21haW4iOiJiYXNlLW9uZS10YXAtY29udHJhY3QtZGVwbG95ZXIudmVyY2VsLmFwcCJ9",
    "signature": "DQVP+pFbGv5BK4RF9xhPVIhbJuPjxZBv9JvtDiMToboYBVU9Fu/+TQSf6kz3+3iO9XELtTz3hvOeTahgtZMnZhw="
  },
  frame: {
    version: "1",
    name: "Base Contract Deployer",
    iconUrl: `${ROOT_URL}/icon.png`,
    homeUrl: ROOT_URL,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    webhookUrl: `${ROOT_URL}/api/webhook`,
  },
  miniapp: {
    version: "1",
    name: "Base Contract Deployer",
    subtitle: "1-Tap Deploy on Base",
    description: "Deploy smart contracts to Base blockchain instantly. String Storage, Calculator, Counter - pick a contract, tap deploy, and you're on-chain in seconds!",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1a1a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "developer-tools",
    tags: ["base", "contracts", "deploy", "smart-contracts", "web3", "blockchain", "ethereum", "l2", "1-tap", "no-code", "developer-tools", "defi"],
    heroImageUrl: `${ROOT_URL}/og-image.png`,
    tagline: "Deploy smart contracts to Base in one tap",
    ogTitle: "Base Contract Deployer | 1-Tap Deploy",
    ogDescription: "Deploy smart contracts to Base blockchain with one tap. No code needed!",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;

