'use client';

import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function ChecklistsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.checklists')}
        description={t('departments.checklistsDesc')}
        icon={CheckCircle2}
        iconColor="#10B981"
        emptyMessage={t('emptyStates.noChecklists')}
        defaultLabels={['operations', 'checklist']}
        baseHref="/dashboard/operations"
        currentTab="checklists"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
