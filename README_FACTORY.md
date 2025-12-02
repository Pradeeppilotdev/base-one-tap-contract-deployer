# Factory Contract Deployment Guide

## Overview

The app now uses a **Factory Contract** pattern to deploy contracts. This allows Farcaster wallet users to deploy contracts through a regular transaction (calling the factory) instead of direct contract creation, which Farcaster wallet doesn't support.

## How It Works

1. **Factory Contract**: A pre-deployed contract on Base mainnet that can deploy other contracts
2. **User Flow**: When users click "Deploy", the app calls the factory's `deployContractWithParams()` function with the contract bytecode
3. **Factory Deploys**: The factory contract creates the new contract and emits an event with the deployed address
4. **App Extracts**: The app reads the event logs to get the deployed contract address

## Deploying the Factory Contract

### Prerequisites

1. Set up your `.env` file with:
   ```env
   PRIVATE_KEY=your_private_key_here
   BASE_MAINNET_RPC_URL=https://mainnet.base.org
   BASESCAN_API_KEY=your_basescan_api_key (optional, for verification)
   ```

2. Make sure you have ETH on Base mainnet for gas

### Deployment Steps

1. **Compile the factory contract:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Base mainnet:**
   ```bash
   npx hardhat run scripts/deploy-factory.ts --network baseMainnet
   ```

3. **Copy the deployed address** from the console output

4. **Update the factory address** in `components/ContractDeployer.tsx`:
   ```typescript
   const FACTORY_CONTRACT_ADDRESS = '0x...'; // Your deployed address
   ```

### Verification (Optional)

The deployment script will automatically verify the contract on BaseScan if you have `BASESCAN_API_KEY` set in your `.env` file.

## Testing

After deploying the factory and updating the address:

1. Start your dev server: `npm run dev`
2. Connect with Farcaster wallet
3. Try deploying a contract - it should now work! 🎉

## Benefits

- ✅ Works with Farcaster wallet (regular transaction, not contract creation)
- ✅ No need for users to handle contract creation complexity
- ✅ Factory can be reused for all deployments
- ✅ Gas costs are similar to direct deployment

## Factory Contract Address

Once deployed, update this in `components/ContractDeployer.tsx`:
```typescript
const FACTORY_CONTRACT_ADDRESS = '0xYourDeployedAddress';
```

