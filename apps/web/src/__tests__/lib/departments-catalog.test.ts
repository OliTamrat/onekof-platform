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
