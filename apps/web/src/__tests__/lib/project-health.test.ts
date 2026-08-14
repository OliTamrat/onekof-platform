import { describe, it, expect } from 'vitest';
import { deriveProjectHealth, HEALTH_ORDER } from '@/lib/project-health';

const NOW = new Date('2026-06-15T12:00:00Z');

const task = (status: string, dueDate: string | null = null) => ({
  status,
  dueDate: dueDate ? new Date(dueDate) : null,
});

const project = (over: Partial<Parameters<typeof deriveProjectHealth>[0]> = {}) => ({
  startDate: null,
  dueDate: null,
  healthOverride: null,
  tasks: [],
  ...over,
});

describe('deriveProjectHealth', () => {
  it('reports NOT_STARTED when the project has no work items', () => {
    const r = deriveProjectHealth(project(), NOW);
    expect(r.health).toBe('NOT_STARTED');
    expect(r.metrics.total).toBe(0);
  });

  it('reports NOT_STARTED when work exists but none has moved', () => {
    const r = deriveProjectHealth(
      project({ tasks: [task('TODO'), task('TODO')] }),
      NOW,
    );
    expect(r.health).toBe('NOT_STARTED');
  });

  it('reports COMPLETE only when every item is done', () => {
    expect(
      deriveProjectHealth(project({ tasks: [task('DONE'), task('DONE')] }), NOW).health,
    ).toBe('COMPLETE');
    expect(
      deriveProjectHealth(project({ tasks: [task('DONE'), task('TODO')] }), NOW).health,
    ).not.toBe('COMPLETE');
  });

  it('treats a project finished late as COMPLETE, not OFF_TRACK', () => {
    // Finishing behind schedule is history, not a live problem — a leader
    // scanning for trouble should not see delivered work in the red band.
    const r = deriveProjectHealth(
      project({
        startDate: new Date('2026-01-01'),
        dueDate: new Date('2026-03-01'),
        tasks: [task('DONE', '2026-02-01'), task('DONE', '2026-02-15')],
      }),
      NOW,
    );
    expect(r.health).toBe('COMPLETE');
  });

  it('lets blocked work dominate before overdue counts are considered', () => {
    const r = deriveProjectHealth(
      project({ tasks: [task('BLOCKED'), task('BLOCKED'), task('DONE'), task('TODO')] }),
      NOW,
    );
    expect(r.health).toBe('BLOCKED');
  });

  it('does not count an item due today as overdue', () => {
    // Boundary: due-today work still has the day to be finished. Counting it
    // overdue would flag healthy projects red every morning.
    const r = deriveProjectHealth(
      project({
        tasks: [task('DONE'), task('TODO', '2026-06-15T23:00:00Z'), task('DONE'), task('DONE')],
      }),
      NOW,
    );
    expect(r.metrics.overdue).toBe(0);
    expect(r.health).toBe('ON_TRACK');
  });

  it('counts an item due yesterday as overdue', () => {
    const r = deriveProjectHealth(
      project({ tasks: [task('TODO', '2026-06-14T23:00:00Z'), task('DONE')] }),
      NOW,
    );
    expect(r.metrics.overdue).toBe(1);
  });

  it('escalates from AT_RISK to OFF_TRACK as the overdue share grows', () => {
    const mostlyFine = deriveProjectHealth(
      project({
        tasks: [task('TODO', '2026-06-01'), ...Array(9).fill(null).map(() => task('DONE'))],
      }),
      NOW,
    );
    expect(mostlyFine.health).toBe('AT_RISK');

    const bad = deriveProjectHealth(
      project({
        tasks: [
          ...Array(3).fill(null).map(() => task('TODO', '2026-06-01')),
          ...Array(7).fill(null).map(() => task('DONE')),
        ],
      }),
      NOW,
    );
    expect(bad.health).toBe('OFF_TRACK');
  });

  it('flags schedule drift even when nothing is overdue', () => {
    // Half the work done with 90% of the calendar gone is the case a purely
    // overdue-based rule misses entirely: no item has slipped its own date yet.
    const r = deriveProjectHealth(
      project({
        startDate: new Date('2026-01-01'),
        dueDate: new Date('2026-07-01'),
        tasks: [task('DONE'), task('DONE'), task('TODO'), task('TODO')],
      }),
      NOW,
    );
    expect(r.metrics.overdue).toBe(0);
    expect(['AT_RISK', 'OFF_TRACK']).toContain(r.health);
  });

  it('survives a project whose start and due date are the same day', () => {
    // Guards the division that would otherwise produce Infinity.
    const r = deriveProjectHealth(
      project({
        startDate: new Date('2026-06-15'),
        dueDate: new Date('2026-06-15'),
        tasks: [task('DONE'), task('TODO')],
      }),
      NOW,
    );
    expect(r.metrics.scheduleElapsed).toBeNull();
    expect(Number.isFinite(r.metrics.percentComplete)).toBe(true);
  });

  it('honours a manual override and marks it as such', () => {
    const r = deriveProjectHealth(
      project({
        healthOverride: 'ON_TRACK',
        // Data that would otherwise classify as OFF_TRACK.
        tasks: [
          ...Array(5).fill(null).map(() => task('TODO', '2026-01-01')),
          task('DONE'),
        ],
      }),
      NOW,
    );
    expect(r.health).toBe('ON_TRACK');
    expect(r.isOverridden).toBe(true);
    // The underlying numbers are still reported, so the override is auditable
    // rather than simply hiding the problem.
    expect(r.metrics.overdue).toBe(5);
  });

  it('orders the legend worst-first so problems lead', () => {
    expect(HEALTH_ORDER[0]).toBe('OFF_TRACK');
    expect(HEALTH_ORDER[HEALTH_ORDER.length - 1]).toBe('COMPLETE');
    expect(new Set(HEALTH_ORDER).size).toBe(HEALTH_ORDER.length);
  });
});
