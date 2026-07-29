import { describe, it, expect } from 'vitest';
import { activityHref, describeChange } from '@/components/activity/activity-timeline';

const task = {
  entityType: 'TASK',
  entityId: 'task-1',
  entity: {
    id: 'task-1',
    key: 'DAPS-42',
    title: 'Fix the thing',
    project: { id: 'proj-1', key: 'DAPS', name: 'Platform', color: '#000' },
  },
};

describe('a card is interactive only when it has somewhere to go', () => {
  it('links a task to its project board with the task open', () => {
    expect(activityHref(task, false)).toBe(
      '/dashboard/issues?projectId=proj-1&taskId=task-1'
    );
  });

  it('returns null inside an entity-scoped timeline', () => {
    // The reported bug. In the issue slideout this timeline is scoped to the
    // task already open behind it, so every card pointed at where the reader
    // already was — and on /dashboard/issues that is a push to the current
    // route, which does not remount and therefore does nothing at all.
    expect(activityHref(task, true)).toBeNull();
  });

  it('returns null for a task with no enriched entity', () => {
    // No entity means no project, so the issues page would open on whichever
    // board happened to load and the task would not be there.
    expect(activityHref({ ...task, entity: null }, false)).toBeNull();
    expect(activityHref({ ...task, entity: undefined }, false)).toBeNull();
  });

  it('links a project', () => {
    expect(
      activityHref({ entityType: 'PROJECT', entityId: 'proj-9', entity: null }, false)
    ).toBe('/dashboard?projectId=proj-9');
  });

  it('returns null for every entity type with no destination', () => {
    // These used to fall through the handler silently while the card still
    // rendered as a button. A null here makes the card non-interactive
    // instead — the honest outcome until those pages exist.
    for (const entityType of ['GOAL', 'TEAM', 'BUDGET', 'EXPENSE', 'DOCUMENT', 'SPRINT']) {
      expect(activityHref({ entityType, entityId: 'x', entity: null }, false)).toBeNull();
    }
  });

  it('falls back to a taskId-only link when the project is missing', () => {
    const noProject = { ...task, entity: { ...task.entity, project: undefined as any } };
    expect(activityHref(noProject, false)).toBe('/dashboard/issues?taskId=task-1');
  });
});

describe('the card shows what changed', () => {
  it('reads field/from/to out of metadata', () => {
    // This data has been recorded and returned all along; the card just never
    // read it. That is the whole of "it does not show the edited version".
    expect(
      describeChange({ metadata: { field: 'status', from: 'TODO', to: 'IN_PROGRESS' } })
    ).toEqual({ field: 'status', from: 'todo', to: 'in progress' });
  });

  it('renders a cleared value as "none" rather than blank', () => {
    expect(describeChange({ metadata: { field: 'assigneeId', from: 'u1', to: null } })).toEqual({
      field: 'assigneeId',
      from: 'u1',
      to: 'none',
    });
  });

  it('keeps a set-with-no-previous-value renderable', () => {
    // from is absent, to is present — the card shows only the new value
    // rather than "undefined -> x".
    const out = describeChange({ metadata: { field: 'sprint', to: 'Sprint 3' } });
    expect(out).toEqual({ field: 'sprint', from: undefined, to: 'sprint 3' });
  });

  it('returns null when there is no field to describe', () => {
    expect(describeChange({ metadata: null })).toBeNull();
    expect(describeChange({ metadata: {} })).toBeNull();
    expect(describeChange({ metadata: { commentId: 'c1' } })).toBeNull();
    expect(describeChange({ metadata: 'not an object' })).toBeNull();
  });

  it('humanises underscored field names', () => {
    expect(describeChange({ metadata: { field: 'story_points', to: 5 } })?.field).toBe(
      'story points'
    );
  });
});
