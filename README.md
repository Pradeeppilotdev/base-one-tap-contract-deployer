# Base One-Tap Contract Deployer

A Farcaster Mini App that helps users boost their wallet activity on Base blockchain. Deploy smart contracts, interact with on-chain contracts, and track your wallet health — all designed to help users build on-chain credibility.
One Place to Know and Do Everything!

## Features

### Core Functionality
- **One-tap contract deployment** — Deploy smart contracts directly from the web UI
- **On-chain interactions** — Click counter for easy contract interactions
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
- Activity Score (out of 1000)
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
- **Contracts Deployed** — List of deployed contracts with count badge
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
```

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
```

## Deploying / Hosting

Deploy on Vercel (recommended):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

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
