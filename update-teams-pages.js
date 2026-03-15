const fs = require('fs');
const path = require('path');

// Teams pages to update
const pages = [
  { page: 'page', title: 'Teams Overview' },  // Main teams page
  { page: 'list', title: 'Team Members' },
  { page: 'board', title: 'Teams Board' },
  { page: 'timeline', title: 'Teams Timeline' },
  { page: 'overview', title: 'Teams Overview' },
  { page: 'settings', title: 'Teams Settings' },
  { page: 'code', title: 'Teams Code' },
  { page: 'forms', title: 'Teams Forms' },
  { page: 'pages', title: 'Teams Pages' },
];

// Check which pages exist
pages.forEach(({ page, title }) => {
  const pageFileName = page === 'page' ? 'page.tsx' : `${page}/page.tsx`;
  const pagePath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'dashboard', 'teams', pageFileName);

  if (fs.existsSync(pagePath)) {
    try {
      const currentContent = fs.readFileSync(pagePath, 'utf-8');

      // Check if already using DashboardSectionHeader
      if (currentContent.includes('DashboardSectionHeader')) {
        console.log(`✅ Already updated: ${page}`);
        return;
      }

      // Check if it has the old TAB_ITEMS navigation
      if (currentContent.includes('TAB_ITEMS')) {
        console.log(`🔄 Needs update: ${page}`);

        // For now, just log - we'll update manually to preserve custom logic
        console.log(`   Path: ${pagePath}`);
      } else {
        console.log(`⚠️  No old navigation found in: ${page}`);
      }
    } catch (error) {
      console.error(`❌ Error reading ${page}:`, error.message);
    }
  } else {
    console.log(`⚠️  Page not found: ${page}`);
  }
});

console.log('\n📝 Manual Update Required:');
console.log('Replace the old navigation with:');
console.log(`
import { DashboardSectionHeader } from '@/components/navigation/dashboard-section-header';

// In the component:
<DashboardSectionHeader
  section="teams"
  onCreateClick={() => setShowCreateModal(true)}
  createButtonLabel="Add Member"
  showSearch
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  showFilter
/>
`);
