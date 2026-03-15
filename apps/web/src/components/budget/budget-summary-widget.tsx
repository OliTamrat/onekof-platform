'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  AlertCircle,
  Eye,
  Shield,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface BudgetUtilization {
  totalBudget: number;
  spent: number;
  committed: number;
  available: number;
  percentageUsed: number;
  percentageCommitted: number;
  status: 'ON_TRACK' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'OVER_BUDGET';
  lastUpdated: string;
}

interface BudgetBurnRate {
  dailyBurnRate: number;
  weeklyBurnRate: number;
  monthlyBurnRate: number;
  averageExpenseSize: number;
  totalExpenses: number;
}

interface BudgetAlert {
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  category: string;
  threshold?: number;
  count?: number;
  amount?: number;
}

interface BudgetForecast {
  daysRemaining: number;
  projectedCompletionDate: string | null;
  daysUntilFiscalYearEnd: number | null;
  forecastStatus: string;
  forecastMessage: string;
  projectedTotalSpend: number;
}

interface BudgetData {
  id: string;
  projectId: string;
  currency: string;
  status: string;
  totalBudget?: number;
  accessLevel: string;
  utilization?: BudgetUtilization;
  burnRate?: BudgetBurnRate;
  alerts?: BudgetAlert[];
  forecast?: BudgetForecast;
}

interface BudgetSummaryWidgetProps {
  projectId: string;
  compact?: boolean;
  showAlerts?: boolean;
}

const statusConfig = {
  ON_TRACK: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle,
    label: 'On Track',
  },
  WATCH: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Eye,
    label: 'Monitoring',
  },
  AT_RISK: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: AlertTriangle,
    label: 'At Risk',
  },
  CRITICAL: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: AlertCircle,
    label: 'Critical',
  },
  OVER_BUDGET: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: AlertCircle,
    label: 'Over Budget',
  },
};

export function BudgetSummaryWidget({
  projectId,
  compact = false,
  showAlerts = true,
}: BudgetSummaryWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['budget', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/budget`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('NO_ACCESS');
        }
        if (response.status === 404) {
          throw new Error('NOT_FOUND');
        }
        throw new Error('Failed to fetch budget');
      }
      const result = await response.json();
      return result.budget as BudgetData;
    },
    retry: (failureCount, error) => {
      // Don't retry if no access or not found
      if (error.message === 'NO_ACCESS' || error.message === 'NOT_FOUND') {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Project Budget</h3>
            <p className="text-sm text-slate-500">Loading budget data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    if (error.message === 'NO_ACCESS') {
      return (
        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Project Budget</h3>
              <p className="text-sm text-slate-500">Restricted access</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
              <Shield className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              You don't have permission to view budget information for this project.
            </p>
          </div>
        </div>
      );
    }

    if (error.message === 'NOT_FOUND') {
      return (
        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Project Budget</h3>
              <p className="text-sm text-slate-500">No budget configured</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
              <DollarSign className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              This project doesn't have a budget set up yet.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load budget</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const budget = data;
  const utilization = budget.utilization;
  const burnRate = budget.burnRate;
  const alerts = budget.alerts || [];
  const forecast = budget.forecast;

  // If user only has basic access, show limited view
  if (!utilization || !budget.totalBudget) {
    return (
      <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Project Budget</h3>
            <p className="text-sm text-slate-500">Budget is active</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500">
            Limited budget information available at your access level.
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[utilization.status] || statusConfig.ON_TRACK;
  const StatusIcon = statusInfo.icon;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-[#22272B] overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-[#1C8C7D] to-[#16A085]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Project Budget</h3>
              <p className="text-sm text-white/80">Real-time financial tracking</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-2`}>
            <StatusIcon className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{statusInfo.label}</span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            {/* SVG Circle */}
            <svg className="transform -rotate-90" width="180" height="180">
              {/* Background Circle */}
              <circle
                cx="90"
                cy="90"
                r="75"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="90"
                cy="90"
                r="75"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 75}`}
                strokeDashoffset={`${2 * Math.PI * 75 * (1 - Math.min(utilization.percentageUsed, 100) / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {utilization.percentageUsed.toFixed(1)}%
              </span>
              <span className="text-sm text-white/80 mt-1">utilized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="p-6 space-y-4">
        {/* Total Budget */}
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budget</span>
          <span className="text-lg font-bold">
            {formatCurrency(utilization.totalBudget)} <span className="text-sm font-normal text-slate-500">{budget.currency}</span>
          </span>
        </div>

        {/* Spent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Spent</span>
          </div>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(utilization.spent)} <span className="text-xs font-normal">{budget.currency}</span>
          </span>
        </div>

        {/* Committed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Committed</span>
          </div>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(utilization.committed)} <span className="text-xs font-normal">{budget.currency}</span>
          </span>
        </div>

        {/* Available */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Available</span>
          </div>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(utilization.available)} <span className="text-xs font-normal">{budget.currency}</span>
          </span>
        </div>

        {/* Burn Rate */}
        {burnRate && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[#1C8C7D]" />
              <span className="text-sm font-medium">Burn Rate</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Daily</p>
                <p className="text-sm font-semibold">{formatCurrency(burnRate.dailyBurnRate)}</p>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Weekly</p>
                <p className="text-sm font-semibold">{formatCurrency(burnRate.weeklyBurnRate)}</p>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Monthly</p>
                <p className="text-sm font-semibold">{formatCurrency(burnRate.monthlyBurnRate)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Forecast */}
        {forecast && forecast.daysRemaining !== Infinity && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#1C8C7D]" />
              <span className="text-sm font-medium">Budget Forecast</span>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#1C8C7D] mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{forecast.forecastMessage}</p>
              </div>
              {forecast.daysRemaining > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>~{forecast.daysRemaining} days remaining at current burn rate</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {showAlerts && alerts.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'CRITICAL'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : alert.type === 'WARNING'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.type === 'CRITICAL'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.type === 'WARNING'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-3 border-t flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Updated {formatDistanceToNow(new Date(utilization.lastUpdated), { addSuffix: true })}
            </span>
          </div>
          <Link
            href={`/for-organizations/projects/${projectId}/budget`}
            className="flex items-center gap-1 text-[#1C8C7D] hover:underline font-medium transition-colors"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
