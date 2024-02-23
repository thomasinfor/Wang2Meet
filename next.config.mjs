/** @type {import('next').NextConfig} */

import nextPwa from 'next-pwa';
const withPWA = nextPwa({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = withPWA({
  output: 'standalone',
});

export default nextConfig;
