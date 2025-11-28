# Base Contract Deployer Mini App

A Base mini app that allows users to deploy predefined smart contracts to the Base blockchain with a single click.

## Features

- Deploy smart contracts directly from the app
- Support for multiple contract templates (String Storage, Calculator, Simple Token)
- Automatic Base network switching
- Real-time deployment status
- Direct links to BaseScan for deployed contracts

## Prerequisites

- Base app account
- Vercel account (for hosting)
- Node.js 18+ installed

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy

### 4. Configure Mini App Manifest

1. After deploying to Vercel, note your deployment URL
2. Update `minikit.config.ts` with your production URL
3. Navigate to [Base Build Account Association Tool](https://www.base.dev/preview?tab=account)
4. Paste your domain and generate `accountAssociation` credentials
5. Update `minikit.config.ts` with the `accountAssociation` object

### 5. Preview Your App

Go to [base.dev/preview](https://base.dev/preview) to validate your app.

### 6. Publish

Create a post in the Base app with your app's URL to publish it.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts          # Webhook endpoint
│   ├── .well-known/
│   │   └── farcaster.json/
│   │       └── route.ts          # Manifest endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles
├── components/
│   └── ContractDeployer.tsx     # Main contract deployer component
├── minikit.config.ts             # Mini app configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies
```

## Contract Templates

The app includes three contract templates:

1. **String Storage**: Store and retrieve string values
2. **Calculator**: Perform arithmetic operations
3. **Simple Token**: Basic ERC20-like token with minting

## Configuration

Edit `minikit.config.ts` to customize:
- App name and description
- Screenshots and images
- Tags and categories
- Account association (after deployment)

## License

MIT


