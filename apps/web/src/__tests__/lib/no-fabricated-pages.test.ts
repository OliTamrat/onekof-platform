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

  it('keeps the deleted routes deleted', () => {
    // Re-adding one of these is fine — in the change that makes it query real
    // data. This guard exists so it cannot come back by a copy-paste.
    const deleted = [
      'teams/activity', 'teams/board', 'teams/goals', 'teams/list',
      'teams/pages', 'teams/timeline',
      'goals/active', 'goals/board', 'goals/completed', 'goals/list',
      'goals/pages', 'goals/teams', 'goals/timeline',
    ];
    for (const route of deleted) {
      expect(existsSync(join(DASHBOARD, route, 'page.tsx')), route).toBe(false);
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
