'use client';

import { ShieldCheck } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function SafetyPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.safety')}
        description={t('departments.safetyDesc')}
        icon={ShieldCheck}
        iconColor="#10B981"
        emptyMessage={t('emptyStates.noSafety')}
        defaultLabels={['operations', 'safety']}
        baseHref="/dashboard/operations"
        currentTab="safety"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
