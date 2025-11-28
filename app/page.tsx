'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import ContractDeployer from '@/components/ContractDeployer';

export default function Home() {
  useEffect(() => {
    // Call ready() immediately per Farcaster docs
    // https://miniapps.farcaster.xyz/docs/guides/loading
    sdk.actions.ready();
  }, []);

  return <ContractDeployer />;
}


