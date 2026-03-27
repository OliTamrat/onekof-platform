'use client';

import { ListChecks } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function BacklogPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.backlog')}
        description={t('departments.backlogDesc')}
        icon={ListChecks}
        iconColor="#22C55E"
        emptyMessage={t('emptyStates.noBacklog')}
        defaultLabels={['development', 'backlog']}
        baseHref="/dashboard/development"
        currentTab="backlog"
        tabs={DEVELOPMENT_TABS}
        category="development"
      />
    </AppLayout>
  );
}
