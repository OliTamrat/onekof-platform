import { describe, it, expect, vi } from 'vitest';

// care-item-visibility imports the access ladder, which lives alongside the
// database-backed requirePatientAccess. Only the pure ladder is used here.
vi.mock('@onekof/database', () => ({ prisma: {} }));

import {
  isCareItem,
  filterCareItems,
  redactCareItem,
  applyCareItemVisibility,
} from '@/lib/security/care-item-visibility';

const ordinary = { id: 'task-1', patientId: null };
const care = { id: 'task-2', patientId: 'pat-1' };
const tasks = [ordinary, care];

describe('care item identification', () => {
  it('is defined solely by carrying a patient reference', () => {
    expect(isCareItem(care)).toBe(true);
    expect(isCareItem(ordinary)).toBe(false);
    expect(isCareItem({ id: 'x' })).toBe(false);
  });
});

describe('below LIMITED, care items are omitted rather than redacted', () => {
  // A redacted row still says "a patient exists and somebody is doing work
  // about them", which on a small ward is often enough to identify who.
  it('removes care items entirely for NO_ACCESS', () => {
    const out = applyCareItemVisibility(tasks, 'NO_ACCESS');
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('task-1');
  });

  it('removes care items for a viewer with no patient access at all', () => {
    expect(applyCareItemVisibility(tasks, null)).toHaveLength(1);
    expect(applyCareItemVisibility(tasks, undefined)).toHaveLength(1);
  });

  it('never touches ordinary tasks', () => {
    // The 99% of work that has nothing to do with patients must pass through
    // untouched at every level.
    for (const level of ['NO_ACCESS', 'LIMITED', 'FULL', 'MANAGE'] as const) {
      const out = applyCareItemVisibility([ordinary], level);
      expect(out).toEqual([ordinary]);
    }
  });
});

describe('LIMITED sees the work but not the patient', () => {
  it('keeps the care item and strips the patient reference', () => {
    const out = applyCareItemVisibility(tasks, 'LIMITED');
    expect(out).toHaveLength(2);
    const item = out.find((t) => t.id === 'task-2')!;
    expect(item.patientId).toBeNull();
  });

  it('nulls the field rather than deleting it', () => {
    // A missing key could be mistaken for "this task has no patient", which
    // is a different fact from "you may not see which patient".
    const out = redactCareItem(care, 'LIMITED');
    expect('patientId' in out).toBe(true);
    expect(out.patientId).toBeNull();
  });
});

describe('FULL and above see care items intact', () => {
  it('returns the patient reference unchanged', () => {
    for (const level of ['FULL', 'MANAGE'] as const) {
      const out = applyCareItemVisibility(tasks, level);
      expect(out).toHaveLength(2);
      expect(out.find((t) => t.id === 'task-2')!.patientId).toBe('pat-1');
    }
  });
});

describe('order of operations', () => {
  it('filters before redacting, or every care item leaks', () => {
    // Redacting first would null the patientId that the NO_ACCESS filter then
    // needs in order to recognise the row as a care item — and it would pass
    // through as an ordinary task. This test is the reason the combined
    // helper exists rather than leaving callers to compose the two.
    const redactedFirst = tasks
      .map((t) => redactCareItem(t, 'NO_ACCESS'))
      .filter((t) => !isCareItem(t));
    // The wrong order leaks the care item...
    expect(redactedFirst).toHaveLength(2);
    // ...and the helper does not.
    expect(applyCareItemVisibility(tasks, 'NO_ACCESS')).toHaveLength(1);
  });
});
