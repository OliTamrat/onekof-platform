/**
 * Dynamic Sidebar Navigation
 *
 * Generates sidebar navigation based on organization type.
 * This replaces the static sidebar-navigation.ts with dynamic, type-aware navigation.
 */

import { getNavigationForType } from '@/config/organization-types';
import type { LucideIcon } from 'lucide-react';

export interface SidebarSubItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarSection {
  id: string;
  name: string;
  icon: LucideIcon;
  href?: string;
  items: SidebarSubItem[];
}

/**
 * Get sidebar navigation for organization type
 * Returns simplified single-level navigation (no collapsible sections)
 */
export function getSidebarNavigation(organizationType?: string | null): SidebarSection[] {
  const navigation = getNavigationForType(organizationType);

  // Convert to sidebar sections (each item is a standalone section)
  return navigation.map(navItem => ({
    id: navItem.id,
    name: navItem.name,
    icon: navItem.icon,
    href: navItem.href,
    items: [], // No sub-items for now (simplified navigation)
  }));
}

/**
 * Check if a navigation item should be visible for this organization type
 */
export function isNavigationItemVisible(
  itemId: string,
  organizationType?: string | null
): boolean {
  const navigation = getNavigationForType(organizationType);
  return navigation.some(item => item.id === itemId);
}
