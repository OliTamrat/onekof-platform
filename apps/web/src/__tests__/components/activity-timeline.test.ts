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

/**
 * Every shape the logTaskActivity call sites actually write. The first
 * version of describeChange handled two of these and rendered blank for the
 * other five — and the tests passed, because they were written from the same
 * assumption as the code rather than from the call sites.
 */
describe('the card shows what changed — for every shape the routes emit', () => {
  it('UPDATED status: { field, from, to }', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'status', from: 'TODO', to: 'IN_PROGRESS' } })
    ).toEqual({ field: 'status', from: 'todo', to: 'in progress' });
  });

  it('UPDATED priority: { field, from, to }', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'priority', from: 'LOW', to: 'HIGH' } })
    ).toEqual({ field: 'priority', from: 'low', to: 'high' });
  });

  it('COMMENTED: { commentId, preview } — the reported miss', () => {
    // No `field`, so the old version returned null and the card said
    // "somebody commented" with the comment itself withheld.
    expect(
      describeChange({ action: 'COMMENTED', metadata: { commentId: 'c1', preview: 'Ordered the scan' } })
    ).toEqual({ field: 'comment', text: 'Ordered the scan' });
  });

  it('SPRINT_CHANGED: { from, to } with NO field', () => {
    // The label has to come from the action, or this renders blank.
    expect(
      describeChange({ action: 'SPRINT_CHANGED', metadata: { from: 's1', to: 's2' } })
    ).toEqual({ field: 'sprint', from: 's1', to: 's2' });
  });

  it('SPRINT_CHANGED bulk: { from, to, bulk }', () => {
    expect(
      describeChange({ action: 'SPRINT_CHANGED', metadata: { from: null, to: 's2', bulk: true } })
    ).toEqual({ field: 'sprint', from: 'none', to: 's2' });
  });

  it('DEPARTMENT_CHANGED: nested { from: {…}, to: {…} }', () => {
    expect(
      describeChange({
        action: 'DEPARTMENT_CHANGED',
        metadata: {
          from: { department: 'operations', workstream: 'incidents' },
          to: { department: 'medical', workstream: 'care' },
        },
      })
    ).toEqual({
      field: 'classification',
      from: 'operations / incidents',
      to: 'medical / care',
    });
  });

  it('DEPARTMENT_CHANGED from nothing reads as "none", not blank', () => {
    expect(
      describeChange({
        action: 'DEPARTMENT_CHANGED',
        metadata: { from: {}, to: { department: 'medical' } },
      })
    ).toEqual({ field: 'classification', from: 'none', to: 'medical' });
  });

  it('renders a cleared value as "none" rather than blank', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'assigneeId', from: 'u1', to: null } })
    ).toEqual({ field: 'assigneeId', from: 'u1', to: 'none' });
  });

  it('keeps a set-with-no-previous-value renderable', () => {
    const out = describeChange({ action: 'UPDATED', metadata: { field: 'sprint', to: 'Sprint 3' } });
    expect(out).toEqual({ field: 'sprint', from: undefined, to: 'sprint 3' });
  });

  it('returns null only when there is genuinely nothing to say', () => {
    expect(describeChange({ action: 'CREATED', metadata: null })).toBeNull();
    expect(describeChange({ action: 'CREATED', metadata: {} })).toBeNull();
    expect(describeChange({ action: 'CREATED', metadata: 'not an object' })).toBeNull();
    // ASSIGNED records only an opaque id — no transition and no text, so
    // there is nothing meaningful to render beyond the action badge.
    expect(describeChange({ action: 'ASSIGNED', metadata: { assigneeId: 'u1' } })).toBeNull();
  });

  it('ignores an empty comment preview rather than rendering empty quotes', () => {
    expect(describeChange({ action: 'COMMENTED', metadata: { preview: '   ' } })).toBeNull();
  });

  it('humanises underscored field names', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'story_points', to: 5 } })?.field
    ).toBe('story points');
  });
});

/**
 * The PATCH route can change fifteen fields and used to record five. A member
 * could rename an assigned task, rewrite its description and move its due
 * date with the feed showing nothing — which is the actual reason a project
 * admin could not see what had been done. These are the shapes the generic
 * recorder now emits.
 */
describe('field edits that previously produced no activity at all', () => {
  it('title: from → to', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'title', from: 'Old name', to: 'New name' } })
    ).toEqual({ field: 'title', from: 'old name', to: 'new name' });
  });

  it('due date: from → to', () => {
    expect(
      describeChange({
        action: 'UPDATED',
        metadata: { field: 'due date', from: '2026-08-01T00:00:00.000Z', to: '2026-09-01T00:00:00.000Z' },
      })
    ).toMatchObject({ field: 'due date' });
  });

  it('estimate set where there was none reads "none → 8"', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'estimate', from: null, to: '8' } })
    ).toEqual({ field: 'estimate', from: 'none', to: '8' });
  });

  it('labels: joined rather than rendered as an array', () => {
    expect(
      describeChange({ action: 'UPDATED', metadata: { field: 'labels', from: 'bug', to: 'bug, urgent' } })
    ).toEqual({ field: 'labels', from: 'bug', to: 'bug, urgent' });
  });

  it('description records THAT it changed, not the body', () => {
    // A description can be thousands of characters. Recording it in full
    // would bloat every row and push arbitrary user text into a feed
    // rendered elsewhere. `note`, not `text`, so it is not quoted as though
    // somebody said it.
    const out = describeChange({ action: 'UPDATED', metadata: { field: 'description', changed: true } });
    expect(out).toEqual({ field: 'description', note: 'edited' });
    expect(out?.text).toBeUndefined();
  });

  it('an elided change without a field name is not renderable', () => {
    expect(describeChange({ action: 'UPDATED', metadata: { changed: true } })).toBeNull();
  });
});
