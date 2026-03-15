const fs = require('fs');
const path = require('path');

// Pages to update
const pages = [
  'summary',
  'code',
  'forms',
  'pages',
  'settings'
];

// Template for the updated page
const createPageContent = (pageName, pageTitle, icon = 'CheckSquare') => `'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';

export default function Issues${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
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

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">${pageTitle}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#9FADBC]">
                This page is under construction and will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
`;

// Update each page
pages.forEach(page => {
  const pagePath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'dashboard', 'issues', page, 'page.tsx');

  // Check if page exists
  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Page not found: ${page} - skipping`);
    return;
  }

  try {
    // Read current content to preserve any existing logic
    const currentContent = fs.readFileSync(pagePath, 'utf-8');

    // Only update if it doesn't already use ProjectPageHeader
    if (currentContent.includes('ProjectPageHeader')) {
      console.log(`✅ Page already updated: ${page}`);
      return;
    }

    // Determine page title
    const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);

    // Write new content
    const newContent = createPageContent(page, pageTitle);
    fs.writeFileSync(pagePath, newContent, 'utf-8');

    console.log(`✅ Updated: ${page}/page.tsx`);
  } catch (error) {
    console.error(`❌ Error updating ${page}:`, error.message);
  }
});

console.log('\n✨ All pages updated successfully!');
console.log('📝 Note: Some pages now have placeholder content. You can customize them later.');
