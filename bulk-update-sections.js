const fs = require('fs');
const path = require('path');

/**
 * Bulk update all dashboard section pages to use DashboardSectionHeader
 * This ensures consistent navigation across all pages in each section
 */

function updatePageNavigation(filePath, section) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already using DashboardSectionHeader
    if (content.includes('DashboardSectionHeader')) {
      return { updated: false, reason: 'already-updated' };
    }

    // Skip if no TAB_ITEMS found (no old navigation to replace)
    if (!content.includes('TAB_ITEMS')) {
      return { updated: false, reason: 'no-tab-items' };
    }

    // 1. Add DashboardSectionHeader import
    if (!content.includes("from '@/components/navigation/dashboard-section-header'")) {
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf("from '@/");
      if (lastImportIndex !== -1) {
        const endOfLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLineIndex + 1) +
          `import { DashboardSectionHeader } from '@/components/navigation/dashboard-section-header';\n` +
          content.slice(endOfLineIndex + 1);
      }
    }

    // 2. Remove TAB_ITEMS constant
    content = content.replace(/const TAB_ITEMS = \[[\s\S]*?\] as const;?\n*/g, '');

    // 3. Remove old navigation rendering (the complex tabs section)
    // Pattern: {/* Header Section */} ... {/* End of navigation */}
    const headerSectionRegex = /\{\/\* Header Section \*\/\}[\s\S]*?<\/div>\s*\n\s*\n/;
    if (headerSectionRegex.test(content)) {
      content = content.replace(
        headerSectionRegex,
        `{/* Dashboard Section Header with Navigation */}\n        <DashboardSectionHeader\n          section="${section}"\n          onCreateClick={() => setShowCreateModal(true)}\n          showSearch\n          searchValue={searchQuery}\n          onSearchChange={setSearchQuery}\n          showFilter\n        />\n\n`
      );
    } else {
      // Try alternative pattern: Look for the navigation div structure
      const navDivRegex = /<div className="border-b border-gray-200[\s\S]*?<\/div>\s*\n\s*\{\/\*/;
      if (navDivRegex.test(content)) {
        // More complex replacement needed - mark for manual update
        return { updated: false, reason: 'complex-structure' };
      }
    }

    // 4. Remove unused imports if they were only used in TAB_ITEMS
    const unusedImports = ['Link', 'Code', 'FileText', 'Clock', 'Book'];
    unusedImports.forEach(imp => {
      // Only remove if not used elsewhere in the file
      const regex = new RegExp(`${imp},?\\s*`, 'g');
      const occurrences = (content.match(regex) || []).length;
      if (occurrences === 1) { // Only in the import line
        content = content.replace(regex, '');
      }
    });

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf-8');
    return { updated: true };

  } catch (error) {
    return { updated: false, reason: 'error', error: error.message };
  }
}

// Define sections and their pages
const sections = {
  teams: ['page', 'list', 'board', 'timeline', 'overview', 'settings', 'code', 'forms', 'pages'],
  budget: ['page'],
  goals: ['page'],
  automations: ['page'],
  documents: ['page'],
  docs: ['page'],
};

console.log('🚀 Starting bulk update of dashboard sections...\n');

Object.entries(sections).forEach(([section, pages]) => {
  console.log(`📂 Section: ${section}`);

  pages.forEach(page => {
    const pageFileName = page === 'page' ? 'page.tsx' : `${page}/page.tsx`;
    const pagePath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'dashboard', section, pageFileName);

    if (!fs.existsSync(pagePath)) {
      console.log(`  ⚠️  ${page}: Not found`);
      return;
    }

    const result = updatePageNavigation(pagePath, section);

    if (result.updated) {
      console.log(`  ✅ ${page}: Updated successfully`);
    } else {
      if (result.reason === 'already-updated') {
        console.log(`  ✓  ${page}: Already updated`);
      } else if (result.reason === 'no-tab-items') {
        console.log(`  ⚠️  ${page}: No old navigation found`);
      } else if (result.reason === 'complex-structure') {
        console.log(`  ⚠️  ${page}: Complex structure - needs manual update`);
      } else {
        console.log(`  ❌ ${page}: Error - ${result.error}`);
      }
    }
  });

  console.log('');
});

console.log('✨ Bulk update complete!');
console.log('\n📝 Next steps:');
console.log('1. Check for any pages marked as "needs manual update"');
console.log('2. Test navigation on http://localhost:3000');
console.log('3. Verify all section pages show consistent navigation');
