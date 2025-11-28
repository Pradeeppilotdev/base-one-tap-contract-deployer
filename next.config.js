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
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

