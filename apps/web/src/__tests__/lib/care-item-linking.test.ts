import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.mock is hoisted above the imports, so the spy has to be hoisted with it.
const { findFirst } = vi.hoisted(() => ({ findFirst: vi.fn() }));
vi.mock('@onekof/database', () => ({ prisma: { patient: { findFirst } } }));

import { canLinkCareItem } from '@/lib/security/patient-access';

const SAVED = { ...process.env };
function setTier(tier?: string) {
  for (const k of ['VERCEL', 'VERCEL_ENV', 'APP_PLATFORM', 'APP_REGION', 'APP_DEPLOYMENT_TIER']) {
    delete process.env[k];
  }
  if (tier) process.env.APP_DEPLOYMENT_TIER = tier;
}

beforeEach(() => {
  setTier('1');
  findFirst.mockReset();
  findFirst.mockResolvedValue({ id: 'pat-1' });
});
afterEach(() => {
  process.env = { ...SAVED };
});

describe('attaching a task to a patient requires FULL, not LIMITED', () => {
  it('allows FULL and MANAGE', async () => {
    expect(await canLinkCareItem('org-1', 'pat-1', 'FULL')).toBe(true);
    expect(await canLinkCareItem('org-1', 'pat-1', 'MANAGE')).toBe(true);
  });

  it('refuses LIMITED', async () => {
    // LIMITED is defined by not being allowed to know which patient a care
    // item concerns. A LIMITED member who could set the link would have had
    // to obtain the very id the level exists to withhold.
    expect(await canLinkCareItem('org-1', 'pat-1', 'LIMITED')).toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('refuses no access at all', async () => {
    expect(await canLinkCareItem('org-1', 'pat-1', 'NO_ACCESS')).toBe(false);
    expect(await canLinkCareItem('org-1', 'pat-1', null)).toBe(false);
  });
});

describe('residency is checked before the grant', () => {
  it('refuses on a deployment that may not hold patient data', async () => {
    setTier('3');
    expect(await canLinkCareItem('org-1', 'pat-1', 'MANAGE')).toBe(false);
    // No query at all — the deployment is ineligible regardless of who asks.
    expect(findFirst).not.toHaveBeenCalled();
  });
});

describe('the patient must be this organization’s, and still exist', () => {
  it('scopes the lookup to the calling organization', async () => {
    await canLinkCareItem('org-1', 'pat-1', 'FULL');
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'pat-1', organizationId: 'org-1' }),
      })
    );
  });

  it('excludes erased patients', async () => {
    // An erased patient is an anonymised shell kept so operational statistics
    // survive. Attaching new work would quietly rebuild a record about
    // someone whose identifiers were destroyed on request.
    await canLinkCareItem('org-1', 'pat-1', 'FULL');
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ erasedAt: null }),
      })
    );
  });

  it('refuses when no such patient comes back', async () => {
    findFirst.mockResolvedValue(null);
    expect(await canLinkCareItem('org-1', 'pat-1', 'FULL')).toBe(false);
  });

  it('never reveals which of the three reasons applied', async () => {
    // All four refusals below are the same boolean, so the route that turns
    // it into a 404 cannot accidentally distinguish "wrong organization"
    // from "no access" — which would let a caller probe patient ids.
    findFirst.mockResolvedValue(null);
    const wrongOrg = await canLinkCareItem('org-2', 'pat-1', 'FULL');
    const erased = await canLinkCareItem('org-1', 'pat-1', 'FULL');
    const noGrant = await canLinkCareItem('org-1', 'pat-1', 'LIMITED');
    setTier('3');
    const ineligible = await canLinkCareItem('org-1', 'pat-1', 'MANAGE');
    expect([wrongOrg, erased, noGrant, ineligible]).toEqual([false, false, false, false]);
  });
});
