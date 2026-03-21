import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock superadmin auth
const mockRequireSuperAdmin = vi.fn();

vi.mock('@/lib/security/superadmin', () => ({
  requireSuperAdmin: (...args: any[]) => mockRequireSuperAdmin(...args),
}));

// Mock prisma
vi.mock('@onekof/database', () => ({
  prisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([{ id: '1', email: 'a@b.com', name: 'Test' }]),
      count: vi.fn().mockResolvedValue(5),
    },
    organizationMember: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([{ id: '1', email: 'a@b.com', name: 'Test' }]),
    },
  },
}));

import { NextResponse } from 'next/server';

describe('Debug endpoints require superadmin auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const unauthorizedResponse = {
    authorized: false,
    admin: null,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };

  const authorizedResponse = {
    authorized: true,
    admin: { username: 'admin', role: 'OWNER', name: 'Admin' },
    error: null,
  };

  describe('GET /api/debug/users', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { GET } = await import('@/app/api/debug/users/route');
      const res = await GET();

      expect(res.status).toBe(401);
    });

    it('returns users when superadmin authenticated', async () => {
      mockRequireSuperAdmin.mockResolvedValue(authorizedResponse);

      const { GET } = await import('@/app/api/debug/users/route');
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.users).toBeDefined();
    });
  });

  describe('GET /api/debug/organization-members', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { GET } = await import('@/app/api/debug/organization-members/route');
      const res = await GET();

      expect(res.status).toBe(401);
    });

    it('returns members when superadmin authenticated', async () => {
      mockRequireSuperAdmin.mockResolvedValue(authorizedResponse);

      const { GET } = await import('@/app/api/debug/organization-members/route');
      const res = await GET();

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/debug/fix-membership', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { POST } = await import('@/app/api/debug/fix-membership/route');
      const res = await POST();

      expect(res.status).toBe(401);
    });

    it('requires ADMIN role minimum', async () => {
      mockRequireSuperAdmin.mockResolvedValue(authorizedResponse);

      const { POST } = await import('@/app/api/debug/fix-membership/route');
      await POST();

      expect(mockRequireSuperAdmin).toHaveBeenCalledWith('ADMIN');
    });
  });

  describe('GET /api/debug/check-db', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { GET } = await import('@/app/api/debug/check-db/route');
      const res = await GET();

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/env-check', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { GET } = await import('@/app/api/env-check/route');
      const res = await GET();

      expect(res.status).toBe(401);
    });

    it('returns env info when superadmin authenticated', async () => {
      mockRequireSuperAdmin.mockResolvedValue(authorizedResponse);

      const { GET } = await import('@/app/api/env-check/route');
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.env).toBeDefined();
      // Verify secrets are masked or shown as status only
      expect(['SET (hidden)', 'NOT_SET']).toContain(data.env.NEXTAUTH_SECRET);
    });
  });

  describe('GET /api/test-db', () => {
    it('returns 401 when not superadmin', async () => {
      mockRequireSuperAdmin.mockResolvedValue(unauthorizedResponse);

      const { GET } = await import('@/app/api/test-db/route');
      const res = await GET();

      expect(res.status).toBe(401);
    });

    it('returns db status when superadmin authenticated', async () => {
      mockRequireSuperAdmin.mockResolvedValue(authorizedResponse);

      const { GET } = await import('@/app/api/test-db/route');
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.userCount).toBeDefined();
      // Verify no stack traces exposed
      expect(data.stack).toBeUndefined();
    });
  });
});
