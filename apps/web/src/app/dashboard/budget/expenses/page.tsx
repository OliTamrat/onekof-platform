'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Search,
  Calendar,
  Tag,
  User,
  Receipt,
  Loader2,
  Upload,
  Sparkles,
  X,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Filter,
  RotateCcw,
  Plus,
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  transactionDate: string;
  vendor?: string;
  invoiceNumber?: string;
  notes?: string;
  submittedBy?: string;
  budget?: { id: string; project?: { name: string } };
  category?: { id: string; name: string; code?: string };
  attachments?: Array<{ id: string; fileName: string; fileUrl: string }>;
}

export default function BudgetExpensesPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  // AI Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch expenses
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/expenses?limit=100');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // Fetch budgets for linking
  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', 'org'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // AI analysis
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/budgets/analyze-receipt', { method: 'POST', body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Analysis failed'); }
      return res.json();
    },
    onSuccess: (data) => setExtractedData(data.data),
  });

  // Create expense
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: any) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsUploadModalOpen(false);
      resetUpload();
    },
  });

  const resetUpload = useCallback(() => {
    setUploadFile(null);
    setUploadPreview(null);
    setExtractedData(null);
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

  const handleAnalyze = useCallback(() => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('analysisType', 'receipt');
    if (selectedBudgetId) formData.append('budgetId', selectedBudgetId);
    analyzeMutation.mutate(formData);
  }, [uploadFile, selectedBudgetId, analyzeMutation]);

  const handleCreateExpense = useCallback(() => {
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

  // Demo expenses — ALL tied to Jira Water Dam & Irrigation Project (250M ETB)
  const P = 'Jira Water Dam & Irrigation Project';
  const DEMO_EXPENSES: Expense[] = [
    { id: 'de-1', description: 'RCC dam body concrete — Batch 14 (4,200 m³)', amount: 8400000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-15', vendor: 'Ethio-Cement PLC', invoiceNumber: 'EC-2026-0847', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c1', name: 'Dam Construction & Civil Works' } },
    { id: 'de-2', description: 'CAT 390F Excavator & CAT D8T Dozer rental (Q1)', amount: 4200000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-13', vendor: 'Mesfin Industrial Engineering', invoiceNumber: 'MIE-4521', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c3', name: 'Heavy Equipment & Machinery' } },
    { id: 'de-3', description: 'Spillway gate fabrication — steel plates & hinges', amount: 6800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-11', vendor: 'Zuquala Steel', invoiceNumber: 'ZS-2026-0389', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c1', name: 'Dam Construction & Civil Works' } },
    { id: 'de-4', description: 'Community resettlement — Woreda 7 (42 households)', amount: 3200000, currency: 'ETB', status: 'PENDING', type: 'ACTUAL', transactionDate: '2026-03-10', vendor: 'Amhara Regional Authority', invoiceNumber: 'ARA-RST-0312', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c7', name: 'Land Acquisition & Resettlement' } },
    { id: 'de-5', description: 'Engineering team salaries — February 2026 (68 staff)', amount: 5400000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-05', vendor: 'Internal Payroll', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c4', name: 'Engineering & Labor' } },
    { id: 'de-6', description: 'Environmental monitoring — downstream water quality Q1', amount: 1800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-04', vendor: 'Green Impact Consulting', invoiceNumber: 'GIC-0312', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c5', name: 'Environmental & Social Safeguards' } },
    { id: 'de-7', description: 'SolarTech irrigation pump station — Phase 3 solar array', amount: 5500000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-03', vendor: 'SolarTech Ethiopia', invoiceNumber: 'STE-1102', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c2', name: 'Irrigation Canal & Distribution' } },
    { id: 'de-8', description: 'Construction workers wages — Week 36 (320 laborers)', amount: 2800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-03-01', vendor: 'Internal Payroll', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c4', name: 'Engineering & Labor' } },
    { id: 'de-9', description: 'SMEC International — dam safety review & design audit', amount: 4500000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-28', vendor: 'SMEC International', invoiceNumber: 'SMEC-ETH-0156', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c6', name: 'Consulting & Project Management' } },
    { id: 'de-10', description: 'GIS topographic survey — irrigation canal alignment', amount: 2100000, currency: 'ETB', status: 'PENDING', type: 'ACTUAL', transactionDate: '2026-02-26', vendor: 'Esri East Africa', invoiceNumber: 'ESRI-EA-7744', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c2', name: 'Irrigation Canal & Distribution' } },
    { id: 'de-11', description: 'Reinforcement steel bars — 85 tons (dam abutment)', amount: 7200000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-24', vendor: 'Habesha Steel', invoiceNumber: 'HS-2026-0456', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c1', name: 'Dam Construction & Civil Works' } },
    { id: 'de-12', description: 'Downstream community livelihood restoration program', amount: 2400000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-22', vendor: 'World Bank Social Team', invoiceNumber: 'WB-SOC-0089', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c5', name: 'Environmental & Social Safeguards' } },
    { id: 'de-13', description: 'Pump station concrete works & pipe laying (2.4 km)', amount: 4800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-20', vendor: 'METEC', invoiceNumber: 'METEC-2026-0078', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c2', name: 'Irrigation Canal & Distribution' } },
    { id: 'de-14', description: 'Land compensation — 180 hectares agricultural land', amount: 5400000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-18', vendor: 'Amhara Land Administration', invoiceNumber: 'ALA-COMP-0034', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c7', name: 'Land Acquisition & Resettlement' } },
    { id: 'de-15', description: 'Crane rental — Liebherr LTM 1300 (dam crest work)', amount: 3800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-15', vendor: 'Sur Construction', invoiceNumber: 'SUR-CR-229', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c3', name: 'Heavy Equipment & Machinery' } },
    { id: 'de-16', description: 'Hydrological monitoring station equipment', amount: 1950000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-12', vendor: 'Hach Company', invoiceNumber: 'HACH-ETH-330', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c3', name: 'Heavy Equipment & Machinery' } },
    { id: 'de-17', description: 'EIA compliance audit — Q1 2026 (World Bank requirement)', amount: 2200000, currency: 'ETB', status: 'PENDING', type: 'ACTUAL', transactionDate: '2026-02-10', vendor: 'ERM Consulting', invoiceNumber: 'ERM-ETH-0023', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c5', name: 'Environmental & Social Safeguards' } },
    { id: 'de-18', description: 'Project management office — February operational costs', amount: 1800000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-08', vendor: 'Ministry of Water & Irrigation', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c6', name: 'Consulting & Project Management' } },
    { id: 'de-19', description: 'Geotechnical testing — dam foundation core samples', amount: 1400000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-05', vendor: 'Ethiopian Geological Survey', invoiceNumber: 'EGS-2026-0012', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c1', name: 'Dam Construction & Civil Works' } },
    { id: 'de-20', description: 'Contingency draw — unexpected rock formation removal', amount: 3500000, currency: 'ETB', status: 'APPROVED', type: 'ACTUAL', transactionDate: '2026-02-01', vendor: 'Sur Construction', invoiceNumber: 'SUR-CTG-001', budget: { id: 'jira-dam-budget', project: { name: P } }, category: { id: 'c8', name: 'Contingency & Risk Reserve' } },
  ];

  const apiExpenses: Expense[] = expensesData?.expenses || [];
  const apiBudgets = budgetsData?.budgets || [];
  const hasRealExpenses = apiExpenses.length > 0;

  const expenses = hasRealExpenses ? apiExpenses : DEMO_EXPENSES;
  const budgets = hasRealExpenses ? apiBudgets : [
    { id: 'jira-dam-budget', project: { name: 'Jira Water Dam & Irrigation Project' } },
  ];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = searchQuery === '' ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (expense.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const approvedCount = filteredExpenses.filter(e => e.status === 'APPROVED').length;
  const pendingCount = filteredExpenses.filter(e => e.status === 'PENDING').length;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(amount);
  const formatCompact = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toFixed(0);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PAID': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Expenses"
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="expenses"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-4 md:p-6">
        {/* Stats Cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 md:grid md:grid-cols-4 md:gap-4 mb-6 scrollbar-hide">
          <div className="flex-shrink-0 w-[160px] md:w-auto rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 p-3 md:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : `ETB ${formatCompact(totalExpenses)}`}
            </div>
          </div>
          <div className="flex-shrink-0 w-[140px] md:w-auto rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 p-3 md:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Approved</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : approvedCount}
            </div>
          </div>
          <div className="flex-shrink-0 w-[140px] md:w-auto rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 p-3 md:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Pending</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : pendingCount}
            </div>
          </div>
          <div className="flex-shrink-0 w-[160px] md:w-auto rounded-xl bg-gradient-to-br from-[#1C8C7D]/5 to-[#16A085]/5 dark:from-[#1C8C7D]/10 dark:to-[#16A085]/10 border border-[#1C8C7D]/20 p-3 md:p-4 flex items-center justify-center">
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              AI Upload
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses by description, vendor, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'PENDING', 'APPROVED', 'REJECTED', 'PAID'].map((s) => (
                  <Button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === s
                        ? 'bg-[#1C8C7D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Expenses Found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Upload a receipt or create an expense to get started.'}
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Receipt
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                className="hover:shadow-lg hover:border-[#1C8C7D] transition-all cursor-pointer"
              >
                <CardContent className="p-4" onClick={() => { setSelectedExpense(expense); setIsSlideoutOpen(true); }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Receipt className="h-5 w-5 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{expense.description}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        {expense.category?.name && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {expense.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(expense.transactionDate).toLocaleDateString()}
                        </span>
                        {expense.vendor && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {expense.vendor}
                          </span>
                        )}
                        {expense.budget?.project?.name && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {expense.budget.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {expense.currency || 'ETB'} {formatCurrency(Number(expense.amount))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Expense Detail Slideout */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Expense Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Expense Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense?.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedExpense?.currency || 'ETB'} {formatCurrency(Number(selectedExpense?.amount || 0))}
                </p>
              </div>
              {selectedExpense?.category?.name && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense.category.name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {selectedExpense?.transactionDate ? new Date(selectedExpense.transactionDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExpense?.status || '')}`}>
                    {selectedExpense?.status}
                  </span>
                </p>
              </div>
              {selectedExpense?.vendor && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vendor</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense.vendor}</p>
                </div>
              )}
              {selectedExpense?.invoiceNumber && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Invoice #</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense.invoiceNumber}</p>
                </div>
              )}
              {selectedExpense?.budget?.project?.name && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense.budget.project.name}</p>
                </div>
              )}
              {selectedExpense?.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>

      {/* AI Upload Modal */}
      {isUploadModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setIsUploadModalOpen(false); resetUpload(); }} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh] z-50 bg-white dark:bg-[#22272B] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white" />
                <h2 className="text-lg font-semibold text-white">AI Receipt Analysis</h2>
              </div>
              <Button variant="ghost" onClick={() => { setIsUploadModalOpen(false); resetUpload(); }} className="p-2 text-white hover:bg-white/20 rounded-md">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!extractedData ? (
                <>
                  {budgets.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Link to Budget</label>
                      <select
                        value={selectedBudgetId}
                        onChange={(e) => setSelectedBudgetId(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] text-sm"
                      >
                        <option value="">Select a budget...</option>
                        {budgets.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.project.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      uploadFile ? 'border-[#1C8C7D] bg-[#1C8C7D]/5' : 'border-slate-300 dark:border-slate-600 hover:border-[#1C8C7D]'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.csv" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    {uploadFile ? (
                      <div className="space-y-3">
                        {uploadPreview && <img src={uploadPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />}
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-[#1C8C7D]" />
                          <span className="text-sm font-medium">{uploadFile.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-10 w-10 mx-auto text-slate-400" />
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Drop receipt here or click to browse</p>
                        <p className="text-xs text-slate-500">PDF, images, Word docs — max 10MB</p>
                      </div>
                    )}
                  </div>

                  {uploadFile && (
                    <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="w-full mt-4 gap-2">
                      {analyzeMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
                    </Button>
                  )}
                  {analyzeMutation.isError && <p className="mt-2 text-sm text-red-600">{analyzeMutation.error.message}</p>}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Extracted ({extractedData.confidence}% confidence)
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                    {extractedData.vendor && <div className="flex justify-between text-sm"><span className="text-slate-500">Vendor</span><span className="font-medium">{extractedData.vendor}</span></div>}
                    {extractedData.date && <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="font-medium">{extractedData.date}</span></div>}
                    {extractedData.invoiceNumber && <div className="flex justify-between text-sm"><span className="text-slate-500">Invoice #</span><span className="font-medium">{extractedData.invoiceNumber}</span></div>}
                    {extractedData.total && (
                      <div className="flex justify-between text-sm border-t pt-2 mt-2">
                        <span className="font-medium text-slate-500">Total</span>
                        <span className="text-lg font-bold text-[#1C8C7D]">{extractedData.currency || 'ETB'} {formatCurrency(extractedData.total)}</span>
                      </div>
                    )}
                  </div>

                  {extractedData.lineItems?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Line Items</h4>
                      {extractedData.lineItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-sm">
                          <span>{item.description}</span>
                          <span className="font-medium">{extractedData.currency || 'ETB'} {formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {extractedData && (
              <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
                <Button variant="outline" onClick={resetUpload} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> New Upload
                </Button>
                {selectedBudgetId && extractedData.total && (
                  <Button onClick={handleCreateExpense} disabled={createExpenseMutation.isPending} className="flex-1 gap-2">
                    {createExpenseMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4" /> Create Expense</>}
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
