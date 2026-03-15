'use client';

/**
 * Project Navigation Component
 * Dynamic navigation tabs based on project type
 * Mobile-responsive with "More" menu
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getProjectNavigation, splitNavigationForMobile, categorizeNavigation, type ProjectType } from '@/lib/project-navigation';

interface ProjectNavigationProps {
  projectType?: ProjectType;
  currentPath?: string;
  className?: string;
}

export function ProjectNavigation({
  projectType = 'BUSINESS',
  currentPath,
  className = ''
}: ProjectNavigationProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname;

  const navigationItems = getProjectNavigation(projectType);
  const { visible: visibleTabs, more: moreTabs } = splitNavigationForMobile(navigationItems);
  const categories = categorizeNavigation(moreTabs, projectType);

  const isActive = (href: string) => {
    // Exact match for the main board/issues page
    if (href === '/dashboard/issues' && activePath === '/dashboard/issues') {
      return true;
    }
    // Check if the current path starts with the href (for sub-pages)
    return activePath?.startsWith(href) && href !== '/dashboard/issues';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Mobile: Show first 4 tabs + More menu */}
      <div className="flex items-center gap-1 md:hidden w-full">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
                prefetch={false}
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
                active
                  ? 'border-primary-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Menu for remaining tabs - Organized by categories */}
        {moreTabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MoreHorizontal className="h-4 w-4" />
                <span className="text-xs">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              {categories.map((category, categoryIndex) => (
                <div key={category.label}>
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                    {category.label}
                  </DropdownMenuLabel>
                  {category.items.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <DropdownMenuItem key={tab.id} asChild>
                        <Link
                          href={tab.href}
                prefetch={false}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {tab.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {categoryIndex < categories.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Desktop: Show all tabs */}
      <div className="hidden md:flex items-center gap-1 w-full">
        {navigationItems.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
                prefetch={false}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'border-primary-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
