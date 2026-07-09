import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth
const mockGetServerSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock prisma
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@onekof/database', () => ({
  prisma: {
    invitation: {
      findMany: (...args: any[]) => mockFindMany(...args),
    },
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

// Mock token helpers
vi.mock('@/lib/security/tokens', () => ({
  verifyTokenHash: vi.fn().mockReturnValue(false),
  isTokenExpired: vi.fn().mockReturnValue(false),
}));

import { GET } from '@/app/api/invitations/accept/route';

describe('GET /api/invitations/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows unauthenticated access for token validation', async () => {
    mockGetServerSession.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    const req = new NextRequest('http://localhost:3000/api/invitations/accept?token=abc123');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Invalid or expired');
  });

  it('allows access without user id for token validation', async () => {
    mockGetServerSession.mockResolvedValue({ user: {} });
    mockFindMany.mockResolvedValue([]);

    const req = new NextRequest('http://localhost:3000/api/invitations/accept?token=abc123');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when token is missing', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const req = new NextRequest('http://localhost:3000/api/invitations/accept');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('token');
  });

  it('returns 400 when no matching invitation found', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockFindMany.mockResolvedValue([]);

    const req = new NextRequest('http://localhost:3000/api/invitations/accept?token=invalid');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Invalid or expired');
  });

  it('does not expose inviter email or sensitive user details', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const { verifyTokenHash } = await import('@/lib/security/tokens');
    vi.mocked(verifyTokenHash).mockReturnValue(true);

    mockFindMany.mockResolvedValue([
      {
        id: 'inv-1',
        email: 'invitee@test.com',
        role: 'MEMBER',
        tokenHash: 'hash',
        invitedBy: 'inviter-id',
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
        organization: { id: 'org-1', name: 'Test Org', slug: 'test-org' },
      },
    ]);

    const req = new NextRequest('http://localhost:3000/api/invitations/accept?token=valid-token');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.invitation.organizationName).toBe('Test Org');
    expect(data.invitation.invitedBy).toBe('A team member');
    // Verify no email leakage
    expect(JSON.stringify(data)).not.toContain('invitee@test.com');
    expect(JSON.stringify(data)).not.toContain('inviter-id');
  });
});
