/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // "Do I qualify?" became "Can I afford this home?" (no approval claims)
      { source: '/qualify', destination: '/affordability', permanent: true },
    ];
  },
};

module.exports = nextConfig;
