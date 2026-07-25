import { describe, it, expect } from 'vitest';
import {
  aggregateSprintInsights,
  sprintDurationDays,
  summarizeChurn,
} from '@/components/sprints/insights';

const issue = (over: Record<string, unknown> = {}) => ({
  id: Math.random().toString(36).slice(2),
  status: 'DONE',
  timeSpent: 0,
  estimate: 0,
  storyPoints: 0,
  assignee: null,
  ...over,
});

describe('aggregateSprintInsights', () => {
  const abebe = { id: 'u1', name: 'Abebe' };
  const sara = { id: 'u2', name: 'Sara' };

  it('totals issues, done, time, and estimates', () => {
    const result = aggregateSprintInsights(
      [
        issue({ status: 'DONE', timeSpent: 3, estimate: 4, assignee: abebe }),
        issue({ status: 'IN_PROGRESS', timeSpent: 1, estimate: 2, assignee: abebe }),
        issue({ status: 'DONE', timeSpent: 5, estimate: 6, assignee: sara }),
      ],
      'HOURS'
    );
    expect(result.totals).toEqual({ issues: 3, done: 2, timeSpent: 9, estimated: 12 });
  });

  it('groups contributions per assignee, most delivered first', () => {
    const result = aggregateSprintInsights(
      [
        issue({ assignee: sara }),
        issue({ assignee: sara }),
        issue({ assignee: abebe }),
      ],
      'HOURS'
    );
    expect(result.contributions.map((c) => c.name)).toEqual(['Sara', 'Abebe']);
    expect(result.contributions[0].done).toBe(2);
  });

  it('buckets unassigned work last, honestly labeled', () => {
    const result = aggregateSprintInsights(
      [issue({ assignee: null }), issue({ assignee: abebe })],
      'HOURS'
    );
    expect(result.contributions.at(-1)?.id).toBeNull();
    expect(result.contributions.at(-1)?.issues).toBe(1);
  });

  it('uses storyPoints when the unit is POINTS and estimate when HOURS', () => {
    const rows = [issue({ estimate: 8, storyPoints: 3, assignee: abebe })];
    expect(aggregateSprintInsights(rows, 'POINTS').totals.estimated).toBe(3);
    expect(aggregateSprintInsights(rows, 'HOURS').totals.estimated).toBe(8);
  });

  it('handles the empty sprint without dividing by zero', () => {
    const result = aggregateSprintInsights([], 'HOURS');
    expect(result.totals.issues).toBe(0);
    expect(result.contributions).toEqual([]);
  });
});

describe('summarizeChurn', () => {
  const S = 'sprint-1';

  it('counts adds and removes for this sprint only', () => {
    const result = summarizeChurn(S, [
      { entityId: 'a', metadata: { from: null, to: S } },
      { entityId: 'b', metadata: { from: S, to: null } },
      { entityId: 'c', metadata: { from: 'other-sprint', to: 'another' } },
    ]);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
    expect(result.perIssue.has('c')).toBe(false);
  });

  it('gross counting: added then removed is 1+1 and direction both', () => {
    const result = summarizeChurn(S, [
      { entityId: 'a', metadata: { from: null, to: S } },
      { entityId: 'a', metadata: { from: S, to: null } },
    ]);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
    expect(result.perIssue.get('a')).toBe('both');
  });

  it('a move between two sprints counts once per side', () => {
    // from other sprint INTO this one — this sprint sees an add only
    const result = summarizeChurn(S, [
      { entityId: 'a', metadata: { from: 'other', to: S } },
    ]);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(0);
    expect(result.perIssue.get('a')).toBe('in');
  });

  it('tolerates null metadata', () => {
    const result = summarizeChurn(S, [{ entityId: 'a', metadata: null }]);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });
});

describe('sprintDurationDays', () => {
  it('computes whole days', () => {
    expect(sprintDurationDays('2026-08-01T00:00:00.000Z', '2026-08-15T00:00:00.000Z')).toBe(14);
  });

  it('returns null on missing or inverted dates', () => {
    expect(sprintDurationDays(null, '2026-08-15T00:00:00.000Z')).toBeNull();
    expect(sprintDurationDays('2026-08-15T00:00:00.000Z', '2026-08-01T00:00:00.000Z')).toBeNull();
  });
});
