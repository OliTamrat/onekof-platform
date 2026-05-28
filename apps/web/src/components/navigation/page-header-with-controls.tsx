'use client';

/**
 * Page Header with Jira-style Controls
 * Includes: Breadcrumbs, Search, Filter, Group By, View Settings, Insights
 */

import { useState , type ReactNode } from 'react';
import { ChevronRight, Search, Filter, LayoutGrid, Settings, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderWithControlsProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: ReactNode;
  iconColor?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showGroupBy?: boolean;
  showViewSettings?: boolean;
  showInsights?: boolean;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (filters: any) => void;
  onGroupByChange?: (groupBy: string) => void;
  onViewChange?: (view: string) => void;
}

export function PageHeaderWithControls({
  title,
  description,
  breadcrumbs = [],
  icon,
  iconColor = '#1C8C7D',
  showSearch = true,
  showFilters = true,
  showGroupBy = true,
  showViewSettings = true,
  showInsights = true,
  onSearchChange,
  onFilterChange,
  onGroupByChange,
  onViewChange,
}: PageHeaderWithControlsProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('status');
  const [selectedView, setSelectedView] = useState('board');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleGroupByChange = (groupBy: string) => {
    setSelectedGroupBy(groupBy);
    onGroupByChange?.(groupBy);
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    onViewChange?.(view);
  };

  return (
    <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-2 text-sm border-b border-gray-200 dark:border-slate-700">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 dark:text-slate-400" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Title and Icon */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <div style={{ color: iconColor }}>{icon}</div>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Filter */}
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>By Status</DropdownMenuItem>
                <DropdownMenuItem>By Priority</DropdownMenuItem>
                <DropdownMenuItem>By Assignee</DropdownMenuItem>
                <DropdownMenuItem>By Project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Group By */}
          {showGroupBy && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Group by: {selectedGroupBy}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleGroupByChange('status')}>
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGroupByChange('priority')}>
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGroupByChange('assignee')}>
                  Assignee
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGroupByChange('project')}>
                  Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Insights */}
          {showInsights && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Insights</span>
            </Button>
          )}

          {/* View Settings */}
          {showViewSettings && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">View</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleViewChange('board')}>
                  Board View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('calendar')}>
                  Calendar View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
