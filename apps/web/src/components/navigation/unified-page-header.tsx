'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  Filter,
  LayoutGrid,
  Settings as SettingsIcon,
  Sparkles,
  BarChart3,
  List,
  LayoutDashboard,
  Calendar,
  GitBranch,
  Users,
  Target,
  DollarSign,
  FileText,
  Zap,
  BookOpen,
  MoreHorizontal,
  X,
  Check,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Breadcrumb {
  label: string;
  href?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export type FilterField = 'status' | 'priority' | 'assignee' | 'project';
export type GroupByField = 'none' | 'status' | 'priority' | 'assignee' | 'project';
export type ViewMode = 'list' | 'board' | 'compact';

interface UnifiedPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: React.ReactNode;
  iconColor?: string;
  currentTab?: string;
  baseHref?: string;
  customTabs?: TabDefinition[];
  showTabs?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showGroupBy?: boolean;
  showViewSettings?: boolean;
  showInsights?: boolean;
  // Functional callbacks
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (field: FilterField, values: string[]) => void;
  groupBy?: GroupByField;
  onGroupByChange?: (field: GroupByField) => void;
  viewMode?: ViewMode;
  onViewChange?: (mode: ViewMode) => void;
  onInsightsToggle?: () => void;
  insightsOpen?: boolean;
  taskCounts?: { total: number; filtered: number };
}

const DEFAULT_NAV_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '' },
  { id: 'list', label: 'List', icon: List, href: '/list' },
  { id: 'board', label: 'Board', icon: LayoutDashboard, href: '/board' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'timeline', label: 'Timeline', icon: GitBranch, href: '/timeline' },
  { id: 'team', label: 'Team', icon: Users, href: '/team' },
  { id: 'goals', label: 'Goals', icon: Target, href: '/goals' },
  { id: 'budget', label: 'Budget', icon: DollarSign, href: '/budget' },
  { id: 'documents', label: 'Docs', icon: FileText, href: '/documents' },
  { id: 'automation', label: 'Automation', icon: Zap, href: '/automation' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, href: '/wiki' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '/settings' },
];

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];
const PRIORITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  BLOCKED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

