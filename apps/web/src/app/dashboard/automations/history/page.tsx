'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Clock, Search, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { useLanguage } from '@/contexts/language-context';

const HISTORY = [
  { id: 1, workflow: 'New Task Assignment', status: 'SUCCESS', triggeredBy: 'Task Created', executedAt: '10 min ago', duration: '1.2s' },
  { id: 2, workflow: 'Budget Approval', status: 'SUCCESS', triggeredBy: 'Expense Submitted', executedAt: '25 min ago', duration: '0.8s' },
  { id: 3, workflow: 'Project Status Update', status: 'FAILED', triggeredBy: 'Schedule', executedAt: '1 hour ago', duration: '2.5s' },
  { id: 4, workflow: 'Goal Milestone Alert', status: 'SUCCESS', triggeredBy: 'Goal Progress', executedAt: '2 hours ago', duration: '1.0s' },
  { id: 5, workflow: 'New Member Onboarding', status: 'WARNING', triggeredBy: 'User Joined', executedAt: '3 hours ago', duration: '3.2s' },
  { id: 6, workflow: 'Budget Approval', status: 'SUCCESS', triggeredBy: 'Expense Submitted', executedAt: '5 hours ago', duration: '0.9s' },
];

export default function AutomationsHistoryPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredHistory = HISTORY.filter((item) =>
    item.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <UnifiedPageHeader title="Execution History" icon={<Clock className="h-6 w-6" />} iconColor="#EC4899" currentTab="history" baseHref="/dashboard/automations" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Executions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredHistory.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Successful</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{filteredHistory.filter(h => h.status === 'SUCCESS').length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Failed</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{filteredHistory.filter(h => h.status === 'FAILED').length}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search execution history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div key={item.id} onClick={() => { setSelectedExecution(item); setIsSlideoutOpen(true); }} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.workflow}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                      <span>Triggered by: {item.triggeredBy}</span>
                      <span>{item.executedAt}</span>
                      <span>Duration: {item.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideoutPanel isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} title="Execution Details">
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Execution Information">
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Workflow</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.workflow}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label><p className="text-sm mt-1"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExecution?.status)}`}>{selectedExecution?.status}</span></p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Triggered By</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.triggeredBy}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Executed At</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.executedAt}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.duration}</p></div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
