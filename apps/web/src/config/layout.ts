/**
 * Layout Configuration
 *
 * Switch between different layout architectures:
 * - 'jira-style': Top bar with project selector, dynamic sidebar (Jira/Linear style)
 * - 'three-tier': Fixed sidebar with all navigation (Traditional app style)
 */

export const LAYOUT_CONFIG = {
  // Change this to switch layouts: 'jira-style' | 'three-tier'
  activeLayout: 'jira-style' as 'jira-style' | 'three-tier',
};

/**
 * OPTION A: Jira-Style Layout
 * ✅ Project selector in top bar (dropdown)
 * ✅ Dynamic sidebar (changes based on context)
 * ✅ When in dashboard: Shows "Home", "My Issues", "Starred", etc.
 * ✅ When in project: Shows "Board", "Backlog", "Timeline", etc.
 * ✅ More screen real estate
 * ✅ Familiar to Jira/Linear users
 *
 * OPTION B: Three-Tier Layout
 * ✅ Workspace switcher in sidebar
 * ✅ Fixed sidebar with all main navigation
 * ✅ Dedicated projects page exists
 * ✅ More traditional application structure
 * ✅ Easier to understand navigation hierarchy
 * ✅ Collapsible sidebar
 */
