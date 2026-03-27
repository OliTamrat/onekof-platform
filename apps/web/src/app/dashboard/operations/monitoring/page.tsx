'use client';

import { Activity } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function MonitoringPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.monitoring')}
        description={t('departments.monitoringDesc')}
        icon={Activity}
        iconColor="#06B6D4"
        emptyMessage={t('emptyStates.noMonitoring')}
        defaultLabels={['operations', 'monitoring']}
        baseHref="/dashboard/operations"
        currentTab="monitoring"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
