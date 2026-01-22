# Base One-Tap Contract Deployer

A lightweight Base mini-app that lets users deploy predefined smart contracts to the Base blockchain with a single click — primarily intended to increase wallet activity and provide an easy way to demo simple contracts.

## Features

- Deploy smart contracts directly from the web UI
- Multiple contract templates included:
  - String Storage
  - Calculator
  - Simple Token (ERC20-like with mint)
- Automatic Base network switching in the client
- Real-time deployment status and logs
- Direct links to BaseScan for deployed contracts

## Prerequisites

- Base app account (for publishing the mini-app)
- A wallet that supports the Base network (e.g., MetaMask)
- Node.js 18+ installed
- (Optional) Vercel account for hosting

## Quickstart — Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser.

Common npm scripts:
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production build (if applicable)

## Deploying / Hosting

You can host this app on Vercel (recommended for quick deploys):

1. Push your code to GitHub.
2. Import the repository in Vercel and deploy.
3. Note your Vercel deployment URL for configuring the mini-app manifest.

## Mini App Manifest / Base Preview Configuration

1. After deploying, update `minikit.config.ts` with your production URL.
2. Go to the Base Build Account Association Tool: https://www.base.dev/preview?tab=account
3. Paste your domain and generate `accountAssociation` credentials.
4. Update `minikit.config.ts` with the `accountAssociation` object returned by Base.
5. Validate and preview the app at https://base.dev/preview.
6. To publish, create a post in the Base app with your app’s URL.

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
│   └── ContractDeployer.tsx      # Main contract deployer component
├── minikit.config.ts             # Mini app configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Project dependencies & scripts
```

(If you add or rename files, please update this section to reflect the current tree.)

## Contract Templates

Included templates (examples) — see the `contracts/` or project-specific folder for sources:

1. String Storage — store and retrieve simple strings
2. Calculator — simple arithmetic operations
3. Simple Token — basic ERC20-like token with mint function

## Configuration

Edit `minikit.config.ts` to customize:
- App name, description and metadata
- Screenshots and images used in the manifest
- Tags and categories
- The `accountAssociation` details required by Base after deployment

## Security & Notes

- This app is provided as a demo/utility. Review and audit all smart contract templates before using them with real funds.
- Keep private keys and secrets out of repository files. Use environment variables and secure secrets in your hosting provider.

## Contributing

Contributions are welcome. A suggested flow:
1. Fork the repo.
2. Create a feature branch.
3. Open a PR describing your changes.
4. Add tests or manual validation steps where appropriate.

Please open an issue for larger changes so we can discuss the design.

## License

MIT

## Acknowledgements & Links

- Base Developer Docs: https://www.base.dev
