import { describe, it, expect } from 'vitest';
import {
  MINISTRY_PRESET,
  NGO_PRESET,
  BUSINESS_PRESET,
  EDUCATION_PRESET,
  HEALTHCARE_PRESET,
  getPresetForOrgType,
  getAllPresets,
  resolveEnabledSections,
} from '@/lib/presets/organization-presets';

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

  it('all five presets exist and are distinct', () => {
    expect(getAllPresets()).toHaveLength(5);
    const names = getAllPresets().map(p => p.name);
    expect(new Set(names).size).toBe(5);
  });

  const has = (preset: { enabledSections: readonly string[] }, id: string) =>
    preset.enabledSections.includes(id as never);

  it('Government: operations + research + compliance; no development/marketing/automations', () => {
    expect(has(MINISTRY_PRESET, 'operations')).toBe(true);
    expect(has(MINISTRY_PRESET, 'research')).toBe(true);
    expect(has(MINISTRY_PRESET, 'compliance')).toBe(true);
    expect(has(MINISTRY_PRESET, 'development')).toBe(false);
    expect(has(MINISTRY_PRESET, 'marketing')).toBe(false);
    expect(has(MINISTRY_PRESET, 'automations')).toBe(false);
  });

  it('NGO: marketing + operations + research + impact + docs; no development', () => {
    expect(has(NGO_PRESET, 'marketing')).toBe(true);
    expect(has(NGO_PRESET, 'operations')).toBe(true);
    expect(has(NGO_PRESET, 'research')).toBe(true);
    expect(has(NGO_PRESET, 'impact')).toBe(true);
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

  it('Education: research + courses; no operations/marketing/development', () => {
    expect(has(EDUCATION_PRESET, 'research')).toBe(true);
    expect(has(EDUCATION_PRESET, 'courses')).toBe(true);
    expect(has(EDUCATION_PRESET, 'operations')).toBe(false);
    expect(has(EDUCATION_PRESET, 'marketing')).toBe(false);
    expect(has(EDUCATION_PRESET, 'development')).toBe(false);
  });

  it('Healthcare: operations + research + medical + compliance; no development/marketing/courses/automations', () => {
    expect(has(HEALTHCARE_PRESET, 'operations')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'research')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'medical')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'compliance')).toBe(true);
    expect(has(HEALTHCARE_PRESET, 'development')).toBe(false);
    expect(has(HEALTHCARE_PRESET, 'marketing')).toBe(false);
    expect(has(HEALTHCARE_PRESET, 'courses')).toBe(false);
    expect(has(HEALTHCARE_PRESET, 'automations')).toBe(false);
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
    expect(resolveEnabledSections(null, 'healthcare')).toContain('medical');
    expect(resolveEnabledSections([], 'ministry')).toContain('operations');
    expect(resolveEnabledSections(undefined, 'education')).toContain('courses');
  });

  it('returns null only when neither settings nor industry exist (legacy fail-open)', () => {
    expect(resolveEnabledSections(null, null)).toBeNull();
    expect(resolveEnabledSections([], undefined)).toBeNull();
  });
});
