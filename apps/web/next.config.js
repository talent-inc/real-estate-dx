/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@real-estate-dx/ui', '@real-estate-dx/types'],
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Required for Docker production builds
  output: 'standalone',
}

module.exports = nextConfig