import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const INTEGRATIONS = join(process.cwd(), 'src/app/api/integrations');

/**
 * Every integration route resolved its organization as
 * `session.user.organizations?.[0]` — the user's FIRST membership, not the
 * organization of the request.
 *
 * Not an IDOR: a user could not reach an organization they do not belong to.
 * But a user who belongs to more than one would read and write the integration
 * configuration of whichever organization happened to be first in their
 * session, regardless of which tenant subdomain they were working in.
 * Connecting Slack for a ministry while working in an NGO workspace is the
 * shape of the failure.
 *
 * It was also inconsistent with the platform's own model: tenancy resolves
 * from the hostname everywhere else. These routes predate that decision.
 *
 * See docs/architecture/API_AUTHORIZATION_AUDIT.md, F2.
 */

function routeFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) routeFiles(full, acc);
    else if (entry.name === 'route.ts') acc.push(full);
  }
  return acc;
}

describe('integrations resolve the organization from the request', () => {
  const routes = routeFiles(INTEGRATIONS);

  it('finds the integration routes', () => {
    expect(routes.length).toBeGreaterThanOrEqual(10);
  });

  it('no route picks the user first organization', () => {
    const offenders = routes.filter((f) => {
      const code = readFileSync(f, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      return /organizations\??\.\[0\]/.test(code);
    });
    expect(
      offenders.map((f) => f.replace(INTEGRATIONS, '')),
      'these still resolve the wrong organization'
    ).toEqual([]);
  });

  it('every route that needs an organization uses resolveUserOrganization', () => {
    const offenders = routes.filter((f) => {
      // OAuth callbacks are correctly excluded. The user is returning from
      // the provider, so there is no reliable tenant context on the request —
      // the organization comes from the `state` parameter carried through the
      // OAuth round trip, which records the organization the flow STARTED in.
      // Resolving from the subdomain here would be wrong, not safer.
      if (f.endsWith('/callback/route.ts')) return false;

      const src = readFileSync(f, 'utf8');
      const needsOrg = /organizationId/.test(src);
      return needsOrg && !src.includes('resolveUserOrganization');
    });
    expect(offenders.map((f) => f.replace(INTEGRATIONS, ''))).toEqual([]);
  });

  it('OAuth callbacks take the organization from the signed state, not a guess', () => {
    const callbacks = routes.filter((f) => f.endsWith('/callback/route.ts'));
    expect(callbacks.length).toBeGreaterThan(0);
    for (const f of callbacks) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).toMatch(/state\.organizationId/);
      // and must still not fall back to the user's first membership
      expect(src, f).not.toMatch(/organizations\??\.\[0\]/);
    }
  });
});
