'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
    priority: 'MEDIUM' as Goal['priority'],
    dueDate: '',
  });

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
      priority: 'MEDIUM',
      dueDate: '',
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
      <div className="flex h-full flex-col bg-slate-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#22272B]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Goals & OKRs
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set objectives and track key results to measure success
              </p>
            </div>

            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </div>

          {/* Filters & Search */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    selectedStatus === filter.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-slate-100 dark:bg-[#22272B] dark:text-gray-300 dark:hover:bg-slate-700'
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-500">Loading goals...</div>
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
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
              <Target className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No goals found
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first goal to start tracking progress
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            </div>
          )}
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new objective with measurable key results to track progress.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title *</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Improve customer satisfaction"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Describe the goal and why it's important"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-priority">Priority</Label>
                  <select
                    id="goal-priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Goal['priority'] })}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:bg-[#2D3748] dark:text-white dark:focus-visible:ring-teal-400"
                  >
                    <option value="LOW" className="dark:bg-[#2D3748] dark:text-white">Low</option>
                    <option value="MEDIUM" className="dark:bg-[#2D3748] dark:text-white">Medium</option>
                    <option value="HIGH" className="dark:bg-[#2D3748] dark:text-white">High</option>
                    <option value="CRITICAL" className="dark:bg-[#2D3748] dark:text-white">Critical</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-duedate">Due Date</Label>
                  <Input
                    id="goal-duedate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGoal}
                disabled={!formData.title || createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Goal Detail Dialog */}
        {selectedGoal && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-teal-600" />
                  {selectedGoal.title}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                {/* Status & Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-500">{selectedGoal.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-teal-600 transition-all"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {selectedGoal.description && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold">Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedGoal.description}
                    </p>
                  </div>
                )}

                {/* Key Results */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Key Results</h3>
                    {!isAddingKeyResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingKeyResult(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Key Result
                      </Button>
                    )}
                  </div>

                  {/* Add Key Result Form */}
                  {isAddingKeyResult && (
                    <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={keyResultForm.description}
                          onChange={(e) => setKeyResultForm({ ...keyResultForm, description: e.target.value })}
                          placeholder="e.g., Increase user engagement"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Unit</Label>
                          <Input
                            value={keyResultForm.unit}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, unit: e.target.value })}
                            placeholder="e.g., users"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Target</Label>
                          <Input
                            type="number"
                            value={keyResultForm.target}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, target: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Current</Label>
                          <Input
                            type="number"
                            value={keyResultForm.current}
                            onChange={(e) => setKeyResultForm({ ...keyResultForm, current: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => createKeyResultMutation.mutate(keyResultForm)}
                          disabled={!keyResultForm.description || !keyResultForm.unit || !keyResultForm.target || createKeyResultMutation.isPending}
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
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-slate-700"
                        >
                          {kr.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{kr.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                value={kr.current}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  updateKeyResultMutation.mutate({ krId: kr.id, current: newValue });
                                }}
                                className="h-7 w-20 text-xs"
                              />
                              <span className="text-xs text-gray-500">/ {kr.target} {kr.unit}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {Math.round((kr.current / kr.target) * 100)}%
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteKeyResultMutation.mutate(kr.id)}
                              disabled={deleteKeyResultMutation.isPending}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isAddingKeyResult && (
                      <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-slate-700">
                        <Target className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p>No key results defined yet</p>
                        <p className="text-xs mt-1">Add measurable outcomes to track your goal progress</p>
                      </div>
                    )
                  )}
                </div>

                {/* Linked Projects */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Linked Projects</h3>

                  {/* Add Project Section */}
                  <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <Label className="mb-2 block text-sm">Link Project</Label>
                    <div className="space-y-3">
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-[#2D3748] dark:text-white"
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
                          <Label className="mb-2 block text-sm">
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
                          <div className="mt-1 flex justify-between text-xs text-gray-500">
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
                        className="w-full"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        {linkProjectMutation.isPending ? 'Linking...' : 'Link Project'}
                      </Button>

                      {linkProjectMutation.isError && (
                        <p className="text-sm text-red-600">
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
                          className="group flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
                        >
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl shrink-0"
                            style={{ backgroundColor: project.color || '#3B82F6' }}
                          >
                            {project.icon || '📁'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {project.name}
                                </p>
                                <p className="text-xs text-gray-500">{project.key}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                            {project.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-500">Contributes</span>
                                  <span className="font-medium text-teal-600">{project.contributionWeight}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                                  <div
                                    className="h-1.5 rounded-full bg-teal-600 transition-all"
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
                    <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-slate-700">
                      <Folder className="mx-auto mb-2 h-8 w-8 text-gray-400" />
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
        return { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Not Started' };
      case 'IN_PROGRESS':
        return { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900', label: 'In Progress' };
      case 'AT_RISK':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', label: 'At Risk' };
      case 'COMPLETED':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', label: 'Completed' };
      default:
        return { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100', label: status };
    }
  };

  const getPriorityConfig = (priority: Goal['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return { color: 'text-red-600', label: 'Critical' };
      case 'HIGH':
        return { color: 'text-orange-600', label: 'High' };
      case 'MEDIUM':
        return { color: 'text-yellow-600', label: 'Medium' };
      case 'LOW':
        return { color: 'text-green-600', label: 'Low' };
    }
  };

  const statusConfig = getStatusConfig(goal.status);
  const priorityConfig = getPriorityConfig(goal.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-teal-500 dark:border-slate-700 dark:bg-[#22272B] dark:hover:border-teal-500"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
              {goal.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              className="text-red-600"
            >
              Delete Goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{goal.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-teal-600 transition-all"
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
          <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
            <Calendar className="h-3 w-3" />
            {new Date(goal.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Team/Owner */}
      {(goal.team || goal.owner) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
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
