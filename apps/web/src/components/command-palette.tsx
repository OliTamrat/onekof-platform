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
  Loader2,
  User,
  Bug,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

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
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = React.useState<{ issues: any[]; projects: any[]; members: any[]; teams: any[]; goals: any[]; documents: any[] }>({ issues: [], projects: [], members: [], teams: [], goals: [], documents: [] });
  const [isSearching, setIsSearching] = React.useState(false);
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!query || query.trim().length < 2) {
      setSearchResults({ issues: [], projects: [], members: [], teams: [], goals: [], documents: [] });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    let cancelled = false;
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {}
      if (!cancelled) setIsSearching(false);
    }, 400);
    return () => {
      cancelled = true;
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query]);

  const issueTypeIcon = (type: string) => {
    if (type === 'BUG') return Bug;
    if (type === 'EPIC') return Target;
    return CheckSquare;
  };

  const searchIssueItems: CommandItem[] = searchResults.issues.map((issue: any) => ({
    id: `search-issue-${issue.id}`,
    label: `${issue.key}: ${issue.title}`,
    description: `${issue.project?.name || ''} · ${issue.type} · ${issue.status}`,
    icon: issueTypeIcon(issue.type),
    action: () => router.push(`/projects/${issue.project?.id}/board?issue=${issue.id}`),
    category: 'search-issue' as any,
    keywords: [],
  }));

  const searchProjectItems: CommandItem[] = searchResults.projects.map((project: any) => ({
    id: `search-project-${project.id}`,
    label: project.name,
    description: `${project.key} · ${project._count?.tasks || 0} issues`,
    icon: FolderKanban,
    action: () => router.push(`/projects/${project.id}`),
    category: 'search-project' as any,
    keywords: [],
  }));

  const searchMemberItems: CommandItem[] = searchResults.members.map((member: any) => ({
    id: `search-member-${member.id}`,
    label: member.name || member.email,
    description: `${member.email} · ${member.role}`,
    icon: User,
    action: () => router.push(`/dashboard/members`),
    category: 'search-member' as any,
    keywords: [],
  }));

  const searchTeamItems: CommandItem[] = (searchResults.teams || []).map((team: any) => ({
    id: `search-team-${team.id}`,
    label: team.name,
    description: `${team.memberCount || 0} members${team.description ? ' · ' + team.description.slice(0, 50) : ''}`,
    icon: Users,
    action: () => router.push(`/dashboard/teams`),
    category: 'search-team' as any,
    keywords: [],
  }));

  const searchGoalItems: CommandItem[] = (searchResults.goals || []).map((goal: any) => ({
    id: `search-goal-${goal.id}`,
    label: goal.title,
    description: `${goal.status || 'Active'}${goal.progress ? ' · ' + goal.progress + '%' : ''}`,
    icon: Target,
    action: () => router.push(`/dashboard/goals`),
    category: 'search-goal' as any,
    keywords: [],
  }));

  const searchDocItems: CommandItem[] = (searchResults.documents || []).map((doc: any) => ({
    id: `search-doc-${doc.id}`,
    label: doc.fileName,
    description: doc.fileType || 'Document',
    icon: FileText,
    action: () => router.push(`/dashboard/documents`),
    category: 'search-doc' as any,
    keywords: [],
  }));

  // Navigation commands
  const navigationItems: CommandItem[] = [
    { id: 'nav-home', label: t('nav.home'), description: t('dashboard.title'), icon: Home, action: () => router.push('/dashboard'), category: 'navigation', keywords: ['dashboard', 'main'] },
    { id: 'nav-projects', label: t('nav.projects'), description: t('nav.allProjects'), icon: FolderKanban, action: () => router.push('/dashboard/projects'), category: 'navigation', keywords: ['project', 'list'] },
    { id: 'nav-issues', label: t('nav.issues'), description: t('nav.issues'), icon: ListChecks, action: () => router.push('/dashboard/issues'), category: 'navigation', keywords: ['task', 'bug', 'ticket'] },
    { id: 'nav-budget', label: t('nav.budget'), description: t('budget.title'), icon: BarChart3, action: () => router.push('/dashboard/budget'), category: 'navigation', keywords: ['money', 'finance', 'expense'] },
    { id: 'nav-documents', label: t('nav.aiDocuments'), description: t('nav.aiDocuments'), icon: Sparkles, action: () => router.push('/dashboard/documents'), category: 'navigation', keywords: ['doc', 'file', 'upload'] },
    { id: 'nav-teams', label: t('nav.teams'), description: t('teams.title'), icon: Users, action: () => router.push('/dashboard/teams'), category: 'navigation', keywords: ['member', 'people', 'group'] },
    { id: 'nav-goals', label: t('nav.goals'), description: t('goals.title'), icon: Target, action: () => router.push('/dashboard/goals'), category: 'navigation', keywords: ['okr', 'objective', 'key result'] },
    { id: 'nav-automations', label: t('nav.automation'), description: t('nav.automation'), icon: Zap, action: () => router.push('/dashboard/automations'), category: 'navigation', keywords: ['workflow', 'rule', 'trigger'] },
    { id: 'nav-docs', label: t('nav.docs'), description: t('nav.docs'), icon: BookOpen, action: () => router.push('/dashboard/docs'), category: 'navigation', keywords: ['wiki', 'knowledge', 'documentation'] },
    { id: 'nav-calendar', label: t('nav.calendar'), description: t('nav.calendar'), icon: Calendar, action: () => router.push('/dashboard/calendar'), category: 'navigation', keywords: ['schedule', 'event', 'date'] },
    { id: 'nav-starred', label: t('nav.starred'), description: t('nav.starred'), icon: Star, action: () => router.push('/dashboard/starred'), category: 'navigation', keywords: ['favorite', 'bookmark'] },
    { id: 'nav-settings', label: t('nav.settings'), description: t('settings.title'), icon: Settings, action: () => router.push('/dashboard/settings'), category: 'navigation', keywords: ['preference', 'config', 'account'] },
  ];

  // Action commands
  const actionItems: CommandItem[] = [
    { id: 'action-new-issue', label: t('nav.createIssue'), description: t('nav.createIssue'), icon: Plus, action: () => { router.push('/dashboard/issues?create=true'); }, category: 'action', keywords: ['new', 'task', 'bug', 'create'] },
    { id: 'action-new-project', label: t('nav.createProject'), description: t('nav.createProject'), icon: Plus, action: () => { router.push('/dashboard/projects?create=true'); }, category: 'action', keywords: ['new', 'project', 'create'] },
    { id: 'action-new-doc', label: t('nav.uploadDocument'), description: t('nav.uploadDocument'), icon: FileText, action: () => { router.push('/dashboard/documents?upload=true'); }, category: 'action', keywords: ['new', 'upload', 'document', 'ai'] },
  ];

  // Project commands
  const projectItems: CommandItem[] = (projects || []).map((project) => ({
    id: `project-${project.id}`,
    label: project.name,
    description: `${project.key} · ${project.template}`,
    icon: FolderKanban,
    action: () => router.push(`/projects/${project.id}`),
    category: 'project' as const,
    keywords: [project.key.toLowerCase(), project.name.toLowerCase()],
  }));

  const hasSearchResults = searchIssueItems.length > 0 || searchProjectItems.length > 0 || searchMemberItems.length > 0 || searchTeamItems.length > 0 || searchGoalItems.length > 0 || searchDocItems.length > 0;
  const allItems = [
    ...searchIssueItems,
    ...searchProjectItems,
    ...searchMemberItems,
    ...searchTeamItems,
    ...searchGoalItems,
    ...searchDocItems,
    ...(hasSearchResults ? [] : actionItems),
    ...navigationItems,
    ...(hasSearchResults ? [] : projectItems),
  ];

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
    'search-issue': 'Issues',
    'search-project': 'Projects',
    'search-member': 'Members',
    'search-team': 'Teams',
    'search-goal': 'Goals',
    'search-doc': 'Documents',
    action: t('commandPalette.actions'),
    navigation: t('commandPalette.navigation'),
    project: t('nav.projects'),
    recent: t('commandPalette.recent'),
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
              placeholder={t('nav.searchPlaceholder')}
              className="h-14 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
            <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto px-2 py-2">
            {isSearching && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}
            {!isSearching && flatItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {query.trim().length >= 2 ? 'No results found' : t('common.noResults')}
              </div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => {
                const order = ['search-issue', 'search-project', 'search-member', 'search-team', 'search-goal', 'search-doc', 'action', 'navigation', 'project', 'recent'];
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
                        <Button
                          key={item.id}
                          variant="ghost"
                          data-selected={isSelected}
                          className={cn(
                            'flex w-full h-auto items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            isSelected
                              ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-300'
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
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
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
                            <CornerDownLeft className="h-4 w-4 shrink-0 text-primary-500" />
                          )}
                        </Button>
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
                {t('commandPalette.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                {t('commandPalette.select')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 text-[10px] dark:border-slate-600 dark:bg-slate-800">ESC</kbd>
                {t('common.close')}
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
