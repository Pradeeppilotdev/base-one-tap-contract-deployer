import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Wagmi config for Farcaster Mini App
// Uses the Farcaster MiniApp connector for wallet integration
// NOTE: Builder Code (ERC-8021) attribution is applied manually in ContractDeployer.tsx
// via appendBuilderCode() since transactions use raw provider.request, not wagmi hooks.
export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  connectors: [
    farcasterMiniApp(),
  ],
});

// Chain IDs
export const BASE_CHAIN_ID = 8453; // Base Mainnet
export const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia

