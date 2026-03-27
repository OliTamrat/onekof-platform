'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  X,
  Upload,
  FileText,
  Receipt,
  Camera,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface BudgetWithStats {
  id: string;
  projectId: string;
  totalBudget: number;
  currency: string;
  status: string;
  createdAt: string;
  project: { id: string; name: string; organizationId: string };
  categories: Array<{
    id: string;
    name: string;
    code: string | null;
    allocatedAmount: number;
    expenses: Array<{ amount: number }>;
  }>;
  totalSpent: number;
  totalAllocated: number;
  utilization: number;
  _count: { expenses: number; watchers: number };
  creatorName?: string | null;
  approverName?: string | null;
  approvalStatus?: string;
  approvedAt?: string | null;
}

interface ExtractedReceiptData {
  documentType?: string;
  vendor?: string;
  invoiceNumber?: string;
  date?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    total: number;
    category?: string;
  }>;
  suggestedCategory?: string;
  notes?: string;
  confidence?: number;
  // Budget document fields
  title?: string;
  totalBudget?: number;
  categories?: Array<{
    name: string;
    code?: string;
    allocated: number;
    description?: string;
  }>;
  summary?: string;
  keyFindings?: string[];
  // Expense report fields
  expenses?: Array<{
    date: string;
    description: string;
    category: string;
    vendor?: string;
    amount: number;
  }>;
  anomalies?: string[];
}

