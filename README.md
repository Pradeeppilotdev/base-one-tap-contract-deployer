# Base One-Tap Contract Deployer

A Farcaster Mini App that helps users boost their wallet activity on Base blockchain. Deploy smart contracts, interact with on-chain contracts, and track your wallet health — all designed to help users build on-chain credibility.
One Place to Know and Do Everything!

## Features

### Core Functionality
- **One-tap contract deployment** — Deploy smart contracts directly from the web UI
- **On-chain interactions** — Click counter for easy contract interactions
- **Gas tracking** — Real-time gas cost monitoring with retroactive fetching for historical contracts
- **Real-time ETH pricing** — Auto-refreshing ETH/USD rates from CoinMarketCap (cached 5 hours in Firebase)
- **Wallet health metrics** — Current balance, gas spent, activity score, and reward strength
- **Shareable On-Chain Resume** — Export wallet metrics as beautiful PNG images with download & social sharing
- **Multiple contract templates**:
  - String Storage — store and retrieve strings
  - Calculator — simple arithmetic operations
  - Counter — increment/decrement counter
  - Click Counter — track on-chain clicks

### Wallet Health Dashboard
A comprehensive 4-page collapsible dashboard to track your on-chain activity:

**Page 1 - Overview:**
- Contracts Deployed count
- Unique Days Active
- Total Transactions
- Gas Spent — Total gas spent across all deployments in ETH and USD
- Activity Score (out of 1000)
- ETH Price (Live) — Real-time ETH/USD rate from CoinMarketCap with auto-refresh
- Wallet Balance — Current balance in ETH and USD
- Potential Reward Strength indicator (LOW / MEDIUM / MEDIUM-HIGH / HIGH)

**Page 2 - Activity Diversity:**
- Contract Deployments progress
- Contract Interactions progress
- Different Contract Types deployed
- Multi-day Activity tracking
- Dynamic tips for improvement

**Page 3 - Weekly Activity Planner:**
- 7-day week view (Mon-Sun) with elegant dot indicators
- Daily activity status (● filled, ○ empty, ✕ missed)
- Smart contract suggestions for inactive days
- "Missed :(" indicator for past missed days
- Weekly goal tracking (5+ days/week)
- Current activity streak counter

**Page 4 - Activity Heatmap:**
- Visual representation of last 30 days activity with Unicode blocks
- Weekly action blocks (████████░░░░ style, screenshot-friendly)
- Best day stats
- Longest streak counter
- Activity level badge (GETTING STARTED / WARMING UP / ACTIVE / POWER USER)

### Collapsible Sections
All major sections feature consistent expand/collapse UI with chevron icons:
- **Wallet Health** — 4-page dashboard with pagination
  - Gas Tracker shows total gas spent with retroactive ETH→USD conversion
  - Real-time ETH prices fetched from CoinMarketCap (5-hour cache)
  - Wallet balance widget with auto-refresh every 30 seconds
- **Contracts Deployed** — List of deployed contracts with count badge and sorting
  - Sort by newest or oldest deployment dates
  - Copy contract address with one click
  - Verify contracts on BaseScan
- **Leaderboard** — Rankings with sorting and pagination
- **Network Selection** — Choose between Base Mainnet or Sepolia testnet
- **Your Stats & Achievements** — Stats and achievement progression

### Reward Strength Criteria
| Level | Requirements |
|-------|-------------|
| HIGH | 30+ contracts, 50+ clicks, 10+ unique days, 4 contract types |
| MEDIUM-HIGH | 15+ contracts, 25+ clicks, 7+ unique days |
| MEDIUM | 5+ contracts OR 10+ clicks OR 3+ unique days |
| LOW | Below MEDIUM thresholds |

