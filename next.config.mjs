import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack for faster local dev (Next.js 15)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
}

const config =
  process.env.ANALYZE === 'true'
    ? withBundleAnalyzer({ enabled: true })(nextConfig)
    : nextConfig

export default config
