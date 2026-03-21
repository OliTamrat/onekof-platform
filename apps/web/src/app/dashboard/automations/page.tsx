'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import Link from 'next/link';
import {
  Plus,
  Search,
  Zap,
  Power,
  PowerOff,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Sparkles,
  List as List,
  LayoutTemplate,
  BarChart3,
  Play,
  History,
  Settings,
  Code,
  FileText,
  Book,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/automations/summary' },
  { id: 'list', label: 'List', icon: List, href: '/dashboard/automations/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/automations', active: true },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/automations/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/automations/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/automations/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/automations/pages' },
];

interface AutomationRule {
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
  lastExecutedAt?: string;
  avgExecutionMs?: number;
  estimatedSavedHours?: number;
  aiGenerated?: boolean;
  createdAt: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  entityType: string;
  triggerEvent: string;
  estimatedTimeSaved: number;
  popularity: number;
}

export default function AutomationsPage() {
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'enabled' | 'disabled' | 'ai'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'templates'>('list');
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationRule | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch automations
  const { data: automationsData, isLoading } = useQuery({
    queryKey: ['automations', currentOrganization?.id, selectedFilter],
    queryFn: async () => {
      if (!currentOrganization?.id) return { automations: [], statistics: {} };

      const params = new URLSearchParams({
        organizationId: currentOrganization.id,
      });

      if (selectedFilter === 'enabled') {
        params.append('isEnabled', 'true');
      } else if (selectedFilter === 'disabled') {
        params.append('isEnabled', 'false');
      }

      const res = await fetch(`/api/automations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
    enabled: !!currentOrganization?.id,
  });

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['automation-templates'],
    queryFn: async () => {
      const res = await fetch('/api/automations/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });

  // Toggle automation enabled/disabled
  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ automationId, isEnabled }: { automationId: string; isEnabled: boolean }) => {
      const res = await fetch(`/api/automations/${automationId}`, {
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

  // Delete automation
  const deleteAutomationMutation = useMutation({
    mutationFn: async (automationId: string) => {
      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete automation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  // Filter automations
  const filteredAutomations = automationsData?.automations?.filter((automation: AutomationRule) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      automation.name.toLowerCase().includes(query) ||
      automation.description?.toLowerCase().includes(query)
    );
  }) || [];

  const statistics = automationsData?.statistics || {
    total: 0,
    enabled: 0,
    disabled: 0,
    aiGenerated: 0,
    totalExecutions: 0,
    totalTimeSaved: 0,
  };

  const filters = [
    { value: 'all' as const, label: 'All', count: statistics.total },
    { value: 'enabled' as const, label: 'Active', count: statistics.enabled },
    { value: 'disabled' as const, label: 'Inactive', count: statistics.disabled },
    { value: 'ai' as const, label: 'AI Generated', count: statistics.aiGenerated },
  ];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Header Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-3 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Automation Hub</h1>
                <p className="text-xs text-gray-600 dark:text-slate-400">Automate workflows and boost productivity</p>
              </div>
            </div>

            <Link
              href="/dashboard/automations/create"
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Automation
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-3 md:px-6 overflow-x-auto">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 md:px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    selectedFilter === filter.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                  )}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 p-3 md:p-6 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          <StatsCard
            icon={Activity}
            label="Total Automations"
            value={statistics.total}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <StatsCard
            icon={TrendingUp}
            label="Total Executions"
            value={statistics.totalExecutions.toLocaleString()}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <StatsCard
            icon={Clock}
            label="Time Saved"
            value={`${statistics.totalTimeSaved}h`}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
          />
          <StatsCard
            icon={Sparkles}
            label="AI Generated"
            value={statistics.aiGenerated}
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10"
          />
        </div>

        {/* Automations Content */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-3 md:pb-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Loading automations...</p>
              </div>
            </div>
          ) : filteredAutomations.length > 0 ? (
            <div className="space-y-3">
              {filteredAutomations.map((automation: AutomationRule) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onClick={() => {
                    setSelectedAutomation(automation);
                    setIsDetailDialogOpen(true);
                  }}
                  onToggle={(id, isEnabled) => {
                    toggleAutomationMutation.mutate({ automationId: id, isEnabled });
                  }}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this automation?')) {
                      deleteAutomationMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
              <Zap className="h-12 w-12 text-gray-300 dark:text-slate-700" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No automations found
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Create your first automation to streamline your workflows
              </p>
              <Link
                href="/dashboard/automations/create"
                className="mt-4 flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Automation
              </Link>
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        {selectedAutomation && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl bg-[#22272B] border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded"
                    style={{ backgroundColor: selectedAutomation.color }}
                  >
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  {selectedAutomation.name}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                  <p className="text-sm text-slate-400">
                    {selectedAutomation.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Trigger</h3>
                    <p className="text-sm text-slate-400">{selectedAutomation.triggerEvent}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Entity Type</h3>
                    <p className="text-sm text-slate-400">{selectedAutomation.entityType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Executions</h3>
                    <p className="text-2xl font-bold text-white">{selectedAutomation.executionCount}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Success Rate</h3>
                    <p className="text-2xl font-bold text-green-500">
                      {selectedAutomation.executionCount > 0
                        ? Math.round((selectedAutomation.successCount / selectedAutomation.executionCount) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Avg Time</h3>
                    <p className="text-2xl font-bold text-white">
                      {selectedAutomation.avgExecutionMs ? `${selectedAutomation.avgExecutionMs.toFixed(0)}ms` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

// Stats Card Component
interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
  iconBg: string;
}

function StatsCard({ icon: Icon, label, value, iconColor, iconBg }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-slate-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Automation Card Component
interface AutomationCardProps {
  automation: AutomationRule;
  onClick: () => void;
  onToggle: (id: string, isEnabled: boolean) => void;
  onDelete: (id: string) => void;
}

function AutomationCard({ automation, onClick, onToggle, onDelete }: AutomationCardProps) {
  const successRate = automation.executionCount > 0
    ? Math.round((automation.successCount / automation.executionCount) * 100)
    : 0;

  return (
    <div
      className="group cursor-pointer rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-[#282E33]"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded shrink-0"
          style={{ backgroundColor: automation.color }}
        >
          <Zap className="h-5 w-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                {automation.name}
                {automation.aiGenerated && (
                  <Sparkles className="inline-block ml-2 h-3 w-3 text-amber-500" />
                )}
              </h3>
              {automation.description && (
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-1">
                  {automation.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {automation.executionCount} runs
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {successRate}% success
            </span>
            {automation.lastExecutedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(automation.lastExecutedAt).toLocaleDateString()}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400">
              {automation.entityType}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(automation.id, automation.isEnabled);
            }}
            className={cn(
              'flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors',
              automation.isEnabled
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                : 'bg-gray-200 dark:bg-[#282E33] text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
            )}
            title={automation.isEnabled ? 'Disable automation' : 'Enable automation'}
          >
            {automation.isEnabled ? (
              <>
                <Power className="h-3 w-3" />
                <span>Active</span>
              </>
            ) : (
              <>
                <PowerOff className="h-3 w-3" />
                <span>Inactive</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#282E33] border border-gray-200 dark:border-slate-700">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Navigate to execution history
                }}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(automation.id);
                }}
                className="text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
