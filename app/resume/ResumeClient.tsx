'use client';

import { useEffect, useState } from 'react';

interface ResumeData {
  address: string;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
  contractCount: number;
  totalTransactions: number;
  gasSpentEth: string;
  uniqueDays: number;
  rewardStrength?: {
    level: string;
    color?: string;
  };
}

interface ResumeClientProps {
  searchParams: { [key: string]: string | undefined };
}

export default function ResumeClient({ searchParams }: ResumeClientProps) {
  const [userData, setUserData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  const addressParam = searchParams.address;
  const imageParam = searchParams.image;
  const contractsParam = searchParams.contracts;
  const transactionsParam = searchParams.transactions;
  const gasParam = searchParams.gas;
  const daysParam = searchParams.days;
  const strengthParam = searchParams.strength;
  const displayNameParam = searchParams.displayName;
  const preventDownloadParam = searchParams.preventDownload;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setCurrentUrl(window.location.href);

    if (!addressParam) {
      setLoading(false);
      return;
    }

    // Try localStorage first, then sessionStorage
    const storedData = localStorage.getItem(`resume-data-${addressParam}`) ||
                       sessionStorage.getItem(`resume-data-${addressParam}`);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUserData(parsed);
      } catch (e) {
        console.error('Failed to parse resume data:', e);
      }
    } else {
      // Build from URL params if no stored data
      setUserData({
        address: addressParam,
        displayName: displayNameParam,
        contractCount: parseInt(contractsParam || '0'),
        totalTransactions: parseInt(transactionsParam || '0'),
        gasSpentEth: gasParam || '0.0000',
        uniqueDays: parseInt(daysParam || '0'),
        rewardStrength: { level: strengthParam || 'MEDIUM' },
      });
    }

    setLoading(false);
  }, [addressParam, contractsParam, transactionsParam, gasParam, daysParam, strengthParam, displayNameParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-[var(--ink)] text-lg">Loading resume...</div>
      </div>
    );
  }

  if (!userData && !addressParam) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Resume not found</h1>
          <p className="text-[var(--ink-secondary)]">Try sharing from the app again</p>
          <a 
            href="https://base-one-tap-contract-deployer.vercel.app/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to app
          </a>
        </div>
      </div>
    );
  }

  const data = userData || {
    address: addressParam || '',
    displayName: displayNameParam,
    contractCount: parseInt(contractsParam || '0'),
    totalTransactions: parseInt(transactionsParam || '0'),
    gasSpentEth: gasParam || '0.0000',
    uniqueDays: parseInt(daysParam || '0'),
    rewardStrength: { level: strengthParam || 'MEDIUM' },
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'VERY_STRONG': return 'bg-green-500';
      case 'STRONG': return 'bg-blue-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'WEAK': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrengthLabel = (level: string) => {
    switch (level) {
      case 'VERY_STRONG': return 'Very Strong';
      case 'STRONG': return 'Strong';
      case 'MEDIUM': return 'Medium';
      case 'WEAK': return 'Weak';
      default: return level;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Resume Card */}
        <div className="bg-white border-4 border-[#2a2a2a] p-6 shadow-[8px_8px_0px_0px_#2a2a2a]">
          {/* Header */}
          <div className="border-b-2 border-[#2a2a2a] pb-4 mb-4">
            <h1 className="text-2xl font-bold text-[#2a2a2a] uppercase tracking-wide">
              Base On-Chain Resume
            </h1>
            <p className="text-sm text-[#666] font-mono mt-1">
              {data.address.slice(0, 6)}...{data.address.slice(-4)}
            </p>
            {data.displayName && (
              <p className="text-lg font-semibold text-[#2a2a2a] mt-2">
                {data.displayName}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border-2 border-[#2a2a2a] p-3 bg-[#fafaf8]">
              <div className="text-xs font-bold text-[#666] uppercase tracking-wider">Contracts</div>
              <div className="text-3xl font-black text-[#2a2a2a]">{data.contractCount}</div>
            </div>
            <div className="border-2 border-[#2a2a2a] p-3 bg-[#fafaf8]">
              <div className="text-xs font-bold text-[#666] uppercase tracking-wider">Transactions</div>
              <div className="text-3xl font-black text-[#2a2a2a]">{data.totalTransactions}</div>
            </div>
            <div className="border-2 border-[#2a2a2a] p-3 bg-[#fafaf8]">
              <div className="text-xs font-bold text-[#666] uppercase tracking-wider">Gas Spent</div>
              <div className="text-2xl font-black text-[#2a2a2a]">{data.gasSpentEth} ETH</div>
            </div>
            <div className="border-2 border-[#2a2a2a] p-3 bg-[#fafaf8]">
              <div className="text-xs font-bold text-[#666] uppercase tracking-wider">Days Active</div>
              <div className="text-3xl font-black text-[#2a2a2a]">{data.uniqueDays}</div>
            </div>
          </div>

          {/* Strength Badge */}
          {data.rewardStrength && (
            <div className="flex items-center justify-center">
              <div className={`${getStrengthColor(data.rewardStrength.level)} px-4 py-2 text-white font-bold uppercase tracking-wider`}>
                {getStrengthLabel(data.rewardStrength.level)} Builder
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t-2 border-[#2a2a2a] text-center">
            <p className="text-xs text-[#666]">
              Powered by Base Contract Deployer
            </p>
          </div>
        </div>

        {/* CTA Button */}
        {!preventDownloadParam && (
          <div className="mt-6 text-center">
            <a
              href="https://base-one-tap-contract-deployer.vercel.app/"
              className="inline-block bg-[#2a2a2a] text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors"
            >
              Create Your Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
