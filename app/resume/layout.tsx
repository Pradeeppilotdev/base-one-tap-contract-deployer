import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const address = params.address as string || 'User';
  const displayName = params.displayName as string || 'Developer';
  const contracts = params.contracts as string || '0';
  const transactions = params.transactions as string || '0';
  const gas = params.gas as string || '0.0000';
  const days = params.days as string || '0';
  const strength = params.strength as string || 'MEDIUM';
  const imageUrl = params.image as string;

  const title = `${displayName}'s Base On-Chain Resume`;
  const description = `${contracts} Contracts Deployed | ${transactions} Transactions | ${gas} ETH Gas | ${days} Days Active`;
  
  // Use IPFS image if provided, otherwise generate via API
  const ogImage = imageUrl || 
    `https://base-one-tap-contract-deployer.vercel.app/api/resume-og?address=${address}&contracts=${contracts}&transactions=${transactions}&gas=${gas}&days=${days}&strength=${strength}`;

  console.log('[RESUME-METADATA] Generating OG tags with image:', ogImage);

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
