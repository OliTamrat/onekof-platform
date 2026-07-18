'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  Eye,
  ArrowUpRight,
  Package,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { useState , type ReactNode } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectBudgetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { t } = useLanguage();

  // Fetch budget data
  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['project-budget', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/budget`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      return res.json();
    },
  });

  if (budgetLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
      </div>
    );
  }

  const budget = budgetData?.budget;
  const categories = budgetData?.categories || [];
  const expenses = budgetData?.expenses || [];

  // Calculate statistics
  const totalAllocated = budget?.totalBudget || 0;
  const totalSpent = categories.reduce((sum: number, cat: any) => sum + (cat.spent || 0), 0);
  const totalCommitted = categories.reduce((sum: number, cat: any) => sum + (cat.committed || 0), 0);
  const totalAvailable = totalAllocated - totalSpent - totalCommitted;
  const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Recent expenses
  const recentExpenses = expenses.slice(0, 5);

  // Pending approvals
  const pendingApprovals = expenses.filter((e: any) => e.status === 'PENDING').length;

  // Rejected expenses
  const rejectedCount = expenses.filter((e: any) => e.status === 'REJECTED').length;

  // AI Budget Watchers — data-driven insights from real budget data
  const budgetWatchers = (() => {
    const insights: Array<{ id: string; type: string; icon: any; color: string; title: string; message: string; timestamp: Date; priority: string }> = [];
    const formatAmt = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toFixed(0);

    // Find at-risk categories (>75% utilization)
    const catStats = categories.map((c: any) => {
      const spent = c.expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0;
      const allocated = Number(c.allocatedAmount || 0);
      return { name: c.name, spent, allocated, util: allocated > 0 ? (spent / allocated) * 100 : 0 };
    });

    const atRisk = catStats.filter((c: any) => c.util > 75);
    if (atRisk.length > 0) {
      const top = atRisk.sort((a: any, b: any) => b.util - a.util)[0];
      insights.push({
        id: 'risk-1', type: 'warning', icon: AlertCircle, color: 'text-yellow-500',
        title: `${top.name} Alert`,
        message: `${top.name} is at ${top.util.toFixed(0)}% utilization (ETB ${formatAmt(top.spent)} of ${formatAmt(top.allocated)}). Review upcoming expenses.`,
        timestamp: new Date(), priority: 'high',
      });
    }

    // Find under-utilized categories for reallocation suggestion
    const underUsed = catStats.filter((c: any) => c.util < 40 && c.allocated > 0);
    if (underUsed.length > 0 && atRisk.length > 0) {
      const source = underUsed.sort((a: any, b: any) => a.util - b.util)[0];
      insights.push({
        id: 'opt-1', type: 'info', icon: Sparkles, color: 'text-blue-500',
        title: 'Budget Optimization',
        message: `${source.name} is at ${source.util.toFixed(0)}% — consider reallocating surplus to ${atRisk[0].name}.`,
        timestamp: new Date(), priority: 'medium',
      });
    }

    // Overall health check
    const overallUtil = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    if (overallUtil <= 75 && atRisk.length === 0) {
      insights.push({
        id: 'health-1', type: 'success', icon: CheckCircle, color: 'text-green-500',
        title: 'On-Track Performance',
        message: `Overall budget is at ${overallUtil.toFixed(0)}% utilization. All categories within healthy limits.`,
        timestamp: new Date(), priority: 'low',
      });
    }

    // Pending approvals alert
    if (pendingApprovals > 0) {
      insights.push({
        id: 'pending-1', type: 'info', icon: AlertCircle, color: 'text-amber-500',
        title: 'Pending Approvals',
        message: `${pendingApprovals} expense${pendingApprovals === 1 ? '' : 's'} awaiting approval.`,
        timestamp: new Date(), priority: 'medium',
      });
    }

    return insights;
  })();

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-[#1B1F23] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('budget.budgetOverview')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('budget.realTimeTracking')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
              <Eye className="h-4 w-4 inline mr-2" />
              {t('common.export')}
            </Button>
            <Button className="px-4 py-2 text-sm font-medium text-white bg-[#1C8C7D] rounded-lg hover:bg-[#156B60] transition-colors">
              <Package className="h-4 w-4 inline mr-2" />
              {t('common.submit')}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Dashboard Style */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            value={`${(totalAllocated / 1000000).toFixed(1)}M`}
            label={t('budget.totalBudget')}
            sublabel={`${budget?.currency || 'ETB'} allocated`}
            color="text-[#1C8C7D]"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value={`${(totalSpent / 1000000).toFixed(1)}M`}
            label={t('budget.spent')}
            sublabel={`${utilizationRate.toFixed(1)}% utilization`}
            color="text-blue-500"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value={pendingApprovals.toString()}
            label={t('budget.pendingApprovals')}
            sublabel={t('budget.awaitingApproval')}
            color="text-yellow-500"
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5" />}
            value={`${(totalAvailable / 1000000).toFixed(1)}M`}
            label={t('budget.available')}
            sublabel={`${((totalAvailable / totalAllocated) * 100).toFixed(0)}% remaining`}
            color="text-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Budget Categories & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Budget Categories Breakdown */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('budget.categories')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {categories.length} categories • {expenses.length} total expenses
                  </p>
                </div>
                <Button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1B1F23] rounded-lg transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category: any) => {
                  const percentUsed = category.allocatedAmount > 0
                    ? ((category.spent || 0) / category.allocatedAmount) * 100
                    : 0;
                  const isHighUtilization = percentUsed > 75;
                  const isOverBudget = percentUsed > 100;

                  return (
                    <div
                      key={category.id}
                      className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            {category.code && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({category.code})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('budget.spent')}: <span className="font-medium text-gray-900 dark:text-white">
                                {((category.spent || 0) / 1000000).toFixed(2)}M ETB
                              </span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Allocated: {(category.allocatedAmount / 1000000).toFixed(2)}M ETB
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            isOverBudget
                              ? 'text-red-500'
                              : isHighUtilization
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}>
                            {percentUsed.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">{t('budget.utilized')}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 bg-gray-200 dark:bg-[#1B1F23] rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                            isOverBudget
                              ? 'bg-red-500'
                              : isHighUtilization
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>

                      {/* Remaining Amount */}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {t('budget.remaining')}: <span className="font-medium text-gray-900 dark:text-white">
                          {((category.allocatedAmount - (category.spent || 0)) / 1000000).toFixed(2)}M ETB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Budget Activities */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('budget.recentActivity')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('budget.totalExpenses')}
                  </p>
                </div>
                <Button variant="link" className="text-sm text-[#1C8C7D] hover:underline font-medium">
                  {t('common.viewAll')}
                </Button>
              </div>

              <div className="space-y-3">
                {recentExpenses.map((expense: any) => {
                  const StatusIcon = expense.status === 'APPROVED'
                    ? CheckCircle
                    : expense.status === 'PENDING'
                    ? Clock
                    : XCircle;

                  const statusColor = expense.status === 'APPROVED'
                    ? 'text-green-500'
                    : expense.status === 'PENDING'
                    ? 'text-yellow-500'
                    : 'text-red-500';

                  return (
                    <div
                      key={expense.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1B1F23] transition-colors"
                    >
                      <StatusIcon className={`h-5 w-5 ${statusColor} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {expense.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {expense.category?.name || 'Uncategorized'}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(expense.transactionDate), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {(expense.amount / 1000000).toFixed(2)}M
                        </div>
                        <div className="text-xs text-gray-500">{expense.currency}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: AI Budget Watchers */}
          <div className="space-y-6">
            {/* AI-Powered Budget Watchers */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-[#1C8C7D]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Budget Watchers
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Smart insights & recommendations
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {budgetWatchers.map((watcher) => {
                  const Icon = watcher.icon;
                  return (
                    <div
                      key={watcher.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 ${watcher.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {watcher.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {watcher.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              watcher.priority === 'high'
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                : watcher.priority === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            }`}>
                              {watcher.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(watcher.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Status Overview */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status Overview
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Approved</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {expenses.filter((e: any) => e.status === 'APPROVED').length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pendingApprovals}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Rejected</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {rejectedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard Component matching dashboard style
function StatCard({
  icon,
  value,
  label,
  sublabel,
  color,
  onClick,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  sublabel: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200 cursor-pointer text-left w-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={color}>{icon}</div>
        {onClick && (
          <div className="text-xs text-[#1C8C7D] dark:text-[#1C8C7D] font-medium">View details →</div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</div>
    </div>
  );
}
