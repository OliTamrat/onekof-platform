import { describe, it, expect } from 'vitest';
import {
  validateStatusTransition,
  getAllowedTransitions,
  WORKFLOW_STATUSES,
  type TaskStatus,
} from '@/lib/workflow-engine';

describe('Workflow Engine', () => {
  describe('validateStatusTransition (enforceWorkflow: false)', () => {
    it('allows any transition when enforcement is off', () => {
      const result = validateStatusTransition('BACKLOG', 'DONE', { enforceWorkflow: false });
      expect(result.allowed).toBe(true);
    });

    it('allows same-status transition', () => {
      const result = validateStatusTransition('TODO', 'TODO');
      expect(result.allowed).toBe(true);
    });
  });

  describe('validateStatusTransition (enforceWorkflow: true)', () => {
    it('allows BACKLOG → TODO', () => {
      const result = validateStatusTransition('BACKLOG', 'TODO', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows TODO → IN_PROGRESS', () => {
      const result = validateStatusTransition('TODO', 'IN_PROGRESS', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows IN_PROGRESS → IN_REVIEW', () => {
      const result = validateStatusTransition('IN_PROGRESS', 'IN_REVIEW', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows IN_REVIEW → DONE', () => {
      const result = validateStatusTransition('IN_REVIEW', 'DONE', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows IN_PROGRESS → DONE (skip review)', () => {
      const result = validateStatusTransition('IN_PROGRESS', 'DONE', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('blocks BACKLOG → DONE (skip too many steps)', () => {
      const result = validateStatusTransition('BACKLOG', 'DONE', { enforceWorkflow: true });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cannot transition');
    });

    it('blocks TODO → DONE', () => {
      const result = validateStatusTransition('TODO', 'DONE', { enforceWorkflow: true });
      expect(result.allowed).toBe(false);
    });

    it('allows backward: IN_REVIEW → IN_PROGRESS', () => {
      const result = validateStatusTransition('IN_REVIEW', 'IN_PROGRESS', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows reopening: DONE → TODO', () => {
      const result = validateStatusTransition('DONE', 'TODO', { enforceWorkflow: true });
      expect(result.allowed).toBe(true);
    });

    it('allows blocking from any active state', () => {
      for (const status of ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] as TaskStatus[]) {
        const result = validateStatusTransition(status, 'BLOCKED', { enforceWorkflow: true });
        expect(result.allowed).toBe(true);
      }
    });

    it('allows unblocking to active states', () => {
      for (const status of ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] as TaskStatus[]) {
        const result = validateStatusTransition('BLOCKED', status, { enforceWorkflow: true });
        expect(result.allowed).toBe(true);
      }
    });

    it('blocks BLOCKED → DONE directly', () => {
      const result = validateStatusTransition('BLOCKED', 'DONE', { enforceWorkflow: true });
      expect(result.allowed).toBe(false);
    });
  });

  describe('getAllowedTransitions', () => {
    it('returns transitions for BACKLOG', () => {
      const transitions = getAllowedTransitions('BACKLOG');
      expect(transitions).toContain('TODO');
      expect(transitions).toContain('BLOCKED');
      expect(transitions).not.toContain('DONE');
    });

    it('returns transitions for DONE (reopening)', () => {
      const transitions = getAllowedTransitions('DONE');
      expect(transitions).toContain('TODO');
      expect(transitions).toContain('IN_PROGRESS');
    });
  });

  describe('WORKFLOW_STATUSES', () => {
    it('has all 6 statuses', () => {
      expect(WORKFLOW_STATUSES).toHaveLength(6);
    });

    it('each status has id, label, and color', () => {
      for (const status of WORKFLOW_STATUSES) {
        expect(status.id).toBeDefined();
        expect(status.label).toBeDefined();
        expect(status.color).toMatch(/^#/);
      }
    });
  });
});
