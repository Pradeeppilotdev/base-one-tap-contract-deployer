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

export default function ResumePage() {
  const [userData, setUserData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setCurrentUrl(window.location.href);
    const addressParam = new URLSearchParams(window.location.search).get('address');

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
    }

    setLoading(false);
  }, []);

  // Update meta tags when userData changes
  useEffect(() => {
    if (!userData || typeof document === 'undefined') return;

    const strengthLevel = userData.rewardStrength?.level || 'MEDIUM';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://base-one-tap-contract-deployer.vercel.app';
    const imageParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('image') : null;
    const ogImageUrl = imageParam || `${baseUrl}/api/resume-og?address=${userData.address}&contracts=${userData.contractCount}&transactions=${userData.totalTransactions}&gas=${userData.gasSpentEth}&days=${userData.uniqueDays}&strength=${strengthLevel}`;
    
    const title = `${userData.displayName || userData.username || 'Developer'}'s Base On-Chain Resume`;
    const description = `${userData.contractCount} Contracts Deployed | ${userData.totalTransactions} Transactions | ${userData.gasSpentEth} ETH Gas | ${userData.uniqueDays} Days Active`;

    document.title = title;

    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateMetaTagName = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', ogImageUrl);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', 'website');
    updateMetaTagName('twitter:card', 'summary_large_image');
    updateMetaTagName('twitter:title', title);
    updateMetaTagName('twitter:description', description);
    updateMetaTagName('twitter:image', ogImageUrl);
  }, [userData, currentUrl]);

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
        <div className="text-center">
          <div className="text-[var(--ink)] text-lg mb-4">Resume not found</div>
          <p className="text-[var(--graphite)] text-sm mb-4">Try sharing from the app again</p>
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            Back to app
          </a>
        </div>
      </div>
    );
  }

  const strengthLevel = userData.rewardStrength?.level || 'MEDIUM';

  return (
    <div className="min-h-screen bg-[var(--paper)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Resume Card */}
        <div
          id="resume-capture"
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
                {strengthLevel}
              </span>
              <div className="h-3 flex-1 border-2 border-[var(--ink)] bg-[var(--light)]">
                <div
                  className="h-full bg-[var(--ink)]"
                  style={{
                    width:
                      strengthLevel === 'HIGH'
                        ? '100%'
                        : strengthLevel === 'MEDIUM-HIGH'
                          ? '75%'
                          : strengthLevel === 'MEDIUM'
                            ? '50%'
                            : '25%',
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
              `Check out my Base On-Chain Resume\n\n${userData.contractCount} Contracts Deployed\n${userData.totalTransactions} Total Transactions\n${userData.gasSpentEth} ETH Gas Spent\n${userData.uniqueDays} Days Active\n\nBuilding on-chain credibility!\n\n#Base #Web3`
            )}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            Share on X
          </a>

          <a
            href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
              `Check out my Base On-Chain Resume\n\n${userData.contractCount} Contracts Deployed\n${userData.totalTransactions} Total Transactions\n${userData.gasSpentEth} ETH Gas Spent\n${userData.uniqueDays} Days Active\n\nBuilding on-chain credibility!`
            )}&embeds[]=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-[#8B5CF6] text-white font-bold border-2 border-[#8B5CF6] hover:bg-white hover:text-[#8B5CF6] transition-colors"
          >
            Share on Farcaster
          </a>

          <a
            href="/"
            className="block text-center w-full py-3 bg-[var(--light)] text-[var(--ink)] font-bold border-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--light)] transition-colors"
          >
            Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
