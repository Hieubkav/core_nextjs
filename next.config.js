/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    // Do not fail production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
