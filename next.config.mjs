/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV === 'development';
import nextPwa from 'next-pwa';
const withPWA = nextPwa({
  dest: 'public',
  disable: dev,
})

const nextConfig = withPWA({
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_PATH}/:path*`,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ssl.gstatic.com',
        port: '',
      },
    ],
  },
});

export default nextConfig;
