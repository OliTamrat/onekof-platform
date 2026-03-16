'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '@/hooks/use-admin';
import {
  Building2,
  Search,
  Users,
  FolderKanban,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Shield,
  Zap,
  Crown,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  type: string | null;
  maxMembers: number;
  maxProjects: number;
  memberCount: number;
  projectCount: number;
  createdAt: string;
  trialEndsAt: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PLAN_BADGE: Record<string, { style: string; icon: typeof Star }> = {
  FREE: { style: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Star },
  STARTER: { style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Zap },
  PROFESSIONAL: { style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Shield },
  ENTERPRISE: { style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Crown },
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { dot: 'bg-emerald-500', label: 'Active', icon: CheckCircle2 },
  TRIAL: { dot: 'bg-blue-500', label: 'Trial', icon: Clock },
  SUSPENDED: { dot: 'bg-red-500', label: 'Suspended', icon: XCircle },
  CANCELLED: { dot: 'bg-slate-400', label: 'Cancelled', icon: AlertCircle },
};

export default function AdminOrganizationsPage() {
  const queryClient = useQueryClient();
  const { canWrite } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ organizations: Organization[]; pagination: Pagination }>({
    queryKey: ['admin', 'organizations', search, statusFilter, planFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('plan', planFilter);
      params.set('page', page.toString());
      const res = await fetch(`/api/admin/organizations?${params}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: { id: string; status?: string; plan?: string }) => {
      const res = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] }),
  });

  const organizations = data?.organizations || [];
  const pagination = data?.pagination;

  const activeCount = organizations.filter(o => o.status === 'ACTIVE').length;
  const totalMembers = organizations.reduce((sum, o) => sum + o.memberCount, 0);
  const totalProjects = organizations.reduce((sum, o) => sum + o.projectCount, 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Organizations</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage all organizations on the platform
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Orgs</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Active (this page)</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalMembers}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Members (this page)</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
            <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{totalProjects}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Projects (this page)</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="STARTER">Starter</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading organizations...</p>
          </div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">No organizations found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {search || statusFilter || planFilter ? 'Try adjusting your filters' : 'Organizations will appear here as users sign up'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Members</th>
                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {organizations.map(org => {
                  const planInfo = PLAN_BADGE[org.plan] || PLAN_BADGE.FREE;
                  const PlanIcon = planInfo.icon;
                  const statusInfo = STATUS_CONFIG[org.status] || STATUS_CONFIG.ACTIVE;
                  const memberPct = Math.min((org.memberCount / org.maxMembers) * 100, 100);
                  const projectPct = Math.min((org.projectCount / org.maxProjects) * 100, 100);
                  return (
                    <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-[#1B1F23] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                            {org.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{org.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{org.slug}.onekof.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md', planInfo.style)}>
                          <PlanIcon className="h-3 w-3" />
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full shrink-0', statusInfo.dot)} />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{org.memberCount}</span>
                            <span className="text-[10px] text-slate-400">/ {org.maxMembers}</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', memberPct > 80 ? 'bg-amber-500' : 'bg-primary-500')}
                              style={{ width: `${memberPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{org.projectCount}</span>
                            <span className="text-[10px] text-slate-400">/ {org.maxProjects}</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', projectPct > 80 ? 'bg-amber-500' : 'bg-primary-500')}
                              style={{ width: `${projectPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-[11px]">Change Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: org.id, status: 'ACTIVE' })} disabled={org.status === 'ACTIVE'}>
                              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: org.id, status: 'SUSPENDED' })} disabled={org.status === 'SUSPENDED'}>
                              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />Suspend
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[11px]">Change Plan</DropdownMenuLabel>
                            {['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map(plan => (
                              <DropdownMenuItem key={plan} onClick={() => updateMutation.mutate({ id: org.id, plan })} disabled={org.plan === plan}>
                                {plan}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <a href={`https://${org.slug}.onekof.com/dashboard`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <ExternalLink className="h-3.5 w-3.5" />View Dashboard
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
