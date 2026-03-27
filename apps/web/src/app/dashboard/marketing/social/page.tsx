'use client';

import { MessageSquare } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function SocialMediaPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.socialMedia')}
        description={t('departments.socialMediaDesc')}
        icon={MessageSquare}
        iconColor="#0EA5E9"
        emptyMessage={t('emptyStates.noSocialMedia')}
        defaultLabels={['marketing', 'social-media']}
        baseHref="/dashboard/marketing"
        currentTab="social"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
