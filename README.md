# Base One-Tap Contract Deployer

A Farcaster Mini App that helps users build on-chain credibility on Base. Deploy smart contracts with one tap, generate contracts with AI, track wallet health, and compete on the leaderboard.

One Place to Know and Do Everything!

## Features

### Core Functionality
- **One-tap contract deployment** — Deploy pre-built contracts or custom Solidity code directly from the UI
- **AI-powered contract generation** — Describe your contract idea in plain English and get ready-to-deploy Solidity code
- **Custom Solidity compiler** — Write, compile, and deploy your own Solidity contracts (browser-side compilation via API)
- **Contract drafts** — Save AI-generated drafts for later deployment
- **Contract verification** — Auto-verify contracts on BaseScan
- **Global Activity Feed** — See live deployments from all users in real-time
- **Click counter** — On-chain interaction tracking
- **Gas tracking** — Real-time gas cost monitoring with retroactive fetching for historical contracts
- **Real-time ETH pricing** — Auto-refreshing ETH/USD rates from CoinMarketCap (cached 5 hours in Firebase)
- **Wallet health dashboard** — 4-page collapsible dashboard with contract count, gas spent, activity score, and reward strength
- **Daily streak tracking** — Track consecutive deployment days with milestone celebrations
- **Shareable On-Chain Resume** — Export wallet metrics as beautiful PNG images with download & social sharing
- **Referral system** — Share referral codes and earn points
- **Achievement system** — 11 milestones from 1 to 1000 deployments

### Contract Templates
- String Storage — store and retrieve strings
- Calculator — simple arithmetic operations
- Counter — increment/decrement counter
- Greeter — personalized greeting contract
- Message Board — public message board
- Number Store — store a number
- Click Counter — track on-chain clicks
- Custom Contract — write your own Solidity code

### Wallet Health Dashboard
A comprehensive 4-page collapsible dashboard to track your on-chain activity:

**Page 1 - Overview:**
- Contracts Deployed count
- Unique Days Active
- Total Transactions
- Gas Spent — Total gas across all deployments in ETH and USD
- Activity Score (out of 1000)
- ETH Price (Live) — Real-time ETH/USD rate from CoinMarketCap
- Wallet Balance — Current balance in ETH and USD
- Potential Reward Strength indicator (LOW / MEDIUM / MEDIUM-HIGH / HIGH)

**Page 2 - Activity Diversity:**
- Contract Deployments progress
- Contract Interactions progress
- Different Contract Types deployed
- Multi-day Activity tracking
- Dynamic tips for improvement

**Page 3 - Weekly Activity Planner:**
- 7-day week view (Mon-Sun) with dot indicators
- Daily activity status
- Smart contract suggestions for inactive days
- Weekly goal tracking (5+ days/week)
- Current activity streak counter

**Page 4 - Activity Heatmap:**
- Visual representation of last 30 days activity
- Weekly action blocks
- Best day stats
- Longest streak counter
- Activity level badge

### Live Activity Feed
- See real-time deployments from all users
- Auto-refreshes every 30 seconds
- Shows user avatars, contract names, and deployment times
- Click through to view contracts on BaseScan

### AI Contract Generation
- Describe your contract idea in natural language
- Example prompts: Tip Jar, Voting, Guestbook, Meme Coin, Allowlist
- Daily contract idea suggestions
- Save generated contracts as drafts for later
- Share generated contract ideas on Farcaster

### Reward Strength Criteria
| Level | Requirements |
|-------|-------------|
| HIGH | 30+ contracts, 50+ clicks, 10+ unique days, 4 contract types |
| MEDIUM-HIGH | 15+ contracts, 25+ clicks, 7+ unique days |
| MEDIUM | 5+ contracts OR 10+ clicks OR 3+ unique days |
| LOW | Below MEDIUM thresholds |

### Achievement System
11 achievement milestones:
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
- **Leaderboard** — Top deployers sorted by contracts, referrals, clicks, or first deploy date
- **Referral System** — Share codes, earn points, track referred users
- **Global Activity Feed** — See who's deploying what in real-time
- **On-Chain Resume** — Export and share your wallet credentials

### Visual & UX Features
- Pencil sketch aesthetic with hand-drawn borders
- Smooth animations for success, achievements, and streak milestones
- Confetti celebrations for streak milestones
- Sound effects with toggle (click, success, achievement, error)
- Responsive mobile design
- Dark mode support

