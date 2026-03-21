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
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
  AlertCircle,
  Building,
  UsersRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  totalUsers: number;
  totalOrgs: number;
  totalProjects: number;
  totalTasks: number;
  activeOrgs: number;
  recentUsers: number;
  recentOrgs: number;
  totalMembers: number;
  planBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

const PLAN_COLORS: Record<string, { bar: string; badge: string; dot: string }> = {
  FREE: {
    bar: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  STARTER: {
    bar: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  PROFESSIONAL: {
    bar: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  ENTERPRISE: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
};

const STATUS_COLORS: Record<string, { bar: string; dot: string; text: string }> = {
  ACTIVE: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  TRIAL: { bar: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  SUSPENDED: { bar: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  CANCELLED: { bar: 'bg-slate-400', dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' },
};

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery<{ stats: Stats }>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Failed to load stats');
      }
      return res.json();
    },
    retry: 2,
  });

  const stats = data?.stats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading platform stats...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Failed to load stats</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            The stats API returned an error. Check server logs for details.
          </p>
          <Button
            variant="link"
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-primary-600 dark:text-primary-400"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const primaryStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      change: stats.recentUsers,
      changeLabel: 'new this month',
    },
    {
      label: 'Organizations',
      value: stats.totalOrgs,
      icon: Building2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      change: stats.recentOrgs,
      changeLabel: 'new this month',
    },
    {
      label: 'Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Tasks',
      value: stats.totalTasks,
      icon: ListChecks,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const secondaryStats = [
    {
      label: 'Active Orgs',
      value: stats.activeOrgs,
      total: stats.totalOrgs,
      icon: Activity,
      color: 'text-emerald-500',
    },
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: UsersRound,
      color: 'text-indigo-500',
    },
    {
      label: 'New Users (30d)',
      value: stats.recentUsers,
      icon: UserPlus,
      color: 'text-pink-500',
    },
    {
      label: 'New Orgs (30d)',
      value: stats.recentOrgs,
      icon: Building,
      color: 'text-cyan-500',
    },
  ];

  const totalOrgsByPlan = Object.values(stats.planBreakdown).reduce((a, b) => a + b, 0) || 1;
  const totalOrgsByStatus = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  const planOrder = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
  const statusOrder = ['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'];

  const sortedPlans = planOrder
    .filter(p => stats.planBreakdown[p] !== undefined)
    .map(p => ({ name: p, count: stats.planBreakdown[p] }));

  const sortedStatuses = statusOrder
    .filter(s => stats.statusBreakdown[s] !== undefined)
    .map(s => ({ name: s, count: stats.statusBreakdown[s] }));

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Platform Overview</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map(card => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('rounded-lg p-2.5', card.bg)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
              {card.change !== undefined && card.change > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">+{card.change}</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
            {card.changeLabel && card.change !== undefined && card.change > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2">
                +{card.change} {card.changeLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryStats.map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3 flex items-center gap-3"
          >
            <stat.icon className={cn('h-4 w-4 shrink-0', stat.color)} />
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {stat.value.toLocaleString()}
                {stat.total !== undefined && (
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {stat.total}</span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              Organizations by Plan
            </h3>
            <span className="text-xs text-slate-400">{totalOrgsByPlan} total</span>
          </div>

          {sortedPlans.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No organizations yet</p>
          ) : (
            <>
              {/* Stacked bar */}
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex mb-5">
                {sortedPlans.map(({ name, count }) => {
                  const pct = (count / totalOrgsByPlan) * 100;
                  const colors = PLAN_COLORS[name] || PLAN_COLORS.FREE;
                  return (
                    <div
                      key={name}
                      className={cn('h-full transition-all first:rounded-l-full last:rounded-r-full', colors.bar)}
                      style={{ width: `${pct}%` }}
                      title={`${name}: ${count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2.5">
                {sortedPlans.map(({ name, count }) => {
                  const pct = Math.round((count / totalOrgsByPlan) * 100);
                  const colors = PLAN_COLORS[name] || PLAN_COLORS.FREE;
                  return (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={cn('h-2.5 w-2.5 rounded-sm shrink-0', colors.dot)} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{pct}%</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-500" />
              Organizations by Status
            </h3>
            <span className="text-xs text-slate-400">{totalOrgsByStatus} total</span>
          </div>

          {sortedStatuses.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No organizations yet</p>
          ) : (
            <>
              {/* Individual bars */}
              <div className="space-y-3 mb-1">
                {sortedStatuses.map(({ name, count }) => {
                  const pct = Math.round((count / totalOrgsByStatus) * 100);
                  const colors = STATUS_COLORS[name] || STATUS_COLORS.CANCELLED;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', colors.dot)} />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{pct}%</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{count}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', colors.bar)}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/organizations', label: 'Manage Orgs', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
            { href: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
            { href: '/admin/system', label: 'System Health', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
            { href: '/admin/team', label: 'Admin Team', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all hover:shadow-sm"
            >
              <div className={cn('rounded-lg p-2', action.bg)}>
                <action.icon className={cn('h-4 w-4', action.color)} />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {action.label}
              </span>
              <ArrowUpRight className="h-3 w-3 text-slate-300 dark:text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
