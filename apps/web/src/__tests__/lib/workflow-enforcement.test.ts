import { describe, it, expect } from 'vitest';
import {
  validateStatusTransition,
  getAllowedTransitions,
  DEFAULT_TRANSITIONS,
} from '@/lib/workflow-engine';

describe('Workflow enforcement (Phase 4)', () => {
  it('allows anything when enforcement is off', () => {
    expect(
      validateStatusTransition('BACKLOG', 'DONE', { enforceWorkflow: false }).allowed
    ).toBe(true);
    expect(validateStatusTransition('BACKLOG', 'DONE').allowed).toBe(true);
  });

  it('blocks illegal jumps when enforcement is on', () => {
    const result = validateStatusTransition('BACKLOG', 'DONE', { enforceWorkflow: true });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Cannot transition');
  });

  it('allows legal transitions when enforcement is on', () => {
    expect(
      validateStatusTransition('IN_PROGRESS', 'DONE', { enforceWorkflow: true }).allowed
    ).toBe(true);
  });

  it('same status is always a no-op', () => {
    expect(
      validateStatusTransition('DONE', 'DONE', { enforceWorkflow: true }).allowed
    ).toBe(true);
  });

  it('honors a custom transition table over the default', () => {
    const strict = { BACKLOG: ['TODO'], TODO: ['IN_PROGRESS'] } as any;
    // Default allows BACKLOG -> IN_PROGRESS; the strict table does not
    expect(
      validateStatusTransition('BACKLOG', 'IN_PROGRESS', { enforceWorkflow: true }).allowed
    ).toBe(true);
    expect(
      validateStatusTransition('BACKLOG', 'IN_PROGRESS', {
        enforceWorkflow: true,
        transitions: strict,
      }).allowed
    ).toBe(false);
    expect(
      validateStatusTransition('BACKLOG', 'TODO', {
        enforceWorkflow: true,
        transitions: strict,
      }).allowed
    ).toBe(true);
  });

  it('null transitions falls back to the default table', () => {
    expect(
      validateStatusTransition('IN_REVIEW', 'DONE', {
        enforceWorkflow: true,
        transitions: null,
      }).allowed
    ).toBe(true);
  });

  it('getAllowedTransitions reflects the custom table', () => {
    const strict = { TODO: ['IN_PROGRESS'] } as any;
    expect(getAllowedTransitions('TODO', strict)).toEqual(['IN_PROGRESS']);
    expect(getAllowedTransitions('TODO')).toEqual(DEFAULT_TRANSITIONS.TODO);
    expect(getAllowedTransitions('BACKLOG', strict)).toEqual([]);
  });

  it('default table has an entry for every status and no self-loops', () => {
    for (const [from, tos] of Object.entries(DEFAULT_TRANSITIONS)) {
      expect(tos.length).toBeGreaterThan(0);
      expect(tos).not.toContain(from);
    }
  });
});
