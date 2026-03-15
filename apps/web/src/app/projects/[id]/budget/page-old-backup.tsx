'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BudgetSummaryWidget } from '@/components/budget/budget-summary-widget';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface BudgetCategory {
  id: string;
  name: string;
  code?: string;
  allocated: number;
  spent: number;
  committed: number;
  available: number;
  percentageUsed: number;
  variance: number;
  status: string;
  expenseCount: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  transactionDate: string;
  status: string;
  category?: {
    name: string;
    code?: string;
  };
}

const statusColors = {
  ON_TRACK: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  AT_RISK: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  OVER_BUDGET: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  WATCH: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
};

const expenseStatusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
  APPROVED: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Approved' },
  REJECTED: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Rejected' },
  PAID: { icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Paid' },
};

export default function ProjectBudgetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expenseStatus, setExpenseStatus] = useState<string | null>(null);

  // Fetch budget data
  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/budget`);
      if (!response.ok) throw new Error('Failed to fetch budget');
      return response.json();
    },
  });

  const budget = budgetData?.budget;
  const categories = budget?.categoryBreakdown || [];

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', budget?.id, selectedCategory, expenseStatus],
    queryFn: async () => {
      if (!budget?.id) return null;
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (expenseStatus) params.append('status', expenseStatus);
      const response = await fetch(`/api/budgets/${budget.id}/expenses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    },
    enabled: !!budget?.id,
  });

  const expenses = expensesData?.expenses || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (budgetLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Loading budget data...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 inline-block mb-4">
            <DollarSign className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Budget Configured</h3>
          <p className="text-sm text-slate-500 mb-6">
            This project doesn't have a budget set up yet. Configure a budget to start tracking expenses and utilization.
          </p>
          <button className="px-4 py-2 bg-[#1C8C7D] text-white rounded-md hover:bg-[#16A085] transition-colors">
            Configure Budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#1B1F23]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Budget Summary Widget */}
        <BudgetSummaryWidget projectId={projectId} showAlerts={true} />

        {/* Budget Categories */}
        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Budget Categories</h3>
                <p className="text-sm text-slate-500">Track spending across different categories</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">No budget categories defined yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category: BudgetCategory) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:border-[#1C8C7D] transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{category.name}</h4>
                        {category.code && (
                          <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded">
                            {category.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{category.expenseCount} expenses</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            statusColors[category.status as keyof typeof statusColors] || statusColors.ON_TRACK
                          }`}
                        >
                          {category.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{category.percentageUsed.toFixed(1)}%</div>
                      <div className="text-xs text-slate-500">utilized</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1C8C7D] to-[#16A085] transition-all duration-500"
                        style={{ width: `${Math.min(category.percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Budget Breakdown */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Allocated</p>
                      <p className="font-semibold">
                        {formatCurrency(category.allocated)} <span className="text-xs text-slate-500">{budget.currency}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Spent</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(category.spent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Committed</p>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(category.committed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Available</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(category.available)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Recent Expenses</h3>
                <p className="text-sm text-slate-500">Latest transactions and expense submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1C8C7D] text-white rounded-md hover:bg-[#16A085] transition-colors">
                <Plus className="h-4 w-4" />
                New Expense
              </button>
            </div>
          </div>

          {expensesLoading ? (
            <div className="text-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm text-slate-500">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">No expenses recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense: Expense) => {
                const statusConfig = expenseStatusConfig[expense.status as keyof typeof expenseStatusConfig] || expenseStatusConfig.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-[#1C8C7D] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-10 w-10 rounded-full ${statusConfig.bg} flex items-center justify-center`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{expense.description}</p>
                          {expense.category && (
                            <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded">
                              {expense.category.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>{formatDistanceToNow(new Date(expense.transactionDate), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(Number(expense.amount))} <span className="text-sm text-slate-500">{expense.currency}</span>
                      </p>
                      <p className="text-xs text-slate-500">{expense.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI-Powered Budget Watchers & Activity Timeline */}
        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Budget Activity & Watchers
                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                  AI-Powered
                </span>
              </h3>
              <p className="text-sm text-slate-500">Track budget changes, expense approvals, and financial activity</p>
            </div>
          </div>

          {/* Activity Timeline with budget-specific filters */}
          <ActivityTimeline
            entityType="BUDGET"
            entityId={budget.id}
            limit={20}
            showFilters={true}
          />
        </div>
      </div>
    </div>
  );
}
