import type { Metadata, Viewport } from 'next';
import './globals.css';
import { WagmiProvider } from '@/providers/WagmiProvider';
import { ThemeProvider } from '@/components/theme-provider';

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

// Build fc:frame embed for backward compatibility
const frameEmbed = {
  ...miniAppEmbed,
  button: {
    ...miniAppEmbed.button,
    action: {
      ...miniAppEmbed.button.action,
      type: "launch_frame"
    }
  }
};

// Base metadata - used for main page, child routes override via generateMetadata
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
    url: appUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Contract Deployer | 1-Tap Deploy',
    description: 'Deploy smart contracts to Base blockchain with one tap. No code needed!',
    images: ['/opengraph-image'],
  },
  // Farcaster Mini App embed metadata - child pages can override
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    'fc:frame': JSON.stringify(frameEmbed),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        {/* fc:miniapp and fc:frame are now in metadata API so child pages can override */}
        
        {/* OG tags are handled by metadata API in each page/layout */}
        {/* Do NOT add hardcoded og:image here - it conflicts with child route metadata */}
      </head>
      <body className="bg-[var(--paper)]">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <WagmiProvider>
            {children}
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}