import { Metadata } from 'next';

// Clear fc:miniapp/fc:frame metadata so Farcaster shows OG image instead of mini app embed
export const metadata: Metadata = {
  other: {
    // Empty strings to override parent's fc:miniapp and fc:frame
    'fc:miniapp': '',
    'fc:frame': '',
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
