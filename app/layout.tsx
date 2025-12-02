import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
// Use canonical domain for production, fallback to env var or localhost
const appUrl = process.env.NEXT_PUBLIC_ROOT_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://base-one-tap-contract-deployer.vercel.app'
    : 'http://localhost:3000');

// Mini App embed metadata (for fc:miniapp meta tag)
const miniAppEmbed = {
  version: "1",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Deploy Based!",
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
        {/* Set up RPC interceptors BEFORE React loads to catch SDK requests */}
        <Script
          id="rpc-interceptors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                // Intercept fetch - intercept ALL requests to catch eth_createAccessList
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const [url, options] = args;
                  const urlString = typeof url === 'string' ? url : url instanceof URL ? url.href : String(url);
                  
                  // Log ALL POST requests to help debug
                  if (options?.method === 'POST') {
                    console.log('🌐 [SCRIPT-FETCH] ALL POST request to:', urlString);
                  }
                  
                  // Check for RPC calls
                  if (urlString.includes('alchemy.com') || urlString.includes('base.org') || urlString.includes('base-mainnet.g.alchemy.com') || urlString.includes('g.alchemy.com')) {
                    console.log('🌐 [SCRIPT-FETCH] Intercepted RPC call:', urlString, 'Method:', options?.method);
                    
                    if (options?.method === 'POST' && options?.body) {
                      try {
                        let bodyStr = '';
                        let bodyObj = null;
                        
                        // Handle different body types
                        if (typeof options.body === 'string') {
                          bodyStr = options.body;
                          bodyObj = JSON.parse(bodyStr);
                        } else if (options.body instanceof FormData || options.body instanceof Blob || options.body instanceof ReadableStream) {
                          // Can't intercept these easily
                          console.log('⚠️ [SCRIPT-FETCH] Body is FormData/Blob - cannot intercept');
                          return originalFetch.apply(this, args);
                        } else {
                          bodyObj = options.body;
                          bodyStr = JSON.stringify(bodyObj);
                        }
                        
                        console.log('🌐 [SCRIPT-FETCH] Request body:', bodyStr);
                        console.log('🌐 [SCRIPT-FETCH] Method:', bodyObj?.method);
                        
                        // BLOCK eth_createAccessList entirely - return empty access list
                        if (bodyObj && bodyObj.method === 'eth_createAccessList') {
                          console.log('🚫 [SCRIPT-FETCH] BLOCKING eth_createAccessList - returning empty access list');
                          console.log('🔍 [SCRIPT-FETCH] Blocked params:', JSON.stringify(bodyObj.params, null, 2));
                          // Return a mock response with empty access list instead of making the RPC call
                          return Promise.resolve(new Response(JSON.stringify({
                            jsonrpc: '2.0',
                            id: bodyObj.id || 1,
                            result: { accessList: [], gasUsed: '0x0' }
                          }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                          }));
                        }
                      } catch(e) {
                        console.error('❌ [SCRIPT-FETCH] Error parsing body:', e, 'Body type:', typeof options?.body, 'Body:', options?.body);
                        // If we can't parse, continue with original request
                      }
                    }
                  }
                  return originalFetch.apply(this, args);
                };
                
                // Intercept XMLHttpRequest
                const originalXHROpen = XMLHttpRequest.prototype.open;
                const originalXHRSend = XMLHttpRequest.prototype.send;
                
                XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
                  this._rpcUrl = typeof url === 'string' ? url : url instanceof URL ? url.href : String(url);
                  this._rpcMethod = method;
                  return originalXHROpen.call(this, method, url, async ?? true, username, password);
                };
                
                XMLHttpRequest.prototype.send = function(body) {
                  const url = this._rpcUrl;
                  const method = this._rpcMethod;
                  
                  if (url && (url.includes('alchemy.com') || url.includes('base.org') || url.includes('base-mainnet.g.alchemy.com') || url.includes('g.alchemy.com'))) {
                    console.log('🌐 [SCRIPT-XHR] Intercepted RPC call:', url, 'Method:', method);
                    
                    if (method === 'POST' && body) {
                      try {
                        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
                        const bodyObj = JSON.parse(bodyStr);
                        
                        console.log('🌐 [SCRIPT-XHR] Request body:', JSON.stringify(bodyObj, null, 2));
                        
                        // BLOCK eth_createAccessList entirely - return empty access list
                        if (bodyObj && bodyObj.method === 'eth_createAccessList') {
                          console.log('🚫 [SCRIPT-XHR] BLOCKING eth_createAccessList - returning empty access list');
                          console.log('🔍 [SCRIPT-XHR] Blocked request body:', JSON.stringify(bodyObj, null, 2));
                          
                          // Create mock response
                          const mockResponse = JSON.stringify({
                            jsonrpc: '2.0',
                            id: bodyObj.id || 1,
                            result: { accessList: [], gasUsed: '0x0' }
                          });
                          
                          // Set response properties before calling original send
                          const xhr = this;
                          const originalSend = originalXHRSend;
                          
                          // Override response handling
                          Object.defineProperty(xhr, 'responseText', {
                            get: function() { return mockResponse; },
                            configurable: true
                          });
                          Object.defineProperty(xhr, 'status', {
                            get: function() { return 200; },
                            configurable: true
                          });
                          Object.defineProperty(xhr, 'statusText', {
                            get: function() { return 'OK'; },
                            configurable: true
                          });
                          
                          // Don't send the actual request - just trigger the response handlers
                          setTimeout(() => {
                            xhr.readyState = 4;
                            if (xhr.onreadystatechange) {
                              xhr.onreadystatechange();
                            }
                            if (xhr.onload) {
                              xhr.onload();
                            }
                          }, 0);
                          
                          return; // Don't send the actual request
                        }
                      } catch(e) {
                        console.error('❌ [SCRIPT-XHR] Error parsing body:', e);
                      }
                    }
                  }
                  return originalXHRSend.call(this, body);
                };
                
                console.log('✅ RPC interceptors installed (before React)');
                console.log('🔍 [SCRIPT] Fetch interceptor:', typeof window.fetch);
                console.log('🔍 [SCRIPT] XHR interceptor:', typeof XMLHttpRequest);
                
                // Test that interceptors are working
                setTimeout(() => {
                  console.log('🧪 [SCRIPT] Testing interceptors - fetch:', window.fetch !== originalFetch);
                  console.log('🧪 [SCRIPT] Testing interceptors - XHR:', XMLHttpRequest.prototype.send !== originalXHRSend);
                }, 100);
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
