'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  Download,
  Eye,
  User,
  X
} from 'lucide-react';

export default function BudgetPage() {
  const toast = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentOrganization } = useWorkspace();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Slide-out panel states
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filterTitle, setFilterTitle] = useState('');
  const [isActivitySlideoutOpen, setIsActivitySlideoutOpen] = useState(false);
  const [isWatchersSlideoutOpen, setIsWatchersSlideoutOpen] = useState(false);

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState<'all' | 'approved' | 'pending' | 'category'>('all');

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/budget');
    }
  }, [status, router]);

  // Add timeout for loading state
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // Show loading while checking session
  if (status === 'loading' && !loadingTimeout) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // If loading timed out
  if (status === 'loading' && loadingTimeout) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="text-center max-w-md p-6">
            <div className="mb-4 text-yellow-500">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Session Loading Issue</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              The session is taking longer than expected to load. This might be a configuration issue.
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="px-4 py-2 bg-[#1C8C7D] text-white rounded-md hover:bg-[#156B60]"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Mock budget data - will be replaced with API call
  const totalBudget = 125000000; // ETB
  const allocated = 98000000;
  const spent = 72500000;
  const pending = 5200000;

  const categories = [
    { name: 'Construction & Infrastructure', budget: 50000000, spent: 35000000, color: '#1C8C7D' },
    { name: 'Equipment & Materials', budget: 30000000, spent: 22000000, color: '#00875A' },
    { name: 'Labor & Personnel', budget: 25000000, spent: 10000000, color: '#FF5630' },
    { name: 'Environmental & Social', budget: 10000000, spent: 3000000, color: '#FFAB00' },
    { name: 'Contingency', budget: 10000000, spent: 2500000, color: '#6554C0' },
  ];

  const recentTransactions = [
    { id: 1, date: '2026-03-03', category: 'Construction & Infrastructure', description: 'Dam foundation materials', amount: -1200000, status: 'approved', user: 'Dr. Abebe Kebede' },
    { id: 2, date: '2026-03-02', category: 'Equipment & Materials', description: 'Heavy machinery rental', amount: -850000, status: 'approved', user: 'Eng. Tigist Haile' },
    { id: 3, date: '2026-03-01', category: 'Labor & Personnel', description: 'Engineering team - Feb 2026', amount: -2100000, status: 'approved', user: 'Finance Team' },
    { id: 4, date: '2026-02-28', category: 'Environmental & Social', description: 'Community consultation', amount: -350000, status: 'pending', user: 'Social Impact Team' },
    { id: 5, date: '2026-02-27', category: 'Construction & Infrastructure', description: 'Irrigation system components', amount: -980000, status: 'approved', user: 'Dr. Abebe Kebede' },
    { id: 6, date: '2026-02-26', category: 'Equipment & Materials', description: 'Survey equipment', amount: -420000, status: 'approved', user: 'Eng. Tigist Haile' },
    { id: 7, date: '2026-02-25', category: 'Labor & Personnel', description: 'Construction workers - Week 8', amount: -680000, status: 'approved', user: 'HR Department' },
  ];

  const budgetWatchers: { id: number; name: string; role: string; avatar: string | null; watching: string[] }[] = [
    { id: 1, name: 'Minister Seleshi Bekele', role: 'Minister', avatar: null, watching: ['All Categories'] },
    { id: 2, name: 'Dr. Abebe Kebede', role: 'Project Director', avatar: null, watching: ['Construction & Infrastructure', 'Equipment & Materials'] },
    { id: 3, name: 'Finance Director', role: 'CFO', avatar: null, watching: ['All Categories'] },
    { id: 4, name: 'Budget Committee', role: 'Committee', avatar: null, watching: ['All Categories'] },
  ];

  const totalCategories = categories.length;
  const maxCategorySpent = Math.max(...categories.map(c => c.spent), 1);

  // Calculate stats
  const approvedThisWeek = recentTransactions.filter(t =>
    t.status === 'approved' &&
    new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const pendingApproval = recentTransactions.filter(t => t.status === 'pending').length;

  const categoriesUnderBudget = categories.filter(c => c.spent < c.budget).length;

  const categoriesAtRisk = categories.filter(c => {
    const utilizationRate = (c.spent / c.budget) * 100;
    return utilizationRate > 80 && utilizationRate < 100;
  }).length;

  // Handlers for drill-down
  const handleShowApprovedTransactions = () => {
    const approved = recentTransactions.filter(t =>
      t.status === 'approved' &&
      new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    setFilteredTransactions(approved);
    setFilterTitle('Approved Transactions (Last 7 Days)');
    setIsActivitySlideoutOpen(true);
  };

  const handleShowPendingTransactions = () => {
    const pending = recentTransactions.filter(t => t.status === 'pending');
    setFilteredTransactions(pending);
    setFilterTitle('Pending Approval');
    setIsActivitySlideoutOpen(true);
  };

  const handleShowUnderBudgetCategories = () => {
    const underBudget = categories.filter(c => c.spent < c.budget);
    setFilteredTransactions(underBudget.map((c, i) => ({
      id: i,
      category: c.name,
      description: `Budget: ETB ${(c.budget / 1000000).toFixed(1)}M | Spent: ETB ${(c.spent / 1000000).toFixed(1)}M`,
      amount: c.budget - c.spent,
      status: 'healthy',
    })));
    setFilterTitle(`Under Budget Categories (${underBudget.length})`);
    setIsActivitySlideoutOpen(true);
  };

  const handleShowAtRiskCategories = () => {
    const atRisk = categories.filter(c => {
      const utilizationRate = (c.spent / c.budget) * 100;
      return utilizationRate > 80 && utilizationRate < 100;
    });
    setFilteredTransactions(atRisk.map((c, i) => ({
      id: i,
      category: c.name,
      description: `Budget: ETB ${(c.budget / 1000000).toFixed(1)}M | Spent: ETB ${(c.spent / 1000000).toFixed(1)}M`,
      amount: c.budget - c.spent,
      status: 'warning',
    })));
    setFilterTitle(`At Risk Categories (${atRisk.length})`);
    setIsActivitySlideoutOpen(true);
  };

  const handleShowCategoryDetails = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return;

    const categoryTransactions = recentTransactions.filter(t => t.category === categoryName);
    const utilizationRate = ((category.spent / category.budget) * 100).toFixed(1);
    const remaining = category.budget - category.spent;

    setFilteredTransactions(categoryTransactions);
    setFilterTitle(`${categoryName} • ${utilizationRate}% Utilized`);
    setIsActivitySlideoutOpen(true);
  };

  const handleShowAllBudgetOverview = () => {
    setFilteredTransactions(recentTransactions);
    setFilterTitle(`All Transactions • ETB ${(spent / 1000000).toFixed(1)}M Spent`);
    setIsActivitySlideoutOpen(true);
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Budget"
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="#EF4444"

        currentTab="budget"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      {/* Stats Cards — sticky only on desktop */}
      <div className="bg-white dark:bg-[#1B1F23] border-b border-gray-200 dark:border-gray-800 lg:sticky lg:top-0 lg:z-10 lg:shadow-sm">
        <div className="p-3 md:p-6">
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 scrollbar-hide">
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            value={`ETB ${(spent / 1000000).toFixed(1)}M`}
            label="spent"
            sublabel={`of ETB ${(totalBudget / 1000000).toFixed(1)}M total budget`}
            color="text-blue-500 dark:text-blue-400"
            onClick={handleShowAllBudgetOverview}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={approvedThisWeek.toString()}
            label="approved"
            sublabel="transactions in last 7 days"
            color="text-green-500 dark:text-green-400"
            onClick={handleShowApprovedTransactions}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value={pendingApproval.toString()}
            label="pending"
            sublabel="awaiting approval"
            color="text-orange-500 dark:text-orange-400"
            onClick={handleShowPendingTransactions}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value={categoriesUnderBudget.toString()}
            label="on track"
            sublabel={`of ${totalCategories} budget categories`}
            color="text-primary-500 dark:text-primary-400"
            onClick={handleShowUnderBudgetCategories}
          />
          </div>
        </div>
      </div>

      {/* Main Content with Padding */}
      <div className="p-4 md:p-6">
        {/* Main Grid - Redesigned for Better UI/UX */}
        <div className="grid grid-cols-1 gap-6">
          {/* Row 1: Budget Overview + (Activity + Watchers stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Budget Overview - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div
                onClick={handleShowAllBudgetOverview}
                className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-6 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200 cursor-pointer h-full"
              >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Budget overview
                </h2>
                <div className="text-xs text-[#1C8C7D] dark:text-[#1C8C7D] font-medium">
                  Click to view details →
                </div>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Track spending across all budget categories. Click anywhere to drill down.
              </p>

              {/* Donut Chart */}
              <div className="flex items-center gap-8">
                <div className="relative h-48 w-48">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="15"
                    />
                    {/* Segments based on real data */}
                    {totalBudget > 0 && (
                      <>
                        {categories.map((category, index) => {
                          const previousTotal = categories.slice(0, index).reduce((sum, c) => sum + c.budget, 0);
                          const percentage = (category.budget / totalBudget) * 100;
                          const dashArray = (percentage / 100) * 220;
                          const dashOffset = -((previousTotal / totalBudget) * 220);

                          return (
                            <circle
                              key={category.name}
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke={category.color}
                              strokeWidth="15"
                              strokeDasharray={`${dashArray} 220`}
                              strokeDashoffset={dashOffset}
                            />
                          );
                        })}
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {((spent / totalBudget) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Utilized</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  {categories.map((category) => {
                    const utilizationRate = ((category.spent / category.budget) * 100).toFixed(1);
                    return (
                      <Button variant="ghost" size="icon"
                        key={category.name}
                        onClick={(e) => { e.stopPropagation(); handleShowCategoryDetails(category.name); }}
                        className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }}></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{utilizationRate}%</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            ETB {(category.spent / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Category Spending Breakdown */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Category spending breakdown</h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Visual representation of spending levels across budget categories.
                </p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <CategoryBar
                      key={category.name}
                      label={category.name}
                      value={category.spent}
                      budget={category.budget}
                      max={maxCategorySpent}
                      color={category.color}
                    />
                  ))}
                </div>
              </div>

              {/* AI-Powered Budget Analysis Summary */}
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">AI Budget Analysis</h3>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-[#1C8C7D]/10 to-[#16A085]/10 border border-[#1C8C7D]/20">
                      <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
                      <span className="text-xs font-medium text-[#1C8C7D]">AI-Generated</span>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // PDF export functionality
                      toast.info('Generating report', 'Budget report PDF is being prepared');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#1C8C7D] text-white hover:bg-[#156B60] transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF Report
                  </Button>
                </div>

                {/* AI Summary Content */}
                <div className="space-y-4">
                  {/* Executive Summary */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Executive Summary</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          The Water Dam and Irrigation project has utilized <span className="font-semibold text-[#1C8C7D]">ETB {(spent / 1000000).toFixed(1)}M ({((spent / totalBudget) * 100).toFixed(1)}%)</span> of the total <span className="font-semibold">ETB {(totalBudget / 1000000).toFixed(1)}M</span> budget allocation.
                          Based on current spending patterns, the project is on track with <span className="font-semibold text-green-600 dark:text-green-400">{categoriesUnderBudget} out of {totalCategories} categories</span> operating within budget limits.
                          {categoriesAtRisk > 0 && (
                            <span className="font-semibold text-orange-600 dark:text-orange-400"> However, {categoriesAtRisk} {categoriesAtRisk === 1 ? 'category requires' : 'categories require'} immediate attention due to high utilization rates exceeding 80%.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Budget Performance */}
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Budget Performance</h5>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><span className="font-medium text-slate-900 dark:text-white">ETB {((totalBudget - spent) / 1000000).toFixed(1)}M</span> remaining in total budget</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Average daily spending: <span className="font-medium text-slate-900 dark:text-white">ETB {((spent / 30) / 1000).toFixed(0)}K</span></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Projected completion: <span className="font-medium text-slate-900 dark:text-white">{Math.ceil((totalBudget - spent) / (spent / 30))} days</span> at current rate</span>
                        </li>
                      </ul>
                    </div>

                    {/* Category Analysis */}
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Top Spending Categories</h5>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        {[...categories]
                          .sort((a, b) => b.spent - a.spent)
                          .slice(0, 3)
                          .map((category, index) => (
                            <li key={category.name} className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="h-4 w-4 rounded-sm flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: category.color }}>
                                  {index + 1}
                                </div>
                              </div>
                              <span>
                                <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                                {' '}• ETB {(category.spent / 1000000).toFixed(1)}M ({((category.spent / category.budget) * 100).toFixed(0)}%)
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="p-4 rounded-lg border border-[#1C8C7D]/20 bg-gradient-to-br from-[#1C8C7D]/5 to-[#16A085]/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-md bg-[#1C8C7D] flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">AI Recommendations</h5>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {categoriesAtRisk > 0 && (
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-medium">Immediate Action Required:</span> Review budget allocation for {categories.filter(c => (c.spent / c.budget) > 0.8).map(c => c.name).join(', ')} to prevent overspending.
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Optimization Opportunity:</span> Consider reallocating {((categories.find(c => c.spent < c.budget * 0.5)?.budget || 0) * 0.1 / 1000000).toFixed(1)}M ETB from underutilized categories to high-priority areas.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Timeline Insight:</span> At the current spending rate, the project budget will be exhausted in approximately {Math.ceil((totalBudget - spent) / (spent / 30))} days. Plan accordingly for Q2 2026.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Report Timestamp */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                    <span>Analysis generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>Ministry of Water and Irrigation • Ethiopia</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Recent Budget Activity + Budget Watchers - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Budget Activity - AI-Powered */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent activity
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-[#1C8C7D] font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Stay up to date with what's happening across your organization.
              </p>

              {/* Filter Buttons */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Filter by:</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActivityFilter('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activityFilter === 'all'
                        ? 'bg-[#1C8C7D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setActivityFilter('approved')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activityFilter === 'approved'
                        ? 'bg-[#1C8C7D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Approved
                  </Button>
                  <Button
                    onClick={() => setActivityFilter('pending')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activityFilter === 'pending'
                        ? 'bg-[#1C8C7D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Pending
                  </Button>
                  <Button
                    onClick={() => setActivityFilter('category')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activityFilter === 'category'
                        ? 'bg-[#1C8C7D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    By Category
                  </Button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1C8C7D] via-slate-200 dark:via-slate-700 to-transparent"></div>

                {/* Activities */}
                <div className="space-y-4">
                  {recentTransactions
                    .filter((transaction) => {
                      if (activityFilter === 'all') return true;
                      if (activityFilter === 'approved') return transaction.status === 'approved';
                      if (activityFilter === 'pending') return transaction.status === 'pending';
                      return true;
                    })
                    .slice(0, 2)
                    .map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="relative pl-12 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-0 flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-white dark:bg-[#22272B] border-2 border-[#1C8C7D] shadow-md flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#1C8C7D]" />
                          </div>
                        </div>

                        {/* Activity Card */}
                        <div className="rounded-lg border bg-white dark:bg-[#22272B] p-4 hover:shadow-md transition-all duration-200 hover:border-[#1C8C7D]">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3 flex-1">
                              {/* User Avatar */}
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#1C8C7D]/20">
                                {transaction.user.split(' ').map((n: string) => n[0]).join('')}
                              </div>

                              {/* User Name and Action */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">
                                    {transaction.user}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                      transaction.status === 'approved'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                    }`}
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    {transaction.status === 'approved' ? 'approved' : 'submitted'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{getRelativeTime(transaction.date)}</span>
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="flex items-start gap-2 mb-3 p-3 rounded-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                            <Sparkles className="h-4 w-4 text-[#1C8C7D] mt-0.5 flex-shrink-0" />
                            <p className="text-sm leading-relaxed">
                              <span className="font-medium text-[#1C8C7D]">ETB {(Math.abs(transaction.amount) / 1000).toFixed(0)}K</span>
                              {' '}for{' '}
                              <span className="font-medium">{transaction.category}</span>
                              {' '}• {transaction.description}
                            </p>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium">Budget Transaction</span>
                              <span>•</span>
                              <span className="font-mono">{transaction.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* View All Activity Button */}
                {recentTransactions.filter((transaction) => {
                  if (activityFilter === 'all') return true;
                  if (activityFilter === 'approved') return transaction.status === 'approved';
                  if (activityFilter === 'pending') return transaction.status === 'pending';
                  return true;
                }).length > 2 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => {
                        setFilteredTransactions(recentTransactions.filter((transaction) => {
                          if (activityFilter === 'all') return true;
                          if (activityFilter === 'approved') return transaction.status === 'approved';
                          if (activityFilter === 'pending') return transaction.status === 'pending';
                          return true;
                        }));
                        setFilterTitle(`All ${activityFilter === 'all' ? '' : activityFilter.charAt(0).toUpperCase() + activityFilter.slice(1) + ' '}Activity`);
                        setIsActivitySlideoutOpen(true);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-[#1C8C7D] text-[#1C8C7D] hover:bg-[#1C8C7D] hover:text-white transition-colors"
                    >
                      View All Activity ({recentTransactions.filter((transaction) => {
                        if (activityFilter === 'all') return true;
                        if (activityFilter === 'approved') return transaction.status === 'approved';
                        if (activityFilter === 'pending') return transaction.status === 'pending';
                        return true;
                      }).length - 2} more)
                    </Button>
                  </div>
                )}
              </div>

              {/* Animation Styles */}
              <style jsx>{`
                @keyframes fade-in {
                  from {
                    opacity: 0;
                    transform: translateX(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
                .animate-fade-in {
                  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                  opacity: 0;
                }
              `}</style>
              </div>

              {/* Budget Watchers */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Budget watchers
                  <span className="ml-2 text-sm font-normal text-slate-500">({budgetWatchers.length})</span>
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Team members monitoring budget activities.
              </p>

              {/* Watchers Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1C8C7D] via-slate-200 dark:via-slate-700 to-transparent"></div>

                {/* Watchers */}
                <div className="space-y-4">
                  {budgetWatchers.slice(0, 2).map((watcher, index) => (
                    <div
                      key={watcher.id}
                      className="relative pl-12 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-0 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-white dark:bg-[#22272B] border-2 border-[#1C8C7D] shadow-md flex items-center justify-center">
                          <Eye className="h-5 w-5 text-[#1C8C7D]" />
                        </div>
                      </div>

                      {/* Watcher Card */}
                      <div className="rounded-lg border bg-white dark:bg-[#22272B] p-4 hover:shadow-md transition-all duration-200 hover:border-[#1C8C7D]">
                        <div className="flex items-center gap-3">
                          {/* User Avatar */}
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#1C8C7D]/20">
                            {watcher.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Watcher Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-sm">
                                {watcher.name}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                <Eye className="h-3 w-3" />
                                watching
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {watcher.role} • {watcher.watching.length} {watcher.watching.length === 1 ? 'category' : 'categories'}
                            </p>
                          </div>
                        </div>

                        {/* Watching Categories */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {watcher.watching.map((category, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Watchers Button */}
                {budgetWatchers.length > 2 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setIsWatchersSlideoutOpen(true)}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-[#1C8C7D] text-[#1C8C7D] hover:bg-[#1C8C7D] hover:text-white transition-colors"
                    >
                      View All Watchers ({budgetWatchers.length - 2} more)
                    </Button>
                  </div>
                )}
              </div>

              {/* Animation Styles */}
              <style jsx>{`
                @keyframes fade-in {
                  from {
                    opacity: 0;
                    transform: translateX(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
                .animate-fade-in {
                  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                  opacity: 0;
                }
              `}</style>
              </div>
            </div>
          </div>

          {/* Row 2: Budget Alert + Budget Insights (side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Alert */}
            <div>
              {/* Alert Card */}
              <div className="rounded-lg border border-orange-500/20 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-orange-500/20 ring-2 ring-orange-500/30">
                    <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      Budget Alert
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                        Action Required
                      </span>
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {categoriesAtRisk} {categoriesAtRisk === 1 ? 'category is' : 'categories are'} approaching budget limits at <span className="font-semibold text-orange-600 dark:text-orange-400">80%+ utilization</span>.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button className="px-4 py-2 text-sm font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors">
                        Review Categories
                      </Button>
                      <Button className="px-4 py-2 text-sm font-medium rounded-md border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Insights */}
            <div>
              {/* Quick Stats Card */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-6 hover:shadow-md transition-all duration-200">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#1C8C7D]" />
                  Budget Insights
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Average Spending/Day</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">ETB {((spent / 30) / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Projected End Date</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {Math.ceil((totalBudget - spent) / (spent / 30))} days remaining
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Slide-out Panel */}
      {isActivitySlideoutOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsActivitySlideoutOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white dark:bg-[#1B1F23] shadow-2xl overflow-hidden animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{filterTitle}</h2>
                  <p className="text-sm text-white/80 mt-1">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'items'} found
                  </p>
                </div>
                <Button variant="ghost" size="icon"
                  onClick={() => setIsActivitySlideoutOpen(false)}
                  className="rounded-md p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* AI-Powered Analytics Bar */}
            {filteredTransactions.length > 0 && (() => {
              const approved = filteredTransactions.filter((t: any) => t.status === 'approved').length;
              const pending = filteredTransactions.filter((t: any) => t.status === 'pending').length;
              const totalAmount = filteredTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

              return (
                <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 py-3">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">AI Insights:</span>
                    </div>
                    {totalAmount > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Total: <span className="font-semibold text-blue-600 dark:text-blue-400">ETB {(totalAmount / 1000000).toFixed(2)}M</span>
                        </span>
                      </div>
                    )}
                    {approved > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-green-600 dark:text-green-400">{approved}</span> approved
                        </span>
                      </div>
                    )}
                    {pending > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">{pending}</span> pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#22272B] hover:shadow-md hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {transaction.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              transaction.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              transaction.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                              transaction.status === 'healthy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              transaction.status === 'warning' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                              'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                            }`}>
                              {transaction.status.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {transaction.user && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{transaction.user}</span>
                              </div>
                            )}
                            {transaction.date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{transaction.date}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-sm font-semibold ${
                            transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.amount < 0 ? '-' : '+'}ETB {(Math.abs(transaction.amount) / 1000000).toFixed(2)}M
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                </div>
              )}
            </div>
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes slide-in-right {
              from {
                opacity: 0;
                transform: translateX(100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            .animate-slide-in-right {
              animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}</style>
        </>
      )}

      {/* Watchers Slide-out Panel */}
      {isWatchersSlideoutOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsWatchersSlideoutOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white dark:bg-[#1B1F23] shadow-2xl overflow-hidden animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Budget Watchers</h2>
                  <p className="text-sm text-white/80 mt-1">
                    {budgetWatchers.length} team {budgetWatchers.length === 1 ? 'member' : 'members'} watching
                  </p>
                </div>
                <Button variant="ghost" size="icon"
                  onClick={() => setIsWatchersSlideoutOpen(false)}
                  className="rounded-md p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Watchers List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {budgetWatchers.map((watcher) => (
                  <div
                    key={watcher.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#22272B] hover:shadow-md hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-white text-lg font-semibold ring-2 ring-[#1C8C7D]/20 flex-shrink-0">
                        {watcher.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Watcher Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-base text-gray-900 dark:text-white">
                            {watcher.name}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            <Eye className="h-3 w-3" />
                            watching
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {watcher.role} • {watcher.watching.length} {watcher.watching.length === 1 ? 'category' : 'categories'}
                        </p>

                        {/* Watching Categories */}
                        <div className="flex flex-wrap gap-2">
                          {watcher.watching.map((category, i) => (
                            <span
                              key={i}
                              className="inline-block px-3 py-1 text-sm rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-[#22272B]">
              <Button className="w-full px-4 py-2 text-sm font-medium rounded-md bg-[#1C8C7D] text-white hover:bg-[#156B60] transition-colors">
                <Plus className="h-4 w-4 inline-block mr-2" />
                Add Watcher
              </Button>
            </div>
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes slide-in-right {
              from {
                opacity: 0;
                transform: translateX(100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            .animate-slide-in-right {
              animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}</style>
        </>
      )}
    </AppLayout>
  );
}

// Helper Components
function StatCard({
  icon,
  value,
  label,
  sublabel,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Button variant="outline"
      onClick={onClick}
      className="flex-shrink-0 w-[160px] md:w-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-3 md:p-4 hover:shadow-md hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200 cursor-pointer text-left"
    >
      <div className="flex items-center gap-2.5 mb-2 md:mb-3">
        <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 ${color}`}>{icon}</div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate">{sublabel}</div>
    </Button>
  );
}

function CategoryBar({
  label,
  value,
  budget,
  max,
  color,
}: {
  label: string;
  value: number;
  budget: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const utilizationRate = budget > 0 ? (value / budget) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-slate-700 dark:text-slate-300 truncate">{label}</div>
      <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {percentage > 0 && (
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: utilizationRate > 100 ? '#FF5630' : color,
            }}
          />
        )}
      </div>
      <div className="w-24 text-right text-sm font-medium text-slate-900 dark:text-white">
        ETB {(value / 1000000).toFixed(1)}M
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
