import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getDeploymentTier,
  isDataResidentInEthiopia,
  canStorePatientData,
  getResidencyPosture,
} from '@/lib/compliance/residency';

// getRuntimeInfo reads process.env directly, so these tests drive it the same way.
const SAVED = { ...process.env };

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of ['VERCEL', 'VERCEL_ENV', 'VERCEL_REGION', 'APP_PLATFORM', 'APP_REGION', 'APP_DEPLOYMENT_TIER']) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) process.env[key] = value;
  }
}

beforeEach(() => setEnv({}));
afterEach(() => {
  process.env = { ...SAVED };
});

describe('deployment tier resolution', () => {
  it('reports Tier 3 on Vercel', () => {
    setEnv({ VERCEL: '1', VERCEL_REGION: 'fra1' });
    expect(getDeploymentTier()).toBe(3);
  });

  it('reports Tier 1 for a self-hosted EthioTelecom Cloud region', () => {
    setEnv({ APP_PLATFORM: 'self-hosted', APP_REGION: 'etc-addis-1' });
    expect(getDeploymentTier()).toBe(1);
  });

  it('reports Tier 2 for any other self-hosted Ethiopian server', () => {
    setEnv({ APP_PLATFORM: 'self-hosted', APP_REGION: 'et-addis-1' });
    expect(getDeploymentTier()).toBe(2);
  });

  it('lets an explicit APP_DEPLOYMENT_TIER override inference', () => {
    setEnv({ VERCEL: '1', VERCEL_REGION: 'fra1', APP_DEPLOYMENT_TIER: '2' });
    expect(getDeploymentTier()).toBe(2);
  });

  it('ignores a nonsense APP_DEPLOYMENT_TIER rather than trusting it', () => {
    setEnv({ VERCEL: '1', APP_DEPLOYMENT_TIER: '0' });
    expect(getDeploymentTier()).toBe(3);
  });

  // Local dev must not look more sovereign than production, or the patient
  // gate would pass on a laptop and fail on deploy.
  it('treats local development as Tier 3, the least privileged answer', () => {
    setEnv({});
    expect(getDeploymentTier()).toBe(3);
    expect(isDataResidentInEthiopia()).toBe(false);
  });
});

describe('residency posture', () => {
  it('counts Tier 1 and Tier 2 as in-country and Tier 3 as not', () => {
    setEnv({ APP_DEPLOYMENT_TIER: '1' });
    expect(isDataResidentInEthiopia()).toBe(true);
    setEnv({ APP_DEPLOYMENT_TIER: '2' });
    expect(isDataResidentInEthiopia()).toBe(true);
    setEnv({ APP_DEPLOYMENT_TIER: '3' });
    expect(isDataResidentInEthiopia()).toBe(false);
  });

  // Guards the numbering itself. Tier 1 is the MOST sovereign tier; an earlier
  // draft of the medical design doc had this inverted, which would have gated
  // patient data to exactly the wrong deployments.
  it('does not invert the tier ordering', () => {
    setEnv({ APP_DEPLOYMENT_TIER: '1' });
    expect(getResidencyPosture().location).toContain('Ethiopia');
    setEnv({ APP_DEPLOYMENT_TIER: '3' });
    expect(getResidencyPosture().location).not.toContain('Ethiopia');
  });

  it('reports a location string for every tier', () => {
    for (const tier of ['1', '2', '3']) {
      setEnv({ APP_DEPLOYMENT_TIER: tier });
      expect(getResidencyPosture().location.length).toBeGreaterThan(0);
    }
  });
});

describe('patient data gate (M5)', () => {
  it('refuses patient storage on the EU cloud tier', () => {
    setEnv({ VERCEL: '1', VERCEL_REGION: 'fra1' });
    expect(canStorePatientData()).toBe(false);
  });

  it('permits patient storage on in-country tiers', () => {
    setEnv({ APP_DEPLOYMENT_TIER: '1' });
    expect(canStorePatientData()).toBe(true);
    setEnv({ APP_DEPLOYMENT_TIER: '2' });
    expect(canStorePatientData()).toBe(true);
  });

  it('tracks isDataResidentInEthiopia exactly, so one edit moves both', () => {
    for (const tier of ['1', '2', '3']) {
      setEnv({ APP_DEPLOYMENT_TIER: tier });
      expect(canStorePatientData()).toBe(isDataResidentInEthiopia());
    }
  });
});
