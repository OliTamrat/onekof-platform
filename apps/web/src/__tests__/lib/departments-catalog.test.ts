import { describe, it, expect } from 'vitest';
import {
  DEPARTMENT_CATALOG,
  DEPARTMENTS,
  isDepartment,
  isWorkstreamOf,
  validateClassification,
} from '@/lib/departments/catalog';

describe('department catalog', () => {
  it('contains the four seed departments', () => {
    expect(DEPARTMENTS.sort()).toEqual(['development', 'marketing', 'operations', 'research']);
  });

  it('isDepartment accepts catalog values and rejects everything else', () => {
    expect(isDepartment('operations')).toBe(true);
    expect(isDepartment('finance')).toBe(false);
    expect(isDepartment('')).toBe(false);
    expect(isDepartment(null)).toBe(false);
    expect(isDepartment(undefined)).toBe(false);
    expect(isDepartment(42)).toBe(false);
  });

  it('isWorkstreamOf enforces pairing', () => {
    expect(isWorkstreamOf('development', 'release')).toBe(true);
    expect(isWorkstreamOf('marketing', 'release')).toBe(false);
    expect(isWorkstreamOf('research', 'inspection')).toBe(true);
    expect(isWorkstreamOf('unknown', 'release')).toBe(false);
    expect(isWorkstreamOf('development', null)).toBe(false);
  });

  it('every catalog pair validates', () => {
    for (const [dept, workstreams] of Object.entries(DEPARTMENT_CATALOG)) {
      expect(validateClassification(dept, null).ok).toBe(true);
      for (const ws of workstreams) {
        expect(validateClassification(dept, ws).ok).toBe(true);
      }
    }
  });

  it('null/undefined classification is valid (general work is first-class)', () => {
    expect(validateClassification(null, null).ok).toBe(true);
    expect(validateClassification(undefined, undefined).ok).toBe(true);
  });

  it('a workstream without a department is rejected', () => {
    const result = validateClassification(null, 'release');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/requires a department/);
  });

  it('unknown departments and mismatched workstreams are rejected', () => {
    expect(validateClassification('finance', null).ok).toBe(false);
    const mismatch = validateClassification('operations', 'release');
    expect(mismatch.ok).toBe(false);
    expect(mismatch.error).toMatch(/does not belong/);
  });
});

describe('issue schemas accept classification fields', () => {
  it('create and update schemas pass department/workstream through', async () => {
    const { createIssueSchema, updateIssueSchema } = await import('@/lib/validation/schemas');
    const create = createIssueSchema.safeParse({
      title: 'Water quality sensors procurement',
      type: 'TASK',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: 'clx0000000000000000000000',
      reporterId: 'clx0000000000000000000001',
      department: 'operations',
      workstream: 'checklist',
    });
    expect(create.success).toBe(true);
    if (create.success) {
      expect(create.data.department).toBe('operations');
      expect(create.data.workstream).toBe('checklist');
    }

    const update = updateIssueSchema.safeParse({ department: null, workstream: null });
    expect(update.success).toBe(true);
  });
});

describe('workstream label keys (chip + slideout rendering)', () => {
  it('every catalog workstream has an i18n label key', async () => {
    const { WORKSTREAM_LABEL_KEYS } = await import('@/lib/departments/catalog');
    for (const [dept, workstreams] of Object.entries(DEPARTMENT_CATALOG)) {
      for (const ws of workstreams) {
        expect(WORKSTREAM_LABEL_KEYS[ws], `${dept}/${ws}`).toBeTruthy();
      }
    }
  });

  it('every label key resolves in English (no raw keys leak to the UI)', async () => {
    const { WORKSTREAM_LABEL_KEYS } = await import('@/lib/departments/catalog');
    const en = (await import('@/locales/en.json')).default as any;
    for (const key of Object.values(WORKSTREAM_LABEL_KEYS)) {
      const [section, name] = key.split('.');
      expect(en[section]?.[name], key).toBeTruthy();
    }
    // department labels too
    for (const dept of Object.keys(DEPARTMENT_CATALOG)) {
      expect(en.sidebar?.[dept], `sidebar.${dept}`).toBeTruthy();
    }
  });
});

describe('M4 — facility operations workstreams', () => {
  const M4_WORKSTREAMS = ['equipment', 'facility', 'safety'] as const;

  it('places facility work under Operations rather than a new department', () => {
    // M8: facilities/equipment/safety are Operations workstreams. If someone
    // promotes one to a top-level department, that is a design change and
    // should fail here first.
    expect(DEPARTMENTS.sort()).toEqual(['development', 'marketing', 'operations', 'research']);
    for (const ws of M4_WORKSTREAMS) {
      expect(isWorkstreamOf('operations', ws), ws).toBe(true);
    }
  });

  it('does not attach facility workstreams to unrelated departments', () => {
    for (const ws of M4_WORKSTREAMS) {
      expect(isWorkstreamOf('development', ws), ws).toBe(false);
      expect(isWorkstreamOf('marketing', ws), ws).toBe(false);
      expect(isWorkstreamOf('research', ws), ws).toBe(false);
    }
  });

  // The English-only guard above would pass while Amharic silently rendered a
  // raw key. These pages ship to Ethiopian hospitals and contractors, so the
  // check runs across every locale we claim to support.
  it('resolves every workstream label in all five locales', async () => {
    const { WORKSTREAM_LABEL_KEYS } = await import('@/lib/departments/catalog');
    const locales = {
      en: (await import('@/locales/en.json')).default as any,
      am: (await import('@/locales/am.json')).default as any,
      om: (await import('@/locales/om.json')).default as any,
      ti: (await import('@/locales/ti.json')).default as any,
      so: (await import('@/locales/so.json')).default as any,
    };
    for (const [code, dict] of Object.entries(locales)) {
      for (const ws of M4_WORKSTREAMS) {
        const key = WORKSTREAM_LABEL_KEYS[ws];
        const [section, name] = key.split('.');
        expect(dict[section]?.[name], `${code}: ${key}`).toBeTruthy();
      }
      for (const desc of ['facilitiesDesc', 'equipmentDesc', 'safetyDesc']) {
        expect(dict.departments?.[desc], `${code}: departments.${desc}`).toBeTruthy();
      }
    }
  });

  it('gives every Operations tab a matching catalog workstream', async () => {
    const { OPERATIONS_TABS } = await import('@/config/department-tabs');
    // Tab ids are plural page slugs; workstreams are singular vocabulary.
    const TAB_TO_WORKSTREAM: Record<string, string> = {
      incidents: 'incident',
      monitoring: 'monitoring',
      checklists: 'checklist',
      facilities: 'facility',
      equipment: 'equipment',
      safety: 'safety',
    };
    for (const tab of OPERATIONS_TABS) {
      const ws = TAB_TO_WORKSTREAM[tab.id];
      expect(ws, `no workstream mapped for tab "${tab.id}"`).toBeTruthy();
      expect(isWorkstreamOf('operations', ws), tab.id).toBe(true);
    }
  });
});
