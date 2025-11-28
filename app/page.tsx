'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import ContractDeployer from '@/components/ContractDeployer';

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Call sdk.actions.ready() IMMEDIATELY on mount - this is critical!
    const callReady = async () => {
      try {
        console.log('[Page] Calling sdk.actions.ready()...');
        await sdk.actions.ready();
        console.log('[Page] sdk.actions.ready() SUCCESS');
      } catch (error) {
        console.log('[Page] sdk.actions.ready() error (normal if not in Farcaster):', error);
      } finally {
        setIsReady(true);
      }
    };
    
    // Call immediately - no delays!
    callReady();
  }, []);

  // Always render the app, but show loading indicator briefly
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <ContractDeployer />;
}


