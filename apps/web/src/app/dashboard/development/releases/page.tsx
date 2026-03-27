'use client';

import { GitBranch } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function ReleasesPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.releases')}
        description={t('departments.releasesDesc')}
        icon={GitBranch}
        iconColor="#A855F7"
        emptyMessage={t('emptyStates.noReleases')}
        defaultLabels={['development', 'release']}
        baseHref="/dashboard/development"
        currentTab="releases"
        tabs={DEVELOPMENT_TABS}
        category="development"
      />
    </AppLayout>
  );
}
