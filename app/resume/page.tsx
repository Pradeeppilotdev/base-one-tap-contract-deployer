'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';

interface UserData {
  contractCount: number;
  uniqueDays: number;
  contractTypes: number;
  totalTransactions: number;
  gasSpentEth: string;
  gasSpentUsd: string;
  totalClicks: number;
  rewardStrength: string;
  address: string;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
}

const resumeMetaData = ({
  contractCount,
  gasSpentEth,
  displayName,
  username,
}: {
  contractCount: number;
  gasSpentEth: string;
  displayName?: string;
  username?: string;
}) => {
  const userDisplay = displayName || username || 'Developer';
  return {
    title: `${userDisplay}'s Base On-Chain Resume`,
    description: `${userDisplay} has deployed ${contractCount} smart contracts and spent ${gasSpentEth} ETH in gas on Base. View their on-chain credentials!`,
  };
};

export default function ResumePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get('address');

    if (address) {
      // Fetch user data from localStorage or API
      const storedData = localStorage.getItem(`resume-data-${address}`);
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-[var(--ink)] text-lg">Loading resume...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-[var(--ink)] text-lg">Resume not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Resume Card */}
        <div
          className="border-4 border-[var(--ink)] bg-gradient-to-br from-[var(--paper)] via-[var(--paper)] to-[var(--light)] p-6 md:p-8"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px)',
          }}
        >
          {/* Header */}
          <div className="border-b-2 border-[var(--ink)] pb-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--ink)] leading-tight">
              Base On-Chain Resume
            </h1>
            <p className="text-xs md:text-sm text-[var(--graphite)] mt-2">
              {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-[var(--ink)] p-3 md:p-4 bg-[var(--paper)]">
              <div className="text-xs md:text-sm font-bold text-[var(--graphite)] uppercase tracking-wider">
                Contracts
              </div>
              <div className="text-2xl md:text-3xl font-black text-[var(--ink)] leading-tight">
                {userData.contractCount}
              </div>
            </div>

            <div className="border-2 border-[var(--ink)] p-3 md:p-4 bg-[var(--paper)]">
              <div className="text-xs md:text-sm font-bold text-[var(--graphite)] uppercase tracking-wider">
                Transactions
              </div>
              <div className="text-2xl md:text-3xl font-black text-[var(--ink)] leading-tight">
                {userData.totalTransactions}
              </div>
            </div>

            <div className="border-2 border-[var(--ink)] p-3 md:p-4 bg-[var(--paper)]">
              <div className="text-xs md:text-sm font-bold text-[var(--graphite)] uppercase tracking-wider">
                Days Active
              </div>
              <div className="text-2xl md:text-3xl font-black text-[var(--ink)] leading-tight">
                {userData.uniqueDays}
              </div>
            </div>

            <div className="border-2 border-[var(--ink)] p-3 md:p-4 bg-[var(--paper)]">
              <div className="text-xs md:text-sm font-bold text-[var(--graphite)] uppercase tracking-wider">
                Gas Spent
              </div>
              <div className="text-lg md:text-xl font-black text-[var(--ink)] leading-tight">
                {userData.gasSpentEth} ETH
              </div>
            </div>
          </div>

          {/* Reward Strength Badge */}
          <div className="border-2 border-[var(--ink)] p-4 mb-6 bg-[var(--paper)]">
            <p className="text-xs font-bold text-[var(--graphite)] uppercase tracking-wider mb-2">
              Reward Strength
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[var(--ink)]">
                {userData.rewardStrength}
              </span>
              <div className="h-3 flex-1 border-2 border-[var(--ink)] bg-[var(--light)]">
                <div
                  className="h-full bg-[var(--ink)]"
                  style={{
                    width: userData.rewardStrength === 'HIGH' ? '100%' : 
                           userData.rewardStrength === 'MEDIUM-HIGH' ? '75%' :
                           userData.rewardStrength === 'MEDIUM' ? '50%' : '25%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[var(--ink)] pt-4 text-center">
            <p className="text-xs text-[var(--graphite)]">
              Built with Base Deployer on Base Network
            </p>
          </div>
        </div>

        {/* Share Links */}
        <div className="mt-8 space-y-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Check out my Base On-Chain Resume!\n\n${userData.contractCount} Contracts Deployed\n${userData.totalTransactions} Total Transactions\n${userData.gasSpentEth} ETH Gas Spent\n\nBuilding on-chain credibility with Base Deployer!\n\n#Base #Web3`
            )}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            Share on X
          </a>

          <a
            href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
              `Check out my Base On-Chain Resume!\n\n${userData.contractCount} Contracts Deployed\n${userData.totalTransactions} Total Transactions\n${userData.gasSpentEth} ETH Gas Spent\n\nBuilding on-chain credibility with Base Deployer!`
            )}&embeds[]=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-[#8B5CF6] text-white font-bold border-2 border-[#8B5CF6] hover:bg-white hover:text-[#8B5CF6] transition-colors"
          >
            Share on Farcaster
          </a>
        </div>
      </div>
    </div>
  );
}