function NavigationTabs({ tabs, baseHref, activeTab }: { tabs: TabDefinition[]; baseHref: string; activeTab: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(tabs.length);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      const containerWidth = container.offsetWidth - 100;
      const tabWidth = 90;
      const count = Math.max(2, Math.min(tabs.length, Math.floor(containerWidth / tabWidth)));
      setVisibleCount(count);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs.length]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);
  const hasOverflow = overflowTabs.length > 0;

  return (
    <div ref={containerRef} className="flex items-center px-3 md:px-6">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const href = `${baseHref}${tab.href}`;

        return (
          <Link
            key={tab.id}
            href={href}
            prefetch={false}
            className={cn(
              'flex items-center gap-1.5 px-2.5 md:px-3 py-2.5 text-xs md:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap shrink-0',
              isActive
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#282E33]'
            )}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {hasOverflow && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'flex items-center gap-1.5 px-2.5 h-auto py-2.5 text-xs md:text-sm font-medium rounded-none border-b-2 whitespace-nowrap shrink-0',
                overflowTabs.some(tab => activeTab === tab.id)
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#282E33]'
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {overflowTabs.map((tab) => {
              const Icon = tab.icon;
              const href = `${baseHref}${tab.href}`;
              const isActive = activeTab === tab.id;

              return (
                <DropdownMenuItem key={tab.id} asChild>
                  <Link
                    href={href}
                    prefetch={false}
                    className={cn(
                      'flex items-center gap-2 w-full cursor-pointer',
                      isActive && 'bg-primary-500/10 text-primary-500 font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function UnifiedPageHeader({
  title,
  description,
  breadcrumbs = [],
  icon,
  iconColor = '#1C8C7D',
  currentTab,
  baseHref = '/dashboard',
  customTabs,
  showTabs = true,
  showSearch = true,
  showFilters = true,
  showGroupBy = true,
  showViewSettings = true,
  showInsights = true,
  searchValue: externalSearch,
  onSearchChange,
  activeFilters = {},
  onFilterChange,
  groupBy = 'none',
  onGroupByChange,
  viewMode = 'list',
  onViewChange,
  onInsightsToggle,
  insightsOpen = false,
  taskCounts,
}: UnifiedPageHeaderProps) {
  const pathname = usePathname();
  const [internalSearch, setInternalSearch] = useState('');

  const searchVal = externalSearch ?? internalSearch;
  const handleSearchChange = (v: string) => {
    if (onSearchChange) onSearchChange(v);
    else setInternalSearch(v);
  };

  const tabs = customTabs || DEFAULT_NAV_TABS;

  const activeTab = currentTab || tabs.find(tab =>
    pathname?.endsWith(tab.href) || (tab.href === '' && pathname === baseHref)
  )?.id || tabs[0]?.id || 'summary';

  const totalActiveFilters = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  const toggleFilter = (field: FilterField, value: string) => {
    if (!onFilterChange) return;
    const current = activeFilters[field] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange(field, next);
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
      <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 md:gap-3">
          {icon && (
            <div
              className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <div style={{ color: iconColor }}>{icon}</div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
            {description && (
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 mt-1 line-clamp-1">{description}</p>
            )}
          </div>
          {taskCounts && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{taskCounts.filtered}</span>
              {taskCounts.filtered !== taskCounts.total && (
                <span>of {taskCounts.total}</span>
              )}
              <span>items</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {showTabs && (
        <div className="border-b border-gray-200 dark:border-slate-700">
          <NavigationTabs tabs={tabs} baseHref={baseHref} activeTab={activeTab} />
        </div>
      )}

      {/* Controls Bar */}
      <div className="px-3 md:px-6 py-2 md:py-3 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 md:h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-8 md:pl-10 pr-8 text-xs md:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {searchVal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Filter */}
            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-1.5 md:gap-2 px-2 md:px-3 shrink-0',
                      totalActiveFilters > 0
                        ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : ''
                    )}
                    title="Filter"
                  >
                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Filter</span>
                    {totalActiveFilters > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                        {totalActiveFilters}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  {STATUS_OPTIONS.map(status => {
                    const isSelected = (activeFilters.status || []).includes(status);
                    return (
                      <DropdownMenuItem
                        key={status}
                        onClick={(e) => { e.preventDefault(); toggleFilter('status', status); }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', STATUS_COLORS[status])}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary-500" />}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  {PRIORITY_OPTIONS.map(priority => {
                    const isSelected = (activeFilters.priority || []).includes(priority);
                    return (
                      <DropdownMenuItem
                        key={priority}
                        onClick={(e) => { e.preventDefault(); toggleFilter('priority', priority); }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_COLORS[priority])}>
                            {priority}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary-500" />}
                      </DropdownMenuItem>
                    );
                  })}
                  {totalActiveFilters > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          onFilterChange?.('status', []);
                          onFilterChange?.('priority', []);
                        }}
                        className="text-red-600 dark:text-red-400 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5 mr-2" />
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Group By */}
            {showGroupBy && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-1.5 md:gap-2 px-2 md:px-3 shrink-0',
                      groupBy !== 'none'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : ''
                    )}
                    title="Group by"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">
                      {groupBy !== 'none' ? `By ${groupBy}` : 'Group'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {(['none', 'status', 'priority'] as GroupByField[]).map(field => (
                    <DropdownMenuItem
                      key={field}
                      onClick={() => onGroupByChange?.(field)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{field === 'none' ? 'No grouping' : field.charAt(0).toUpperCase() + field.slice(1)}</span>
                      {groupBy === field && <Check className="h-4 w-4 text-primary-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Insights */}
            {showInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={onInsightsToggle}
                className={cn(
                  'gap-1.5 md:gap-2 px-2 md:px-3 shrink-0',
                  insightsOpen
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50'
                )}
                title="AI Insights"
              >
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Insights</span>
              </Button>
            )}

            {/* View Settings */}
            {showViewSettings && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 md:gap-2 px-2 md:px-3 shrink-0"
                    title="View settings"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">
                      {viewMode === 'list' ? 'List' : viewMode === 'board' ? 'Board' : 'Compact'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {([
                    { id: 'list' as ViewMode, label: 'List View', icon: List },
                    { id: 'board' as ViewMode, label: 'Board View', icon: LayoutDashboard },
                    { id: 'compact' as ViewMode, label: 'Compact View', icon: BarChart3 },
                  ]).map(v => (
                    <DropdownMenuItem
                      key={v.id}
                      onClick={() => onViewChange?.(v.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <v.icon className="h-4 w-4" />
                        <span>{v.label}</span>
                      </div>
                      {viewMode === v.id && <Check className="h-4 w-4 text-primary-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {totalActiveFilters > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {Object.entries(activeFilters).map(([field, values]) =>
              values.map(value => (
                <Button
                  key={`${field}-${value}`}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFilter(field as FilterField, value)}
                  className="h-auto rounded-full border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 text-[11px] text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40"
                >
                  <span className="capitalize">{field}:</span> {value.replace('_', ' ')}
                  <X className="h-3 w-3 ml-0.5" />
                </Button>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFilterChange?.('status', []);
                onFilterChange?.('priority', []);
              }}
              className="h-auto text-[11px] text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-1 px-1 py-0.5"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