### Technical Features
- Farcaster SDK integration for user context
- Firebase Firestore for cross-device data persistence
- Funnel analytics for tracking user journey
- Support for Base Mainnet and Base Sepolia testnet
- Contract verification via BaseScan API
- Daily streak system with at-risk notifications
- IPFS upload for resume images
- Cron jobs for streak checks and user re-engagement

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
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
BASESCAN_API_KEY=your_basescan_api_key
CMC_PRO_API_KEY=your_coinmarketcap_api_key
```

**For hosted deployments (Vercel):**
Add all env vars to your Vercel project settings. The CoinMarketCap API key is used server-side only.

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
- `npm run lint` — run linter

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── ai-generate/           # AI contract generation
│   │   ├── compile/               # Solidity compiler
│   │   ├── cron/                  # Streak checks & re-engagement
│   │   ├── eth-price/             # Real-time ETH price with Firebase caching
│   │   ├── funnel-event/          # Funnel analytics tracking
│   │   ├── global-activity/       # Live activity feed
│   │   ├── ipfs-upload/           # IPFS resume image upload
│   │   ├── leaderboard/           # Leaderboard aggregation
│   │   ├── resume-og/             # Resume OG image generation
│   │   ├── save-notification-token/
│   │   ├── send-notification/     # Farcaster notifications
│   │   ├── track-referral/        # Referral tracking
│   │   ├── user-data/             # User data persistence
│   │   ├── user-referral-info/    # Referral info
│   │   ├── validate-referral/     # Referral validation
│   │   ├── verify-contract/       # Contract verification
│   │   └── webhook/               # Webhook endpoint
│   ├── resume/                    # Shareable On-Chain Resume page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page
│   └── globals.css                # Global styles & animations
├── components/
│   └── ContractDeployer.tsx       # Main application component (~7000 lines)
├── contracts/                     # Solidity source files
│   ├── StringStorage.sol
│   ├── Calculator.sol
│   ├── Counter.sol
│   ├── Greeter.sol
│   ├── MessageBoard.sol
│   ├── NumberStore.sol
│   ├── ClickCounter.sol
│   └── ContractFactory.sol
├── lib/
│   ├── firebase.ts                # Firebase configuration
│   └── wagmi.ts                   # Wagmi configuration
├── providers/
│   └── WagmiProvider.tsx          # Wagmi provider
├── types/                         # TypeScript type declarations
├── minikit.config.ts              # Mini app configuration
├── next.config.js                 # Next.js configuration
├── hardhat.config.ts              # Hardhat configuration
└── package.json                   # Project dependencies
```

## Firebase Data Structure

```
users/{walletAddress}
├── contracts[]               # Deployed contracts array
│   ├── address               # Contract address
│   ├── contractType          # Contract template type
│   ├── contractName          # Contract name
│   ├── txHash                # Transaction hash
│   ├── timestamp             # Deployment timestamp
│   ├── inputValue            # Constructor input (if any)
│   ├── gasSpent              # Gas cost in Wei
│   └── network               # Network (mainnet/testnet)
├── achievements[]            # Unlocked achievements
├── clicks                    # Total click count
├── fid                       # Farcaster ID
├── username                  # Farcaster username
├── displayName               # Display name
├── pfpUrl                    # Profile picture URL
├── currentStreak             # Current daily streak
├── longestStreak             # Longest streak
├── lastActiveDate            # Last active date (YYYY-MM-DD)
├── referralPoints            # Referral points earned
├── referredBy                # Referrer FID
└── lastUpdated               # Timestamp

referrals/{fid}
├── referralCount             # Number of referrals
├── totalPoints               # Points earned
├── referredUsers[]           # List of referred users
└── username                  # Referrer username

system/eth_price
├── price                     # Current ETH price in USD
└── timestamp                 # Last fetch timestamp (5-hour cache)

funnelEvents/ (auto-generated)
├── event                     # Event type
├── sessionId                 # User session
├── walletAddress             # Wallet address
├── fid                       # Farcaster ID
├── metadata                  # Event metadata
└── createdAt                 # Server timestamp
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
- **Key Metrics Displayed**: Contracts Deployed, Total Transactions, Days Active, Gas Spent (ETH), Reward Strength Level
- **Download as PNG** — Export resume as high-quality image
- **Social Sharing**: Share to Twitter/X or Farcaster with pre-filled captions
- **IPFS Upload** — Optionally pin resume images to IPFS

**Technical Details:**
- Uses `html2canvas` library for DOM-to-image conversion
- Renders with white background for optimal sharing
- IPFS upload via Pinata API
- Auto-generated OG images for shareable resume links

## Daily Streak System

Track daily deployment consistency:
- **Streak tracking** — Consecutive days with at least one deployment
- **Visual indicators** — Active, at-risk (missed a day), or broken status
- **Milestone celebrations** — Confetti at 3, 7, 14, 30, 50, 100, 365 days
- **Notifications** — At-risk reminders via Farcaster notifications
- **Cron jobs** — Automated streak checks and re-engagement messages

## Deploying / Hosting

Deploy on Vercel (recommended):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Update `minikit.config.ts` with your production URL
5. Deploy

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
- **CoinMarketCap API:** Server-side only. Your API key is never exposed to the client.

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
