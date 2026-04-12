/**
 * Runtime environment abstraction.
 *
 * Onekof deploys to multiple tiers:
 * - Tier 3 (Vercel + Supabase, EU) — default production for global/demo customers
 * - Tier 2 (on-premise Ethiopian server) — private sector tenants
 * - Tier 1 (EthioTelecom Cloud) — government tenants (future)
 *
 * This module reads platform-specific environment variables and returns a
 * normalized runtime info object that the rest of the app can consume without
 * caring which platform it's running on. On Vercel, VERCEL_* env vars are used.
 * On self-hosted, APP_* env vars override the defaults.
 *
 * Zero behavior change on Vercel: if APP_* vars are unset and VERCEL_* vars
 * are present, the function returns exactly what the legacy inline code returned.
 */

export type HostingPlatform = 'vercel' | 'self-hosted' | 'local';

export interface RuntimeInfo {
  /** Which platform is hosting the app */
  platform: HostingPlatform;
  /** Geographic/datacenter region (e.g. "fra1", "et-addis-1", "local") */
  region: string;
  /** Logical environment (e.g. "production", "preview", "development") */
  environment: string;
  /** Short deployment identifier (8 chars of SHA or "local") */
  deploymentId: string;
  /** Node.js runtime version */
  nodeVersion: string;
  /** Next.js runtime ("nodejs" or "edge") */
  nextRuntime: string;
}

/**
 * Returns the normalized runtime info for the current process.
 * Safe to call from API routes, middleware, and client-rendered code.
 */
export function getRuntimeInfo(): RuntimeInfo {
  const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

  // Platform detection
  let platform: HostingPlatform;
  if (isVercel) {
    platform = 'vercel';
  } else if (process.env.APP_PLATFORM === 'self-hosted') {
    platform = 'self-hosted';
  } else {
    platform = 'local';
  }

  // Region: APP_REGION takes precedence (self-hosted), then VERCEL_REGION (Tier 3), then fallback
  const region =
    process.env.APP_REGION ||
    process.env.VERCEL_REGION ||
    (platform === 'local' ? 'local' : 'unknown');

  // Environment: APP_ENV → VERCEL_ENV → NODE_ENV → 'development'
  const environment =
    process.env.APP_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    'development';

  // Deployment ID: APP_BUILD_SHA (self-hosted CI) → VERCEL_DEPLOYMENT_ID → 'local'
  const rawDeploymentId =
    process.env.APP_BUILD_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    'local';
  const deploymentId = rawDeploymentId.slice(0, 8);

  return {
    platform,
    region,
    environment,
    deploymentId,
    nodeVersion: process.version,
    nextRuntime: process.env.NEXT_RUNTIME || 'nodejs',
  };
}

/**
 * True when the process is running on Vercel.
 * Prefer this over raw `process.env.VERCEL` reads so tests and self-hosted
 * deployments can override it cleanly.
 */
export function isVercelRuntime(): boolean {
  return getRuntimeInfo().platform === 'vercel';
}

/**
 * True when the app is running on a tier that uses Vercel's Preview environment.
 * Used by auth.ts to skip cookie domain pinning on preview deploys.
 */
export function isVercelPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}
