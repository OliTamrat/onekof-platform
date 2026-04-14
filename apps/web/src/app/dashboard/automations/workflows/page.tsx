'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  Zap,
  Search,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
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
  actions?: unknown[];
  conditions?: unknown[];
}

interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  triggerCount: number;
  actionCount: number;
  lastRun: string;
  executions: number;
  rawAutomation: Automation;
}

function buildWorkflowRecords(automations: Automation[]): WorkflowRecord[] {
  return automations.map((a) => {
    const lastRun = a.lastExecutedAt
      ? new Date(a.lastExecutedAt).toLocaleString()
      : '—';

    const actionCount = Array.isArray(a.actions) ? a.actions.length : 1;
    const conditionCount = Array.isArray(a.conditions) ? a.conditions.length : 0;

    return {
      id: a.id,
      name: a.name,
      description: a.description || `${a.entityType} → ${a.triggerEvent}`,
      status: a.isEnabled ? 'ACTIVE' : 'INACTIVE',
      triggerCount: conditionCount + 1,
      actionCount,
      lastRun,
      executions: a.executionCount,
      rawAutomation: a,
    };
  });
}

export default function AutomationsWorkflowsPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRecord | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });
      if (!res.ok) throw new Error('Failed to toggle automation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const automations: Automation[] = automationsData?.automations || [];
  const workflows = buildWorkflowRecords(automations);

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActive = filteredWorkflows.filter((w) => w.status === 'ACTIVE').length;
  const totalInactive = filteredWorkflows.filter((w) => w.status === 'INACTIVE').length;
  const totalExecutions = filteredWorkflows.reduce((sum, w) => sum + w.executions, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('automations.workflowsTitle')}
        icon={<Zap className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="workflows"
        baseHref="/dashboard/automations"
        customTabs={AUTOMATIONS_TABS}
        showTabs
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-white/50">{t('automations.workflowsTotalWorkflows')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredWorkflows.length}</div>
          </div>
          <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-white/50">{t('automations.workflowsActive')}</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{totalActive}</div>
          </div>
          <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-white/50">{t('automations.inactive')}</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-white/50 mt-1">{totalInactive}</div>
          </div>
          <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-white/50">{t('automations.workflowsTotalExecutions')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalExecutions}</div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('automations.workflowsSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <Zap className="h-4 w-4" />
            {t('automations.workflowsCreate')}
          </Button>
        </div>

        {/* Workflows List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-white/50">{t('automations.loading')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => { setSelectedWorkflow(workflow); setIsSlideoutOpen(true); }}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-[#EC4899]" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status === 'ACTIVE' ? t('automations.active') : t('automations.inactive')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/50 mb-3">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white/50">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {workflow.triggerCount} {t('automations.workflowsTriggers')}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {workflow.actionCount} {t('automations.workflowsActions')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('automations.workflowsLastRun')} {workflow.lastRun}
                      </span>
                      <span>{workflow.executions} {t('automations.workflowsExecutions')}</span>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMutation.mutate({ id: workflow.id, isEnabled: workflow.rawAutomation.isEnabled });
                    }}
                    className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-white/[0.08] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    {workflow.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {workflow.status === 'ACTIVE' ? t('automations.workflowsPause') : t('automations.workflowsResume')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slideout Panel */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedWorkflow?.name || t('automations.workflowsDetails')}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('automations.workflowsInfo')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.description')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.status')}</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkflow?.status ?? '')}`}>
                    {selectedWorkflow?.status === 'ACTIVE' ? t('automations.active') : t('automations.inactive')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.workflowsTriggers')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedWorkflow?.triggerCount} {t('automations.workflowsConfigured')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.workflowsActions')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedWorkflow?.actionCount} {t('automations.workflowsConfigured')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.workflowsLastExecution')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.lastRun}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.workflowsTotalExecutions')}</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedWorkflow?.executions}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
