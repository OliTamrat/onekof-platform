'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  DollarSign,
  Search,
  Calendar,
  Tag,
  User,
  Receipt
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock expenses data
const EXPENSES = [
  { id: 1, description: 'Office Rent - March', amount: 5000, category: 'Facilities', date: '2024-03-01', status: 'APPROVED', submittedBy: 'John Smith' },
  { id: 2, description: 'Software Licenses', amount: 1200, category: 'Technology', date: '2024-03-05', status: 'PENDING', submittedBy: 'Sarah Johnson' },
  { id: 3, description: 'Marketing Campaign', amount: 3500, category: 'Marketing', date: '2024-03-10', status: 'APPROVED', submittedBy: 'Mike Wilson' },
  { id: 4, description: 'Team Lunch', amount: 250, category: 'Team Building', date: '2024-03-12', status: 'APPROVED', submittedBy: 'Emily Brown' },
  { id: 5, description: 'Travel Expenses', amount: 1800, category: 'Travel', date: '2024-03-15', status: 'PENDING', submittedBy: 'David Lee' },
  { id: 6, description: 'Office Supplies', amount: 450, category: 'Operations', date: '2024-03-18', status: 'APPROVED', submittedBy: 'Lisa Anderson' },
];

export default function BudgetExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredExpenses = EXPENSES.filter((expense) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExpenseClick = (expense: any) => {
    setSelectedExpense(expense);
    setIsSlideoutOpen(true);
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Expenses"
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="expenses"
        baseHref="/dashboard/budget"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Total Expenses</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Approved</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredExpenses.filter(e => e.status === 'APPROVED').length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {filteredExpenses.filter(e => e.status === 'PENDING').length}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
            />
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => handleExpenseClick(expense)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Receipt className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{expense.description}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-[#9FADBC]">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {expense.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {expense.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {expense.submittedBy}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${expense.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Expense Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Expense Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Expense Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExpense?.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">${selectedExpense?.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExpense?.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExpense?.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExpense?.status)}`}>
                    {selectedExpense?.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted By</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExpense?.submittedBy}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
