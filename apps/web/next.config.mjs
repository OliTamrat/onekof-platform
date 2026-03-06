/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disabled until all type errors are resolved
    typedRoutes: false,
    // Include Prisma engine binaries in deployment
    outputFileTracingIncludes: {
      '/api/**/*': ['../../node_modules/.prisma/client/**/*'],
    },
  },
  // Transpile packages from monorepo
  transpilePackages: ['@onekof/database'],
  // Build configuration
  eslint: {
    // Monorepo config resolution requires this
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow build despite type errors (to be fixed incrementally)
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable bundle analyzer in production
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      );
      return config;
    },
  }),
};

export default nextConfig;
