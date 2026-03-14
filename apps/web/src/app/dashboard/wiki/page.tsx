'use client';

import { BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function WikiPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Wiki"
        icon={<BookOpen className="h-6 w-6" />}
        iconColor="#3B82F6"
        breadcrumbs={[{"label":"Knowledge","href":"/dashboard/documents"},{"label":"Wiki"}]}
        currentTab="wiki"
        baseHref="/dashboard/wiki"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />
      <EmptyState
        preset="docs"
        title="No wiki pages yet"
        description="Build your organization's knowledge base. Create wiki pages to document processes, guides, and important information for your team."
        actionLabel="Create Wiki Page"
      />
    </AppLayout>
  );
}
