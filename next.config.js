const { securityHeaders } = require('./lib/securityHeaders');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({ dev: process.env.NODE_ENV === 'development' }),
      },
    ];
  },
  async redirects() {
    return [
      // "Do I qualify?" became "Can I afford this home?" (no approval claims)
      { source: '/qualify', destination: '/affordability', permanent: true },
    ];
  },
};

module.exports = nextConfig;
