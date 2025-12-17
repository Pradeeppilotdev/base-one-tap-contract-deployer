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
  aspectRatio: "3:2",
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
        {/* CRITICAL: Block eth_createAccessList BEFORE any SDK loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block eth_createAccessList calls that cause failures in Farcaster wallet
              // This MUST run before any SDK or wallet code loads
              (function() {
                'use strict';
                
                // Store originals immediately
                const originalFetch = window.fetch;
                const originalXHROpen = XMLHttpRequest.prototype.open;
                const originalXHRSend = XMLHttpRequest.prototype.send;
                
                // Intercept fetch - catch ALL eth_createAccessList calls
                window.fetch = function(...args) {
                  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
                  const options = args[1] || {};
                  
                  // Check body for eth_createAccessList
                  let bodyStr = options.body;
                  if (bodyStr && typeof bodyStr === 'string') {
                    try {
                      const body = JSON.parse(bodyStr);
                      if (body && body.method === 'eth_createAccessList') {
                        const params = body.params && body.params[0];
                        // Block if 'to' is missing, null, empty string, or undefined
                        if (!params || !params.to || params.to === null || params.to === '' || params.to === undefined) {
                          console.log('[Fetch Interceptor] Blocked eth_createAccessList for contract creation');
                          return Promise.resolve(new Response(JSON.stringify({
                            jsonrpc: '2.0',
                            id: body.id || 1,
                            result: []
                          }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                          }));
                        }
                      }
                    } catch (e) {
                      // Not JSON, continue
                    }
                  }
                  
                  return originalFetch.apply(this, args);
                };
                
                // Intercept XMLHttpRequest
                const xhrState = new WeakMap();
                
                XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                  xhrState.set(this, { method, url });
                  return originalXHROpen.apply(this, [method, url, ...rest]);
                };
                
                XMLHttpRequest.prototype.send = function(body) {
                  const state = xhrState.get(this);
                  if (state && state.method === 'POST' && body) {
                    try {
                      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
                      if (parsedBody && parsedBody.method === 'eth_createAccessList') {
                        const params = parsedBody.params && parsedBody.params[0];
                        // Block if 'to' is missing, null, empty string, or undefined
                        if (!params || !params.to || params.to === null || params.to === '' || params.to === undefined) {
                          console.log('[XHR Interceptor] Blocked eth_createAccessList for contract creation');
                          
                          // Create a proper mock response
                          setTimeout(() => {
                            Object.defineProperty(this, 'status', { value: 200, writable: false, configurable: true });
                            Object.defineProperty(this, 'statusText', { value: 'OK', writable: false, configurable: true });
                            Object.defineProperty(this, 'responseText', { 
                              value: JSON.stringify({
                                jsonrpc: '2.0',
                                id: parsedBody.id || 1,
                                result: []
                              }),
                              writable: false,
                              configurable: true
                            });
                            Object.defineProperty(this, 'readyState', { value: 4, writable: false, configurable: true });
                            
                            if (this.onreadystatechange) {
                              this.onreadystatechange();
                            }
                            if (this.onload) {
                              this.onload();
                            }
                          }, 0);
                          
                          return;
                        }
                      }
                    } catch (e) {
                      // Not JSON, continue
                    }
                  }
                  
                  return originalXHRSend.apply(this, [body]);
                };
              })();
            `,
          }}
        />
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
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={appUrl} />
        <meta property="og:site_name" content="Base Contract Deployer" />
      </head>
      <body className="bg-[#f5f5f0]">
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}
