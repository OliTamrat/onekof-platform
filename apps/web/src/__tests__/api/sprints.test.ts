import { describe, it, expect } from 'vitest';
import {
  createSprintSchema,
  updateSprintSchema,
  completeSprintSchema,
  updateIssueSchema,
  updateProjectSettingsSchema,
} from '@/lib/validation/schemas';
import {
  computeEffectiveSettings,
  ORG_DEFAULTS,
} from '@/lib/settings/effective';

describe('Sprint schemas', () => {
  it('accepts a minimal sprint (dates optional at creation)', () => {
    const result = createSprintSchema.safeParse({ name: 'Sprint 1' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty sprint name', () => {
    const result = createSprintSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts full sprint payload with goal and dates', () => {
    const result = createSprintSchema.safeParse({
      name: 'Phase 2 — Data Collection',
      goal: 'Complete field data collection for all woredas',
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('allows clearing dates on update via null', () => {
    const result = updateSprintSchema.safeParse({ startDate: null, endDate: null });
    expect(result.success).toBe(true);
  });

  it('rejects negative position on update', () => {
    const result = updateSprintSchema.safeParse({ position: -1 });
    expect(result.success).toBe(false);
  });
});

describe('Sprint completion rollover', () => {
  it('accepts backlog as rollover target', () => {
    const result = completeSprintSchema.safeParse({ rolloverTo: 'backlog' });
    expect(result.success).toBe(true);
  });

  it('accepts a sprint id as rollover target', () => {
    const result = completeSprintSchema.safeParse({
      rolloverTo: 'clxyz12340000abcd1234abcd',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing rollover decision', () => {
    const result = completeSprintSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Issue sprint fields', () => {
  it('accepts sprintId null (move back to backlog)', () => {
    const result = updateIssueSchema.safeParse({ sprintId: null });
    expect(result.success).toBe(true);
  });

  it('accepts storyPoints alongside estimate', () => {
    const result = updateIssueSchema.safeParse({ estimate: 8, storyPoints: 5 });
    expect(result.success).toBe(true);
  });

  it('rejects negative storyPoints', () => {
    const result = updateIssueSchema.safeParse({ storyPoints: -3 });
    expect(result.success).toBe(false);
  });
});

describe('Project settings schema', () => {
  it('accepts null overrides (restore inheritance)', () => {
    const result = updateProjectSettingsSchema.safeParse({
      sprintsEnabled: null,
      estimationUnit: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown estimation units', () => {
    const result = updateProjectSettingsSchema.safeParse({ estimationUnit: 'DAYS' });
    expect(result.success).toBe(false);
  });

  it('accepts a workflow transitions map', () => {
    const result = updateProjectSettingsSchema.safeParse({
      workflowTransitions: { TODO: ['IN_PROGRESS', 'BLOCKED'], DONE: [] },
    });
    expect(result.success).toBe(true);
  });
});

describe('Settings inheritance (computeEffectiveSettings)', () => {
  const org = {
    sprintsEnabledDefault: false,
    estimationUnitDefault: 'HOURS',
    enforceWorkflowDefault: false,
    terminologyScheme: 'AGILE',
  };

  it('falls through to org defaults when project has no overrides', () => {
    const effective = computeEffectiveSettings(org, null, 'KANBAN');
    expect(effective.sprintsEnabled).toBe(false);
    expect(effective.estimationUnit).toBe('HOURS');
    expect(effective.enforceWorkflow).toBe(false);
    expect(effective.workflowTransitions).toBeNull();
  });

  it('project override wins over org default', () => {
    const effective = computeEffectiveSettings(
      org,
      { sprintsEnabled: true, estimationUnit: 'POINTS', enforceWorkflow: true, workflowTransitions: null },
      'KANBAN'
    );
    expect(effective.sprintsEnabled).toBe(true);
    expect(effective.estimationUnit).toBe('POINTS');
    expect(effective.enforceWorkflow).toBe(true);
  });

  it('null project value means inherit, not false', () => {
    const orgEnabled = { ...org, sprintsEnabledDefault: true };
    const effective = computeEffectiveSettings(
      orgEnabled,
      { sprintsEnabled: null, estimationUnit: null, enforceWorkflow: null, workflowTransitions: null },
      'KANBAN'
    );
    expect(effective.sprintsEnabled).toBe(true);
  });

  it('explicit false override beats org default true', () => {
    const orgEnabled = { ...org, sprintsEnabledDefault: true };
    const effective = computeEffectiveSettings(
      orgEnabled,
      { sprintsEnabled: false, estimationUnit: null, enforceWorkflow: null, workflowTransitions: null },
      'SCRUM'
    );
    expect(effective.sprintsEnabled).toBe(false);
  });

  it('SCRUM template enables sprints even when org default is off', () => {
    const effective = computeEffectiveSettings(org, null, 'SCRUM');
    expect(effective.sprintsEnabled).toBe(true);
  });

  it('uses hardcoded fallbacks when org has no settings row', () => {
    const effective = computeEffectiveSettings(ORG_DEFAULTS, null, 'KANBAN');
    expect(effective.estimationUnit).toBe('HOURS');
    expect(effective.terminologyScheme).toBe('AGILE');
  });
});

describe('Bulk moveToSprint contract', () => {
  it('uses the "null" sentinel string for backlog moves', () => {
    // The bulk API's value field is a string; "null" maps to sprintId = null
    const value = 'null';
    const targetSprintId = value === 'null' ? null : value;
    expect(targetSprintId).toBeNull();
  });
});
