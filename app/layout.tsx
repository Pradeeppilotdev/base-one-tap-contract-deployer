import type { Metadata, Viewport } from 'next';
import './globals.css';
import { WagmiProvider } from '@/providers/WagmiProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a1a',
};

// Dynamic metadata for Farcaster Mini Apps
const appUrl = process.env.NEXT_PUBLIC_ROOT_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Mini App embed metadata (for fc:miniapp meta tag)
const miniAppEmbed = {
  version: "1",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Deploy to Base",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: "Base Contract Deployer",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#1a1a1a"
    }
  }
};

export const metadata: Metadata = {
  title: 'Base Contract Deployer | 1-Tap Deploy',
  description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Base Contract Deployer | 1-Tap Deploy',
    description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'Base Contract Deployer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Contract Deployer | 1-Tap Deploy',
    description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Farcaster Mini App Embed Metadata */}
        <meta name="fc:miniapp" content={JSON.stringify(miniAppEmbed)} />
        {/* Backward compatibility with fc:frame */}
        <meta name="fc:frame" content={JSON.stringify({
          ...miniAppEmbed,
          button: {
            ...miniAppEmbed.button,
            action: {
              ...miniAppEmbed.button.action,
              type: "launch_frame"
            }
          }
        })} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Base Contract Deployer | 1-Tap Deploy" />
        <meta property="og:description" content="Deploy smart contracts to Base blockchain with one tap. No code needed!" />
        <meta property="og:image" content={`${appUrl}/og-image.png`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={appUrl} />
      </head>
      <body className="bg-[#f5f5f0]">
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}
