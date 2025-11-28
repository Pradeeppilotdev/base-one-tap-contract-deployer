import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Wagmi config for Farcaster Mini App
// Uses the Farcaster MiniApp connector for wallet integration
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  connectors: [
    farcasterMiniApp(),
  ],
});

// Chain ID for Base Mainnet
export const BASE_CHAIN_ID = 8453;

