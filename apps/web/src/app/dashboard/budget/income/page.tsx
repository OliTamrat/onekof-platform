'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import {
  DollarSign,
  Search,
  Calendar,
  Tag,
  TrendingUp,
  Loader2,
  Landmark,
  Globe,
  Building2,
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { useLanguage } from '@/contexts/language-context';

interface FundingSource {
  id: string;
  source: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  date?: string;
  projectName: string;
  budgetId: string;
  totalBudget: number;
  amountInETB: number;
}

export default function BudgetIncomePage() {
  const { t } = useLanguage();
  const { status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets', 'org'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const budgets = budgetsData?.budgets || [];

  // Extract funding sources from all budgets
  const fundingSources: FundingSource[] = [];
  budgets.forEach((b: any) => {
    // Primary budget allocation as a funding source
    fundingSources.push({
      id: `${b.id}-primary`,
      source: 'Primary Budget Allocation',
      amount: Number(b.totalBudget),
      currency: b.currency || 'ETB',
      projectName: b.project?.name || 'Unknown',
      budgetId: b.id,
      totalBudget: Number(b.totalBudget),
      amountInETB: Number(b.totalBudget),
    });

    // Additional funding sources from JSON field
    const additional = Array.isArray(b.additionalFunding) ? b.additionalFunding : [];
    additional.forEach((fund: any, idx: number) => {
      const rate = fund.exchangeRate || 1;
      fundingSources.push({
        id: `${b.id}-add-${idx}`,
        source: fund.source || 'External Funding',
        amount: Number(fund.amount || 0),
        currency: fund.currency || 'ETB',
        exchangeRate: rate,
        date: fund.date,
        projectName: b.project?.name || 'Unknown',
        budgetId: b.id,
        totalBudget: Number(b.totalBudget),
        amountInETB: Number(fund.amount || 0) * rate,
      });
    });
  });

  const filteredSources = fundingSources.filter((s) =>
    searchQuery === '' ||
    s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFunding = filteredSources.reduce((sum, s) => sum + s.amountInETB, 0);
  const externalFunding = filteredSources.filter(s => s.source !== 'Primary Budget Allocation').reduce((sum, s) => sum + s.amountInETB, 0);
  const sourceCount = new Set(filteredSources.map(s => s.source)).size;

  const formatCompact = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toFixed(0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(Math.round(amount));

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('bank') || s.includes('treasury')) return Landmark;
    if (s.includes('world') || s.includes('ifc') || s.includes('afdb') || s.includes('grant')) return Globe;
    return Building2;
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Income & Funding"
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="#10B981"
        currentTab="income"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
          </div>
        ) : fundingSources.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Funding Sources</h3>
            <p className="text-sm text-slate-600 dark:text-white/50">
              Create a budget with additional funding sources to track income here.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 md:grid md:grid-cols-3 md:gap-4 mb-6 scrollbar-hide">
              <div className="flex-shrink-0 w-[180px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50">Total Funding</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">ETB {formatCompact(totalFunding)}</div>
                <div className="text-xs text-slate-500 mt-1">{sourceCount} funding sources</div>
              </div>

              <div className="flex-shrink-0 w-[180px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50">External Funding</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">ETB {formatCompact(externalFunding)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {totalFunding > 0 ? ((externalFunding / totalFunding) * 100).toFixed(0) : 0}% of total
                </div>
              </div>

              <div className="flex-shrink-0 w-[180px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50">Active Budgets</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{budgets.length}</div>
                <div className="text-xs text-slate-500 mt-1">across projects</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search funding sources, projects, currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Funding Sources List */}
            <div className="space-y-3">
              {filteredSources.map((source) => {
                const Icon = getSourceIcon(source.source);
                return (
                  <div
                    key={source.id}
                    onClick={() => { setSelectedSource(source); setIsSlideoutOpen(true); }}
                    className="bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/60 dark:border-white/[0.08]/60 rounded-xl p-4 hover:shadow-lg hover:border-[#1C8C7D]/40 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{source.source}</h3>
                          {source.source !== 'Primary Budget Allocation' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              EXTERNAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/50 ml-11">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {source.projectName}
                          </span>
                          {source.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(source.date).toLocaleDateString()}
                            </span>
                          )}
                          {source.currency !== 'ETB' && source.exchangeRate && (
                            <span className="text-[11px] text-slate-500">
                              Rate: 1 {source.currency} = {source.exchangeRate} ETB
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {source.currency} {formatCurrency(source.amount)}
                        </div>
                        {source.currency !== 'ETB' && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            ~ ETB {formatCurrency(source.amountInETB)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Slideout Panel */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Funding Source Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Source Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedSource?.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedSource?.currency} {formatCurrency(selectedSource?.amount || 0)}
                </p>
                {selectedSource?.currency !== 'ETB' && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    ~ ETB {formatCurrency(selectedSource?.amountInETB || 0)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedSource?.projectName}</p>
              </div>
              {selectedSource?.date && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    {new Date(selectedSource.date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {selectedSource?.exchangeRate && selectedSource?.currency !== 'ETB' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exchange Rate</label>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    1 {selectedSource.currency} = {selectedSource.exchangeRate} ETB
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Project Budget</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  ETB {formatCurrency(selectedSource?.totalBudget || 0)}
                </p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
