/**
 * App Layout Wrapper
 *
 * This component automatically selects the correct layout based on config
 */

'use client';

import { LAYOUT_CONFIG } from '@/config/layout';
import { JiraStyleLayout } from './jira-style-layout';
import { ThreeTierLayout } from './three-tier-layout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const Layout = LAYOUT_CONFIG.activeLayout === 'jira-style'
    ? JiraStyleLayout
    : ThreeTierLayout;

  return <Layout>{children}</Layout>;
}

// Export both layouts for direct use if needed
export { JiraStyleLayout, ThreeTierLayout };
