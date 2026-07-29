import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * M2 coverage sweep.
 *
 * Every route that reads tasks must decide what to do about care items. The
 * three previous audit passes on this codebase all missed live defects for the
 * same reason: they grepped for a KNOWN list of helper names and quietly
 * treated anything unmatched as fine. So this test does the opposite. It finds
 * every route that touches the task table and requires each one to be
 * *explicitly accounted for* — either it applies a control, or it appears in
 * EXEMPT below with a reason someone had to write down.
 *
 * A new route that reads tasks fails this test until someone makes that
 * decision. That is the point: the failure is the prompt.
 */

const API = join(process.cwd(), 'src/app/api');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });
}

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Any control that resolves the care-item question for the rows a route returns. */
const CONTROLS = [
  'careItemExclusion(',
  'applyCareItemVisibility(',
  'requireTaskAccess(',
  'getPatientAccessLevel(',
];

/**
 * Routes that read tasks and deliberately do NOT filter. Each entry states
 * why, and the reason has to survive review — an entry added to silence the
 * test is a decision to expose something.
 */
const EXEMPT: Record<string, string> = {
  'sprints/[id]/report.pdf/route.ts':
    'Aggregates only — no title, key or patient reference is selected. ' +
    'Filtering would make the sprint total depend on who exported the PDF.',
  'issues/[id]/subtasks/route.ts':
    'Gated by requireTaskAccess on the parent; the later task lookups only ' +
    'compute the next issue key.',
  // The rule these three share with report.pdf: counts stay whole, names get
  // filtered. A groupBy over status or priority returns no title, key or id,
  // so nothing about any individual is disclosed — and a dashboard reading
  // "12 open" beside a board showing 10 would be a worse product for every
  // organization in order to protect nothing.
  'dashboard/stats/route.ts':
    'groupBy over status and priority plus counts. No row identity is ' +
    'returned, and per-viewer totals would disagree with the board.',
  'projects/route.ts':
    'groupBy over projectId and status for the per-project progress bar. ' +
    'No task identity is returned.',
  'organizations/[organizationId]/projects/route.ts':
    'Same per-project status aggregation as projects/route.ts.',
};

describe('every route that reads tasks accounts for care items', () => {
  const routes = walk(API)
    .filter((f) => f.endsWith('route.ts'))
    .map((f) => ({ file: f, rel: relative(API, f), src: stripComments(readFileSync(f, 'utf8')) }))
    .filter(({ src }) => /prisma\.task\.(findMany|findFirst|findUnique|groupBy|aggregate)/.test(src));

  it('finds task-reading routes at all (the sweep itself must not silently pass)', () => {
    // If a refactor renames the client or moves these queries behind a helper,
    // the filter above matches nothing and every assertion below passes
    // vacuously. This is the canary for that.
    expect(routes.length).toBeGreaterThan(8);
  });

  for (const { rel, src } of routes) {
    it(`${rel} applies a care-item control or is explicitly exempt`, () => {
      if (rel in EXEMPT) {
        expect(EXEMPT[rel].length).toBeGreaterThan(20);
        return;
      }
      const applied = CONTROLS.filter((c) => src.includes(c));
      expect(
        applied,
        `${rel} reads tasks but applies none of: ${CONTROLS.join(', ')}. ` +
          'Either apply one, or add an entry to EXEMPT explaining why this ' +
          'route may return care items to a viewer without patient access.'
      ).not.toHaveLength(0);
    });
  }
});

describe('the exemption list stays honest', () => {
  it('names only routes that still exist and still read tasks', () => {
    // A stale exemption is worse than none: it reads as "considered and
    // cleared" for a file that may have changed underneath it.
    for (const rel of Object.keys(EXEMPT)) {
      const src = stripComments(readFileSync(join(API, rel), 'utf8'));
      expect(src).toMatch(/prisma\.task\.(findMany|findFirst|findUnique|groupBy|aggregate)/);
    }
  });
});
