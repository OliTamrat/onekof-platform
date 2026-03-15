'use client';

/**
 * Project Page Header Component
 * Displays project info and navigation tabs
 * Fully responsive for mobile
 */

import { Plus, Search, Filter } from 'lucide-react';
import { ProjectNavigation } from './project-navigation';
import type { ProjectType } from '@/lib/project-navigation';

interface Project {
  id: string;
  name: string;
  key: string;
  type?: ProjectType;
  color?: string;
  icon?: string;
}

interface ProjectPageHeaderProps {
  project?: Project;
  onCreateClick?: () => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

export function ProjectPageHeader({
  project,
  onCreateClick,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  showFilter = false,
  onFilterClick,
}: ProjectPageHeaderProps) {
  const projectType = project?.type || 'BUSINESS';

  return (
    <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
      {/* Project Title and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div
            className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md text-white font-semibold text-sm md:text-base shrink-0"
            style={{ backgroundColor: project?.color || '#0065FF' }}
          >
            {project?.icon || project?.key?.substring(0, 2) || 'PR'}
          </div>
          <h1 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
            {project?.name || 'Project'}
          </h1>
        </div>

        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 md:gap-2 rounded-md bg-[#0065FF] px-3 md:px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <ProjectNavigation
        projectType={projectType}
        className="px-3 md:px-6"
      />

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
