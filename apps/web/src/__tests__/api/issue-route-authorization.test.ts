import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const code = (p: string) =>
  readFileSync(join(SRC, p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/**
 * requireAuth() and resolveAuthUser() only AUTHENTICATE. They answer "who is
 * this?", never "may they touch this resource?" — despite the header of
 * lib/security/authorization.ts claiming the module prevents IDOR.
 *
 * These three routes took a task id from the URL and acted on it having done
 * only the first half. Each guard below pins one of them.
 */

const ROUTES = [
  { path: 'app/api/issues/[id]/comments/route.ts', label: 'comments' },
  { path: 'app/api/issues/[id]/subtasks/route.ts', label: 'subtasks' },
  { path: 'app/api/issues/[id]/transitions/route.ts', label: 'transitions' },
];

describe('issue sub-routes authorize against the task project', () => {
  for (const { path, label } of ROUTES) {
    it(`${label} calls requireProjectAccess`, () => {
      const src = code(path);
      expect(src).toContain('requireProjectAccess');
      expect(src).toMatch(/from\s*'@\/lib\/security\/authorization'/);
    });
  }

  it('comments authorizes before creating the comment', () => {
    const src = code('app/api/issues/[id]/comments/route.ts');
    const gate = src.indexOf('requireProjectAccess(');
    const write = src.indexOf('comment.create');
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });

  it('subtasks authorizes before creating the task', () => {
    const src = code('app/api/issues/[id]/subtasks/route.ts');
    const gate = src.indexOf('requireProjectAccess(');
    const write = src.indexOf('task.create');
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });

  it('transitions authorizes before returning workflow state', () => {
    const src = code('app/api/issues/[id]/transitions/route.ts');
    const gate = src.indexOf('requireProjectAccess(');
    const respond = src.indexOf('getAllowedTransitions(');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(respond);
  });
});

describe('routes already verified correct stay correct', () => {
  // These were flagged by a first-pass grep and turned out to be fine. The
  // guards exist so a later refactor cannot quietly remove the checks that
  // made them fine.
  it('expenses/[id]/pay gates on requireExpenseAccess', () => {
    const src = code('app/api/expenses/[id]/pay/route.ts');
    expect(src).toContain('requireExpenseAccess(');
    const gate = src.indexOf('requireExpenseAccess(');
    const write = src.indexOf('$transaction');
    expect(gate).toBeLessThan(write);
  });

  it('expenses/[id] gates read and update separately', () => {
    const src = code('app/api/expenses/[id]/route.ts');
    expect(src).toMatch(/requireExpenseAccess\([^)]*'read'\)/);
    expect(src).toMatch(/requireExpenseAccess\([^)]*'update'\)/);
  });

  it('issues/[id] gates on requireProjectAccess', () => {
    expect(code('app/api/issues/[id]/route.ts')).toContain('requireProjectAccess');
  });
});
