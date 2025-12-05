'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Suspense } from 'react';
import ContractDeployer from '@/components/ContractDeployer';
import DynamicMeta from '@/components/DynamicMeta';

export default function Home() {
  useEffect(() => {
    // Call ready() immediately per Farcaster docs
    // https://miniapps.farcaster.xyz/docs/guides/loading
    sdk.actions.ready();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <DynamicMeta />
      </Suspense>
      <ContractDeployer />
    </>
  );
}


