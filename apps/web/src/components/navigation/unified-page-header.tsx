'use client';

/**
 * Unified Page Header Component
 * Combines Navigation Tabs + Control Bar (Jira-style)
 * Used across all dashboard pages for consistency
 */

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
  ChevronDown,
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface UnifiedPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: React.ReactNode;
  iconColor?: string;
  currentTab?: string;
  baseHref?: string; // Base URL for tabs (e.g., '/dashboard/projects')
  showTabs?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showGroupBy?: boolean;
  showViewSettings?: boolean;
  showInsights?: boolean;
}

// Navigation tabs configuration
const NAV_TABS = [
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

// Responsive tab navigation — fits to screen width with overflow in "More" dropdown
function NavigationTabs({ tabs, baseHref, activeTab }: { tabs: typeof NAV_TABS; baseHref: string; activeTab: string }) {
  // Use ResizeObserver to determine how many tabs fit
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(tabs.length);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerWidth = container.offsetWidth - 100; // reserve space for "More" button
      const tabWidth = 110; // approximate width per tab
      const count = Math.max(3, Math.min(tabs.length, Math.floor(containerWidth / tabWidth)));
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
            <button
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-2.5 text-xs md:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap shrink-0',
                overflowTabs.some(tab => activeTab === tab.id)
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#282E33]'
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>More</span>
            </button>
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
  showTabs = true,
  showSearch = true,
  showFilters = true,
  showGroupBy = true,
  showViewSettings = true,
  showInsights = true,
}: UnifiedPageHeaderProps) {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('status');
  const [selectedView, setSelectedView] = useState('board');

  // Auto-detect current tab from pathname if not provided
  const activeTab = currentTab || NAV_TABS.find(tab =>
    pathname?.endsWith(tab.href) || (tab.href === '' && pathname === baseHref)
  )?.id || 'summary';

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
        </div>
      </div>

      {/* Navigation Tabs */}
      {showTabs && (
        <div className="border-b border-gray-200 dark:border-slate-700">
          <NavigationTabs tabs={NAV_TABS} baseHref={baseHref} activeTab={activeTab} />
        </div>

      )}

      {/* Controls Bar - Spread on Desktop, Compact on Mobile */}
      <div className="px-3 md:px-6 py-2 md:py-3 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          {/* Search - Full width on mobile, constrained on desktop */}
          {showSearch && (
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-8 md:h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-8 md:pl-10 pr-3 text-xs md:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Right side controls group */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Filter - Icon only on mobile, full on desktop */}
            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 md:gap-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors shrink-0"
                    title="Filter"
                  >
                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Filter</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem>By Status</DropdownMenuItem>
                  <DropdownMenuItem>By Priority</DropdownMenuItem>
                  <DropdownMenuItem>By Assignee</DropdownMenuItem>
                  <DropdownMenuItem>By Project</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Group By - Icon only on mobile, full on desktop */}
            {showGroupBy && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 md:gap-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors shrink-0"
                    title="Group by"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Group</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedGroupBy('status')}>
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedGroupBy('priority')}>
                    Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedGroupBy('assignee')}>
                    Assignee
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedGroupBy('project')}>
                    Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Insights - Icon only on mobile, full on desktop */}
            {showInsights && (
              <button
                className="flex items-center gap-1.5 md:gap-2 rounded-md border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors shrink-0"
                title="AI Insights"
              >
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Insights</span>
              </button>
            )}

            {/* View Settings - Icon only on mobile, full on desktop */}
            {showViewSettings && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 md:gap-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors shrink-0"
                    title="View settings"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">View</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setSelectedView('board')}>
                    Board View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedView('list')}>
                    List View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedView('calendar')}>
                    Calendar View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
