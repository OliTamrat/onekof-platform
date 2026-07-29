import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// api-organization imports the database package at module scope, which the
// test transform cannot load. Only the enum shape matters here.
vi.mock('@onekof/database', () => ({
  prisma: {},
  BudgetAccess: {
    NO_ACCESS: 'NO_ACCESS',
    VIEW_ONLY: 'VIEW_ONLY',
    EDIT: 'EDIT',
    APPROVE: 'APPROVE',
    FULL_CONTROL: 'FULL_CONTROL',
  },
}));

const SRC = join(process.cwd(), 'src');
const read = (p: string) => readFileSync(join(SRC, p), 'utf8');

/**
 * Strip comments before asserting on code. Without this, a comment that
 * *describes* the old broken pattern would fail the guard against it — which
 * is exactly what happened when these tests were first written.
 */
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/**
 * These are source-level guards rather than request-level tests: the routes
 * pull in NextAuth, Prisma and the mailer at module scope, and the existing
 * API tests in this suite follow the same shape. They are narrow on purpose —
 * each one pins a specific regression that actually shipped.
 */

describe('expense rejection authorization', () => {
  const route = read('app/api/expenses/[id]/reject/route.ts');

  // The route shipped checking only that the caller was signed in. Any
  // authenticated user could reject any expense by id, across organizations.
  it('gates rejection behind canApproveExpense', () => {
    expect(route).toContain('canApproveExpense');
    expect(route).toContain("from '@/lib/budget-access'");
  });

  it('returns 403 when the caller cannot approve', () => {
    expect(route).toMatch(/canApprove\b/);
    expect(route).toContain('status: 403');
  });

  it('checks authorization before mutating the expense', () => {
    const gateAt = route.indexOf('canApproveExpense(');
    const updateAt = route.indexOf('prisma.$transaction');
    expect(gateAt).toBeGreaterThan(-1);
    expect(updateAt).toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(updateAt);
  });

  it('applies the same gate the approve route uses', () => {
    const approve = read('app/api/expenses/[id]/approve/route.ts');
    expect(approve).toContain('canApproveExpense');
    // Both paths reject on the same signal, so a permission change lands in
    // one place rather than drifting between the two routes.
    expect(route).toContain('canApproveExpense');
  });
});

describe('budget approver notification targeting', () => {
  const route = code('app/api/expenses/route.ts');

  // `budgetAccess: 'FULL' as any` matched nobody: there is no FULL member of
  // the BudgetAccess enum, and the `as any` suppressed the type error.
  it('does not compare budgetAccess against the non-existent FULL value', () => {
    expect(route).not.toMatch(/budgetAccess:\s*'FULL'/);
    expect(route).not.toMatch(/'FULL'\s+as\s+any/);
  });

  it('targets approvers via the typed BudgetAccess enum', () => {
    expect(route).toContain('BudgetAccess.APPROVE');
    expect(route).toContain('BudgetAccess.FULL_CONTROL');
    expect(route).toMatch(/import\s*\{[^}]*BudgetAccess[^}]*\}\s*from\s*'@onekof\/database'/);
  });
});

describe('budget access helpers', () => {
  it('accepts real enum values and rejects the invented ones', async () => {
    const { hasBudgetAccess, hasFullBudgetAccess } = await import('@/lib/api-organization');

    // Previously compared against 'FULL' / 'VIEW', so both returned false for
    // every member that could exist.
    expect(hasFullBudgetAccess({ budgetAccess: 'FULL_CONTROL' })).toBe(true);
    expect(hasFullBudgetAccess({ budgetAccess: 'FULL' })).toBe(false);
    expect(hasFullBudgetAccess({ budgetAccess: 'APPROVE' })).toBe(false);

    for (const level of ['VIEW_ONLY', 'EDIT', 'APPROVE', 'FULL_CONTROL']) {
      expect(hasBudgetAccess({ budgetAccess: level }), level).toBe(true);
    }
    expect(hasBudgetAccess({ budgetAccess: 'NO_ACCESS' })).toBe(false);
    expect(hasBudgetAccess({ budgetAccess: null })).toBe(false);
  });
});
