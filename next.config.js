/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.farcaster.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.warpcast.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
    unoptimized: true, // Disable optimization for Farcaster frame compatibility
  },
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;

