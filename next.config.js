/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow ngrok and other tunneling services for Base mini app development
  allowedDevOrigins: [
    'https://*.ngrok-free.app',
    'https://*.ngrok.io',
    'https://*.ngrok.app',
  ],
  async headers() {
    return [
      {
        // Allow iframe embedding for Farcaster mini apps
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            // Remove X-Frame-Options to allow iframe embedding
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            // Allow embedding in Farcaster frames
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://warpcast.com https://farcaster.xyz *;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

