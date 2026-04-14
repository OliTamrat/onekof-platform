'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSidebarNavigation, type SidebarSection } from '@/lib/sidebar-navigation-dynamic';
import { useWorkspace } from '@/contexts/workspace-context';
import { useLanguage } from '@/contexts/language-context';
import { useOrganizationSettings } from '@/contexts/organization-settings-context';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface CollapsibleSidebarProps {
  className?: string;
  collapsed?: boolean;
}

export function CollapsibleSidebar({ className, collapsed = false }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const { currentOrganization, projects } = useWorkspace();
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'projects', // Projects expanded by default
  ]);

  const router = useRouter();

  // Detect active project scope from URL
  const [scopedProjectId, setScopedProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('projectId');
    }
    return null;
  });
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const projectButtonRef = useRef<HTMLButtonElement>(null);
  const scopedProject = scopedProjectId ? projects.find(p => p.id === scopedProjectId) : null;

  useEffect(() => {
    if (isProjectSelectorOpen && projectButtonRef.current) {
      const rect = projectButtonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isProjectSelectorOpen]);

  const selectProject = (projectId: string | null) => {
    setScopedProjectId(projectId);
    setIsProjectSelectorOpen(false);
    // Navigate to dashboard with the filter
    if (projectId) {
      router.push(`/dashboard?projectId=${projectId}`);
    } else {
      router.push('/dashboard');
    }
  };

  // Try to get settings, but don't fail if context isn't available
  let settings;
  try {
    const settingsContext = useOrganizationSettings();
    settings = settingsContext.settings;
  } catch (error) {
    // Context not available, use undefined to show all sections
    settings = undefined;
  }

  // Get dynamic navigation based on organization type AND settings
  // If settings are undefined or not loaded, getSidebarNavigation will return all sections
  const sidebarNavigation = getSidebarNavigation((currentOrganization as unknown as Record<string, unknown> | null)?.type as string | undefined, settings);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const isSectionActive = (section: SidebarSection) => {
    if (section.href && isActive(section.href)) return true;
    return section.items.some((item) => isActive(item.href));
  };

  return (
    <nav className={cn('pt-1 pb-2', collapsed ? 'space-y-0' : 'space-y-0.5', className)}>
      {sidebarNavigation.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        const hasSubItems = section.items.length > 0;
        const Icon = section.icon;
        const sectionActive = isSectionActive(section);
        const label = section.nameKey ? t(section.nameKey) : section.name;

        // Collapsed mode: render icon-only button/link with native tooltip
        if (collapsed) {
          const activeClass = sectionActive
            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:bg-primary-500/20'
            : 'text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/[0.04]';

          if (!hasSubItems && section.href) {
            return (
              <div key={section.id} className="px-2 py-0.5">
                <Link
                  href={(() => {
                    if (!scopedProjectId || !section.href) return section.href!;
                    if (section.href.startsWith('/dashboard/')) {
                      const separator = section.href.includes('?') ? '&' : '?';
                      return `${section.href}${separator}projectId=${scopedProjectId}`;
                    }
                    return section.href;
                  })()}
                  title={label}
                  className={cn(
                    'flex w-full items-center justify-center rounded-md p-2 text-sm font-medium transition-colors',
                    activeClass
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </Link>
              </div>
            );
          }

          // Collapsible section in collapsed mode: toggle sub-items visibility
          return (
            <div key={section.id} className="px-2 py-0.5">
              <button
                onClick={() => toggleSection(section.id)}
                title={label}
                className={cn(
                  'flex w-full items-center justify-center rounded-md p-2 text-sm font-medium transition-colors',
                  activeClass
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
              </button>
            </div>
          );
        }

        // Expanded mode: full label rendering
        return (
          <div key={section.id} className="px-3">
            {/* Section Header */}
            {hasSubItems ? (
              // Collapsible section
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 h-auto px-3 py-2 text-sm font-medium justify-start',
                  sectionActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:bg-primary-500/20'
                    : 'text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {section.items.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-white/30 mr-1">
                    {section.items.length}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </Button>
            ) : (
              // Single link (no collapse)
              <Link
                href={(() => {
                  if (!scopedProjectId || !section.href) return section.href!;
                  if (section.href.startsWith('/dashboard/')) {
                    const separator = section.href.includes('?') ? '&' : '?';
                    return `${section.href}${separator}projectId=${scopedProjectId}`;
                  }
                  return section.href;
                })()}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(section.href!)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:bg-primary-500/20'
                    : 'text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
              </Link>
            )}

            {/* Sub-items (when expanded) */}
            {hasSubItems && isExpanded && (
              <div className="mt-1 space-y-1 pl-8">
                {/* Project Selector — replaces "All Projects" link in the projects section */}
                {section.id === 'projects' && projects.length > 0 && (
                  <div className="mb-1">
                    <button
                      ref={projectButtonRef}
                      onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                        scopedProjectId
                          ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium'
                          : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                      )}
                    >
                      {scopedProject ? (
                        <>
                          <span className="h-3 w-3 rounded shrink-0" style={{ backgroundColor: scopedProject.color || '#3B82F6' }} />
                          <span className="flex-1 text-left truncate">{scopedProject.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-left">{t('nav.allProjects')}</span>
                        </>
                      )}
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </button>
                    {isProjectSelectorOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsProjectSelectorOpen(false)} />
                        <div
                          className="fixed z-[101] w-64 max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] shadow-2xl"
                          style={{ top: dropdownPos.top, left: dropdownPos.left }}
                        >
                          <button
                            onClick={() => selectProject(null)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#181D23] transition-colors',
                              !scopedProjectId ? 'text-[#1C8C7D] font-medium' : 'text-slate-700 dark:text-white/85'
                            )}
                          >
                            {!scopedProjectId ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5" />}
                            <span>{t('nav.allProjects')}</span>
                          </button>
                          <div className="border-t border-slate-100 dark:border-white/[0.08]" />
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => selectProject(project.id)}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#181D23] transition-colors',
                                scopedProjectId === project.id ? 'text-[#1C8C7D] font-medium' : 'text-slate-700 dark:text-white/85'
                              )}
                            >
                              {scopedProjectId === project.id ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5" />}
                              <span
                                className="h-3.5 w-3.5 rounded shrink-0"
                                style={{ backgroundColor: project.color || '#3B82F6' }}
                              />
                              <span className="truncate">{project.name}</span>
                              <span className="ml-auto text-xs text-white/30">{project.key}</span>
                            </button>
                          ))}
                        </div>
                      </>,
                      document.body
                    )}
                  </div>
                )}

                {section.items.filter(item => !(section.id === 'projects' && item.href === '/dashboard/projects')).map((item) => {
                  const ItemIcon = item.icon;
                  // When a project is scoped, append ?projectId to dashboard page links
                  let scopedHref = item.href;
                  if (scopedProjectId && item.href.startsWith('/dashboard/')) {
                    const separator = item.href.includes('?') ? '&' : '?';
                    scopedHref = `${item.href}${separator}projectId=${scopedProjectId}`;
                  }
                  return (
                    <Link
                      key={item.href}
                      href={scopedHref}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium dark:bg-primary-500/20'
                          : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                      <span>{item.nameKey ? t(item.nameKey) : item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
