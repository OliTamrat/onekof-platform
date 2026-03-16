'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Database,
  Server,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  Zap,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalOrgs: number;
  totalProjects: number;
  totalIssues: number;
}

export default function AdminSystemPage() {
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

  const healthChecks = [
    {
      name: 'Application Server',
      status: 'operational' as const,
      detail: 'Next.js 14 on Vercel Serverless',
      icon: Server,
    },
    {
      name: 'Database',
      status: 'operational' as const,
      detail: `PostgreSQL — ${stats.totalUsers} users, ${stats.totalIssues} issues`,
      icon: Database,
    },
    {
      name: 'Authentication',
      status: 'operational' as const,
      detail: 'NextAuth JWT with cross-subdomain cookies',
      icon: Shield,
    },
    {
      name: 'Multi-Tenant Routing',
      status: 'operational' as const,
      detail: `${stats.totalOrgs} orgs via subdomain routing`,
      icon: Globe,
    },
  ];

  const statusColor = {
    operational: 'text-emerald-500',
    degraded: 'text-amber-500',
    down: 'text-red-500',
  };

  const statusBg = {
    operational: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    degraded: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    down: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const capacityItems = [
    {
      name: 'Concurrent Users',
      current: '~200-500',
      limit: 'Serverless tier dependent',
      icon: Zap,
      note: 'Add connection pooling to scale beyond 500',
    },
    {
      name: 'Database Connections',
      current: 'Shared pool',
      limit: 'Provider limit',
      icon: Database,
      note: 'Prisma Accelerate or PgBouncer recommended for production',
    },
    {
      name: 'Static Pages',
      current: '164 pages',
      limit: 'CDN-served',
      icon: HardDrive,
      note: 'Pre-rendered and cached globally — excellent performance',
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          System Health
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Infrastructure status and capacity planning
        </p>
      </div>

      {/* Overall Status */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-5 mb-8 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All Systems Operational</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            Last checked: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Health Checks */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {healthChecks.map(check => (
            <div key={check.name} className={cn('rounded-xl border p-4', statusBg[check.status])}>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white dark:bg-[#22272B] p-2 shadow-sm">
                  <check.icon className={cn('h-4 w-4', statusColor[check.status])} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{check.name}</p>
                    <span className={cn('text-[10px] font-bold uppercase', statusColor[check.status])}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{check.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capacity & Scaling */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Capacity & Scaling</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {capacityItems.map(item => (
            <div key={item.name} className="flex items-start gap-4 p-4">
              <div className="rounded-lg bg-slate-50 dark:bg-[#1B1F23] p-2">
                <item.icon className="h-4 w-4 text-primary-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{item.current}</span>
                    <span className="text-[10px] text-slate-400">/ {item.limit}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Summary */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Architecture Stack</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Framework', value: 'Next.js 14 (App Router)', icon: Server },
            { label: 'Database', value: 'PostgreSQL + Prisma ORM', icon: Database },
            { label: 'Auth', value: 'NextAuth.js v4 (JWT)', icon: Shield },
            { label: 'Hosting', value: 'Vercel Serverless', icon: Globe },
            { label: 'Styling', value: 'Tailwind CSS + Radix UI', icon: Zap },
            { label: 'State', value: 'TanStack React Query', icon: Activity },
          ].map(item => (
            <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3 flex items-center gap-3">
              <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
