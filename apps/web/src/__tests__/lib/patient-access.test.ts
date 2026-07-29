import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { meetsPatientAccess, canSeeIdentifiers } from '@/lib/security/patient-access';

vi.mock('@onekof/database', () => ({ prisma: {} }));

const SAVED = { ...process.env };
function setTier(tier?: string) {
  for (const k of ['VERCEL', 'VERCEL_ENV', 'APP_PLATFORM', 'APP_REGION', 'APP_DEPLOYMENT_TIER']) {
    delete process.env[k];
  }
  if (tier) process.env.APP_DEPLOYMENT_TIER = tier;
}
beforeEach(() => setTier());
afterEach(() => {
  process.env = { ...SAVED };
});

describe('the patient access ladder', () => {
  it('each level includes everything below it', () => {
    expect(meetsPatientAccess('MANAGE', 'FULL')).toBe(true);
    expect(meetsPatientAccess('MANAGE', 'LIMITED')).toBe(true);
    expect(meetsPatientAccess('FULL', 'LIMITED')).toBe(true);
    expect(meetsPatientAccess('LIMITED', 'LIMITED')).toBe(true);
  });

  it('does not grant upward', () => {
    expect(meetsPatientAccess('LIMITED', 'FULL')).toBe(false);
    expect(meetsPatientAccess('FULL', 'MANAGE')).toBe(false);
    expect(meetsPatientAccess('NO_ACCESS', 'LIMITED')).toBe(false);
  });

  it('treats missing access as no access', () => {
    expect(meetsPatientAccess(null, 'LIMITED')).toBe(false);
    expect(meetsPatientAccess(undefined, 'LIMITED')).toBe(false);
  });

  it('separates seeing that a patient exists from seeing who they are', () => {
    // LIMITED can work on care items; only FULL sees identifiers.
    expect(canSeeIdentifiers('LIMITED')).toBe(false);
    expect(canSeeIdentifiers('FULL')).toBe(true);
    expect(canSeeIdentifiers('MANAGE')).toBe(true);
    expect(canSeeIdentifiers('NO_ACCESS')).toBe(false);
  });
});

describe('residency is checked before identity', () => {
  it('refuses everybody on a Tier 3 deployment', async () => {
    setTier('3');
    const { requirePatientAccess } = await import('@/lib/security/patient-access');
    const result = await requirePatientAccess('org1', 'user1', 'LIMITED');
    expect(result.authorized).toBe(false);
    // 404, not 403: telling a caller "patients exist here but you cannot see
    // them" would be untrue on a deployment that may not hold them at all.
    expect(result.error?.status).toBe(404);
  });

  it('does not consult the database when the deployment is ineligible', async () => {
    // prisma is mocked as an empty object — any query would throw. Reaching a
    // verdict without touching it proves residency short-circuits first.
    setTier('3');
    const { requirePatientAccess } = await import('@/lib/security/patient-access');
    await expect(requirePatientAccess('org1', 'user1')).resolves.toMatchObject({
      authorized: false,
    });
  });
});

describe('effective access folds residency into the level itself', () => {
  it('is null for everybody on a deployment that may not hold patient data', async () => {
    setTier('3');
    const { effectivePatientAccess } = await import('@/lib/security/patient-access');
    // Including a granted MANAGE — a member who kept their grant across a
    // move to a non-sovereign deployment loses it in effect, not on paper.
    expect(effectivePatientAccess('MANAGE')).toBeNull();
  });

  it('passes a real level through on an eligible deployment', async () => {
    setTier('1');
    const { effectivePatientAccess } = await import('@/lib/security/patient-access');
    expect(effectivePatientAccess('LIMITED')).toBe('LIMITED');
    expect(effectivePatientAccess('MANAGE')).toBe('MANAGE');
  });

  it('rejects a value that is not on the ladder', async () => {
    setTier('1');
    const { effectivePatientAccess } = await import('@/lib/security/patient-access');
    // A column that somehow held junk must read as no access, not as a level
    // that `meetsPatientAccess` would compare with indexOf(-1) semantics.
    expect(effectivePatientAccess('SUPERUSER')).toBeNull();
    expect(effectivePatientAccess('')).toBeNull();
    expect(effectivePatientAccess(null)).toBeNull();
  });
});

describe('care items are excluded in the query, not after it', () => {
  it('emits a where fragment for viewers below LIMITED', async () => {
    setTier('1');
    const { careItemExclusion } = await import('@/lib/security/patient-access');
    expect(careItemExclusion(null)).toEqual({ patientId: null });
    expect(careItemExclusion('NO_ACCESS')).toEqual({ patientId: null });
  });

  it('emits nothing once the viewer holds LIMITED', async () => {
    setTier('1');
    const { careItemExclusion } = await import('@/lib/security/patient-access');
    // Empty rather than `{ patientId: { not: null } }` — LIMITED sees care
    // items *and* ordinary work, not care items instead of it.
    expect(careItemExclusion('LIMITED')).toEqual({});
    expect(careItemExclusion('FULL')).toEqual({});
  });

  it('is what keeps a paginated total honest', async () => {
    setTier('1');
    const { careItemExclusion } = await import('@/lib/security/patient-access');
    // A post-filter would run after take/skip, so `total` would count rows the
    // caller never receives — disclosing how many care items exist and
    // returning short pages. The fragment exists to be merged into `where`.
    expect(Object.keys(careItemExclusion('NO_ACCESS'))).toEqual(['patientId']);
  });
});

describe('the ladder is deliberately not derived from organization role', () => {
  it('has no path from OWNER to patient access', async () => {
    // Guard by inspection: the module must not consult `role` at all. An
    // owner is not automatically entitled to read a patient's record, and
    // this is the opposite of how budget access treats owners.
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const src = readFileSync(
      join(process.cwd(), 'src/lib/security/patient-access.ts'),
      'utf8'
    )
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');

    expect(src).not.toMatch(/\bOWNER\b/);
    expect(src).not.toMatch(/\bADMIN\b/);
    expect(src).toContain('patientAccess');
  });
});
