import { useQuery } from '@tanstack/react-query';

interface AdminInfo {
  username: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

export function useAdmin() {
  const { data, isLoading } = useQuery<{ admin: AdminInfo }>({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/admin/me');
      if (!res.ok) throw new Error('Not authorized');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const admin = data?.admin || null;
  const ROLE_LEVEL = { OWNER: 3, ADMIN: 2, VIEWER: 1 } as const;

  return {
    admin,
    isLoading,
    isOwner: admin?.role === 'OWNER',
    isAdmin: admin ? ROLE_LEVEL[admin.role] >= 2 : false,
    canWrite: admin ? ROLE_LEVEL[admin.role] >= 2 : false,
    canManageTeam: admin?.role === 'OWNER',
  };
}
