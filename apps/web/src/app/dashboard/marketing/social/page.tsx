'use client';

import { MessageSquare } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';

export default function SocialMediaPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Social Media"
        description="Schedule posts, track engagement, and manage your online presence"
        icon={MessageSquare}
        iconColor="#0EA5E9"
        emptyMessage="No social media tasks yet. Create one to start managing posts."
        defaultLabels={['marketing', 'social-media']}
        baseHref="/dashboard/marketing"
        currentTab="social"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
