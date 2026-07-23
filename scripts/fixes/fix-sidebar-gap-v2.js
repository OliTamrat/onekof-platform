const fs = require('fs');

const filePath = './apps/web/src/components/layouts/jira-style-layout.tsx';

console.log('🔧 Fixing sidebar gap (v2 - proper fix)...\n');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the sidebar to fill the entire flex container height
  content = content.replace(
    `        {/* LEFT SIDEBAR - Changes based on context */}
        <aside className={cn(
          "w-56 border-r border-jira-gray-200 dark:border-jira-dark-border bg-white dark:bg-jira-dark-sidebar overflow-y-auto transition-transform duration-300 ease-in-out",
          // Desktop: Full height from top, no gap
          "md:relative md:translate-x-0 md:z-auto md:h-[calc(100vh-3.5rem)]",
          // Mobile: Fixed position with slide-in animation, positioned below header
          isMobileSidebarOpen ? "fixed top-14 bottom-0 left-0 translate-x-0 z-50" : "fixed top-14 bottom-0 left-0 -translate-x-full z-50"
        )}>`,
    `        {/* LEFT SIDEBAR - Changes based on context */}
        <aside className={cn(
          "w-56 border-r border-jira-gray-200 dark:border-jira-dark-border bg-white dark:bg-jira-dark-sidebar overflow-y-auto transition-transform duration-300 ease-in-out",
          // Desktop: Full height of flex container (no gap)
          "md:relative md:translate-x-0 md:z-auto md:h-full",
          // Mobile: Fixed position with slide-in animation, positioned below header
          isMobileSidebarOpen ? "fixed top-14 bottom-0 left-0 translate-x-0 z-50" : "fixed top-14 bottom-0 left-0 -translate-x-full z-50"
        )}>`,
  );

  fs.writeFileSync(filePath, content, 'utf8');

  console.log('✅ Sidebar gap fixed (v2)!');
  console.log('  - Changed from h-[calc(100vh-3.5rem)] to h-full');
  console.log('  - Sidebar now fills entire flex container');
  console.log('  - No gap between navbar and sidebar');

} catch (error) {
  console.error('❌ Error:', error.message);
}
