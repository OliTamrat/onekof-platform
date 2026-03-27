'use client';

import { Map } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function CampaignsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.campaigns')}
        description={t('departments.campaignsDesc')}
        icon={Map}
        iconColor="#EC4899"
        emptyMessage={t('emptyStates.noCampaigns')}
        defaultLabels={['marketing', 'campaign']}
        baseHref="/dashboard/marketing"
        currentTab="campaigns"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
