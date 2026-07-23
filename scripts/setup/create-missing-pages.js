const fs = require('fs');
const path = require('path');

// All navigation pages from the comprehensive navigation system
const issuesPages = [
  { id: 'calendar', title: 'Calendar', icon: 'Calendar' },
  { id: 'team', title: 'Team', icon: 'Users' },
  { id: 'goals', title: 'Goals', icon: 'Target' },
  { id: 'budget', title: 'Budget', icon: 'DollarSign' },
  { id: 'documents', title: 'Documents', icon: 'Sparkles' },
  { id: 'automation', title: 'Automation', icon: 'Zap' },
  { id: 'wiki', title: 'Wiki', icon: 'BookOpen' },
  { id: 'reports', title: 'Reports', icon: 'BarChart3' },
  { id: 'backlog', title: 'Backlog', icon: 'ListChecks' },
  { id: 'releases', title: 'Releases', icon: 'GitBranch' },
  { id: 'social', title: 'Social', icon: 'MessageSquare' },
  { id: 'analytics', title: 'Analytics', icon: 'TrendingUp' },
  { id: 'incidents', title: 'Incidents', icon: 'AlertCircle' },
  { id: 'monitoring', title: 'Monitoring', icon: 'Activity' },
  { id: 'checklists', title: 'Checklists', icon: 'CheckCircle2' },
  { id: 'data', title: 'Data', icon: 'FileSpreadsheet' },
  { id: 'findings', title: 'Findings', icon: 'FileText' },
  { id: 'plans', title: 'Plans', icon: 'Map' },
  { id: 'materials', title: 'Materials', icon: 'FileSpreadsheet' },
  { id: 'inspections', title: 'Inspections', icon: 'CheckCircle2' },
];

const createPageTemplate = (pageId, pageTitle, icon) => `'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { ${icon} } from 'lucide-react';

export default function Issues${pageTitle.replace(/\s/g, '')}Page() {
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
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Project Page Header with Navigation */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* ${pageTitle} Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <${icon} className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">${pageTitle}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-[#9FADBC]">
                This feature is coming soon. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
`;

const issuesDir = path.join(__dirname, 'apps', 'web', 'src', 'app', 'dashboard', 'issues');

console.log('🚀 Creating missing Issues pages...\n');

issuesPages.forEach(({ id, title, icon }) => {
  const pageDir = path.join(issuesDir, id);
  const pagePath = path.join(pageDir, 'page.tsx');

  // Skip if page already exists
  if (fs.existsSync(pagePath)) {
    console.log(`✓  ${id}: Already exists`);
    return;
  }

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // Create page file
    const content = createPageTemplate(id, title, icon);
    fs.writeFileSync(pagePath, content, 'utf-8');

    console.log(`✅ ${id}: Created successfully`);
  } catch (error) {
    console.error(`❌ ${id}: Error - ${error.message}`);
  }
});

console.log('\n✨ All missing pages created!');
console.log('📝 Pages are created with placeholder content showing "Coming Soon"');
console.log('🔧 You can customize each page later with specific functionality');
