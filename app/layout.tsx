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
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Deploy Based!",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: "Base Contract Deployer",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#1a1a1a"
    }
  },
  developer: "pradeep-pilot"
};

export const metadata: Metadata = {
  title: 'Base Contract Deployer | 1-Tap Deploy',
  description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
  metadataBase: new URL(appUrl),
  openGraph: {
    title: 'Base Contract Deployer | 1-Tap Deploy',
    description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
    images: ['/opengraph-image'],
    type: 'website',
    siteName: 'Base Contract Deployer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Contract Deployer | 1-Tap Deploy',
    description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
    images: ['/opengraph-image'],
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
        <meta property="og:image" content={`${appUrl}/opengraph-image`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={appUrl} />
        <meta property="og:site_name" content="Base Contract Deployer" />
      </head>
      <body className="bg-[#f5f5f0]">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block eth_createAccessList calls that cause failures in Farcaster wallet
              (function() {
                const originalFetch = window.fetch;
                const originalXHROpen = XMLHttpRequest.prototype.open;
                const originalXHRSend = XMLHttpRequest.prototype.send;
                
                // Intercept fetch
                window.fetch = function(...args) {
                  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
                  const options = args[1] || {};
                  
                  // Check if this is a POST request with eth_createAccessList
                  if (options.method === 'POST' || (options.body && typeof options.body === 'string')) {
                    try {
                      const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                      if (body && body.method === 'eth_createAccessList') {
                        // Check if it's a contract creation (no 'to' or 'to' is null/empty)
                        const params = body.params && body.params[0];
                        if (params && (!params.to || params.to === null || params.to === '')) {
                          console.log('[Interceptor] Blocked eth_createAccessList for contract creation');
                          // Return a mock successful response
                          return Promise.resolve(new Response(JSON.stringify({
                            jsonrpc: '2.0',
                            id: body.id,
                            result: []
                          }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                          }));
                        }
                      }
                    } catch (e) {
                      // Not JSON, continue normally
                    }
                  }
                  
                  return originalFetch.apply(this, args);
                };
                
                // Intercept XMLHttpRequest
                let xhrMethod = null;
                let xhrUrl = null;
                
                XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                  xhrMethod = method;
                  xhrUrl = url;
                  return originalXHROpen.apply(this, [method, url, ...rest]);
                };
                
                XMLHttpRequest.prototype.send = function(body) {
                  if (xhrMethod === 'POST' && body) {
                    try {
                      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
                      if (parsedBody && parsedBody.method === 'eth_createAccessList') {
                        const params = parsedBody.params && parsedBody.params[0];
                        if (params && (!params.to || params.to === null || params.to === '')) {
                          console.log('[Interceptor] Blocked eth_createAccessList for contract creation (XHR)');
                          // Mock the response
                          Object.defineProperty(this, 'status', { value: 200, writable: false });
                          Object.defineProperty(this, 'statusText', { value: 'OK', writable: false });
                          Object.defineProperty(this, 'responseText', { 
                            value: JSON.stringify({
                              jsonrpc: '2.0',
                              id: parsedBody.id,
                              result: []
                            }),
                            writable: false
                          });
                          Object.defineProperty(this, 'readyState', { value: 4, writable: false });
                          
                          // Trigger onreadystatechange if it exists
                          if (this.onreadystatechange) {
                            this.onreadystatechange();
                          }
                          
                          return;
                        }
                      }
                    } catch (e) {
                      // Not JSON, continue normally
                    }
                  }
                  
                  return originalXHRSend.apply(this, [body]);
                };
              })();
            `,
          }}
        />
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}
