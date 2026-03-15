'use client';

import {
  MessageSquare
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function SocialMediaPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Social Media"
        icon={<MessageSquare className="h-6 w-6" />}
        iconColor="#0EA5E9"
        breadcrumbs={[{"label":"Marketing","href":"/dashboard/marketing"},{"label":"Social Media"}]}
        currentTab="list"
        baseHref="/dashboard/marketing/social"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

            <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/20">
              <MessageSquare className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Social Media Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Social media tools are coming soon. Schedule posts, track engagement, and manage your online presence.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
