import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DASHBOARD = join(process.cwd(), 'src/app/dashboard');

/**
 * Twelve dashboard pages rendered invented people — "John Smith",
 * "Sarah Johnson", goals belonging to nobody — with no data call at all, one
 * click from the real Teams and Goals pages. Teams is enabled in every
 * preset, so effectively every customer could reach them.
 *
 * A missing feature costs a sale. A screen of invented colleagues costs
 * credibility, and it fails in a demo where someone reads the screen.
 *
 * See docs/architecture/PRODUCT_SURFACE_AUDIT.md.
 */

// Names that appeared in the deleted pages. Any of these reappearing in a
// dashboard page means demo data has been committed again.
const INVENTED_PEOPLE = [
  'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Brown',
  'David Lee', 'Lisa Anderson',
];

function dashboardPages(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) dashboardPages(full, acc);
    else if (entry.name === 'page.tsx') acc.push(full);
  }
  return acc;
}

describe('no fabricated data in dashboard pages', () => {
  const pages = dashboardPages(DASHBOARD);

  it('finds dashboard pages to check', () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it('contains none of the invented people from the deleted pages', () => {
    const offenders: string[] = [];
    for (const page of pages) {
      const src = readFileSync(page, 'utf8');
      for (const name of INVENTED_PEOPLE) {
        if (src.includes(name)) {
          offenders.push(`${page.replace(DASHBOARD, '')} contains "${name}"`);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('keeps the still-fabricated routes deleted', () => {
    // goals/list and goals/board are deliberately absent from this list: they
    // were rebuilt against the Goal model and now query real data, which is
    // exactly the condition this guard was written to allow. The rest have no
    // model behind them and stay gone until something real backs them.
    const deleted = [
      'teams/activity', 'teams/board', 'teams/goals', 'teams/list',
      'teams/pages', 'teams/timeline',
      'goals/active', 'goals/completed', 'goals/pages', 'goals/teams',
      'goals/timeline',
    ];
    for (const route of deleted) {
      expect(existsSync(join(DASHBOARD, route, 'page.tsx')), route).toBe(false);
    }
  });

  it('the rebuilt goal views actually query data', () => {
    // The whole point of bringing these two back. A rebuilt page that renders
    // a hardcoded array again would pass the "no invented names" check by
    // simply using different names — this is what stops that.
    for (const route of ['goals/list', 'goals/board']) {
      const src = readFileSync(join(DASHBOARD, route, 'page.tsx'), 'utf8');
      expect(src, `${route} must fetch`).toMatch(/useQuery/);
      expect(src, `${route} must use the shared goals query`).toMatch(/fetchGoals/);
      // No top-level array of domain rows masquerading as data.
      expect(src, `${route} must not hardcode rows`).not.toMatch(/^const [A-Z_]+ = \[\s*$/m);
    }
  });
});

describe('tab bars point only at pages that exist', () => {
  it('every Teams and Goals tab has a real destination', async () => {
    const { TEAMS_TABS, GOALS_TABS } = await import('@/config/department-tabs');
    const check = (tabs: { id: string; href: string }[], base: string) => {
      for (const tab of tabs) {
        // href '' is the section landing page
        const dir = tab.href === '' ? base : join(base, tab.href);
        expect(
          existsSync(join(DASHBOARD, dir, 'page.tsx')),
          `${base} tab "${tab.id}" -> ${dir} has no page`
        ).toBe(true);
      }
    };
    check(TEAMS_TABS as any, 'teams');
    check(GOALS_TABS as any, 'goals');
  });
});