### Achievement System
11 achievement milestones with pagination (6 per page):
- **Deploy 1** — First Deploy
- **Deploy 5** — Power User
- **Deploy 10** — Contract Master
- **Deploy 20** — Deployment Legend
- **Deploy 50** — Base Builder
- **Deploy 100** — Contract Deity
- **Deploy 200** — Mega Creator
- **Deploy 300** — Unstoppable Force
- **Deploy 500** — Blockchain Pioneer
- **Deploy 750** — Web3 Visionary
- **Deploy 1000** — Legendary Builder

### Social Features
- **Leaderboard** — See top deployers with pagination (10 per page)
  - Sortable by Contracts, Referrals, Clicks, and First Deploy date
  - Clickable user profiles redirecting to Farcaster
  - Shows FarcasterID with username, display name, and PFP
- **Referral System** — Share referral codes and earn points
- **Achievement System** — Unlock 11 milestones up to 1000 deployments
- **Profile Modal** — View your stats, referrals, points, and clicks

### Visual & UX Features
- Pencil sketch aesthetic with hand-drawn borders
- Smooth fade animations for success messages (auto-disappear after 1.5 seconds)
- Responsive mobile design with proper flex layouts
- Consistent color scheme using CSS variables (--ink, --paper, --graphite, etc.)
- Icons for all major sections and actions
- Real-time transaction status with auto-clearing

### Technical Features
- Farcaster SDK integration for user context
- Firebase Firestore for cross-device data persistence
- Support for Base Mainnet and Base Sepolia testnet
- Contract verification support via BaseScan API
- Real-time deployment status tracking with automatic cleanup
- Leaderboard sorting and pagination with smart contract interaction

## Prerequisites

- Farcaster account (for using the mini-app)
- A wallet that supports the Base network
- Node.js 18+ installed
- Firebase project (for data persistence)
- (Optional) Vercel account for hosting

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
BASESCAN_API_KEY=your_basescan_api_key
CMC_PRO_API_KEY=your_coinmarketcap_api_key
```

**For hosted deployments (Vercel):**
Also add `CMC_PRO_API_KEY` to your platform's environment variables settings. The CoinMarketCap API key is used server-side to fetch real-time ETH prices and is never exposed to the client.

## Quickstart — Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see above)
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 in your browser.

Common npm scripts:
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production build

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── eth-price/
│   │   │   └── route.ts          # Real-time ETH price API with Firebase caching
│   │   ├── leaderboard/
│   │   │   └── route.ts          # Leaderboard aggregation API
│   │   ├── user-data/
│   │   │   └── route.ts          # User data persistence API
│   │   ├── track-referral/
│   │   │   └── route.ts          # Referral tracking API
│   │   ├── validate-referral/
│   │   │   └── route.ts          # Referral validation API
│   │   ├── user-referral-info/
│   │   │   └── route.ts          # User referral info API
│   │   ├── verify-contract/
│   │   │   └── route.ts          # Contract verification API
│   │   └── webhook/
│   │       └── route.ts          # Webhook endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles & animations
├── components/
│   └── ContractDeployer.tsx      # Main contract deployer component
├── contracts/
│   ├── StringStorage.sol         # String storage contract
│   ├── Calculator.sol            # Calculator contract
│   ├── Counter.sol               # Counter contract
│   └── ClickCounter.sol          # Click counter contract
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   └── wagmi.ts                  # Wagmi configuration
├── minikit.config.ts             # Mini app configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Project dependencies
```

## Firebase Data Structure

```
users/{walletAddress}
├── contracts[]           # Deployed contracts array
│   ├── address          # Contract address
│   ├── contractType     # Contract template type
│   ├── contractName     # Contract name
│   ├── txHash           # Transaction hash
│   ├── timestamp        # Deployment timestamp
│   ├── inputValue       # Constructor input (if any)
│   ├── gasSpent         # Gas cost in Wei
│   └── network          # Network (mainnet/testnet)
├── achievements[]        # Unlocked achievements
├── clicks               # Total click count
├── fid                  # Farcaster ID
├── username             # Farcaster username
├── displayName          # Display name
├── pfpUrl               # Profile picture URL
└── lastUpdated          # Timestamp

referrals/{fid}
├── referralCount        # Number of referrals
├── totalPoints          # Points earned
├── referredUsers[]      # List of referred users
└── username             # Referrer username

system/eth_price
├── price                # Current ETH price in USD
└── timestamp            # Last fetch timestamp (5-hour cache)
```

