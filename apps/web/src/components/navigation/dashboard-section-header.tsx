'use client';

/**
 * Dashboard Section Header Component
 * Unified navigation header for all dashboard sections (Teams, Budget, Goals, etc.)
 * Automatically adapts navigation based on the section
 */

import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getDashboardNavigation,
  splitDashboardNavigationForMobile,
  getSectionInfo,
  type DashboardSection,
} from '@/lib/dashboard-navigation';

interface DashboardSectionHeaderProps {
  section: DashboardSection;
  onCreateClick?: () => void;
  createButtonLabel?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

export function DashboardSectionHeader({
  section,
  onCreateClick,
  createButtonLabel = 'Create',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  showFilter = false,
  onFilterClick,
}: DashboardSectionHeaderProps) {
  const pathname = usePathname();
  const sectionInfo = getSectionInfo(section);
  const navigationItems = getDashboardNavigation(section);
  const { visible: visibleTabs, more: moreTabs } = splitDashboardNavigationForMobile(navigationItems);

  const isActive = (href: string) => {
    // Exact match for the main section page
    if (href === `/dashboard/${section}` && pathname === `/dashboard/${section}`) {
      return true;
    }
    // For sub-pages, check if pathname starts with the href
    return pathname?.startsWith(href) && href !== `/dashboard/${section}`;
  };

  return (
    <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
      {/* Section Title and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div
            className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md text-white font-semibold text-sm md:text-base shrink-0"
            style={{ backgroundColor: sectionInfo.color }}
          >
            <sectionInfo.icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <h1 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
            {sectionInfo.title}
          </h1>
        </div>

        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 md:gap-2 rounded-md bg-[#0065FF] px-3 md:px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{createButtonLabel}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-3 md:px-6">
        {/* Mobile: Show first 4 tabs */}
        <div className="flex items-center gap-1 md:hidden w-full overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive(tab.href)
                    ? 'border-[#0065FF] text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </Link>
            );
          })}

          {/* More Menu for remaining tabs */}
          {moreTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 border-b-2 border-transparent px-3 py-2 text-xs text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                  <span className="text-xs">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem key={tab.id} asChild>
                      <Link
                        href={tab.href}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {tab.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Desktop: Show all tabs */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto">
          {navigationItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(tab.href)
                    ? 'border-[#0065FF] text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {(showSearch || showFilter) && (
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-3">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#9FADBC]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none"
              />
            </div>
          )}

          {showFilter && (
            <button
              onClick={onFilterClick}
              className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-100 dark:bg-[#282E33] px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2C333A]"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
