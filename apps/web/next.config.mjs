import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Disabled until all type errors are resolved
    typedRoutes: false,
    // Ensure Prisma engine binaries are included in Vercel deployment
    outputFileTracingIncludes: {
      '/api/**/*': ['../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/**/*'],
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

// Wrap config with Sentry
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
