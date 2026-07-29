import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(
  join(process.cwd(), 'src/lib/security/rate-limit.ts'),
  'utf8'
);

/**
 * rate-limit.ts holds the same names in two places: `rateLimitConfigs` (the
 * numbers) and `rateLimiters` (the Redis-backed limiter per name). Adding a
 * config without adding its limiter compiles fine at the call site and then
 * falls back to the in-memory limiter.
 *
 * That fallback is not equivalent. In-memory state is per instance, so on
 * serverless the same user hitting different instances gets a fresh allowance
 * each time — the limit still "works" in tests and quietly does far less in
 * production. This happened while adding `aiDocument`, caught only because
 * TypeScript indexes the second map by the first map's key type.
 */

function names(block: string): string[] {
  const start = SRC.indexOf(block);
  expect(start, `${block} not found`).toBeGreaterThan(-1);
  const body = SRC.slice(start, SRC.indexOf('};', start));
  return [...body.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
}

describe('rate limit registry', () => {
  it('every config has a limiter, and every limiter has a config', () => {
    const configs = names('const rateLimitConfigs');
    const limiters = names('const rateLimiters');

    expect(configs.length).toBeGreaterThan(5);
    expect(limiters.sort()).toEqual(configs.sort());
  });

  it('the AI document limit exists and is bounded per hour', () => {
    // Cost control rather than load control: this endpoint forwards user
    // files to a paid third-party API, so the ceiling is deliberately low.
    expect(SRC).toMatch(/aiDocument:\s*\{[\s\S]*?requests:\s*(\d+)/);
    const requests = Number(SRC.match(/aiDocument:\s*\{[\s\S]*?requests:\s*(\d+)/)![1]);
    expect(requests).toBeGreaterThan(0);
    expect(requests).toBeLessThanOrEqual(50);
    expect(SRC).toMatch(/aiDocument:\s*\{[\s\S]*?windowMs:\s*60 \* 60 \* 1000/);
  });
});

describe('the AI document route applies the limit', () => {
  const route = readFileSync(
    join(process.cwd(), 'src/app/api/budgets/process-document/route.ts'),
    'utf8'
  )
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  it('checks the limit before doing any work', () => {
    expect(route).toContain("checkRateLimit(request, 'aiDocument'");
    const limit = route.indexOf('aiDocument');
    const work = route.indexOf('request.formData()');
    expect(limit).toBeGreaterThan(-1);
    expect(work).toBeGreaterThan(-1);
    expect(limit).toBeLessThan(work);
  });

  it('keys the limit by user, not by IP', () => {
    // An IP-keyed limit would give a whole ministry behind one NAT a single
    // shared allowance — the same trap orgCreate was fixed for.
    expect(route).toMatch(/checkRateLimit\(request,\s*'aiDocument',\s*user\.id\)/);
  });
});
