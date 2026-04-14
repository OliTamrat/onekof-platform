'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Activity, Search, Clock, Zap } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { AUTOMATIONS_TABS } from '@/config/department-tabs';

interface Automation {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  triggerEvent: string;
  triggerType?: string;
  triggerConfig?: Record<string, unknown>;
  isEnabled: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  scope: string;
}

interface TriggerRecord {
  id: string;
  name: string;
  type: string;
  condition: string;
  automationCount: number;
  status: string;
  lastTriggered: string;
  rawAutomation: Automation;
}

function buildTriggerRecords(automations: Automation[]): TriggerRecord[] {
  return automations.map((a) => {
    const lastTriggered = a.lastExecutedAt
      ? new Date(a.lastExecutedAt).toLocaleString()
      : '—';

    const type = a.triggerType || 'Event';
    const condition = a.description || `${a.entityType} → ${a.triggerEvent}`;

    return {
      id: a.id,
      name: a.name,
      type,
      condition,
      automationCount: 1,
      status: a.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastTriggered,
      rawAutomation: a,
    };
  });
}

export default function AutomationsTriggersPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerRecord | null>(null);
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
  const triggers = buildTriggerRecords(automations);

  const filteredTriggers = triggers.filter((trigger) =>
    trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('automations.triggersTitle')}
        icon={<Activity className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="triggers"
        baseHref="/dashboard/automations"
        customTabs={AUTOMATIONS_TABS}
        showTabs
      />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('automations.triggersSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <Activity className="h-4 w-4" />
            {t('automations.triggersCreate')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-white/50">{t('automations.loading')}</div>
          </div>
        ) : filteredTriggers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-12 w-12 text-gray-400 dark:text-[#6B7684] mb-3" />
            <p className="text-sm text-gray-500 dark:text-white/50">{t('automations.noAutomations')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTriggers.map((trigger) => (
              <div
                key={trigger.id}
                onClick={() => { setSelectedTrigger(trigger); setIsSlideoutOpen(true); }}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="h-5 w-5 text-[#EC4899]" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{trigger.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trigger.status)}`}>
                        {trigger.status === 'ACTIVE' ? t('automations.active') : t('automations.inactive')}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {trigger.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/50 mb-2">{trigger.condition}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white/50">
                      <span>{trigger.rawAutomation.entityType} — {trigger.rawAutomation.triggerEvent}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('automations.triggersLastTriggered')} {trigger.lastTriggered}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedTrigger?.name || t('automations.triggersDetails')}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('automations.triggersTriggerInfo')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.type')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.triggersCondition')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.condition}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.status')}</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrigger?.status ?? '')}`}>
                    {selectedTrigger?.status === 'ACTIVE' ? t('automations.active') : t('automations.inactive')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.entityType')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.rawAutomation.entityType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.trigger')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.rawAutomation.triggerEvent}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('automations.triggersLastTriggeredLabel')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.lastTriggered}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
