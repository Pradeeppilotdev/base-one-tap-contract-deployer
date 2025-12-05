'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ContractDeployer from '@/components/ContractDeployer';
import DynamicMeta from '@/components/DynamicMeta';

function HomeContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Call ready() immediately per Farcaster docs
    // https://miniapps.farcaster.xyz/docs/guides/loading
    sdk.actions.ready();
    
    // Check for ref parameter from shared link and store it
    const ref = searchParams.get('ref');
    if (ref && typeof window !== 'undefined') {
      // Store ref in localStorage so it can be tracked when wallet connects
      localStorage.setItem('pending-referral-url', ref);
    }
  }, [searchParams]);

  return (
    <>
      <Suspense fallback={null}>
        <DynamicMeta />
      </Suspense>
      <ContractDeployer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<ContractDeployer />}>
      <HomeContent />
    </Suspense>
  );
}


