import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock metrics aggregation
vi.mock('@/lib/metrics-aggregation', () => ({
  aggregateMetricsForAllOrganizations: vi.fn().mockResolvedValue([]),
  aggregateAllMetrics: vi.fn().mockResolvedValue({ successful: 1, failed: 0 }),
}));

describe('POST /api/analytics/aggregate', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  function createRequest(apiKey?: string, params?: Record<string, string>): NextRequest {
    const url = new URL('http://localhost:3000/api/analytics/aggregate');
    if (apiKey) url.searchParams.set('apiKey', apiKey);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return new NextRequest(url.toString(), { method: 'POST' });
  }

  it('returns 401 when CRON_SECRET is not set (even with apiKey)', async () => {
    delete process.env.CRON_SECRET;

    const { POST } = await import('@/app/api/analytics/aggregate/route');
    const req = createRequest('any-key');
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('returns 401 when CRON_SECRET is not set and no apiKey provided', async () => {
    delete process.env.CRON_SECRET;

    const { POST } = await import('@/app/api/analytics/aggregate/route');
    const req = createRequest();
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 401 when apiKey does not match CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'correct-secret';

    const { POST } = await import('@/app/api/analytics/aggregate/route');
    const req = createRequest('wrong-secret');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 200 when apiKey matches CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'correct-secret';

    const { POST } = await import('@/app/api/analytics/aggregate/route');
    const req = createRequest('correct-secret');
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('accepts apiKey via x-api-key header', async () => {
    process.env.CRON_SECRET = 'header-secret';

    const { POST } = await import('@/app/api/analytics/aggregate/route');
    const req = new NextRequest('http://localhost:3000/api/analytics/aggregate', {
      method: 'POST',
      headers: { 'x-api-key': 'header-secret' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
  });
});
