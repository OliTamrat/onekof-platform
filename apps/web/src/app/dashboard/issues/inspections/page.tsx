'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import {
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function IssuesInspectionsPage() {
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const currentProject = projectsData?.projects?.[0];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Project Page Header with Navigation */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* Inspections Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Inspections</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
                This feature is coming soon. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
