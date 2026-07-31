import { describe, it, expect } from 'vitest';
import {
  MINISTRY_PRESET,
  NGO_PRESET,
  BUSINESS_PRESET,
  EDUCATION_PRESET,
  HEALTHCARE_PRESET,
  CONSTRUCTION_PRESET,
  getPresetForOrgType,
  getAllPresets,
  resolveEnabledSections,
} from '@/lib/presets/organization-presets';
import { NAVIGABLE_SECTION_IDS } from '@/lib/sidebar-navigation-dynamic';

const VALID_SECTION_IDS = new Set([
  'teams', 'budget', 'goals', 'automations', 'documents', 'docs', 'projects',
  'issues', 'calendar', 'timeline', 'analytics', 'compliance', 'impact',
  'development', 'marketing', 'operations', 'research', 'medical', 'courses',
]);

describe('industry presets (capability matrix, D8)', () => {
  it('every preset uses only valid section ids', () => {
    for (const preset of getAllPresets()) {
      for (const id of preset.enabledSections) {
        expect(VALID_SECTION_IDS.has(id), `${preset.name}: ${id}`).toBe(true);
      }
    }
  });

  it('all six presets exist and are distinct', () => {
    expect(getAllPresets()).toHaveLength(6);
    const names = getAllPresets().map(p => p.name);
    expect(new Set(names).size).toBe(6);
  });

  // An edition audit found `construction` had no preset and fell through to
  // Business, handing a contractor Code Review and Releases.
  it('Construction: operations + research; never development/marketing', () => {
    expect(has(CONSTRUCTION_PRESET, 'operations')).toBe(true);
    expect(has(CONSTRUCTION_PRESET, 'research')).toBe(true);
    expect(has(CONSTRUCTION_PRESET, 'development')).toBe(false);
    expect(has(CONSTRUCTION_PRESET, 'marketing')).toBe(false);
    expect(getPresetForOrgType('construction').name).toBe('Construction / Infrastructure');
  });

  // Every sector-specific onboarding choice must reach a sector preset —
  // silently inheriting Business is the failure this guards against.
  it('no sector-specific onboarding type falls through to the Business fallback', () => {
    for (const id of ['government', 'ngo', 'education', 'healthcare', 'construction']) {
      expect(getPresetForOrgType(id).name, `${id} fell through`).not.toBe('Business / Startup');
    }
  });

  const has = (preset: { enabledSections: readonly string[] }, id: string) =>
    preset.enabledSections.includes(id as never);

  it('Government: operations + research; no development/marketing/automations', () => {
    expect(has(MINISTRY_PRESET, 'operations')).toBe(true);
    expect(has(MINISTRY_PRESET, 'research')).toBe(true);
    expect(has(MINISTRY_PRESET, 'development')).toBe(false);
    expect(has(MINISTRY_PRESET, 'marketing')).toBe(false);
    expect(has(MINISTRY_PRESET, 'automations')).toBe(false);
  });

  it('NGO: marketing + operations + research + docs; no development', () => {
    expect(has(NGO_PRESET, 'marketing')).toBe(true);
    expect(has(NGO_PRESET, 'operations')).toBe(true);
    expect(has(NGO_PRESET, 'research')).toBe(true);
    expect(has(NGO_PRESET, 'docs')).toBe(true);
    expect(has(NGO_PRESET, 'development')).toBe(false);
  });

  it('Business/Tech: development + marketing + operations + automations; no research/medical', () => {
    expect(has(BUSINESS_PRESET, 'development')).toBe(true);
    expect(has(BUSINESS_PRESET, 'marketing')).toBe(true);
    expect(has(BUSINESS_PRESET, 'operations')).toBe(true);
    expect(has(BUSINESS_PRESET, 'automations')).toBe(true);
    expect(has(BUSINESS_PRESET, 'research')).toBe(false);
    expect(has(BUSINESS_PRESET, 'medical')).toBe(false);
  });

  it('Education: research; no operations/marketing/development', () => {
    expect(has(EDUCATION_PRESET, 'research')).toBe(true);
    expect(has(EDUCATION_PRESET, 'operations')).toBe(false);
    expect(has(EDUCATION_PRESET, 'marketing')).toBe(false);
    expect(has(EDUCATION_PRESET, 'development')).toBe(false);
  });

  it('Healthcare: operations + research; no development/marketing/automations', () => {
    expect(has(HEALTHCARE_PRESET, 'operations')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'research')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'development')).toBe(false);
    expect(has(HEALTHCARE_PRESET, 'marketing')).toBe(false);
    expect(has(HEALTHCARE_PRESET, 'automations')).toBe(false);
  });

  // The gap founder testing exposed: Healthcare enabled 'medical' and
  // 'compliance', the Customization page showed toggles for them, and
  // nothing happened because no navigation destination existed.
  //
  // Originally this asserted a HARDCODED list of unbuilt modules stayed
  // disabled. That went stale the moment M3 built the Medical pages — the
  // guard failed for a section that had become legitimate, which is a guard
  // reporting yesterday's truth.
  //
  // Rewritten to check the actual invariant: a preset may enable a section
  // only if the sidebar can navigate to it. NAVIGABLE_SECTION_IDS is the
  // list maintained beside the navigation itself, so this now tracks
  // reality rather than a snapshot of it.
  it('no preset enables a section the sidebar cannot navigate to', () => {
    const navigable = new Set<string>(NAVIGABLE_SECTION_IDS);
    for (const preset of getAllPresets()) {
      for (const id of preset.enabledSections) {
        expect(
          navigable.has(id as string),
          `${preset.name} enables "${id}", which has no navigation destination — ` +
            'either add it to the sidebar in this same change, or do not enable it'
        ).toBe(true);
      }
    }
  });

  it('Healthcare enables medical now that M3 made its pages real', () => {
    // The other half of the same rule: the section is navigable AND enabled.
    // Wiring the sidebar without enabling the section leaves a healthcare
    // customer with no Medical entry, which is exactly what shipped in M3.
    expect(has(HEALTHCARE_PRESET, 'medical')).toBe(true);
  });

  it('org type mapping: healthcare aliases resolve; unknown falls back to Business', () => {
    expect(getPresetForOrgType('healthcare').name).toBe('Healthcare');
    expect(getPresetForOrgType('hospital').name).toBe('Healthcare');
    expect(getPresetForOrgType('clinic').name).toBe('Healthcare');
    expect(getPresetForOrgType('ministry').name).toBe('Ministry / Government');
    expect(getPresetForOrgType('something-else').name).toBe('Business / Startup');
  });
});