## Gas Tracker & Real-Time Pricing

### Gas Tracking
The app automatically tracks gas costs for all deployed contracts:
- **Real-time calculation** — Gas cost fetched from blockchain via `eth_getTransactionReceipt`
- **Retroactive fetching** — Older contracts are updated when first loaded
- **ETH & USD display** — Automatic conversion using real-time ETH prices
- **Cumulative stats** — Total gas spent shown in Wallet Health overview

### Real-Time ETH Price Feed
Powered by CoinMarketCap API with smart caching:
- **Fetch frequency** — Every 5 hours from CoinMarketCap, or on-demand if cache expires
- **Firebase caching** — Prices cached in Firestore at `system/eth_price` document
- **Fallback chain** — Valid cache → CoinMarketCap → Expired cache → $2500 default
- **Auto-refresh** — Client updates prices automatically every 5 hours
- **USD conversion** — All currency displays use real-time rates

## Shareable On-Chain Resume

A viral feature that lets users showcase their wallet metrics:

**Features:**
- **Beautiful Resume Card** — Displays key metrics in a professionally designed format
- **Key Metrics Displayed**:
  - Contracts Deployed
  - Total Transactions
  - Days Active
  - Gas Spent (ETH)
  - Reward Strength Level (LOW / MEDIUM / MEDIUM-HIGH / HIGH)
- **Download as PNG** — Export resume as high-quality image with watermark
- **Social Sharing**:
  - Share directly to Twitter/X with pre-filled metrics
  - Share to Farcaster with formatted text
  - Pre-generated social captions included

**Why It's Viral:**
- Users want to flex their on-chain credentials
- Screenshot-friendly design for Twitter/Farcaster
- Includes "Base Deployer 🚀" watermark for attribution
- Inspires others to build their own activity metrics
- Perfect for proving wallet credibility for airdrops

**Technical Details:**
- Uses `html2canvas` library for DOM-to-image conversion
- Renders with white background for optimal sharing
- Automatic wallet address display (truncated)
- Responsive design works on all devices
- Social sharing uses native web share APIs and platform URLs

## Deploying / Hosting

Deploy on Vercel (recommended):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard:
   - All Firebase environment variables (from `.env.local`)
   - `BASESCAN_API_KEY` for contract verification
   - `CMC_PRO_API_KEY` for real-time ETH prices (**important**)
4. Update `minikit.config.ts` with your production URL
5. Deploy

**Note:** Without `CMC_PRO_API_KEY` set in the hosting platform's environment variables, the ETH price feed will fall back to the cached price or default $2500.

## Mini App Configuration

1. Update `minikit.config.ts` with your production URL
2. Generate `accountAssociation` at: https://www.base.dev/preview?tab=account
3. Update the config with credentials
4. Validate at https://base.dev/preview
5. Publish via Farcaster

## Security & Notes

- This app is a utility for wallet activity. Review contracts before using with real funds.
- Keep private keys and secrets in environment variables
- Firebase rules should be configured for proper access control
- **Firestore permissions:** The app requires the following rules for the system collection:
  ```
  match /system/{document=**} {
    allow read, write: if true;
  }
  ```
  This allows the ETH price cache to be read and written by all users.
- **CoinMarketCap API:** This is a server-side only API call. Your API key is never exposed to the client and cannot be stolen from the browser console.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a PR with description
4. Add tests where appropriate

## License

MIT

## Acknowledgements

- Base Developer Docs: https://www.base.dev
- Farcaster SDK: https://docs.farcaster.xyz
