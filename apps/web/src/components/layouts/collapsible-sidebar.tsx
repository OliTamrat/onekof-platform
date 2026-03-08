'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSidebarNavigation, type SidebarSection } from '@/lib/sidebar-navigation-dynamic';
import { useWorkspace } from '@/contexts/workspace-context';

interface CollapsibleSidebarProps {
  className?: string;
}

export function CollapsibleSidebar({ className }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const { currentOrganization } = useWorkspace();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'projects', // Projects expanded by default
  ]);

  // Get dynamic navigation based on organization type
  const sidebarNavigation = getSidebarNavigation(currentOrganization?.type);

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
    <nav className={cn('space-y-1 py-4', className)}>
      {sidebarNavigation.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        const hasSubItems = section.items.length > 0;
        const Icon = section.icon;
        const sectionActive = isSectionActive(section);

        return (
          <div key={section.id} className="px-3">
            {/* Section Header */}
            {hasSubItems ? (
              // Collapsible section
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  sectionActive
                    ? 'bg-[#0065FF]/10 text-[#0065FF] dark:bg-[#0065FF]/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.name}</span>
                {section.items.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                    {section.items.length}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </button>
            ) : (
              // Single link (no collapse)
              <Link
                href={section.href!}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(section.href!)
                    ? 'bg-[#0065FF]/10 text-[#0065FF] dark:bg-[#0065FF]/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{section.name}</span>
              </Link>
            )}

            {/* Sub-items (when expanded) */}
            {hasSubItems && isExpanded && (
              <div className="mt-1 space-y-1 pl-8">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-[#0065FF]/10 text-[#0065FF] font-medium dark:bg-[#0065FF]/20'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282E33] hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                      <span>{item.name}</span>
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
