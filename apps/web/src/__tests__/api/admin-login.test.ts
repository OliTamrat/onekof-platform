import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock database to avoid tsconfig resolution failure in packages/database
vi.mock('@onekof/database', () => ({
  prisma: {
    adminAuditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mock rate limiting — allow all requests by default
vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  rateLimit: vi.fn().mockResolvedValue(null),
  rateLimitConfigs: {
    login: { requests: 3, window: '15m', windowMs: 15 * 60 * 1000 },
  },
}));

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Bcrypt hashes for 'test-pass-123' and 'view-pass-456' (cost factor 10)
const TEST_ADMIN_USERS = JSON.stringify([
  { username: 'admin', password: '$2b$10$sv1cxRrEllcoxnwa/g/s4eIphnbSANLT6uuwFXquORIwYsFOnY3d6', role: 'OWNER', name: 'Test Admin' },
  { username: 'viewer', password: '$2b$10$J6hdr1mwxysULduXa.9O4.QT0UoDbbrTkCwVvXTtBd13NdNdmcPyC', role: 'VIEWER', name: 'Test Viewer' },
]);

describe('POST /api/admin/login', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('when ADMIN_SECRET is not set', () => {
    it('returns 503 with configuration error', async () => {
      delete process.env.ADMIN_SECRET;
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'admin', password: 'test-pass-123' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toContain('ADMIN_SECRET');
    });
  });

  describe('when ADMIN_SECRET is set', () => {
    beforeEach(() => {
      process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';
    });

    it('returns 503 when ADMIN_USERS is not configured', async () => {
      delete process.env.ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'admin', password: 'test' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toContain('ADMIN_USERS');
    });

    it('returns 400 when username or password is missing', async () => {
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');

      const res1 = await POST(createRequest({ username: 'admin' }));
      expect(res1.status).toBe(400);

      const res2 = await POST(createRequest({ password: 'test' }));
      expect(res2.status).toBe(400);

      const res3 = await POST(createRequest({}));
      expect(res3.status).toBe(400);
    });

    it('returns 401 for invalid credentials', async () => {
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'admin', password: 'wrong-password' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('returns success with admin info and sets cookie on valid login', async () => {
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'admin', password: 'test-pass-123' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.admin).toEqual({
        username: 'admin',
        name: 'Test Admin',
        role: 'OWNER',
      });

      // Check cookie is set
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('onekof-admin-token');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Path=/');
    });

    it('returns correct role for different admin users', async () => {
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'viewer', password: 'view-pass-456' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.admin.role).toBe('VIEWER');
      expect(data.admin.username).toBe('viewer');
    });
  });

  describe('rate limiting integration', () => {
    it('returns 429 when rate limited', async () => {
      process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';
      process.env.ADMIN_USERS = TEST_ADMIN_USERS;

      const { checkRateLimit } = await import('@/lib/security/rate-limit');
      const { NextResponse } = await import('next/server');

      // Mock rate limiter to return a 429
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json(
          { error: 'Too many requests', retryAfter: 900 },
          { status: 429 }
        )
      );

      const { POST } = await import('@/app/api/admin/login/route');
      const req = createRequest({ username: 'admin', password: 'test-pass-123' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Too many requests');
    });
  });
});

describe('verifyToken', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('returns null when ADMIN_SECRET is not set', async () => {
    delete process.env.ADMIN_SECRET;

    const { verifyToken } = await import('@/lib/security/superadmin');
    expect(verifyToken('any.token.here')).toBeNull();
  });

  it('returns null for malformed tokens', async () => {
    process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';

    const { verifyToken } = await import('@/lib/security/superadmin');
    expect(verifyToken('')).toBeNull();
    expect(verifyToken('only-one-part')).toBeNull();
    expect(verifyToken('two.parts')).toBeNull();
    expect(verifyToken('four.parts.here.extra')).toBeNull();
  });

  it('returns null for expired tokens', async () => {
    process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';
    const { createHmac } = await import('crypto');

    const payload = Buffer.from(JSON.stringify({ username: 'admin', role: 'OWNER', name: 'Admin' })).toString('base64url');
    const expiredTimestamp = (Date.now() - 25 * 60 * 60 * 1000).toString(); // 25 hours ago
    const sig = createHmac('sha256', 'test-secret-for-unit-tests-only')
      .update(`${payload}.${expiredTimestamp}`)
      .digest('base64url');

    const { verifyToken } = await import('@/lib/security/superadmin');
    expect(verifyToken(`${payload}.${expiredTimestamp}.${sig}`)).toBeNull();
  });

  it('returns null for invalid signature', async () => {
    process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';

    const payload = Buffer.from(JSON.stringify({ username: 'admin', role: 'OWNER', name: 'Admin' })).toString('base64url');
    const timestamp = Date.now().toString();

    const { verifyToken } = await import('@/lib/security/superadmin');
    expect(verifyToken(`${payload}.${timestamp}.invalid-signature`)).toBeNull();
  });

  it('verifies a valid token correctly', async () => {
    process.env.ADMIN_SECRET = 'test-secret-for-unit-tests-only';
    process.env.ADMIN_USERS = TEST_ADMIN_USERS;

    // Do a login to get a real token, then verify it
    const { POST } = await import('@/app/api/admin/login/route');
    const { verifyToken } = await import('@/lib/security/superadmin');
    const req = createRequest({ username: 'admin', password: 'test-pass-123' });
    const res = await POST(req);

    // Extract token from cookie
    const setCookie = res.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/onekof-admin-token=([^;]+)/);
    expect(tokenMatch).not.toBeNull();

    const token = tokenMatch![1];
    const result = verifyToken(token);

    expect(result).not.toBeNull();
    expect(result!.username).toBe('admin');
    expect(result!.role).toBe('OWNER');
    expect(result!.name).toBe('Test Admin');
  });
});

describe('DELETE /api/admin/login (logout)', () => {
  it('clears the admin token cookie', async () => {
    const { DELETE } = await import('@/app/api/admin/login/route');
    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toContain('onekof-admin-token=');
    expect(setCookie).toContain('Max-Age=0');
  });
});
