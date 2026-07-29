import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@onekof/database', () => ({ prisma: {} }));

import { getResidencyPosture } from '@/lib/compliance/residency';
import { effectivePatientAccess } from '@/lib/security/patient-access';

/**
 * The shape /api/medical/status returns, composed from the same two functions
 * the route composes. Three different screens branch on this, so the branching
 * inputs are pinned here rather than only inside JSX.
 */
function status(rawAccess: string | null) {
  const posture = getResidencyPosture();
  const level = effectivePatientAccess(rawAccess);
  return {
    residency: {
      tier: posture.tier,
      location: posture.location,
      canHoldPatientData: posture.inCountry,
    },
    access: {
      level,
      canSeeIdentifiers: level === 'FULL' || level === 'MANAGE',
      canRegister: level === 'MANAGE',
    },
  };
}

const SAVED = { ...process.env };
function tier(t?: string) {
  for (const k of ['VERCEL', 'VERCEL_ENV', 'APP_PLATFORM', 'APP_REGION', 'APP_DEPLOYMENT_TIER']) {
    delete process.env[k];
  }
  if (t) process.env.APP_DEPLOYMENT_TIER = t;
}
beforeEach(() => tier('2'));
afterEach(() => {
  process.env = { ...SAVED };
});

describe('the three screens the UI must tell apart', () => {
  it('residency block: eligible=false regardless of a granted level', () => {
    // The case the whole endpoint exists for. Without it the page shows an
    // empty list, telling a nurse the ward has no patients when the truth is
    // that this deployment may not hold them.
    tier('3');
    const s = status('MANAGE');
    expect(s.residency.canHoldPatientData).toBe(false);
    expect(s.residency.location).toContain('Vercel');
    // The grant is real but has no effect here, and reporting it would invite
    // a screen saying "you have MANAGE" beside nothing.
    expect(s.access.level).toBeNull();
  });

  it('no-access block: eligible deployment, no grant', () => {
    const s = status('NO_ACCESS');
    expect(s.residency.canHoldPatientData).toBe(true);
    expect(s.access.level).toBe('NO_ACCESS');
    expect(s.access.canSeeIdentifiers).toBe(false);
  });

  it('list: eligible deployment with a grant', () => {
    const s = status('LIMITED');
    expect(s.residency.canHoldPatientData).toBe(true);
    expect(s.access.level).toBe('LIMITED');
  });
});

describe('what each level may do', () => {
  it('LIMITED sees the list but not identities, and cannot register', () => {
    const s = status('LIMITED');
    expect(s.access.canSeeIdentifiers).toBe(false);
    expect(s.access.canRegister).toBe(false);
  });

  it('FULL sees identities but still cannot register', () => {
    // Registering is MANAGE. Reading who somebody is and adding a new person
    // to the registry are different acts.
    const s = status('FULL');
    expect(s.access.canSeeIdentifiers).toBe(true);
    expect(s.access.canRegister).toBe(false);
  });

  it('MANAGE may do both', () => {
    const s = status('MANAGE');
    expect(s.access.canSeeIdentifiers).toBe(true);
    expect(s.access.canRegister).toBe(true);
  });

  it('a member with no row at all reads as no access, not as an error', () => {
    const s = status(null);
    expect(s.access.level).toBeNull();
    expect(s.access.canSeeIdentifiers).toBe(false);
  });
});

describe('Tier 1 and Tier 2 are both permitted', () => {
  it('Tier 1 — EthioTelecom Cloud', () => {
    tier('1');
    const s = status('FULL');
    expect(s.residency.canHoldPatientData).toBe(true);
    expect(s.residency.location).toContain('EthioTelecom');
  });

  it('Tier 2 — on-premise', () => {
    tier('2');
    const s = status('FULL');
    expect(s.residency.canHoldPatientData).toBe(true);
    expect(s.residency.location).toContain('On-premise');
  });
});

describe('the payload carries nothing about any patient', () => {
  it('exposes only the deployment tier and the caller own access', () => {
    // Safe to render before any permission check, which is what lets the page
    // explain itself instead of showing a bare 404.
    const keys = Object.keys(status('MANAGE'));
    expect(keys.sort()).toEqual(['access', 'residency']);
  });
});