export default function BudgetPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentOrganization } = useWorkspace();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // UI state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActivitySlideoutOpen, setIsActivitySlideoutOpen] = useState(false);
  const [slideoutTitle, setSlideoutTitle] = useState('');
  const [slideoutData, setSlideoutData] = useState<any[]>([]);

  // AI upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'receipt' | 'budget_document' | 'expense_report'>('receipt');
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/budget');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setLoadingTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // Fetch all budgets for the organization
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', 'org'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // Fetch recent expenses across the org
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/expenses?limit=10');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // AI receipt analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/budgets/analyze-receipt', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setExtractedData(data.data);
    },
  });

  // Create expense from extracted data
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: {
      budgetId: string;
      categoryId?: string;
      description: string;
      amount: number;
      currency: string;
      transactionDate: string;
      vendor?: string;
      invoiceNumber?: string;
      type: string;
    }) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create expense');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsUploadModalOpen(false);
      resetUploadState();
    },
  });

  const resetUploadState = useCallback(() => {
    setUploadFile(null);
    setUploadPreview(null);
    setExtractedData(null);
    setSelectedBudgetId('');
    analyzeMutation.reset();
    createExpenseMutation.reset();
  }, [analyzeMutation, createExpenseMutation]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadFile(file);
    setExtractedData(null);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = useCallback(() => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('analysisType', analysisType);
    if (selectedBudgetId) formData.append('budgetId', selectedBudgetId);
    analyzeMutation.mutate(formData);
  }, [uploadFile, analysisType, selectedBudgetId, analyzeMutation]);

  const handleCreateExpenseFromExtraction = useCallback(() => {
    if (!extractedData || !selectedBudgetId) return;
    createExpenseMutation.mutate({
      budgetId: selectedBudgetId,
      description: extractedData.vendor
        ? `${extractedData.vendor} - ${extractedData.invoiceNumber || 'Receipt'}`
        : extractedData.lineItems?.[0]?.description || 'AI-extracted expense',
      amount: extractedData.total || extractedData.subtotal || 0,
      currency: extractedData.currency || 'ETB',
      transactionDate: extractedData.date || new Date().toISOString().split('T')[0],
      vendor: extractedData.vendor,
      invoiceNumber: extractedData.invoiceNumber,
      type: 'ACTUAL',
    });
  }, [extractedData, selectedBudgetId, createExpenseMutation]);



  // Compute aggregates — use only real API data (no demo fallback to prevent cross-org data leaks)
  const apiBudgets: BudgetWithStats[] = budgetsData?.budgets || [];
  const apiExpenses = expensesData?.expenses || [];
  const hasRealData = apiBudgets.length > 0;

  const budgets = apiBudgets;
  const expenses = apiExpenses;

  const totalBudget = budgets.reduce((sum, b) => sum + (b.totalBudget || b.totalAllocated), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.totalSpent, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.totalAllocated, 0);
  const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Category aggregation
  const categoryColors = ['#1C8C7D', '#00875A', '#FF5630', '#FFAB00', '#6554C0', '#0065FF', '#00B8D9', '#FF8B00'];
  let categories: Array<{ name: string; budget: number; spent: number; color: string }>;

  if (hasRealData) {
    const categoryMap = new Map<string, { name: string; budget: number; spent: number; color: string }>();
    budgets.forEach((b) => {
      b.categories.forEach((cat) => {
        const existing = categoryMap.get(cat.name);
        const catSpent = cat.expenses.reduce((s, e) => s + Number(e.amount), 0);
        if (existing) {
          existing.budget += Number(cat.allocatedAmount);
          existing.spent += catSpent;
        } else {
          categoryMap.set(cat.name, {
            name: cat.name,
            budget: Number(cat.allocatedAmount),
            spent: catSpent,
            color: categoryColors[categoryMap.size % categoryColors.length],
          });
        }
      });
    });
    categories = Array.from(categoryMap.values());
  } else {
    categories = [];
  }

  const maxCategorySpent = Math.max(...categories.map(c => c.spent), 1);

  const approvedExpenses = expenses.filter((e: any) => e.status === 'APPROVED');
  const pendingExpenses = expenses.filter((e: any) => e.status === 'PENDING');
  const categoriesAtRisk = categories.filter(c => c.budget > 0 && (c.spent / c.budget) > 0.8).length;

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toFixed(0);
  };

  // Slideout handlers
  const openSlideout = (title: string, data: any[]) => {
    setSlideoutTitle(title);
    setSlideoutData(data);
    setIsActivitySlideoutOpen(true);
  };

  if (status === 'loading' && !loadingTimeout) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (status === 'loading' && loadingTimeout) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="text-center max-w-md p-3 md:p-6">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('budget.sessionLoadingIssue')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {t('budget.sessionTakingLong')}
            </p>
            <Button onClick={() => router.push('/auth/signin')}>{t('budget.goToSignIn')}</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!session) return null;

  const isLoading = budgetsLoading || expensesLoading;
  const hasBudgets = budgets.length > 0;

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('budget.title')}
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="summary"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
        showSearch
      />

      {/* Project Header Banner — only show when real budget data exists */}
      {hasBudgets && budgets[0]?.project && (
        <div className="relative bg-gradient-to-r from-[#1C8C7D] via-[#18947F] to-[#16A085] px-4 md:px-6 py-3 md:py-4 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base md:text-lg font-bold text-white truncate">{budgets[0].project.name}</h2>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {budgets.length > 1 && (
                  <span className="text-xs md:text-sm text-white/80 line-clamp-1">and {budgets.length - 1} other {budgets.length - 1 === 1 ? 'budget' : 'budgets'}</span>
                )}
                {budgets[0].creatorName && (
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <User className="h-3 w-3" />
                    {t('budget.owner')}: <span className="font-medium text-white/90">{budgets[0].creatorName}</span>
                  </span>
                )}
                {budgets[0].status && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    budgets[0].status === 'APPROVED' || budgets[0].status === 'ACTIVE' ? 'bg-white/20 text-white' :
                    budgets[0].status === 'DRAFT' ? 'bg-yellow-400/20 text-yellow-100' :
                    budgets[0].status === 'PENDING_APPROVAL' ? 'bg-orange-400/20 text-orange-100' :
                    'bg-white/10 text-white/80'
                  }`}>
                    {budgets[0].status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">{overallUtilization.toFixed(1)}%</div>
              <div className="text-[11px] md:text-xs text-white/70">{t('budget.utilized')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards — scrollable row on mobile, grid on desktop */}
      <div className="bg-white dark:bg-[#1B1F23] border-b border-slate-200 dark:border-slate-700 lg:sticky lg:top-0 lg:z-10 lg:shadow-sm">
        <div className="p-3 md:p-6">
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 scrollbar-hide">
            <StatCard
              icon={<DollarSign className="h-4 w-4 md:h-5 md:w-5" />}
              value={isLoading ? '...' : `ETB ${formatCompact(totalSpent)}`}
              label={t('budget.spent').toLowerCase()}
              sublabel={t('budget.allocatedOf').replace('{amount}', formatCompact(totalBudget))}
              iconBg="bg-blue-50 dark:bg-blue-900/20"
              color="text-blue-600 dark:text-blue-400"
              onClick={() => openSlideout(t('budget.allProjectExpenses'), expenses)}
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />}
              value={isLoading ? '...' : approvedExpenses.length.toString()}
              label={t('budget.approved').toLowerCase()}
              sublabel={t('budget.clearedByFinance')}
              iconBg="bg-emerald-50 dark:bg-emerald-900/20"
              color="text-emerald-600 dark:text-emerald-400"
              onClick={() => openSlideout(t('budget.approvedExpenses'), approvedExpenses)}
            />
            <StatCard
              icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}
              value={isLoading ? '...' : pendingExpenses.length.toString()}
              label={t('budget.pending').toLowerCase()}
              sublabel={t('budget.awaitingApproval')}
              iconBg="bg-amber-50 dark:bg-amber-900/20"
              color="text-amber-600 dark:text-amber-400"
              onClick={() => openSlideout(t('budget.pendingApproval'), pendingExpenses)}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
              value={isLoading ? '...' : `ETB ${formatCompact(totalBudget - totalSpent)}`}
              label={t('budget.remaining').toLowerCase()}
              sublabel={t('budget.atRiskPercent').replace('{count}', categoriesAtRisk.toString())}
              iconBg="bg-primary-50 dark:bg-primary-900/20"
              color="text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* AI Document Upload Banner */}
        <div className="relative rounded-xl bg-gradient-to-br from-[#1C8C7D]/8 to-[#16A085]/5 dark:from-[#1C8C7D]/15 dark:to-[#16A085]/10 border border-[#1C8C7D]/15 dark:border-[#1C8C7D]/20 p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#16A085] items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="sm:hidden flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                  {t('budget.aiDocumentAnalysis')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                {t('budget.uploadDescription')}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => { setAnalysisType('receipt'); setIsUploadModalOpen(true); }}
                className="gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('common.upload')}</span>
                <span className="sm:hidden">{t('common.upload')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Budget Overview - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Budget Overview Card */}
            <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-5 md:p-6 shadow-md border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('budget.budgetOverview')}</h3>
                {hasBudgets && (
                  <span className="text-sm font-medium text-[#1C8C7D] bg-[#1C8C7D]/10 px-2.5 py-1 rounded-lg">
                    {overallUtilization.toFixed(1)}% {t('budget.utilized')}
                  </span>
                )}
              </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
                  </div>
                ) : !hasBudgets ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('budget.noBudgetsYet')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {t('budget.noBudgetsYetDesc')}
                    </p>
                    <Button
                      onClick={() => { setAnalysisType('budget_document'); setIsUploadModalOpen(true); }}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {t('budget.uploadBudgetDocument')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Donut Chart + Legend */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8">
                      <div className="relative h-36 w-36 sm:h-48 sm:w-48 flex-shrink-0">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="15" />
                          {categories.map((category, index) => {
                            const previousTotal = categories.slice(0, index).reduce((sum, c) => sum + c.budget, 0);
                            const percentage = totalAllocated > 0 ? (category.budget / totalAllocated) * 100 : 0;
                            const dashArray = (percentage / 100) * 220;
                            const dashOffset = totalAllocated > 0 ? -((previousTotal / totalAllocated) * 220) : 0;
                            return (
                              <circle
                                key={category.name}
                                cx="50" cy="50" r="35" fill="none"
                                stroke={category.color} strokeWidth="15"
                                strokeDasharray={`${dashArray} 220`}
                                strokeDashoffset={dashOffset}
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {overallUtilization.toFixed(0)}%
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{t('budget.utilized')}</div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        {categories.slice(0, 6).map((category) => {
                          const utilRate = category.budget > 0 ? ((category.spent / category.budget) * 100).toFixed(1) : '0.0';
                          return (
                            <div
                              key={category.name}
                              role="button"
                              tabIndex={0}
                              onClick={() => openSlideout(
                                `${category.name} Expenses`,
                                expenses.filter((e: any) => e.category?.name === category.name)
                              )}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openSlideout(`${category.name} Expenses`, expenses.filter((ex: any) => ex.category?.name === category.name)); }}
                              className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{utilRate}%</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  ETB {formatCompact(category.spent)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Bars */}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t('budget.categorySpending')}</h3>
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

                    {/* AI Analysis Section — Project-Specific */}
                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">{t('budget.aiProjectBudgetAnalysis')}</h3>
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#1C8C7D]/10 text-[#1C8C7D] border border-[#1C8C7D]/20">
                          {t('budget.aiGenerated')}
                        </span>
                      </div>

                      {/* Executive Summary */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('budget.executiveSummary')}</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {budgets.length === 1 ? (
                                <>The <span className="font-semibold">{budgets[0]?.project?.name || 'project'}</span> has</>
                              ) : (
                                <>Your organization&apos;s {budgets.length} budgets have</>
                              )} utilized{' '}
                              <span className="font-semibold text-[#1C8C7D]">ETB {formatCompact(totalSpent)} ({overallUtilization.toFixed(1)}%)</span> of the{' '}
                              <span className="font-semibold">ETB {formatCompact(totalBudget)}</span> total allocation.
                              {categoriesAtRisk > 0 && (
                                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                  {' '}{categoriesAtRisk} budget {categoriesAtRisk === 1 ? 'category has' : 'categories have'} exceeded 80% utilization and require review.
                                </span>
                              )}
                              {totalSpent > 0 && (
                                <>
                                  {' '}Remaining budget:{' '}
                                  <span className="font-semibold">ETB {formatCompact(totalBudget - totalSpent)}</span>.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights Grid — data-driven from real budget data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{t('budget.budgetUtilization')}</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                              {overallUtilization <= 85 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              )}
                              <span>
                                Overall utilization at{' '}
                                <span className={`font-medium ${overallUtilization <= 85 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                  {overallUtilization.toFixed(1)}%
                                </span>
                                {' '}— ETB {formatCompact(totalSpent)} of ETB {formatCompact(totalBudget)} spent
                              </span>
                            </li>
                            {categories.filter(c => c.budget > 0 && (c.spent / c.budget) > 0.8).slice(0, 2).map(c => (
                              <li key={c.name} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span>
                                  {c.name} at <span className="font-medium text-orange-600 dark:text-orange-400">{((c.spent / c.budget) * 100).toFixed(1)}%</span> — may need reallocation
                                </span>
                              </li>
                            ))}
                            {categories.filter(c => c.budget > 0 && (c.spent / c.budget) <= 0.5).length > 0 && (
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{categories.filter(c => c.budget > 0 && (c.spent / c.budget) <= 0.5).length} {categories.filter(c => c.budget > 0 && (c.spent / c.budget) <= 0.5).length === 1 ? 'category' : 'categories'} under 50% — on track</span>
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <DollarSign className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{t('budget.categoryAllocation')}</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            {categories.slice(0, 3).map(c => (
                              <li key={c.name} className="flex items-start gap-2">
                                {c.budget > 0 && (c.spent / c.budget) > 0.9 ? (
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                )}
                                <span><span className="font-medium">{c.name}:</span> ETB {formatCompact(c.budget)} allocated, {formatCompact(c.spent)} spent</span>
                              </li>
                            ))}
                            {categories.length > 3 && (
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>+{categories.length - 3} more {categories.length - 3 === 1 ? 'category' : 'categories'}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      <div className="p-4 rounded-lg border border-[#1C8C7D]/20 bg-gradient-to-br from-[#1C8C7D]/5 to-[#16A085]/5 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-6 w-6 rounded-md bg-[#1C8C7D] flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                          </div>
                          <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{t('budget.aiRecommendations')}</h5>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          {categoriesAtRisk > 0 && (
                            <li className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span><span className="font-medium">{t('budget.reallocationNeeded')}:</span> {categories.filter(c => c.budget > 0 && (c.spent / c.budget) > 0.8).map(c => c.name).join(', ')} — consider reallocating funds from under-utilized categories.</span>
                            </li>
                          )}
                          {pendingExpenses.length > 0 && (
                            <li className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span><span className="font-medium">{t('budget.pendingApprovals')}:</span> {pendingExpenses.length} expense{pendingExpenses.length === 1 ? '' : 's'} (ETB {formatCompact(pendingExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0))}) awaiting approval.</span>
                            </li>
                          )}
                          {overallUtilization < 50 && totalBudget > 0 && (
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span><span className="font-medium">{t('budget.budgetHealth')}:</span> Utilization is at {overallUtilization.toFixed(1)}%. Budget allocation is within healthy limits.</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Report Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                        <span>{t('budget.analysisGeneratedOn').replace('{date}', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}</span>
                        <span>{t('budget.budgetAnalysis')}</span>
                      </div>
                    </div>
                  </>
                )}
            </div>

            {/* Project Timeline vs Budget — will render when real phase data is available from API */}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-5 shadow-md border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#1C8C7D]/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
                </div>
                {t('budget.quickActions')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t('budget.receipt'), icon: Camera, type: 'receipt' as const, bg: 'bg-primary-50 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
                  { label: t('budget.invoice'), icon: Receipt, type: 'receipt' as const, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
                  { label: t('budget.budgetDoc'), icon: FileText, type: 'budget_document' as const, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
                  { label: t('budget.expenseReport'), icon: Download, type: 'expense_report' as const, bg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
                ].map((action) => (
                  <div
                    key={action.label}
                    role="button"
                    tabIndex={0}
                    onClick={() => { setAnalysisType(action.type); setIsUploadModalOpen(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setAnalysisType(action.type); setIsUploadModalOpen(true); } }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#1C8C7D]/40 hover:shadow-sm transition-all group cursor-pointer"
                  >
                    <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-left leading-tight">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-5 shadow-md border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('budget.recentActivity')}</h3>
                <span className="flex items-center gap-1 text-[11px] text-[#1C8C7D] font-medium bg-[#1C8C7D]/10 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1C8C7D] animate-pulse" />
                  {t('budget.live')}
                </span>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1C8C7D]" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">{t('budget.noRecentExpenses')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.slice(0, 5).map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        expense.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        expense.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/20' :
                        'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <DollarSign className={`h-4 w-4 ${
                          expense.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                          expense.status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate leading-tight">
                          {expense.vendor || expense.description?.split(' — ')[0]}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {expense.category?.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCompact(Number(expense.amount))}
                        </p>
                        <p className={`text-[11px] font-medium ${
                          expense.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                          'text-amber-600 dark:text-amber-400'
                        }`}>{expense.status === 'APPROVED' ? t('budget.approved') : t('budget.pending')}</p>
                      </div>
                    </div>
                  ))}
                  {expenses.length > 5 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openSlideout(t('budget.allExpenses'), expenses)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openSlideout(t('budget.allExpenses'), expenses); }}
                      className="w-full text-center text-xs font-medium text-[#1C8C7D] hover:text-[#16A085] py-2 mt-1 rounded-lg hover:bg-[#1C8C7D]/5 transition-colors cursor-pointer"
                    >
                      {t('budget.viewAllExpenses').replace('{count}', expenses.length.toString())}
                    </div>
                    )}
                  </div>
                )}
            </div>

            {/* Project Financial Summary */}
            {hasBudgets && (
              <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-5 shadow-md border border-slate-200/60 dark:border-slate-700/60">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[#1C8C7D]/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-[#1C8C7D]" />
                  </div>
                  {t('budget.financialSummary')}
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const expenseCount = budgets.reduce((sum, b) => sum + (b._count?.expenses || 0), 0);
                    const oldestBudget = budgets.length > 0 ? new Date(Math.min(...budgets.map(b => new Date(b.createdAt).getTime()))) : new Date();
                    const monthsElapsed = Math.max(1, (Date.now() - oldestBudget.getTime()) / (1000 * 60 * 60 * 24 * 30));
                    const monthlyBurn = totalSpent / monthsElapsed;
                    const monthsRemaining = monthlyBurn > 0 ? Math.ceil((totalBudget - totalSpent) / monthlyBurn) : 0;
                    const projectedEnd = new Date();
                    projectedEnd.setMonth(projectedEnd.getMonth() + monthsRemaining);
                    const projectedLabel = monthlyBurn > 0
                      ? projectedEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A';

                    return [
                      { label: t('budget.remainingFunds'), value: `ETB ${formatCompact(totalBudget - totalSpent)}`, icon: DollarSign, bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                      { label: t('budget.monthlyBurnRate'), value: `ETB ${formatCompact(monthlyBurn)}`, icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
                      { label: t('budget.estMonthsRemaining'), value: monthlyBurn > 0 ? `~${monthsRemaining} months` : t('budget.noData'), icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
                      { label: t('budget.projectedCompletion'), value: projectedLabel, icon: CheckCircle2, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
                      { label: t('budget.totalExpenses'), value: expenseCount.toString(), icon: Receipt, bg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
                    ];
                  })().map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Upload Modal */}
      {isUploadModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setIsUploadModalOpen(false); resetUploadState(); }} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] z-50 bg-white dark:bg-[#22272B] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-white" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {analysisType === 'receipt' && t('budget.analyzeReceiptInvoice')}
                    {analysisType === 'budget_document' && t('budget.analyzeBudgetDocument')}
                    {analysisType === 'expense_report' && t('budget.analyzeExpenseReport')}
                  </h2>
                  <p className="text-sm text-white/80">{t('budget.aiExtractDesc')}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => { setIsUploadModalOpen(false); resetUploadState(); }} className="p-2 text-white hover:bg-white/20 rounded-md">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!extractedData ? (
                <>
                  {/* Analysis Type Selector */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('budget.documentType')}</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'receipt', label: t('budget.receiptInvoice'), icon: Receipt },
                        { value: 'budget_document', label: t('budget.budgetDoc'), icon: FileText },
                        { value: 'expense_report', label: t('budget.expenseReport'), icon: Download },
                      ].map((type) => (
                        <Button
                          key={type.value}
                          onClick={() => setAnalysisType(type.value as any)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            analysisType === type.value
                              ? 'bg-[#1C8C7D] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Selector */}
                  {hasBudgets && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        {t('budget.linkToBudgetOptional')}
                      </label>
                      <select
                        value={selectedBudgetId}
                        onChange={(e) => setSelectedBudgetId(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] text-sm"
                      >
                        <option value="">{t('budget.selectBudget')}</option>
                        {budgets.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.project.name} - ETB {formatCompact(Number(b.totalBudget))}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      uploadFile
                        ? 'border-[#1C8C7D] bg-[#1C8C7D]/5'
                        : 'border-slate-300 dark:border-slate-600 hover:border-[#1C8C7D]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    {uploadFile ? (
                      <div className="space-y-3">
                        {uploadPreview && (
                          <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-[#1C8C7D]" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{uploadFile.name}</span>
                          <span className="text-xs text-slate-500">({(uploadFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <p className="text-xs text-slate-500">{t('budget.clickToChangeFile')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-10 w-10 mx-auto text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {t('budget.dropFileOrBrowse')}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {t('budget.fileFormatsExtended')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analyze Button */}
                  {uploadFile && (
                    <div className="mt-4">
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzeMutation.isPending}
                        className="w-full gap-2"
                      >
                        {analyzeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('budget.analyzingWithAI')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            {t('budget.analyzeDocument')}
                          </>
                        )}
                      </Button>
                      {analyzeMutation.isError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {analyzeMutation.error.message}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Extraction Results */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      {t('budget.dataExtractedSuccessfully')}
                      {extractedData.confidence && ` (${extractedData.confidence}% confidence)`}
                    </span>
                  </div>

                  {/* Extracted Summary */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                    {extractedData.vendor && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('budget.vendor')}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{extractedData.vendor}</span>
                      </div>
                    )}
                    {extractedData.invoiceNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('budget.invoiceNumber')}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{extractedData.invoiceNumber}</span>
                      </div>
                    )}
                    {extractedData.date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('common.date')}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{extractedData.date}</span>
                      </div>
                    )}
                    {(extractedData.total || extractedData.totalBudget) && (
                      <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                        <span className="text-slate-500 font-medium">{t('common.total')}</span>
                        <span className="text-lg font-bold text-[#1C8C7D]">
                          {extractedData.currency || 'ETB'} {formatCurrency(extractedData.total || extractedData.totalBudget || 0)}
                        </span>
                      </div>
                    )}
                    {extractedData.suggestedCategory && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Suggested Category</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#1C8C7D]/10 text-[#1C8C7D] text-xs font-medium">
                          {extractedData.suggestedCategory}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  {extractedData.lineItems && extractedData.lineItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Line Items ({extractedData.lineItems.length})
                      </h4>
                      <div className="space-y-2">
                        {extractedData.lineItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-white">{item.description}</p>
                              {item.category && <p className="text-xs text-slate-500">{item.category}</p>}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white ml-4">
                              {extractedData.currency || 'ETB'} {formatCurrency(item.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expense Report Items */}
                  {extractedData.expenses && extractedData.expenses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Expenses ({extractedData.expenses.length})
                      </h4>
                      <div className="space-y-2">
                        {extractedData.expenses.map((exp, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-white">{exp.description}</p>
                              <p className="text-xs text-slate-500">{exp.date} • {exp.category}</p>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white ml-4">
                              {extractedData.currency || 'ETB'} {formatCurrency(exp.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Categories */}
                  {extractedData.categories && extractedData.categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Budget Categories ({extractedData.categories.length})
                      </h4>
                      <div className="space-y-2">
                        {extractedData.categories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-white">{cat.name}</p>
                              {cat.code && <p className="text-xs text-slate-500">Code: {cat.code}</p>}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white ml-4">
                              {extractedData.currency || 'ETB'} {formatCurrency(cat.allocated)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Notes */}
                  {(extractedData.notes || extractedData.summary) && (
                    <div className="p-3 rounded-lg bg-[#1C8C7D]/5 border border-[#1C8C7D]/20">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-[#1C8C7D] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {extractedData.notes || extractedData.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Key Findings */}
                  {extractedData.keyFindings && extractedData.keyFindings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Key Findings</h4>
                      {extractedData.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{finding}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Anomalies */}
                  {extractedData.anomalies && extractedData.anomalies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Anomalies Detected</h4>
                      {extractedData.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{anomaly}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {extractedData && (
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4 bg-slate-50 dark:bg-[#1B1F23] flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={resetUploadState}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('budget.newUpload')}
                </Button>
                {selectedBudgetId && extractedData.total && (
                  <Button
                    onClick={handleCreateExpenseFromExtraction}
                    disabled={createExpenseMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    {createExpenseMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t('common.creating')}</>
                    ) : (
                      <><Plus className="h-4 w-4" /> {t('budget.createExpense')}</>
                    )}
                  </Button>
                )}
                {createExpenseMutation.isError && (
                  <p className="text-sm text-red-600">{createExpenseMutation.error.message}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Activity Slideout */}
      {isActivitySlideoutOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsActivitySlideoutOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white dark:bg-[#1B1F23] shadow-2xl overflow-hidden flex flex-col animate-slide-in-right">
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{slideoutTitle}</h2>
                  <p className="text-sm text-white/80 mt-1">{slideoutData.length} {t('common.items')}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsActivitySlideoutOpen(false)} className="rounded-md p-2 text-white hover:bg-white/20">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {slideoutData.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">{t('common.noResults')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slideoutData.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#1C8C7D] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.description}</span>
                            {item.status && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                item.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                item.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {item.budget?.project?.name && <span>{item.budget.project.name}</span>}
                            {item.category?.name && <span>• {item.category.name}</span>}
                            {item.transactionDate && (
                              <span>• {new Date(item.transactionDate).toLocaleDateString()}</span>
                            )}
                            {item.vendor && <span>• {item.vendor}</span>}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            ETB {formatCurrency(Number(item.amount))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-in-right {
              from { opacity: 0; transform: translateX(100%); }
              to { opacity: 1; transform: translateX(0); }
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

function StatCard({
  icon, value, label, sublabel, iconBg, color, onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
  iconBg: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className="flex-shrink-0 w-[160px] md:w-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3 md:p-4 hover:shadow-md hover:border-[#1C8C7D] transition-all text-left cursor-pointer"
    >
      <div className="flex items-center gap-2.5 mb-2 md:mb-3">
        <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <div className={color}>{icon}</div>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate">{sublabel}</div>
    </div>
  );
}

function CategoryBar({ label, value, budget, max, color }: {
  label: string; value: number; budget: number; max: number; color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const utilization = budget > 0 ? (value / budget) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300 truncate mr-2">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium ${utilization > 90 ? 'text-red-600 dark:text-red-400' : utilization > 75 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {utilization.toFixed(0)}%
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            ETB {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`}
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {percentage > 0 && (
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: utilization > 100 ? '#FF5630' : color }}
          />
        )}
      </div>
    </div>
  );
}
