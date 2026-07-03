'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  Filter,
  List,
  Plus,
  Power,
  PowerOff,
  Search,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface Automation {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isEnabled: boolean;
  entityType: string;
  triggerEvent: string;
  runMode: string;
  scope: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  aiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AutomationsListPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const TAB_ITEMS = [
    { id: 'summary', label: t('automations.title'), icon: BarChart3, href: '/dashboard/automations/summary' },
    { id: 'list', label: t('common.viewAll'), icon: List, href: '/dashboard/automations/list', active: true },
    { id: 'board', label: t('common.overview'), icon: null, href: '/dashboard/automations' },
    { id: 'code', label: 'Code', icon: Code, href: '/dashboard/automations/code' },
    { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/automations/forms' },
    { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/automations/timeline' },
    { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/automations/pages' },
  ];

  const { data: automationsData, isLoading } = useQuery({
    queryKey: ['automations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { automations: [] };
      const res = await fetch(`/api/automations?organizationId=${currentOrganization.id}`);
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
    enabled: !!currentOrganization?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });
      if (!res.ok) throw new Error('Failed to toggle automation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const automations = automationsData?.automations || [];

  const filteredAutomations = automations.filter((automation: Automation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      automation.name.toLowerCase().includes(query) ||
      automation.description?.toLowerCase().includes(query) ||
      automation.entityType.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (isEnabled: boolean) => {
    return isEnabled
      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      : 'bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/70';
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'ORGANIZATION':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'PROJECT':
        return 'text-blue-600 dark:text-blue-400';
      case 'PERSONAL':
        return 'text-primary-600 dark:text-primary-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <Zap className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('automations.title')}
              </h1>
            </div>

            <Link
              href="/dashboard/automations/create"
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t('common.create')}
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
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/70" />
              <input
                type="text"
                placeholder={t('automations.searchAutomations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <Button className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-white/[0.08] bg-gray-100 dark:bg-[#181D23] px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700">
              <Filter className="h-4 w-4" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Automations Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-white/70">{t('automations.loading')}</div>
            </div>
          ) : filteredAutomations.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Zap className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('automations.noAutomations')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                  {searchQuery ? t('automations.noAutomationsMatch') : t('automations.getStartedCreate')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-[#181D23]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colEntityType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colTrigger')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colScope')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colExecutions')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colSuccessRate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colStatus')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('automations.colActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#12161B] divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredAutomations.map((automation: Automation) => {
                    const successRate = automation.executionCount > 0
                      ? Math.round((automation.successCount / automation.executionCount) * 100)
                      : 0;

                    return (
                      <tr
                        key={automation.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#181D23] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded" style={{ backgroundColor: automation.color }}>
                              <Zap className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {automation.name}
                                {automation.aiGenerated && <Sparkles className="h-3 w-3 text-amber-500" />}
                              </div>
                              {automation.description && (
                                <div className="text-xs text-gray-500 dark:text-white/70 line-clamp-1">
                                  {automation.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-white/70">
                            {automation.entityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-white/70">
                            {automation.triggerEvent}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getScopeColor(automation.scope)}`}>
                            {automation.scope}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {automation.executionCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            successRate >= 90 ? 'text-green-600 dark:text-green-400' :
                            successRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {successRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(automation.isEnabled)}`}>
                            {automation.isEnabled ? t('automations.active') : t('automations.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => toggleMutation.mutate({ id: automation.id, isEnabled: automation.isEnabled })}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              automation.isEnabled
                                ? 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23]'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                            }`}
                            title={automation.isEnabled ? t('common.disable') : t('common.enable')}
                          >
                            {automation.isEnabled ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
