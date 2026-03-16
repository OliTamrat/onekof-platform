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
  XCircle,
  Loader2,
  Shield,
  Zap,
  HardDrive,
  RefreshCw,
  Cpu,
  Gauge,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ServiceCheck {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  detail: string;
}

interface HealthData {
  status: 'operational' | 'degraded' | 'down';
  checks: ServiceCheck[];
  environment: {
    nodeVersion: string;
    runtime: string;
    region: string;
    environment: string;
    deploymentId: string;
  };
  checkedAt: string;
}

const STATUS_CONFIG = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    dot: 'bg-emerald-500',
  },
  degraded: {
    label: 'Some Services Degraded',
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    dot: 'bg-amber-500',
  },
  down: {
    label: 'System Issues Detected',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    dot: 'bg-red-500',
  },
};

const SERVICE_ICONS: Record<string, typeof Database> = {
  Database: Database,
  'Prisma ORM': HardDrive,
  Authentication: Shield,
  'Admin Auth': Shield,
  'Multi-Tenant Routing': Globe,
  Application: Server,
};

export default function AdminSystemPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<HealthData>({
    queryKey: ['admin', 'health'],
    queryFn: async () => {
      const res = await fetch('/api/admin/health');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Running health checks...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Failed to load health data</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[data.status];
  const StatusIcon = statusConfig.icon;

  const operationalCount = data.checks.filter(c => c.status === 'operational').length;
  const degradedCount = data.checks.filter(c => c.status === 'degraded').length;
  const downCount = data.checks.filter(c => c.status === 'down').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">System Health</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Infrastructure monitoring & status
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          {isFetching ? 'Checking...' : 'Refresh'}
        </Button>
      </div>

      {/* Overall Status Banner */}
      <div className={cn('rounded-xl border p-5 flex items-center gap-4', statusConfig.bg, statusConfig.border)}>
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', statusConfig.iconBg)}>
          <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
        </div>
        <div className="flex-1">
          <p className={cn('text-sm font-semibold', statusConfig.color)}>{statusConfig.label}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Last checked: {new Date(data.checkedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {operationalCount > 0 && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {operationalCount} operational
            </span>
          )}
          {degradedCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {degradedCount} degraded
            </span>
          )}
          {downCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {downCount} down
            </span>
          )}
        </div>
      </div>

      {/* Service Checks */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Service Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.checks.map(check => {
            const checkStatus = STATUS_CONFIG[check.status];
            const Icon = SERVICE_ICONS[check.name] || Server;
            return (
              <div
                key={check.name}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('rounded-lg p-2', checkStatus.bg === STATUS_CONFIG.operational.bg ? 'bg-slate-50 dark:bg-[#1B1F23]' : checkStatus.bg)}>
                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{check.name}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn('h-2 w-2 rounded-full', checkStatus.dot)} />
                        <span className={cn('text-[10px] font-bold uppercase', checkStatus.color)}>
                          {check.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{check.detail}</p>
                    {check.latency !== undefined && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Gauge className="h-3 w-3 text-slate-400" />
                        <span className={cn(
                          'text-[11px] font-medium',
                          check.latency < 200 ? 'text-emerald-600 dark:text-emerald-400' :
                          check.latency < 1000 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        )}>
                          {check.latency}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Environment</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
            {[
              { label: 'Runtime', value: data.environment.runtime, icon: Cpu },
              { label: 'Node.js', value: data.environment.nodeVersion, icon: Server },
              { label: 'Region', value: data.environment.region, icon: Globe },
              { label: 'Environment', value: data.environment.environment, icon: Zap },
              { label: 'Deployment', value: data.environment.deploymentId, icon: HardDrive },
            ].map(item => (
              <div key={item.label} className="p-4 flex items-center gap-3">
                <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capacity & Scaling */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Capacity & Scaling</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {[
            {
              name: 'Concurrent Users',
              current: '200-500',
              limit: 'Serverless tier dependent',
              icon: Wifi,
              note: 'Add Prisma Accelerate or PgBouncer to scale beyond 500',
              status: 'good' as const,
            },
            {
              name: 'Database Connections',
              current: 'Shared pool',
              limit: 'Provider limit',
              icon: Database,
              note: 'Connection pooling recommended for production scale',
              status: 'warning' as const,
            },
            {
              name: 'Static Pages',
              current: '164 pages',
              limit: 'CDN-served globally',
              icon: HardDrive,
              note: 'Pre-rendered and cached — excellent performance',
              status: 'good' as const,
            },
          ].map(item => (
            <div key={item.name} className="flex items-start gap-4 p-4">
              <div className={cn(
                'rounded-lg p-2',
                item.status === 'good' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
              )}>
                <item.icon className={cn(
                  'h-4 w-4',
                  item.status === 'good' ? 'text-emerald-500' : 'text-amber-500'
                )} />
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

      {/* Architecture Stack */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Architecture Stack</h3>
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
              <div className="rounded-md bg-slate-50 dark:bg-[#1B1F23] p-2">
                <item.icon className="h-4 w-4 text-slate-400" />
              </div>
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
