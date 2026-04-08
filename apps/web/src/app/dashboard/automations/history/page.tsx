'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Zap } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { useLanguage } from '@/contexts/language-context';
import { AUTOMATIONS_TABS } from '@/config/department-tabs';

interface Automation {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  triggerEvent: string;
  isEnabled: boolean;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
  scope: string;
}

interface ExecutionRecord {
  id: string;
  workflow: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  triggeredBy: string;
  executedAt: string;
  entityType: string;
  executionCount: number;
}

function buildExecutionRecords(automations: Automation[]): ExecutionRecord[] {
  return automations
    .filter((a) => a.lastExecutedAt || a.executionCount > 0)
    .map((a) => {
      const successRate = a.executionCount > 0 ? (a.successCount / a.executionCount) * 100 : 100;
      const status: 'SUCCESS' | 'FAILED' | 'WARNING' =
        successRate >= 90 ? 'SUCCESS' : successRate >= 60 ? 'WARNING' : 'FAILED';

      const executedAt = a.lastExecutedAt
        ? new Date(a.lastExecutedAt).toLocaleString()
        : '—';

      return {
        id: a.id,
        workflow: a.name,
        status,
        triggeredBy: a.triggerEvent || a.entityType,
        executedAt,
        entityType: a.entityType,
        executionCount: a.executionCount,
      };
    });
}

export default function AutomationsHistoryPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const { data: automationsData, isLoading } = useQuery({
    queryKey: ['automations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { automations: [] };
      const res = await fetch(`/api/automations?organizationId=${currentOrganization.id}`);
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
    enabled: !!currentOrganization?.id,
  });

  const automations: Automation[] = automationsData?.automations || [];
  const executions = buildExecutionRecords(automations);

  const filteredHistory = executions.filter((item) =>
    item.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSuccessful = filteredHistory.filter((h) => h.status === 'SUCCESS').length;
  const totalFailed = filteredHistory.filter((h) => h.status === 'FAILED').length;

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
      <UnifiedPageHeader
        title={t('automations.historyTitle')}
        icon={<Clock className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="history"
        baseHref="/dashboard/automations"
        customTabs={AUTOMATIONS_TABS}
        showTabs
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('automations.historyTotalExecutions')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredHistory.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('automations.historySuccessful')}</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{totalSuccessful}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('automations.historyFailed')}</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{totalFailed}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('automations.historySearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-slate-400">{t('automations.loading')}</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-12 w-12 text-gray-400 dark:text-[#6B7684] mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('automations.noAutomations')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => { setSelectedExecution(item); setIsSlideoutOpen(true); }}
                className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.workflow}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                        <span>{t('automations.historyTriggeredBy')} {item.triggeredBy}</span>
                        <span>{item.executedAt}</span>
                        <span>{item.executionCount} {t('automations.runs')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideoutPanel isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} title={t('automations.historyExecutionInfo')}>
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('automations.historyExecutionInfo')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.historyWorkflow')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.workflow}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.historyStatus')}</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExecution?.status ?? '')}`}>
                    {selectedExecution?.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.historyTriggeredByLabel')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.triggeredBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.historyExecutedAt')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.executedAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.executions')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedExecution?.executionCount}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
