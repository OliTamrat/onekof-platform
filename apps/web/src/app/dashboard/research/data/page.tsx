'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function DataPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.data')}
        description={t('departments.dataDesc')}
        icon={FileSpreadsheet}
        iconColor="#8B5CF6"
        emptyMessage={t('emptyStates.noDataTasks')}
        defaultLabels={['research', 'data']}
        baseHref="/dashboard/research"
        currentTab="data"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
