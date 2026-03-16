'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  Search,
  Home,
  FolderKanban,
  ListChecks,
  BarChart3,
  Sparkles,
  Users,
  Target,
  Zap,
  BookOpen,
  Star,
  Calendar,
  Settings,
  Plus,
  FileText,
  ArrowRight,
  Hash,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'navigation' | 'project' | 'action' | 'recent';
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const { projects, currentOrganization } = useWorkspace();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Navigation commands
  const navigationItems: CommandItem[] = [
    { id: 'nav-home', label: 'Home', description: 'Go to dashboard', icon: Home, action: () => router.push('/dashboard'), category: 'navigation', keywords: ['dashboard', 'main'] },
    { id: 'nav-projects', label: 'Projects', description: 'View all projects', icon: FolderKanban, action: () => router.push('/dashboard/projects'), category: 'navigation', keywords: ['project', 'list'] },
    { id: 'nav-issues', label: 'Issues', description: 'View all issues', icon: ListChecks, action: () => router.push('/dashboard/issues'), category: 'navigation', keywords: ['task', 'bug', 'ticket'] },
    { id: 'nav-budget', label: 'Budget', description: 'Financial overview', icon: BarChart3, action: () => router.push('/dashboard/budget'), category: 'navigation', keywords: ['money', 'finance', 'expense'] },
    { id: 'nav-documents', label: 'AI Documents', description: 'Document processing', icon: Sparkles, action: () => router.push('/dashboard/documents'), category: 'navigation', keywords: ['doc', 'file', 'upload'] },
    { id: 'nav-teams', label: 'Teams', description: 'Team management', icon: Users, action: () => router.push('/dashboard/teams'), category: 'navigation', keywords: ['member', 'people', 'group'] },
    { id: 'nav-goals', label: 'Goals', description: 'OKRs and objectives', icon: Target, action: () => router.push('/dashboard/goals'), category: 'navigation', keywords: ['okr', 'objective', 'key result'] },
    { id: 'nav-automations', label: 'Automations', description: 'Workflow rules', icon: Zap, action: () => router.push('/dashboard/automations'), category: 'navigation', keywords: ['workflow', 'rule', 'trigger'] },
    { id: 'nav-docs', label: 'Docs & Wiki', description: 'Knowledge base', icon: BookOpen, action: () => router.push('/dashboard/docs'), category: 'navigation', keywords: ['wiki', 'knowledge', 'documentation'] },
    { id: 'nav-calendar', label: 'Calendar', description: 'Schedule and events', icon: Calendar, action: () => router.push('/dashboard/calendar'), category: 'navigation', keywords: ['schedule', 'event', 'date'] },
    { id: 'nav-starred', label: 'Starred', description: 'Favorited items', icon: Star, action: () => router.push('/dashboard/starred'), category: 'navigation', keywords: ['favorite', 'bookmark'] },
    { id: 'nav-settings', label: 'Settings', description: 'Account settings', icon: Settings, action: () => router.push('/settings'), category: 'navigation', keywords: ['preference', 'config', 'account'] },
  ];

  // Action commands
  const actionItems: CommandItem[] = [
    { id: 'action-new-issue', label: 'Create Issue', description: 'Create a new task or bug', icon: Plus, action: () => { router.push('/dashboard/issues?create=true'); }, category: 'action', keywords: ['new', 'task', 'bug', 'create'] },
    { id: 'action-new-project', label: 'Create Project', description: 'Start a new project', icon: Plus, action: () => { router.push('/dashboard/projects?create=true'); }, category: 'action', keywords: ['new', 'project', 'create'] },
    { id: 'action-new-doc', label: 'Upload Document', description: 'Process with AI', icon: FileText, action: () => { router.push('/dashboard/documents?upload=true'); }, category: 'action', keywords: ['new', 'upload', 'document', 'ai'] },
  ];

  // Project commands
  const projectItems: CommandItem[] = (projects || []).map((project) => ({
    id: `project-${project.id}`,
    label: project.name,
    description: `${project.key} · ${project.template}`,
    icon: FolderKanban,
    action: () => router.push(`/dashboard/project/${project.id}`),
    category: 'project' as const,
    keywords: [project.key.toLowerCase(), project.name.toLowerCase()],
  }));

  const allItems = [...actionItems, ...navigationItems, ...projectItems];

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return allItems;
    const lowerQuery = query.toLowerCase();
    return allItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(lowerQuery);
      const matchDescription = item.description?.toLowerCase().includes(lowerQuery);
      const matchKeywords = item.keywords?.some((k) => k.includes(lowerQuery));
      return matchLabel || matchDescription || matchKeywords;
    });
  }, [query, allItems]);

  // Group filtered items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const flatItems = React.useMemo(() => {
    const result: CommandItem[] = [];
    const order: string[] = ['action', 'navigation', 'project', 'recent'];
    for (const cat of order) {
      if (groupedItems[cat]) result.push(...groupedItems[cat]);
    }
    return result;
  }, [groupedItems]);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        flatItems[selectedIndex].action();
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    action: 'Actions',
    navigation: 'Navigation',
    project: 'Projects',
    recent: 'Recent',
  };

  if (!isOpen) return null;

  let itemIndex = -1;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center pt-[15vh]">
        <div
          className="w-full max-w-[640px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1D2125]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or jump to..."
              className="h-14 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
            <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto px-2 py-2">
            {flatItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => {
                const order = ['action', 'navigation', 'project', 'recent'];
                if (!order.includes(category)) return null;
                return (
                  <div key={category} className="mb-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {categoryLabels[category] || category}
                    </div>
                    {items.map((item) => {
                      itemIndex++;
                      const currentIndex = itemIndex;
                      const isSelected = currentIndex === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          data-selected={isSelected}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            isSelected
                              ? 'bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          )}
                          onClick={() => {
                            item.action();
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                              isSelected
                                ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate text-sm font-medium">{item.label}</div>
                            {item.description && (
                              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="h-4 w-4 shrink-0 text-teal-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 dark:border-slate-700">
            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 text-[10px] dark:border-slate-600 dark:bg-slate-800">ESC</kbd>
                Close
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {flatItems.length} result{flatItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