describe('resolveEnabledSections (fail posture, D9)', () => {
  it('explicit settings always win', () => {
    expect(resolveEnabledSections(['teams'], 'ministry')).toEqual(['teams']);
  });

  it('falls back to the industry preset when settings are missing/empty', () => {
    expect(resolveEnabledSections(null, 'healthcare')).toContain('operations');
    expect(resolveEnabledSections([], 'ministry')).toContain('operations');
    expect(resolveEnabledSections(undefined, 'education')).toContain('research');
  });

  it('returns null only when neither settings nor industry exist (legacy fail-open)', () => {
    expect(resolveEnabledSections(null, null)).toBeNull();
    expect(resolveEnabledSections([], undefined)).toBeNull();
  });
});

describe('settings PUT schema accepts preset payloads (Save-failed regression)', () => {
  it('accepts feature groups that are null (Ministry/NGO/Education/Healthcare disable automations)', async () => {
    const { organizationSettingsPutSchema } = await import('@/lib/validation/schemas');
    const payload = {
      enabledSections: [...MINISTRY_PRESET.enabledSections],
      features: { ...MINISTRY_PRESET.features },
      customization: {
        primaryColor: '#1C8C7D',
        budgetCurrency: 'ETB',
        fiscalYearStart: 1,
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
      },
      permissions: {
        allowMemberInvites: true,
        requireBudgetApproval: true,
        publicProjectsVisible: false,
      },
    };
    const result = organizationSettingsPutSchema.safeParse(payload);
    expect(result.success, JSON.stringify(!result.success && result.error.flatten())).toBe(true);
  });

  it('every preset round-trips through the PUT schema', async () => {
    const { organizationSettingsPutSchema } = await import('@/lib/validation/schemas');
    for (const preset of getAllPresets()) {
      const result = organizationSettingsPutSchema.safeParse({
        enabledSections: [...preset.enabledSections],
        features: { ...preset.features },
        customization: { primaryColor: '#1C8C7D', budgetCurrency: 'ETB', fiscalYearStart: 1, dateFormat: 'DD/MM/YYYY', language: 'en' },
        permissions: { allowMemberInvites: true, requireBudgetApproval: true, publicProjectsVisible: false },
      });
      expect(result.success, preset.name).toBe(true);
    }
  });
});

describe('live onboarding org types all resolve to a preset', () => {
  // These ids come from apps/web/src/app/onboarding/page.tsx — the flow
  // real users go through. A mismatch here means a customer picks
  // "Healthcare" and silently receives the Business edition.
  const LIVE_ONBOARDING_TYPES = [
    'personal', 'government', 'private', 'ngo', 'education', 'construction', 'healthcare',
  ];

  it('every live onboarding type maps to an intended preset', () => {
    for (const id of LIVE_ONBOARDING_TYPES) {
      expect(getPresetForOrgType(id).name, id).toBeTruthy();
    }
  });

  it('the sector-specific types map to their own editions, not the fallback', () => {
    expect(getPresetForOrgType('healthcare').name).toBe('Healthcare');
    expect(getPresetForOrgType('government').name).toBe('Ministry / Government');
    expect(getPresetForOrgType('ngo').name).toBe('NGO / Non-Profit');
    expect(getPresetForOrgType('education').name).toBe('Education');
  });
});
