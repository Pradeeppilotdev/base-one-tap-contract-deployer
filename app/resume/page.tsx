import { Metadata } from 'next';
import ResumeClient from './ResumeClient';

// Force dynamic rendering to access searchParams at request time
export const dynamic = 'force-dynamic';

// Generate metadata with IPFS image from searchParams
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const address = (params.address as string) || 'User';
  const displayName = (params.displayName as string) || 'Developer';
  const contracts = (params.contracts as string) || '0';
  const transactions = (params.transactions as string) || '0';
  const gas = (params.gas as string) || '0.0000';
  const days = (params.days as string) || '0';
  const strength = (params.strength as string) || 'MEDIUM';
  const imageUrl = params.image as string;

  const title = `${displayName}'s Base On-Chain Resume`;
  const description = `${contracts} Contracts Deployed | ${transactions} Transactions | ${gas} ETH Gas | ${days} Days Active`;

  // Use IPFS image if provided, otherwise use the OG API endpoint
  const ogImage = imageUrl
    ? decodeURIComponent(imageUrl as string)
    : `https://base-one-tap-contract-deployer.vercel.app/api/resume-og?address=${address}&contracts=${contracts}&transactions=${transactions}&gas=${gas}&days=${days}&strength=${strength}`;

  console.log('[RESUME-PAGE-METADATA] OG Image URL:', ogImage);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      siteName: 'Base On-Chain Resume',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// Server component that passes searchParams to client component
export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Convert to simple string object for client component
  const clientParams: { [key: string]: string | undefined } = {};
  for (const [key, value] of Object.entries(params)) {
    clientParams[key] = Array.isArray(value) ? value[0] : value;
  }

  return <ResumeClient searchParams={clientParams} />;
}
