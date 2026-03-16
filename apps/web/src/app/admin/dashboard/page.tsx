'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  FolderKanban,
  ListChecks,
  TrendingUp,
  UserPlus,
  Activity,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalOrgs: number;
  totalProjects: number;
  totalIssues: number;
  activeOrgs: number;
  recentUsers: number;
  planBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  STARTER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROFESSIONAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ENTERPRISE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500',
  TRIAL: 'bg-blue-500',
  SUSPENDED: 'bg-red-500',
  CANCELLED: 'bg-slate-400',
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<{ stats: Stats }>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const stats = data?.stats;

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Organizations', value: stats.totalOrgs, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Issues', value: stats.totalIssues, icon: ListChecks, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Active Orgs', value: stats.activeOrgs, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'New Users (30d)', value: stats.recentUsers, icon: UserPlus, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ];

  const totalOrgsByPlan = Object.values(stats.planBreakdown).reduce((a, b) => a + b, 0) || 1;
  const totalOrgsByStatus = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">System-wide metrics and health</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('rounded-lg p-2', card.bg)}>
                <card.icon className={cn('h-4 w-4', card.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Organizations by Plan
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => {
              const pct = Math.round((count / totalOrgsByPlan) * 100);
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', PLAN_COLORS[plan] || PLAN_COLORS.FREE)}>
                        {plan}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {Object.keys(stats.planBreakdown).length === 0 && (
            <p className="text-sm text-slate-400">No organizations yet</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary-500" />
            Organizations by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => {
              const pct = Math.round((count / totalOrgsByStatus) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_COLORS[status] || 'bg-slate-400')} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{status}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', STATUS_COLORS[status] || 'bg-slate-400')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {Object.keys(stats.statusBreakdown).length === 0 && (
            <p className="text-sm text-slate-400">No organizations yet</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/admin/organizations" className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
            <Building2 className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Manage Orgs</span>
          </a>
          <a href="/admin/users" className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Manage Users</span>
          </a>
          <a href="/admin/system" className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">System Health</span>
          </a>
          <a href="/dashboard" className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
            <FolderKanban className="h-5 w-5 text-teal-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">User Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
}
