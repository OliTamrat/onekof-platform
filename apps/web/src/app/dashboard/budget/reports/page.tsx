'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  BarChart3,
  FileSpreadsheet,
  Search,
  Calendar,
  Download,
  PieChart
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock reports data
const REPORTS = [
  { id: 1, name: 'Monthly Budget Report - March 2024', type: 'Monthly', period: 'March 2024', generatedDate: '2024-03-31', size: '2.4 MB' },
  { id: 2, name: 'Q1 2024 Financial Summary', type: 'Quarterly', period: 'Q1 2024', generatedDate: '2024-03-31', size: '5.1 MB' },
  { id: 3, name: 'Expense Analysis - February 2024', type: 'Expense Analysis', period: 'February 2024', generatedDate: '2024-02-29', size: '1.8 MB' },
  { id: 4, name: 'Revenue Report - March 2024', type: 'Revenue', period: 'March 2024', generatedDate: '2024-03-31', size: '3.2 MB' },
  { id: 5, name: 'Budget vs Actual - Q1 2024', type: 'Variance', period: 'Q1 2024', generatedDate: '2024-03-31', size: '4.5 MB' },
  { id: 6, name: 'Department Budget Report', type: 'Department', period: 'March 2024', generatedDate: '2024-03-25', size: '2.9 MB' },
];

export default function BudgetReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredReports = REPORTS.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsSlideoutOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Monthly':
      case 'Quarterly':
        return <BarChart3 className="h-5 w-5 text-[#F59E0B]" />;
      case 'Expense Analysis':
        return <PieChart className="h-5 w-5 text-[#EF4444]" />;
      case 'Revenue':
        return <BarChart3 className="h-5 w-5 text-[#10B981]" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-[#3B82F6]" />;
    }
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Reports"
        icon={<FileSpreadsheet className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="reports"
        baseHref="/dashboard/budget"
      />

      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC]">
            <FileSpreadsheet className="h-4 w-4" />
            Generate Report
          </button>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleReportClick(report)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                {getTypeIcon(report.type)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">{report.name}</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {report.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-[#9FADBC]">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Period: {report.period}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Generated: {report.generatedDate}</span>
                  <span className="font-medium">{report.size}</span>
                </div>
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-[#2C333A] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C333A] transition-colors">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Report Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Report Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Report Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Name</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedReport?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedReport?.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedReport?.period}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedReport?.generatedDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File Size</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedReport?.size}</p>
              </div>
              <div className="pt-4">
                <button className="w-full flex items-center justify-center gap-2 rounded-md bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC]">
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
