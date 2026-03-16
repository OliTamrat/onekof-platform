'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '@/hooks/use-admin';
import {
  Users,
  Search,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Lock,
  Unlock,
  Mail,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserOrg {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  isLocked: boolean;
  lockedUntil: string | null;
  failedLoginAttempts: number;
  organizations: UserOrg[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  MEMBER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  GUEST: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { canWrite } = useAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ users: AdminUser[]; pagination: Pagination }>({
    queryKey: ['admin', 'users', search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page.toString());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (body: { id: string; action: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  const lockedCount = users.filter(u => u.isLocked).length;
  const withOrgsCount = users.filter(u => u.organizations.length > 0).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Users</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage all users across the platform
              {pagination && <span> &middot; {pagination.total} total</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {pagination && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{pagination.total}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Users</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{withOrgsCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">With Orgs (this page)</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{lockedCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Locked (this page)</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{pagination.totalPages}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Pages</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">No users found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {search ? 'Try adjusting your search' : 'Users will appear here as they sign up'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organizations</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#1B1F23] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {user.name || 'No name'}
                            </p>
                            {user.isLocked && (
                              <Lock className="h-3 w-3 text-red-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.organizations.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No organizations</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.organizations.map(org => (
                            <div key={org.id} className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] px-2 py-1">
                              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{org.name}</span>
                              <span className={cn('text-[9px] font-bold px-1 py-0.5 rounded shrink-0', ROLE_BADGE[org.role] || ROLE_BADGE.MEMBER)}>
                                {org.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {user.isLocked ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1">
                            <Lock className="h-3 w-3 text-red-500" />
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">LOCKED</span>
                          </div>
                        </div>
                      ) : user.failedLoginAttempts > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{user.failedLoginAttempts} failed</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {!canWrite ? (
                        <span className="text-[10px] text-slate-400 italic">View only</span>
                      ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {user.isLocked ? (
                            <DropdownMenuItem onClick={() => actionMutation.mutate({ id: user.id, action: 'unlock' })}>
                              <Unlock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                              Unlock Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => actionMutation.mutate({ id: user.id, action: 'lock' })}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Lock className="h-3.5 w-3.5 mr-2" />
                              Lock Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23]">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[80px] text-center">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
