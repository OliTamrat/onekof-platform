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
    // expo-server-sdk (and its dep undici@7.x) uses private class field syntax
    // (#target in this) that Next.js 14 webpack cannot parse. Mark as external
    // so they are loaded at runtime by Node.js instead of bundled by webpack.
    serverComponentsExternalPackages: ['expo-server-sdk', 'undici'],
  },
  // Transpile packages from monorepo
  transpilePackages: ['@onekof/database'],
  // Build configuration
  eslint: {
    // Monorepo config resolution requires this
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // 🔒 SECURITY (INSA Finding #2): Restrict image optimization to known hosts
    // only. The deprecated `domains` array is replaced with `remotePatterns`
    // which gives tighter control over protocol and pathname.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
    ],
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
