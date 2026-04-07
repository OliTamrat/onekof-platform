'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast-provider';
import { useWorkspace } from '@/contexts/workspace-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Zap,
  Clock,
  CheckCircle2,
  Star,
  Filter,
  Sparkles,
  List as List,
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
import { useLanguage } from '@/contexts/language-context';

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
  Sparkles,
  Zap,
};

export default function TemplatesPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const { currentOrganization } = useWorkspace();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [templateToActivate, setTemplateToActivate] = useState<AutomationTemplate | null>(null);
  const queryClient = useQueryClient();

  const TAB_ITEMS = [
    { id: 'list', label: t('automations.templatesAllAutomations'), icon: List, href: '/dashboard/automations' },
    { id: 'templates', label: t('automations.templatesTabTemplates'), icon: LayoutTemplate, href: '/dashboard/automations/templates' },
    { id: 'analytics', label: t('automations.templatesTabAnalytics'), icon: BarChart3, href: '/dashboard/automations/analytics' },
    { id: 'code', label: 'Code', icon: Code, href: '/dashboard/automations/code' },
    { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/automations/forms' },
    { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/automations/pages' },
  ];

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

  const activateTemplateMutation = useMutation({
    mutationFn: async (template: AutomationTemplate) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

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
        throw new Error(error.error || 'Failed to activate template');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      setIsDetailDialogOpen(false);
      setIsConfirmDialogOpen(false);
      setSelectedTemplate(null);
      setTemplateToActivate(null);
      router.push('/dashboard/automations');
    },
    onError: (error: Error) => {
      toast.error('Activation failed', error.message);
    },
  });

  const filteredTemplates = templatesData?.templates?.filter((template: AutomationTemplate) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  }) || [];

  const categories = [t('common.all'), ...(templatesData?.categories || [])];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Header Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('automations.templatesTitle')}</h1>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {t('automations.templatesSubtitle')}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/automations"
              className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-slate-700 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <List className="h-4 w-4" />
              {t('automations.templatesViewMy')}
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder={t('automations.templatesSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              {categories.map((category, idx) => {
                const isAll = idx === 0;
                const key = isAll ? 'all' : category;
                return (
                  <Button
                    key={key}
                    onClick={() => setSelectedCategory(isAll ? 'all' : category)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize',
                      selectedCategory === (isAll ? 'all' : category)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                    )}
                  >
                    {category}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Templates Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{t('automations.templatesLoadingTemplates')}</p>
              </div>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template: AutomationTemplate) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  activateLabel={t('automations.templatesActivate')}
                  popularityLabel={t('automations.templatesPopularity')}
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
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
              <LayoutTemplate className="h-12 w-12 text-gray-300 dark:text-slate-700" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                {t('automations.templatesNoTemplates')}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {t('automations.templatesNoTemplatesDesc')}
              </p>
            </div>
          )}
        </div>

        {/* Template Detail Dialog */}
        {selectedTemplate && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl bg-[#22272B] border-slate-700 text-white">
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
                    <p className="text-xs text-slate-400">{selectedTemplate.category}</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400">
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-slate-700 p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-semibold text-white">{t('automations.templatesPopularity')}</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedTemplate.popularity}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <h3 className="text-xs font-semibold text-white">{t('automations.templatesTimeSaved')}</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedTemplate.estimatedTimeSaved}h/week</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-3 bg-[#1B1F23]">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <h3 className="text-xs font-semibold text-white">{t('automations.templatesRunMode')}</h3>
                    </div>
                    <p className="text-sm font-medium text-white capitalize">{selectedTemplate.runMode}</p>
                  </div>
                </div>

                {/* Trigger */}
                <div className="rounded-lg border border-slate-700 p-4 bg-[#1B1F23]">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                    {t('automations.templatesWhen')}
                  </h3>
                  <div className="ml-8">
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-white">{selectedTemplate.entityType}</span>
                      {' → '}
                      <span className="font-medium text-white">{selectedTemplate.triggerEvent}</span>
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                {selectedTemplate.conditions && selectedTemplate.conditions.length > 0 && (
                  <div className="rounded-lg border border-slate-700 p-4 bg-[#1B1F23]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">2</span>
                      {t('automations.templatesIf')}
                    </h3>
                    <div className="ml-8 space-y-2">
                      {selectedTemplate.conditions.map((condition: any, index: number) => (
                        <p key={index} className="text-sm text-slate-400">
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
                  <div className="rounded-lg border border-slate-700 p-4 bg-[#1B1F23]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">3</span>
                      {t('automations.templatesThen')}
                    </h3>
                    <div className="ml-8 space-y-2">
                      {selectedTemplate.actions.map((action: any, index: number) => (
                        <p key={index} className="text-sm text-slate-400">
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
                  className="bg-[#282E33] border-slate-700 text-white hover:bg-slate-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    setTemplateToActivate(selectedTemplate);
                    setIsConfirmDialogOpen(true);
                  }}
                  disabled={activateTemplateMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {t('automations.templatesActivateTemplate')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        {templateToActivate && (
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent className="max-w-md bg-[#22272B] border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  {t('automations.templatesActivateConfirmTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400">
                  {t('automations.templatesActivateConfirmDesc').replace('{name}', templateToActivate.name)}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-4">
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
                      <p className="text-xs text-slate-400 mb-2">{templateToActivate.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
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
                  className="bg-[#282E33] border-slate-700 text-white hover:bg-slate-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    if (templateToActivate) {
                      activateTemplateMutation.mutate(templateToActivate);
                    }
                  }}
                  disabled={activateTemplateMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {activateTemplateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {t('automations.templatesActivating')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('automations.templatesYesActivate')}
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
  activateLabel: string;
  popularityLabel: string;
  onClick: () => void;
  onActivate: (template: AutomationTemplate) => void;
}

function TemplateCard({ template, activateLabel, onClick, onActivate }: TemplateCardProps) {
  const IconComponent = ICON_MAP[template.icon] || Zap;

  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] transition-all hover:border-primary-500 hover:shadow-lg">
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">
              {template.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">{template.category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-2 text-xs text-gray-600 dark:text-slate-400">
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
      <div className="border-t border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-50 dark:bg-[#1B1F23]">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onActivate(template);
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          {activateLabel}
        </Button>
      </div>
    </div>
  );
}
