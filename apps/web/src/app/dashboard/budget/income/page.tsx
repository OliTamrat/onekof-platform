'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  DollarSign,
  Search,
  Calendar,
  Tag,
  TrendingUp
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock income data
const INCOME = [
  { id: 1, source: 'Project Payment - ABC Corp', amount: 25000, category: 'Project Revenue', date: '2024-03-01', status: 'RECEIVED', recurring: false },
  { id: 2, source: 'Subscription Revenue', amount: 15000, category: 'Recurring Revenue', date: '2024-03-01', status: 'RECEIVED', recurring: true },
  { id: 3, source: 'Consulting Services', amount: 8000, category: 'Service Revenue', date: '2024-03-10', status: 'PENDING', recurring: false },
  { id: 4, source: 'License Fees', amount: 3500, category: 'License Revenue', date: '2024-03-15', status: 'RECEIVED', recurring: true },
  { id: 5, source: 'Training Workshop', amount: 5000, category: 'Training Revenue', date: '2024-03-20', status: 'PENDING', recurring: false },
  { id: 6, source: 'Support Contracts', amount: 12000, category: 'Support Revenue', date: '2024-03-25', status: 'RECEIVED', recurring: true },
];

export default function BudgetIncomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncome, setSelectedIncome] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredIncome = INCOME.filter((income) =>
    income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    income.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIncomeClick = (income: any) => {
    setSelectedIncome(income);
    setIsSlideoutOpen(true);
  };

  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const recurringIncome = filteredIncome.filter(inc => inc.recurring).reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Income"
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="#10B981"
        currentTab="income"
        baseHref="/dashboard/budget"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Income</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Recurring Revenue</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${recurringIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {filteredIncome.filter(i => i.status === 'PENDING').length}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search income sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Income List */}
        <div className="space-y-3">
          {filteredIncome.map((income) => (
            <div
              key={income.id}
              onClick={() => handleIncomeClick(income)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#10B981]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{income.source}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(income.status)}`}>
                      {income.status}
                    </span>
                    {income.recurring && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        RECURRING
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {income.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {income.date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">${income.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Income Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Income Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Income Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedIncome?.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">${selectedIncome?.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedIncome?.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedIncome?.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIncome?.status)}`}>
                    {selectedIncome?.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedIncome?.recurring ? 'Recurring' : 'One-time'}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
