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
A comprehensive 4-page dashboard to track your on-chain activity:

**Page 1 - Overview:**
- Real-time on-chain stats from Basescan API (Base Mainnet)
  - Total transactions, contracts deployed, token transfers, days active
- App activity stats (deploys, clicks, activity score)
- Potential Reward Strength indicator (LOW / MEDIUM / MEDIUM-HIGH / HIGH)

**Page 2 - Activity Diversity:**
- Contract Deployments progress
- Contract Interactions progress
- Different Contract Types deployed
- Multi-day Activity tracking
- Dynamic tips for improvement

**Page 3 - Weekly Activity Planner:**
- 7-day week view (Mon-Sun)
- Daily activity status tracking
- Smart contract suggestions for inactive days
- Weekly goal tracking (5+ days/week)
- Current activity streak counter

**Page 4 - On-Chain Details:**
- ETH balance on Base
- Successful vs failed transactions
- Unique contracts interacted with
- Activity period (first to last transaction)
- Most active day
- Total gas used

### Reward Strength Criteria
| Level | Requirements |
|-------|-------------|
| HIGH | 100+ on-chain txns + 30 days active OR 30+ app deploys + 50+ clicks + 10+ days + 4 contract types |
| MEDIUM-HIGH | 50+ on-chain txns + 15 days active OR 15+ app deploys + 25+ clicks + 7+ days |
| MEDIUM | 20+ on-chain txns OR 5+ app deploys OR 10+ clicks OR 3+ unique days |
| LOW | Below MEDIUM thresholds |

### Social Features
- **Leaderboard** — See top deployers with pagination (10 per page)
  - Sortable by contracts or referrals
  - Shows contracts, referrals, clicks, and first deploy date
- **Referral System** — Share referral codes and earn points
- **Achievement System** — Unlock milestones for deployments
- **Profile Modal** — View your stats, referrals, points, and clicks

### Technical Features
- Farcaster SDK integration for user context
- Firebase Firestore for cross-device data persistence
- **Basescan v2 API integration** for real on-chain wallet stats
- Support for Base Mainnet and Base Sepolia testnet
- Contract verification support via BaseScan API
- Real-time deployment status tracking

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
│   │   ├── wallet-stats/
│   │   │   └── route.ts          # On-chain wallet stats via Basescan v2 API
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
