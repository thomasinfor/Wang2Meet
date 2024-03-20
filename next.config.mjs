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
        destination: dev ? 'http://localhost:4000/:path*' : '/api/:path*',
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['ssl.gstatic.com'],
  },
});

export default nextConfig;
