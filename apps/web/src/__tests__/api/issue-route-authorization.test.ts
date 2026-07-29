import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const code = (p: string) =>
  readFileSync(join(SRC, p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/**
 * requireAuthentication() and resolveAuthUser() only AUTHENTICATE. They answer "who is
 * this?", never "may they touch this resource?" — despite the header of
 * lib/security/authorization.ts claiming the module prevents IDOR.
 *
 * These three routes took a task id from the URL and acted on it having done
 * only the first half. Each guard below pins one of them.
 */

/**
 * These routes now gate on `requireTaskAccess`, not `requireProjectAccess`.
 *
 * The difference matters and the guard is deliberately strict about it. A
 * task's sub-resources are reached by task id, and `requireProjectAccess`
 * answers a question about the project — it cannot see that the task is an M2
 * care item. A route that looked the task up, took its projectId and checked
 * that would pass a project-level audit while leaking a patient's comment
 * thread. `requireTaskAccess` is the only helper that answers both questions,
 * so it is the only one accepted here.
 */
const ROUTES = [
  { path: 'app/api/issues/[id]/comments/route.ts', label: 'comments' },
  { path: 'app/api/issues/[id]/subtasks/route.ts', label: 'subtasks' },
  { path: 'app/api/issues/[id]/transitions/route.ts', label: 'transitions' },
  // Found only by the systematic sweep. Three consecutive ad-hoc greps missed
  // it because they required the exact string `where: { id: params.id }` and
  // this route spans lines with a deletedAt clause — a formatting difference
  // hid a live cross-tenant defect sitting in the same directory as the
  // three above.
  { path: 'app/api/issues/[id]/watchers/route.ts', label: 'watchers' },
  // Same class again, found when M2 forced a second pass over everything
  // reachable by task id: DELETE had no authorization at all, so any
  // signed-in user could unsubscribe another tenant's members from any task.
  { path: 'app/api/issues/[id]/watchers/[userId]/route.ts', label: 'watcher preferences' },
  // These two checked organization membership and stopped there, which let
  // any member of the tenant read and write attachments and links on
  // PRIVATE and CONFIDENTIAL projects they had never been added to.
  { path: 'app/api/tasks/[id]/attachments/route.ts', label: 'attachments' },
  { path: 'app/api/tasks/[id]/links/route.ts', label: 'links' },
];

describe('task sub-routes authorize against the task, not merely its project', () => {
  for (const { path, label } of ROUTES) {
    it(`${label} calls requireTaskAccess`, () => {
      const src = code(path);
      expect(src).toContain('requireTaskAccess(');
      expect(src).toMatch(/from\s*'@\/lib\/security\/authorization'/);
    });

    it(`${label} does not substitute a bare organizationMember lookup for it`, () => {
      // The pattern these routes used to use: look up the task's org, confirm
      // the caller is a member of it, act. That passes for any member of the
      // tenant regardless of project visibility, and cannot see a care item
      // at all.
      //
      // Positional rather than absolute, because an org-role lookup is still
      // legitimate AFTER access is established — the watcher route checks
      // OWNER/ADMIN to decide who may remove somebody else. What must not
      // happen is an org lookup standing in for the gate.
      const src = code(path);
      const org = src.indexOf('organizationMember.findUnique');
      if (org === -1) return;
      expect(src.indexOf('requireTaskAccess(')).toBeLessThan(org);
    });
  }

  it('comments authorizes before creating the comment', () => {
    const src = code('app/api/issues/[id]/comments/route.ts');
    const gate = src.indexOf('requireTaskAccess(');
    const write = src.indexOf('comment.create');
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });

  it('subtasks authorizes before creating the task', () => {
    const src = code('app/api/issues/[id]/subtasks/route.ts');
    const gate = src.indexOf('requireTaskAccess(');
    const write = src.indexOf('task.create');
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });

  it('transitions authorizes before returning workflow state', () => {
    const src = code('app/api/issues/[id]/transitions/route.ts');
    const gate = src.indexOf('requireTaskAccess(');
    const respond = src.indexOf('getAllowedTransitions(');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(respond);
  });

  it('links authorizes BOTH ends before creating a link', () => {
    // A link is readable from either side. Checking only the task in the URL
    // would let a caller pull a task they may not see into the link list of
    // one they can, disclosing its key and title.
    const src = code('app/api/tasks/[id]/links/route.ts');
    const post = src.indexOf('export async function POST');
    const write = src.indexOf('taskLink.upsert');
    const gates = [...src.matchAll(/requireTaskAccess\(/g)]
      .map((m) => m.index!)
      .filter((i) => i > post && i < write);
    expect(gates.length).toBe(2);
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
    // Still project-level here, because this route resolves the care-item
    // rule inline: it already loads the task (it has to, to respond) and
    // checks getPatientAccessLevel on it. requireTaskAccess would be a
    // duplicate lookup of a row this route holds.
    const src = code('app/api/issues/[id]/route.ts');
    expect(src).toContain('requireProjectAccess');
    expect(src).toContain('getPatientAccessLevel(');
  });
});
