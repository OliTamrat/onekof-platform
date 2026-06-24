import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Isolate the page's data-binding: stub auth + i18n so the test targets
// only how the page reads the paginated API response.
vi.mock('@/hooks/use-admin', () => ({
  useAdmin: () => ({
    admin: { username: 'admin', name: 'Admin', role: 'OWNER' },
    isLoading: false,
    isOwner: true,
    isAdmin: true,
    canWrite: true,
    canManageTeam: true,
  }),
}));

vi.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

import AdminUsersPage from '@/app/admin/users/page';
import AdminOrganizationsPage from '@/app/admin/organizations/page';

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

// The real API shape produced by buildPaginatedResponse(): rows live under `data`.
const USERS_RESPONSE = {
  data: [
    {
      id: 'u1',
      email: 'alice@example.com',
      name: 'Alice Reviewer',
      avatar: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      isLocked: false,
      lockedUntil: null,
      failedLoginAttempts: 0,
      organizations: [],
    },
    {
      id: 'u2',
      email: 'bob@example.com',
      name: 'Bob Builder',
      avatar: null,
      createdAt: '2026-01-02T00:00:00.000Z',
      isLocked: false,
      lockedUntil: null,
      failedLoginAttempts: 0,
      organizations: [],
    },
  ],
  pagination: { total: 2, page: 1, limit: 20, totalPages: 1, hasMore: false },
};

const ORGS_RESPONSE = {
  data: [
    {
      id: 'o1',
      name: 'Acme Corp',
      slug: 'acme',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      type: 'COMPANY',
      maxMembers: 50,
      maxProjects: 100,
      memberCount: 5,
      projectCount: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      trialEndsAt: null,
    },
  ],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasMore: false },
};

function mockFetch(payload: unknown) {
  return vi.fn(async () =>
    ({ ok: true, json: async () => payload } as Response)
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Admin list pages read the paginated API shape', () => {
  it('Users page renders rows from { data, pagination }', async () => {
    vi.stubGlobal('fetch', mockFetch(USERS_RESPONSE));
    renderWithClient(<AdminUsersPage />);

    expect(await screen.findByText('alice@example.com')).toBeInTheDocument();
    expect(await screen.findByText('bob@example.com')).toBeInTheDocument();
  });

  it('Organizations page renders rows from { data, pagination }', async () => {
    vi.stubGlobal('fetch', mockFetch(ORGS_RESPONSE));
    renderWithClient(<AdminOrganizationsPage />);

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });
});
