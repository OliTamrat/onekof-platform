'use client';

import { GitBranch } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function DevelopmentPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departments.development')}
        description={t('departments.developmentDesc')}
        icon={GitBranch}
        iconColor="#22C55E"
        emptyMessage={t('emptyStates.noDevelopment')}
        defaultLabels={['development']}
        baseHref="/dashboard/development"
        currentTab="backlog"
        tabs={DEVELOPMENT_TABS}
        category="development"
      />
    </AppLayout>
  );
}
