/**
 * Data residency and deployment tier.
 *
 * Until now "Tier 1/2/3" existed only in prose — in the public privacy policy
 * (/privacy, section 3) and in a comment at the top of lib/env/runtime.ts.
 * Nothing could gate on it, so nothing did. This module makes the tier a value
 * the code can read, using the SAME numbering the privacy policy publishes to
 * customers:
 *
 *   Tier 1 — EthioTelecom Cloud, government tenants.        In Ethiopia.
 *   Tier 2 — On-premise / DAPS-managed Ethiopian server.    In Ethiopia.
 *   Tier 3 — Vercel (Frankfurt) + Supabase (EU).            NOT in Ethiopia.
 *
 * Note the direction: Tier 1 is the MOST sovereign tier, Tier 3 the least.
 * Getting this backwards is easy and consequential, so `isDataResidentInEthiopia`
 * exists to be asked instead of comparing tier numbers at call sites.
 *
 * Why this matters (see docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md, M5):
 * Ethiopia's Personal Data Protection Proclamation No. 1321/2024 requires
 * personal data collected in Ethiopia to be stored on a server or data centre
 * located in Ethiopia (Art. 22), and health data is sensitive personal data
 * whose cross-border transfer needs prior approval from the Ethiopian
 * Communications Authority. Tier 3 does not satisfy that.
 */

import { getRuntimeInfo } from '@/lib/env/runtime';

export type DeploymentTier = 1 | 2 | 3;

/** Tiers whose infrastructure physically sits in Ethiopia. */
const IN_COUNTRY_TIERS: readonly DeploymentTier[] = [1, 2];

export interface ResidencyPosture {
  tier: DeploymentTier;
  /** True when the storage backing this deployment is located in Ethiopia. */
  inCountry: boolean;
  /** Human-readable location, for support and compliance screens. */
  location: string;
}

/**
 * Resolve the deployment tier from the runtime.
 *
 * Explicit `APP_DEPLOYMENT_TIER` wins so a sovereign operator can state its
 * tier rather than have it inferred. Otherwise: anything on Vercel is Tier 3;
 * a self-hosted deployment is Tier 1 when it declares an EthioTelecom region
 * and Tier 2 otherwise.
 *
 * Local development deliberately reports Tier 3 — the least privileged answer.
 * A developer laptop is not an Ethiopian data centre, and defaulting the other
 * way would make patient features appear to work locally and then vanish in
 * production, which is the worst possible time to discover the gate.
 */
export function getDeploymentTier(): DeploymentTier {
  const explicit = process.env.APP_DEPLOYMENT_TIER;
  if (explicit === '1' || explicit === '2' || explicit === '3') {
    return Number(explicit) as DeploymentTier;
  }

  const { platform, region } = getRuntimeInfo();
  if (platform === 'vercel') return 3;
  if (platform === 'self-hosted') {
    // EthioTelecom Cloud regions identify themselves with an `etc-` prefix;
    // any other self-hosted box is treated as Tier 2 (still in-country, but
    // not the government cloud).
    return region.startsWith('etc-') ? 1 : 2;
  }
  return 3;
}

/**
 * True when this deployment stores data inside Ethiopia.
 *
 * Prefer this over `getDeploymentTier() <= 2` at call sites: it says what the
 * caller actually means, and it cannot be got backwards.
 */
export function isDataResidentInEthiopia(): boolean {
  return IN_COUNTRY_TIERS.includes(getDeploymentTier());
}

/**
 * Whether this deployment may store patient identifiers at all.
 *
 * This is the M5 gate. It is intentionally a single function with a single
 * caller-facing meaning, so that when counsel confirms (or revises) the
 * residency position, exactly one place changes.
 */
export function canStorePatientData(): boolean {
  return isDataResidentInEthiopia();
}

export function getResidencyPosture(): ResidencyPosture {
  const tier = getDeploymentTier();
  const inCountry = IN_COUNTRY_TIERS.includes(tier);
  const location =
    tier === 1
      ? 'EthioTelecom Cloud, Ethiopia'
      : tier === 2
        ? 'On-premise, Ethiopia'
        : 'Vercel (Frankfurt) + Supabase (EU)';
  return { tier, inCountry, location };
}
