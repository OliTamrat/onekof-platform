'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Filter,
  Sparkles,
  List as ListIcon,
  LayoutTemplate,
  BarChart3,
  Code,
  FileText,
  Book,
  UserPlus,
  Bell,
  AlertTriangle,
  Target,
  Users,
  Calendar,
  DollarSign,
  Archive,
  MessageSquare
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'list', label: 'All Automations', icon: ListIcon, href: '/dashboard/automations' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, href: '/dashboard/automations/templates' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/automations/analytics' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/automations/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/automations/forms' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/automations/pages' },
] as const;

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  entityType: string;
  triggerEvent: string;
  scope: string;
  runMode: string;
  conditions: any[];
  actions: any[];
  estimatedTimeSaved: number;
  popularity: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Target,
  Users,
  Calendar,
  DollarSign,
  Archive,
  MessageSquare,
  Zap,
};

export default function TemplatesPage() {
  const { currentOrganization } = useWorkspace();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [templateToActivate, setTemplateToActivate] = useState<AutomationTemplate | null>(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['automation-templates', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/automations/templates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });

  // Activate template mutation
  const activateTemplateMutation = useMutation({
    mutationFn: async (template: AutomationTemplate) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      console.log('Activating template:', template.name, 'for org:', currentOrganization.id);

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganization.id,
          name: template.name,
          description: template.description,
          icon: template.icon,
          color: template.color,
          scope: template.scope,
          entityType: template.entityType,
          triggerEvent: template.triggerEvent,
          runMode: template.runMode,
          conditions: template.conditions,
          actions: template.actions,
          isEnabled: true,
          isTemplate: false,
          templateId: template.id,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to activate template' }));
        console.error('Activation error:', error);
        throw new Error(error.error || 'Failed to activate template');
      }

      const result = await res.json();
      console.log('Template activated successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Activation successful, redirecting...');
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      setIsDetailDialogOpen(false);
      setIsConfirmDialogOpen(false);
      setSelectedTemplate(null);
      setTemplateToActivate(null);
      // Redirect to automations page to see the new automation
      router.push('/dashboard/automations');
    },
    onError: (error: Error) => {
      console.error('Failed to activate template:', error.message);
      alert(`Failed to activate template: ${error.message}`);
    },
  });

  // Filter templates
  const filteredTemplates = templatesData?.templates?.filter((template: AutomationTemplate) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  }) || [];

  const categories = ['all', ...(templatesData?.categories || [])];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Header Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Automation Templates</h1>
                <p className="text-xs text-gray-600 dark:text-[#9FADBC]">
                  Pre-built automations ready to activate
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/automations"
              className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-[#2C333A] px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2C333A] transition-colors"
            >
              <ListIcon className="h-4 w-4" />
              View My Automations
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.id === 'templates'
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

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#9FADBC]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-[#9FADBC]" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize',
                    selectedCategory === category
                      ? 'bg-[#0065FF] text-white'
                      : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC] hover:bg-gray-300 dark:hover:bg-[#2C333A]'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0065FF] border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template: AutomationTemplate) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsDetailDialogOpen(true);
                  }}
                  onActivate={(tmpl) => {
                    setTemplateToActivate(tmpl);
                    setIsConfirmDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-[#2C333A]">
              <LayoutTemplate className="h-12 w-12 text-gray-300 dark:text-[#2C333A]" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No templates found
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-[#9FADBC]">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Template Detail Dialog */}
        {selectedTemplate && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl bg-[#22272B] border-[#2C333A] text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: selectedTemplate.color }}
                  >
                    {ICON_MAP[selectedTemplate.icon] ? (
                      React.createElement(ICON_MAP[selectedTemplate.icon], {
                        className: 'h-6 w-6 text-white',
                      })
                    ) : (
                      <Zap className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                    <p className="text-xs text-[#9FADBC]">{selectedTemplate.category}</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-sm text-[#9FADBC]">
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-[#2C333A] p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-semibold text-white">Popularity</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedTemplate.popularity}%</p>
                  </div>
                  <div className="rounded-lg border border-[#2C333A] p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <h3 className="text-xs font-semibold text-white">Time Saved</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedTemplate.estimatedTimeSaved}h/week</p>
                  </div>
                  <div className="rounded-lg border border-[#2C333A] p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <h3 className="text-xs font-semibold text-white">Run Mode</h3>
                    </div>
                    <p className="text-sm font-medium text-white capitalize">{selectedTemplate.runMode}</p>
                  </div>
                </div>

                {/* Trigger */}
                <div className="rounded-lg border border-[#2C333A] p-4 bg-[#1B1F23]">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                      1
                    </span>
                    When: Trigger Event
                  </h3>
                  <div className="ml-8">
                    <p className="text-sm text-[#9FADBC]">
                      <span className="font-medium text-white">{selectedTemplate.entityType}</span>
                      {' → '}
                      <span className="font-medium text-white">{selectedTemplate.triggerEvent}</span>
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                {selectedTemplate.conditions && selectedTemplate.conditions.length > 0 && (
                  <div className="rounded-lg border border-[#2C333A] p-4 bg-[#1B1F23]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                        2
                      </span>
                      If: Conditions
                    </h3>
                    <div className="ml-8 space-y-2">
                      {selectedTemplate.conditions.map((condition: any, index: number) => (
                        <p key={index} className="text-sm text-[#9FADBC]">
                          {condition.field}{' '}
                          <span className="font-medium text-white">{condition.operator}</span>{' '}
                          {condition.value !== null && <span className="font-medium text-white">{condition.value}</span>}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedTemplate.actions && selectedTemplate.actions.length > 0 && (
                  <div className="rounded-lg border border-[#2C333A] p-4 bg-[#1B1F23]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                        3
                      </span>
                      Then: Actions
                    </h3>
                    <div className="ml-8 space-y-2">
                      {selectedTemplate.actions.map((action: any, index: number) => (
                        <p key={index} className="text-sm text-[#9FADBC]">
                          <span className="font-medium text-white capitalize">{action.type.replace(/_/g, ' ')}</span>
                          {action.params && Object.keys(action.params).length > 0 && (
                            <span className="text-xs ml-2">
                              ({Object.entries(action.params).map(([key, val]) => `${key}: ${val}`).join(', ')})
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="bg-[#282E33] border-[#2C333A] text-white hover:bg-[#2C333A]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setTemplateToActivate(selectedTemplate);
                    setIsConfirmDialogOpen(true);
                  }}
                  disabled={activateTemplateMutation.isPending}
                  className="bg-[#0065FF] hover:bg-[#0052CC] text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Activate Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        {templateToActivate && (
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent className="max-w-md bg-[#22272B] border-[#2C333A] text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  Activate Automation?
                </DialogTitle>
                <DialogDescription className="text-sm text-[#9FADBC]">
                  Are you sure you want to activate "{templateToActivate.name}"? This automation will start running immediately.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="rounded-lg border border-[#2C333A] bg-[#1B1F23] p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: templateToActivate.color }}
                    >
                      {ICON_MAP[templateToActivate.icon] ? (
                        React.createElement(ICON_MAP[templateToActivate.icon], {
                          className: 'h-5 w-5 text-white',
                        })
                      ) : (
                        <Zap className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">{templateToActivate.name}</h4>
                      <p className="text-xs text-[#9FADBC] mb-2">{templateToActivate.description}</p>
                      <div className="flex items-center gap-3 text-xs text-[#9FADBC]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-green-500" />
                          {templateToActivate.estimatedTimeSaved}h saved/week
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          {templateToActivate.popularity}% popular
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsConfirmDialogOpen(false);
                    setTemplateToActivate(null);
                  }}
                  disabled={activateTemplateMutation.isPending}
                  className="bg-[#282E33] border-[#2C333A] text-white hover:bg-[#2C333A]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (templateToActivate) {
                      activateTemplateMutation.mutate(templateToActivate);
                    }
                  }}
                  disabled={activateTemplateMutation.isPending}
                  className="bg-[#0065FF] hover:bg-[#0052CC] text-white"
                >
                  {activateTemplateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Yes, Activate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: AutomationTemplate;
  onClick: () => void;
  onActivate: (template: AutomationTemplate) => void;
}

function TemplateCard({ template, onClick, onActivate }: TemplateCardProps) {
  const IconComponent = ICON_MAP[template.icon] || Zap;

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] transition-all hover:border-[#0065FF] hover:shadow-lg"
    >
      <div className="p-3" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: template.color }}
          >
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#0065FF] transition-colors line-clamp-1">
              {template.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-[#9FADBC]">{template.category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-[#9FADBC] line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-2 text-xs text-gray-600 dark:text-[#9FADBC]">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            <span>{template.popularity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span>{template.estimatedTimeSaved}h/wk</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="border-t border-gray-200 dark:border-[#2C333A] px-3 py-2 bg-gray-50 dark:bg-[#1B1F23]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActivate(template);
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#0065FF] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0052CC] transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          Activate
        </button>
      </div>
    </div>
  );
}
