'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Search,
  Target,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Users,
  Flag,
  Folder,
  X,
  Link2,
  Settings,
  BarChart3,
  Code,
  FileText,
  Clock,
  Book,
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { DateRangePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
] as const;

// Types
interface Goal {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number;
  startDate?: string;
  dueDate?: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  team?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

interface KeyResult {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
}

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [contributionWeight, setContributionWeight] = useState(100);
  const [isAddingKeyResult, setIsAddingKeyResult] = useState(false);
  const [keyResultForm, setKeyResultForm] = useState({
    description: '',
    unit: '',
    target: '',
    current: '0',
  });
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalType: 'TEAM' as 'COMPANY' | 'TEAM' | 'INDIVIDUAL',
    priority: 'MEDIUM' as Goal['priority'],
    startDate: '',
    dueDate: '',
    ownerId: '',
    teamId: '',
    parentGoalId: '',
    icon: 'Target',
    color: '#0065FF',
  });

  // Fetch data for form
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [orgTeams, setOrgTeams] = useState<any[]>([]);
  const [parentGoals, setParentGoals] = useState<Goal[]>([]);

  // Fetch goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals', selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
  });

  // Fetch organization data when create modal opens
  useEffect(() => {
    if (isCreateDialogOpen && goalsData?.organizationId) {
      // Fetch organization members
      fetch(`/api/organizations/${goalsData.organizationId}/members`)
        .then(res => res.json())
        .then(data => setOrgMembers(data.members || []))
        .catch(err => console.error('Failed to fetch members:', err));

      // Fetch organization teams
      fetch(`/api/teams`)
        .then(res => res.json())
        .then(data => setOrgTeams(data.teams || []))
        .catch(err => console.error('Failed to fetch teams:', err));

      // Set available goals for parent selection (exclude completed/cancelled)
      if (goalsData?.goals) {
        const availableParentGoals = goalsData.goals.filter(
          (g: Goal) => g.status !== 'COMPLETED' && g.status !== 'CANCELLED'
        );
        setParentGoals(availableParentGoals);
      }
    }
  }, [isCreateDialogOpen, goalsData]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, ...data }: { goalId: string } & Partial<Goal>) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Fetch goal projects
  const { data: goalProjectsData } = useQuery({
    queryKey: ['goal-projects', selectedGoal?.id],
    queryFn: async () => {
      if (!selectedGoal?.id) return { projects: [] };
      const res = await fetch(`/api/goals/${selectedGoal.id}/projects`);
      if (!res.ok) throw new Error('Failed to fetch goal projects');
      return res.json();
    },
    enabled: !!selectedGoal?.id && isDetailDialogOpen,
  });

  // Fetch all projects for selection
  const { data: allProjectsData } = useQuery({
    queryKey: ['projects', selectedGoal?.organizationId],
    queryFn: async () => {
      if (!selectedGoal?.organizationId) return { projects: [] };
      const res = await fetch(`/api/organizations/${selectedGoal.organizationId}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    enabled: !!selectedGoal?.organizationId && isDetailDialogOpen,
  });

  // Link project to goal mutation
  const linkProjectMutation = useMutation({
    mutationFn: async ({ goalId, projectId, contributionWeight }: { goalId: string; projectId: string; contributionWeight: number }) => {
      const res = await fetch(`/api/goals/${goalId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, contributionWeight }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to link project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-projects', selectedGoal?.id] });
      setSelectedProjectId('');
      setContributionWeight(100);
    },
  });

  // Unlink project from goal mutation
  const unlinkProjectMutation = useMutation({
    mutationFn: async ({ goalId, projectId }: { goalId: string; projectId: string }) => {
      const res = await fetch(`/api/goals/${goalId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to unlink project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-projects', selectedGoal?.id] });
    },
  });

  // Create key result mutation
  const createKeyResultMutation = useMutation({
    mutationFn: async (data: { description: string; unit: string; target: string; current: string }) => {
      const res = await fetch(`/api/goals/${selectedGoal?.id}/key-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create key result');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setKeyResultForm({ description: '', unit: '', target: '', current: '0' });
      setIsAddingKeyResult(false);
    },
  });

  // Update key result mutation
  const updateKeyResultMutation = useMutation({
    mutationFn: async ({ krId, current }: { krId: string; current: number }) => {
      const res = await fetch(`/api/goals/${selectedGoal?.id}/key-results/${krId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current }),
      });
      if (!res.ok) throw new Error('Failed to update key result');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Delete key result mutation
  const deleteKeyResultMutation = useMutation({
    mutationFn: async (krId: string) => {
      const res = await fetch(`/api/goals/${selectedGoal?.id}/key-results/${krId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete key result');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goalType: 'TEAM',
      priority: 'MEDIUM',
      startDate: '',
      dueDate: '',
      ownerId: '',
      teamId: '',
      parentGoalId: '',
      icon: 'Target',
      color: '#0065FF',
    });
  };

  const handleCreateGoal = () => {
    createGoalMutation.mutate(formData);
  };

  const handleOpenGoalDetail = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailDialogOpen(true);
  };

  // Filter goals
  const filteredGoals = goalsData?.goals?.filter((goal: Goal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      goal.title.toLowerCase().includes(query) ||
      goal.description?.toLowerCase().includes(query)
    );
  }) || [];

  // Group goals by status
  const goalsByStatus = {
    NOT_STARTED: filteredGoals.filter((g: Goal) => g.status === 'NOT_STARTED'),
    IN_PROGRESS: filteredGoals.filter((g: Goal) => g.status === 'IN_PROGRESS'),
    AT_RISK: filteredGoals.filter((g: Goal) => g.status === 'AT_RISK'),
    COMPLETED: filteredGoals.filter((g: Goal) => g.status === 'COMPLETED'),
  };

  const statusFilters = [
    { value: 'all', label: 'All Goals', count: filteredGoals.length },
    { value: 'IN_PROGRESS', label: 'In Progress', count: goalsByStatus.IN_PROGRESS.length },
    { value: 'AT_RISK', label: 'At Risk', count: goalsByStatus.AT_RISK.length },
    { value: 'COMPLETED', label: 'Completed', count: goalsByStatus.COMPLETED.length },
  ];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Header Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Target className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals</h1>
            </div>

            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
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
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    selectedStatus === filter.value
                      ? 'bg-[#0065FF] text-white'
                      : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC] hover:bg-gray-300 dark:hover:bg-[#2C333A]'
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0065FF] border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Loading goals...</p>
              </div>
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal: Goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleOpenGoalDetail(goal)}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this goal?')) {
                      deleteGoalMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-[#2C333A]">
              <Target className="h-12 w-12 text-gray-300 dark:text-[#2C333A]" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No goals found
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-[#9FADBC]">
                Create your first goal to start tracking progress
              </p>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4 flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Goal
              </button>
            </div>
          )}
        </div>

        {/* Create Goal Slide-out Panel */}
        <SlideoutPanel
          open={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            resetForm();
          }}
          title="Create New Goal"
          size="md"
          showFooter
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={createGoalMutation.isPending}
                className="bg-[#282E33] border-[#2C333A] text-white hover:bg-[#2C333A]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGoal}
                disabled={!formData.title || createGoalMutation.isPending}
                className="bg-[#0065FF] hover:bg-[#0052CC] text-white"
              >
                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          }
        >
          <SlideoutPanelContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateGoal(); }} className="space-y-6">
              {/* Basic Information Card */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title" className="text-gray-900 dark:text-white">
                      Goal Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="goal-title"
                      placeholder="e.g., Increase Customer Satisfaction, Launch New Product, Improve Team Performance"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-[#2C333A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF]"
                    />
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">A clear, measurable objective you want to achieve</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-type" className="text-gray-900 dark:text-white">Goal Type</Label>
                    <select
                      id="goal-type"
                      value={formData.goalType}
                      onChange={(e) => setFormData({ ...formData, goalType: e.target.value as typeof formData.goalType })}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none"
                    >
                      <option value="COMPANY">Company Goal - Organization-wide objective</option>
                      <option value="TEAM">Team Goal - Shared team target</option>
                      <option value="INDIVIDUAL">Individual Goal - Personal objective</option>
                    </select>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Defines the scope and visibility of this goal</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-description" className="text-gray-900 dark:text-white">Description</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Describe what success looks like, why this goal matters, and how it aligns with broader objectives..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-[#2C333A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF]"
                    />
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Provide context about the goal's purpose and expected outcomes</p>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Goal Timeline</h3>
                <DateRangePicker
                  startDate={formData.startDate}
                  endDate={formData.dueDate}
                  onStartDateChange={(date) => setFormData({ ...formData, startDate: date })}
                  onEndDateChange={(date) => setFormData({ ...formData, dueDate: date })}
                  startLabel="Start Date"
                  endLabel="Target Completion Date"
                />
              </div>

              {/* Ownership & Assignment Card */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Ownership & Assignment</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-owner" className="text-gray-900 dark:text-white">Goal Owner</Label>
                    <select
                      id="goal-owner"
                      value={formData.ownerId}
                      onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none"
                    >
                      <option value="">No owner assigned</option>
                      {orgMembers.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.name || member.email}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Person accountable for achieving this goal</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-team" className="text-gray-900 dark:text-white">Assign to Team</Label>
                    <select
                      id="goal-team"
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none"
                    >
                      <option value="">No team assignment</option>
                      {orgTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.icon} {team.name} ({team.memberCount} members)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Team responsible for collaborating on this goal</p>
                  </div>
                </div>
              </div>

              {/* Goal Hierarchy Card */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Goal Hierarchy</h3>
                <div className="space-y-2">
                  <Label htmlFor="parent-goal" className="text-gray-900 dark:text-white">Parent Goal (Optional)</Label>
                  <select
                    id="parent-goal"
                    value={formData.parentGoalId}
                    onChange={(e) => setFormData({ ...formData, parentGoalId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none"
                  >
                    <option value="">This is a top-level goal</option>
                    {parentGoals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Link this goal to a broader objective to create goal hierarchies</p>
                </div>
              </div>

              {/* Priority & Appearance Card */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Priority & Appearance</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-priority" className="text-gray-900 dark:text-white">Priority Level</Label>
                    <select
                      id="goal-priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Goal['priority'] })}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none"
                    >
                      <option value="LOW">Low - Nice to have, flexible timeline</option>
                      <option value="MEDIUM">Medium - Important, standard timeline</option>
                      <option value="HIGH">High - Critical, needs attention</option>
                      <option value="CRITICAL">Critical - Highest priority, urgent</option>
                    </select>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Helps teams prioritize their focus and resources</p>
                  </div>

                  <IconPicker
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                    label="Goal Icon"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="goal-color" className="text-gray-900 dark:text-white">Goal Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="goal-color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-[#2C333A]"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#0065FF"
                        className="flex-1 bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-[#2C333A] text-gray-900 dark:text-white focus:border-[#0065FF]"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC]">Visual identifier to quickly recognize this goal</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-300">About Goals</p>
                    <p className="mt-1 text-xs text-blue-400">
                      Goals help align teams around measurable objectives. Use Key Results (OKRs) to track progress, link projects to show contributing work, and create goal hierarchies to cascade company objectives to team and individual levels.
                    </p>
                  </div>
                </div>
              </div>

              {createGoalMutation.isError && (
                <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    {createGoalMutation.error?.message || 'Failed to create goal'}
                  </p>
                </div>
              )}
            </form>
          </SlideoutPanelContent>
        </SlideoutPanel>

        {/* Goal Detail Dialog */}
        {selectedGoal && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-3xl bg-[#22272B] border-[#2C333A] text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-[#0065FF]" />
                  {selectedGoal.title}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                {/* Status & Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Progress</span>
                    <span className="text-sm text-[#9FADBC]">{selectedGoal.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#2C333A]">
                    <div
                      className="h-2 rounded-full bg-[#0065FF] transition-all"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {selectedGoal.description && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-white">Description</h3>
                    <p className="text-sm text-[#9FADBC]">
                      {selectedGoal.description}
                    </p>
                  </div>
                )}

                {/* Key Results */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Key Results</h3>
                    {!isAddingKeyResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingKeyResult(true)}
                        className="bg-[#282E33] border-[#2C333A] text-white hover:bg-[#2C333A]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Key Result
                      </Button>
                    )}
                  </div>

                  {/* Add Key Result Form */}
                  {isAddingKeyResult && (
                    <div className="mb-4 rounded-lg border border-[#2C333A] p-4 space-y-3 bg-[#1B1F23]">
                      <div>
                        <Label className="text-xs text-white">Description</Label>
                        <Input
                          value={keyResultForm.description}
                          onChange={(e) => setKeyResultForm({ ...keyResultForm, description: e.target.value })}
                          placeholder="e.g., Increase user engagement"
                          className="bg-[#22272B] border-[#2C333A] text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-white">Unit</Label>
                          <Input
                            value={keyResultForm.unit}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, unit: e.target.value })}
                            placeholder="e.g., users"
                            className="bg-[#22272B] border-[#2C333A] text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white">Target</Label>
                          <Input
                            type="number"
                            value={keyResultForm.target}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, target: e.target.value })}
                            placeholder="100"
                            className="bg-[#22272B] border-[#2C333A] text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white">Current</Label>
                          <Input
                            type="number"
                            value={keyResultForm.current}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, current: e.target.value })}
                            placeholder="0"
                            className="bg-[#22272B] border-[#2C333A] text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => createKeyResultMutation.mutate(keyResultForm)}
                          disabled={!keyResultForm.description || !keyResultForm.unit || !keyResultForm.target || createKeyResultMutation.isPending}
                          className="bg-[#0065FF] hover:bg-[#0052CC]"
                        >
                          {createKeyResultMutation.isPending ? 'Adding...' : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingKeyResult(false);
                            setKeyResultForm({ description: '', unit: '', target: '', current: '0' });
                          }}
                          className="bg-[#282E33] border-[#2C333A] text-white hover:bg-[#2C333A]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedGoal.keyResults && selectedGoal.keyResults.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGoal.keyResults.map((kr) => (
                        <div
                          key={kr.id}
                          className="flex items-center gap-3 rounded-lg border border-[#2C333A] p-3 bg-[#1B1F23]"
                        >
                          {kr.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-[#9FADBC]" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{kr.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                value={kr.current}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  updateKeyResultMutation.mutate({ krId: kr.id, current: newValue });
                                }}
                                className="h-7 w-20 text-xs bg-[#22272B] border-[#2C333A] text-white"
                              />
                              <span className="text-xs text-[#9FADBC]">/ {kr.target} {kr.unit}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white">
                              {Math.round((kr.current / kr.target) * 100)}%
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#2C333A]"
                              onClick={() => deleteKeyResultMutation.mutate(kr.id)}
                              disabled={deleteKeyResultMutation.isPending}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isAddingKeyResult && (
                      <div className="rounded-lg border border-[#2C333A] p-8 text-center text-sm text-[#9FADBC] bg-[#1B1F23]">
                        <Target className="mx-auto mb-2 h-8 w-8 text-[#2C333A]" />
                        <p>No key results defined yet</p>
                        <p className="text-xs mt-1">Add measurable outcomes to track your goal progress</p>
                      </div>
                    )
                  )}
                </div>

                {/* Linked Projects */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-white">Linked Projects</h3>

                  {/* Add Project Section */}
                  <div className="mb-4 rounded-lg border border-[#2C333A] p-4 bg-[#1B1F23]">
                    <Label className="mb-2 block text-sm text-white">Link Project</Label>
                    <div className="space-y-3">
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-[#2C333A] bg-[#22272B] px-3 py-2 text-sm text-white focus:border-[#0065FF] focus:outline-none"
                      >
                        <option value="">Select a project...</option>
                        {allProjectsData?.projects
                          ?.filter((project: any) =>
                            !goalProjectsData?.projects?.some((gp: any) => gp.id === project.id)
                          )
                          .map((project: any) => (
                            <option key={project.id} value={project.id}>
                              {project.name} ({project.key})
                            </option>
                          ))}
                      </select>

                      {selectedProjectId && (
                        <div>
                          <Label className="mb-2 block text-sm text-white">
                            Contribution Weight: {contributionWeight}%
                          </Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={contributionWeight}
                            onChange={(e) => setContributionWeight(parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="mt-1 flex justify-between text-xs text-[#9FADBC]">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          if (selectedProjectId && selectedGoal?.id) {
                            linkProjectMutation.mutate({
                              goalId: selectedGoal.id,
                              projectId: selectedProjectId,
                              contributionWeight,
                            });
                          }
                        }}
                        disabled={!selectedProjectId || linkProjectMutation.isPending}
                        className="w-full bg-[#0065FF] hover:bg-[#0052CC]"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        {linkProjectMutation.isPending ? 'Linking...' : 'Link Project'}
                      </Button>

                      {linkProjectMutation.isError && (
                        <p className="text-sm text-red-500">
                          {linkProjectMutation.error?.message || 'Failed to link project'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Linked Projects List */}
                  {goalProjectsData?.projects && goalProjectsData.projects.length > 0 ? (
                    <div className="space-y-2">
                      {goalProjectsData.projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="group flex items-start gap-3 rounded-lg border border-[#2C333A] p-4 bg-[#1B1F23] hover:border-[#0065FF] transition-colors"
                        >
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl shrink-0"
                            style={{ backgroundColor: project.color || '#0065FF' }}
                          >
                            {project.icon || '📁'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">
                                  {project.name}
                                </p>
                                <p className="text-xs text-[#9FADBC]">{project.key}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2C333A]"
                                onClick={() => {
                                  if (selectedGoal?.id) {
                                    unlinkProjectMutation.mutate({
                                      goalId: selectedGoal.id,
                                      projectId: project.id,
                                    });
                                  }
                                }}
                                disabled={unlinkProjectMutation.isPending}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            {project.description && (
                              <p className="text-xs text-[#9FADBC] line-clamp-1 mb-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-[#9FADBC]">Contributes</span>
                                  <span className="font-medium text-[#0065FF]">{project.contributionWeight}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-[#2C333A]">
                                  <div
                                    className="h-1.5 rounded-full bg-[#0065FF] transition-all"
                                    style={{ width: `${project.contributionWeight}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#2C333A] p-8 text-center text-sm text-[#9FADBC] bg-[#1B1F23]">
                      <Folder className="mx-auto mb-2 h-8 w-8 text-[#2C333A]" />
                      <p>No projects linked to this goal yet</p>
                      <p className="text-xs mt-1">Link projects that contribute to achieving this goal</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

// Goal Card Component
interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
  onDelete: (id: string) => void;
}

function GoalCard({ goal, onClick, onDelete }: GoalCardProps) {
  const getStatusConfig = (status: Goal['status']) => {
    switch (status) {
      case 'NOT_STARTED':
        return { icon: Circle, color: 'text-[#9FADBC]', bg: 'bg-[#2C333A]', label: 'Not Started' };
      case 'IN_PROGRESS':
        return { icon: TrendingUp, color: 'text-[#0065FF]', bg: 'bg-[#0065FF]/20', label: 'In Progress' };
      case 'AT_RISK':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'At Risk' };
      case 'COMPLETED':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Completed' };
      default:
        return { icon: Circle, color: 'text-[#9FADBC]', bg: 'bg-[#2C333A]', label: status };
    }
  };

  const getPriorityConfig = (priority: Goal['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return { color: 'text-red-500', label: 'Critical' };
      case 'HIGH':
        return { color: 'text-orange-500', label: 'High' };
      case 'MEDIUM':
        return { color: 'text-yellow-500', label: 'Medium' };
      case 'LOW':
        return { color: 'text-green-500', label: 'Low' };
    }
  };

  const statusConfig = getStatusConfig(goal.status);
  const priorityConfig = getPriorityConfig(goal.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-[#0065FF]"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#0065FF] transition-colors">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-600 dark:text-[#9FADBC]">
              {goal.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#2C333A] shrink-0 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-[#9FADBC]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#282E33] border border-gray-200 dark:border-[#2C333A]">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2C333A]">
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              className="text-red-600 hover:bg-gray-100 dark:hover:bg-[#2C333A]"
            >
              Delete Goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-[#9FADBC]">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{goal.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-[#2C333A]">
          <div
            className="h-1.5 rounded-full bg-[#0065FF] transition-all"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Badges & Info */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Status Badge */}
        <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', statusConfig.bg, statusConfig.color)}>
          <StatusIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{statusConfig.label}</span>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-1">
          <Flag className={cn('h-3 w-3', priorityConfig.color)} />
          <span className={cn('text-xs hidden sm:inline', priorityConfig.color)}>{priorityConfig.label}</span>
        </div>

        {/* Due Date */}
        {goal.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-[#9FADBC] ml-auto">
            <Calendar className="h-3 w-3" />
            {new Date(goal.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Team/Owner */}
      {(goal.team || goal.owner) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-[#9FADBC]">
          {goal.team && (
            <>
              <Users className="h-3 w-3" />
              {goal.team.name}
            </>
          )}
        </div>
      )}
    </div>
  );
}
