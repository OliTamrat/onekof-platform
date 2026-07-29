import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { canStorePatientData, getResidencyPosture } from '@/lib/compliance/residency';
import { isBlindIndexConfigured } from '@/lib/security/blind-index';

/**
 * The readiness signal /api/health reports. Composed from the same two
 * functions the route composes, so this pins the logic without needing to
 * boot a Next request.
 */
function readiness() {
  const posture = getResidencyPosture();
  const residencyAllows = canStorePatientData();
  const keyConfigured = isBlindIndexConfigured();
  return {
    ready: residencyAllows && keyConfigured,
    tier: posture.tier,
    reason: residencyAllows
      ? keyConfigured
        ? null
        : 'key'
      : 'tier',
  };
}

const SAVED = { ...process.env };
function env(tier?: string, key?: string) {
  for (const k of ['VERCEL', 'VERCEL_ENV', 'APP_PLATFORM', 'APP_REGION', 'APP_DEPLOYMENT_TIER', 'BLIND_INDEX_KEY']) {
    delete process.env[k];
  }
  if (tier) process.env.APP_DEPLOYMENT_TIER = tier;
  if (key) process.env.BLIND_INDEX_KEY = key;
}

const GOOD_KEY = 'x'.repeat(48);

beforeEach(() => env());
afterEach(() => {
  process.env = { ...SAVED };
});

describe('patient features are ready only when tier AND key allow it', () => {
  it('is ready on Tier 1 with a key', () => {
    env('1', GOOD_KEY);
    expect(readiness().ready).toBe(true);
    expect(readiness().reason).toBeNull();
  });

  it('is ready on Tier 2 with a key', () => {
    // Tier 2 is on-premise Ethiopia — in-country, so permitted. This is the
    // tier docker-compose.tier-sim.yml resolves to, which is what makes M1
    // and M2 exercisable before the EthioTelecom VM exists.
    env('2', GOOD_KEY);
    expect(readiness().ready).toBe(true);
  });

  it('is NOT ready on Tier 3 even with a key', () => {
    env('3', GOOD_KEY);
    const r = readiness();
    expect(r.ready).toBe(false);
    expect(r.reason).toBe('tier');
  });

  it('is NOT ready on an eligible tier without a key', () => {
    // The case that would otherwise surface as a 500 from a nurse trying to
    // register a patient, because blindIndex() throws rather than degrading.
    env('1');
    const r = readiness();
    expect(r.ready).toBe(false);
    expect(r.reason).toBe('key');
  });

  it('treats a too-short key as no key', () => {
    // 31 characters. The HMAC would still compute, which is exactly why the
    // length floor has to be checked rather than mere presence.
    env('1', 'y'.repeat(31));
    expect(readiness().ready).toBe(false);
    expect(readiness().reason).toBe('key');
  });
});

describe('the tier reason outranks the key reason', () => {
  it('reports the tier on Tier 3 with no key, not the missing key', () => {
    // Setting a key on Tier 3 changes nothing, so telling an operator to set
    // one there would send them to fix the wrong thing — which is the exact
    // mistake made in the runbook before this was corrected.
    env('3');
    expect(readiness().reason).toBe('tier');
  });
});

describe('readiness reports rather than fails', () => {
  it('exposes a tier on every configuration', () => {
    // A Tier 3 deployment is CORRECTLY unable to hold patient data, so the
    // health check must stay green there. `ready: false` is expected state,
    // not an outage.
    for (const t of ['1', '2', '3']) {
      env(t);
      expect([1, 2, 3]).toContain(readiness().tier);
    }
  });

  it('never returns key material', () => {
    env('1', GOOD_KEY);
    expect(JSON.stringify(readiness())).not.toContain(GOOD_KEY);
  });
});
