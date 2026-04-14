'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import {
  BarChart3,
  FileSpreadsheet,
  Search,
  Calendar,
  Download,
  PieChart,
  Loader2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { useLanguage } from '@/contexts/language-context';

interface ReportData {
  id: string;
  name: string;
  type: 'overview' | 'expenses' | 'categories' | 'variance';
  generatedAt: string;
  projectName: string;
  totalBudget: number;
  totalSpent: number;
  utilization: number;
  expenseCount: number;
  categories: Array<{
    name: string;
    allocated: number;
    spent: number;
    utilization: number;
  }>;
  pendingCount: number;
  approvedCount: number;
}

export default function BudgetReportsPage() {
  const { t } = useLanguage();
  const { status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', 'org'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', 'all-reports'],
    queryFn: async () => {
      const res = await fetch('/api/expenses?limit=500');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const isLoading = budgetsLoading || expensesLoading;
  const budgets = budgetsData?.budgets || [];
  const expenses = expensesData?.expenses || [];

  // Generate real reports from budget data
  const reports: ReportData[] = budgets.map((b: any) => {
    const cats = (b.categories || []).map((cat: any) => {
      const catSpent = cat.expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
      return {
        name: cat.name,
        allocated: Number(cat.allocatedAmount),
        spent: catSpent,
        utilization: Number(cat.allocatedAmount) > 0 ? (catSpent / Number(cat.allocatedAmount)) * 100 : 0,
      };
    });

    const budgetExpenses = expenses.filter((e: any) => e.budget?.id === b.id);

    return {
      id: b.id,
      name: `Budget Report — ${b.project?.name || 'Unknown Project'}`,
      type: 'overview' as const,
      generatedAt: new Date().toISOString(),
      projectName: b.project?.name || 'Unknown',
      totalBudget: Number(b.totalBudget || b.totalAllocated),
      totalSpent: b.totalSpent,
      utilization: b.utilization,
      expenseCount: b._count?.expenses || budgetExpenses.length,
      categories: cats,
      pendingCount: budgetExpenses.filter((e: any) => e.status === 'PENDING').length,
      approvedCount: budgetExpenses.filter((e: any) => e.status === 'APPROVED').length,
    };
  });

  const filteredReports = reports.filter((r) =>
    searchQuery === '' ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCompact = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toFixed(0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(Math.round(amount));

  // Generate CSV download
  const handleDownload = useCallback((report: ReportData) => {
    const rows = [
      ['Budget Report', report.projectName],
      ['Generated', new Date().toLocaleDateString()],
      [''],
      ['Metric', 'Value'],
      ['Total Budget', `ETB ${formatCurrency(report.totalBudget)}`],
      ['Total Spent', `ETB ${formatCurrency(report.totalSpent)}`],
      ['Remaining', `ETB ${formatCurrency(report.totalBudget - report.totalSpent)}`],
      ['Utilization', `${report.utilization.toFixed(1)}%`],
      ['Total Expenses', String(report.expenseCount)],
      ['Pending Approvals', String(report.pendingCount)],
      [''],
      ['Category', 'Allocated', 'Spent', 'Remaining', 'Utilization'],
      ...report.categories.map(c => [
        c.name,
        `ETB ${formatCurrency(c.allocated)}`,
        `ETB ${formatCurrency(c.spent)}`,
        `ETB ${formatCurrency(c.allocated - c.spent)}`,
        `${c.utilization.toFixed(1)}%`,
      ]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${report.projectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const getUtilColor = (util: number) => {
    if (util > 90) return 'text-red-600 dark:text-red-400';
    if (util > 75) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Reports"
        icon={<FileSpreadsheet className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="reports"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Reports Available</h3>
            <p className="text-sm text-slate-600 dark:text-white/50">Create budgets with expenses to generate reports.</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <span className="text-sm text-slate-500">{filteredReports.length} reports</span>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => { setSelectedReport(report); setIsSlideoutOpen(true); }}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-5 hover:shadow-lg hover:border-[#1C8C7D]/40 transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-[#1C8C7D]/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-5 w-5 text-[#1C8C7D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 truncate">{report.projectName}</h3>
                      <span className="flex items-center gap-1 text-[11px] text-[#1C8C7D] font-medium bg-[#1C8C7D]/10 px-2 py-0.5 rounded-full w-fit">
                        <Sparkles className="h-3 w-3" /> Live Report
                      </span>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-[11px] text-slate-500">Budget</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">ETB {formatCompact(report.totalBudget)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Spent</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">ETB {formatCompact(report.totalSpent)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Utilization</div>
                      <div className={`text-sm font-bold ${getUtilColor(report.utilization)}`}>{report.utilization.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Expenses</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{report.expenseCount}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-white/[0.08] rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full ${
                        report.utilization > 90 ? 'bg-red-500' :
                        report.utilization > 75 ? 'bg-amber-500' : 'bg-[#1C8C7D]'
                      }`}
                      style={{ width: `${Math.min(100, report.utilization)}%` }}
                    />
                  </div>

                  <Button
                    onClick={(e) => { e.stopPropagation(); handleDownload(report); }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#181D23] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Report Detail Slideout */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Budget Report"
      >
        <SlideoutPanelContent>
          {selectedReport && (
            <>
              <SlideoutPanelSection title="Overview">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Project</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedReport.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Total Budget</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">ETB {formatCurrency(selectedReport.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Total Spent</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">ETB {formatCurrency(selectedReport.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Remaining</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ETB {formatCurrency(selectedReport.totalBudget - selectedReport.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Utilization</span>
                    <span className={`text-sm font-bold ${getUtilColor(selectedReport.utilization)}`}>{selectedReport.utilization.toFixed(1)}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-white/[0.08] rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedReport.utilization > 90 ? 'bg-red-500' :
                        selectedReport.utilization > 75 ? 'bg-amber-500' : 'bg-[#1C8C7D]'
                      }`}
                      style={{ width: `${Math.min(100, selectedReport.utilization)}%` }}
                    />
                  </div>
                </div>
              </SlideoutPanelSection>

              <SlideoutPanelSection title="Expense Summary">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.approvedCount} approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.pendingCount} pending approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.expenseCount} total expenses</span>
                  </div>
                </div>
              </SlideoutPanelSection>

              <SlideoutPanelSection title="Category Breakdown">
                <div className="space-y-3">
                  {selectedReport.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                        <span className={`text-xs font-semibold ${getUtilColor(cat.utilization)}`}>
                          {cat.utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/[0.08] rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            cat.utilization > 90 ? 'bg-red-500' :
                            cat.utilization > 75 ? 'bg-amber-500' : 'bg-[#1C8C7D]'
                          }`}
                          style={{ width: `${Math.min(100, cat.utilization)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                        <span>ETB {formatCompact(cat.spent)} spent</span>
                        <span>ETB {formatCompact(cat.allocated)} allocated</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SlideoutPanelSection>

              <SlideoutPanelSection title="Actions">
                <Button
                  onClick={() => selectedReport && handleDownload(selectedReport)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1C8C7D] hover:bg-[#16A085] text-white"
                >
                  <Download className="h-4 w-4" />
                  Export Full Report (CSV)
                </Button>
              </SlideoutPanelSection>
            </>
          )}
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
