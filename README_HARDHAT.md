# Hardhat Setup for Base Sepolia

This guide will help you compile contracts and deploy to Base Sepolia testnet to get real bytecode.

## Prerequisites

1. **Funded Wallet**: You need Base Sepolia ETH in your wallet
   - Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Or use another Base Sepolia faucet

2. **Private Key**: Export your private key from MetaMask or your wallet
   - ⚠️ **NEVER share your private key or commit it to git**

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here_without_0x_prefix
BASESCAN_API_KEY=your_api_key_optional
```

**Important**: 
- Add `.env` to `.gitignore` (already done)
- Never commit your private key
- The private key should NOT include the `0x` prefix

### 3. Compile Contracts

```bash
npm run compile
```

This will compile all contracts in the `contracts/` directory and create artifacts.

### 4. Get Contract Bytecode (Without Deploying)

To extract bytecode and ABIs without deploying:

```bash
npm run get-bytecode
```

This creates `contracts-config.json` with all the bytecode and ABIs you need for the frontend.

### 5. Deploy to Base Sepolia

Make sure your wallet has Base Sepolia ETH, then:

```bash
npm run deploy:sepolia
```

This will:
- Deploy all three contracts (StringStorage, Calculator, Counter)
- Show the deployment transaction data (bytecode + constructor args)
- Show the contract bytecode only
- Display contract addresses

### 6. Update Frontend with Real Bytecode

After deployment, you can:

1. **Option A**: Use the bytecode from `contracts-config.json` (from `get-bytecode` script)
2. **Option B**: Copy the bytecode from the deployment output
3. **Option C**: Extract bytecode from deployed contracts

Update `components/ContractDeployer.tsx` with the real bytecode.

## Contract Files

- `contracts/StringStorage.sol` - String storage contract
- `contracts/Calculator.sol` - Calculator with arithmetic operations
- `contracts/Counter.sol` - Simple counter contract

## Scripts

- `npm run compile` - Compile all contracts
- `npm run get-bytecode` - Extract bytecode and ABIs to JSON
- `npm run deploy:sepolia` - Deploy all contracts to Base Sepolia
- `npm run verify` - Verify contracts on BaseScan (requires API key)

## Network Configuration

- **Base Sepolia**: Chain ID 84532 (0x14a34)
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## Security Notes

1. ⚠️ **Never commit `.env` file** - it contains your private key
2. ⚠️ **Never share your private key** - it gives full access to your wallet
3. ✅ Use a separate wallet for testing
4. ✅ Only use testnet ETH on testnet

## Troubleshooting

### "Insufficient funds"
- Make sure you have Base Sepolia ETH in your wallet
- Get testnet ETH from a faucet

### "Nonce too high"
- Wait a few seconds and try again
- Or manually set nonce in Hardhat config

### "Contract verification failed"
- Make sure you have a BaseScan API key
- Check that the contract source matches

## Next Steps

After getting the real bytecode:

1. Update `components/ContractDeployer.tsx` with the bytecode from `contracts-config.json`
2. Test the deployment in the frontend
3. Once verified, you can switch to mainnet (change chainId back to 0x2105)


