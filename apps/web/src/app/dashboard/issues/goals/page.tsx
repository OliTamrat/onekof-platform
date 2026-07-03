'use client';

/**
 * Production-Ready Goals & OKR Tracking Page
 *
 * Features:
 * - OKR (Objectives and Key Results) tracking
 * - Goal progress visualization
 * - Key Results management
 * - Status-based filtering
 * - Priority indicators
 * - Team assignment
 * - Progress bars and completion tracking
 * - Create/Edit goals with key results
 * - Due date tracking
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Play,
  XCircle,
  Flag,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
type GoalPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface KeyResult {
  id: string;
  description: string;
  unit: string;
  target: number;
  current: number;
  isCompleted: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  ownerId?: string | null;
  team?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  startDate?: string;
  dueDate?: string;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Team {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export default function IssuesGoalsPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as GoalPriority,
    teamId: '',
    dueDate: '',
    keyResults: [{ description: '', unit: 'units', target: 100 }],
  });

  // Fetch goals
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
    enabled: !!session,
  });

  // Fetch teams
  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    enabled: !!session && showCreateGoal,
  });

  const goals: Goal[] = goalsData?.goals || [];
  const teams: Team[] = teamsData?.teams || [];

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: typeof goalFormData) => {
      // First create the goal
      const goalRes = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority,
          teamId: data.teamId || null,
          dueDate: data.dueDate || null,
        }),
      });
      if (!goalRes.ok) throw new Error('Failed to create goal');
      const { goal } = await goalRes.json();

      // Then create key results
      for (const kr of data.keyResults) {
        if (!kr.description) continue;
        await fetch(`/api/goals/${goal.id}/key-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(kr),
        });
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowCreateGoal(false);
      setGoalFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        teamId: '',
        dueDate: '',
        keyResults: [{ description: '', unit: 'units', target: 100 }],
      });
    },
  });

  // Update key result mutation
  const updateKeyResultMutation = useMutation({
    mutationFn: async ({
      goalId,
      krId,
      current,
    }: {
      goalId: string;
      krId: string;
      current: number;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/key-results/${krId}`, {
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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMutation.mutate(goalFormData);
  };

  const toggleGoalExpand = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return <Circle className="h-4 w-4 text-gray-500" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'AT_RISK':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'AT_RISK':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const addKeyResult = () => {
    setGoalFormData({
      ...goalFormData,
      keyResults: [...goalFormData.keyResults, { description: '', unit: 'units', target: 100 }],
    });
  };

  const removeKeyResult = (index: number) => {
    setGoalFormData({
      ...goalFormData,
      keyResults: goalFormData.keyResults.filter((_, i) => i !== index),
    });
  };

  const updateKeyResult = (index: number, field: string, value: any) => {
    const newKeyResults = [...goalFormData.keyResults];
    newKeyResults[index] = { ...newKeyResults[index], [field]: value };
    setGoalFormData({ ...goalFormData, keyResults: newKeyResults });
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500 dark:text-white/70">Please sign in to view goals.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Goals"
        icon={<Target className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="goals"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6">
            {/* Header with Actions */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Goals & OKRs
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-white/70">
                  Track objectives and key results across your organization
                </p>
              </div>

              <Button
                onClick={() => setShowCreateGoal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            </div>

            {/* Status Filter */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {[
                { value: 'all', label: 'All Goals', icon: Target },
                { value: 'NOT_STARTED', label: 'Not Started', icon: Circle },
                { value: 'IN_PROGRESS', label: t('status.inProgress'), icon: Play },
                { value: 'AT_RISK', label: 'At Risk', icon: AlertTriangle },
                { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    statusFilter === value
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-white dark:bg-[#12161B] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-[#181D23] border border-gray-200 dark:border-white/[0.08]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Goals List */}
            {goalsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#8B5CF6] dark:border-gray-700"></div>
                  <p className="text-sm text-gray-600 dark:text-white/70">Loading goals...</p>
                </div>
              </div>
            ) : goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No goals found
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-white/70">
                  {statusFilter === 'all'
                    ? 'Get started by creating your first goal'
                    : `No goals with status "${statusFilter.replace('_', ' ').toLowerCase()}"`}
                </p>
                {statusFilter === 'all' && (
                  <Button
                    onClick={() => setShowCreateGoal(true)}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]"
                  >
                    <Plus className="h-4 w-4" />
                    Create Goal
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const isExpanded = expandedGoals.has(goal.id);
                  const overdue = isOverdue(goal.dueDate);
                  const completedKRs = goal.keyResults.filter((kr) => kr.isCompleted).length;
                  const totalKRs = goal.keyResults.length;

                  return (
                    <div
                      key={goal.id}
                      className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] overflow-hidden transition-shadow hover:shadow-md"
                    >
                      {/* Goal Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Priority Indicator */}
                          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${getPriorityColor(goal.priority)}`} />

                          <div className="flex-1 min-w-0">
                            {/* Title Row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <Button
                                  onClick={() => toggleGoalExpand(goal.id)}
                                  className="flex items-center gap-2 text-left w-full group"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#8B5CF6] transition-colors">
                                    {goal.title}
                                  </h3>
                                </Button>
                                {goal.description && (
                                  <p className="mt-1 text-sm text-gray-600 dark:text-white/70 line-clamp-2 ml-6">
                                    {goal.description}
                                  </p>
                                )}
                              </div>

                              {/* Status Badge */}
                              <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(goal.status)}`}>
                                {getStatusIcon(goal.status)}
                                {goal.status.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Metadata Row */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-white/70 ml-6">
                              {goal.team && (
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="flex h-5 w-5 items-center justify-center rounded text-xs"
                                    style={{ backgroundColor: goal.team.color + '40' }}
                                  >
                                    {goal.team.icon}
                                  </div>
                                  {goal.team.name}
                                </div>
                              )}

                              {goal.dueDate && (
                                <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                  <Calendar className="h-3.5 w-3.5" />
                                  {overdue && 'Overdue: '}
                                  {formatDate(goal.dueDate)}
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {completedKRs}/{totalKRs} Key Results
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 ml-6">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700 dark:text-white/70">
                                  Progress
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {goal.progress}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-200 dark:bg-[#181D23] overflow-hidden">
                                <div
                                  className={`h-full transition-all ${getProgressColor(goal.progress)}`}
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Results (Expanded) */}
                      {isExpanded && goal.keyResults.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#0B0E11] p-5">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target className="h-4 w-4 text-[#8B5CF6]" />
                            Key Results
                          </h4>
                          <div className="space-y-3">
                            {goal.keyResults.map((kr, idx) => {
                              const krProgress = (kr.current / kr.target) * 100;
                              return (
                                <div
                                  key={kr.id}
                                  className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        {kr.isCompleted ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        <p className={`text-sm font-medium ${kr.isCompleted ? 'text-gray-500 dark:text-[#6B7684] line-through' : 'text-gray-900 dark:text-white'}`}>
                                          {kr.description}
                                        </p>
                                      </div>

                                      {/* KR Progress */}
                                      <div className="mt-3 ml-6">
                                        <div className="flex items-center gap-3 text-xs mb-1">
                                          <span className="text-gray-600 dark:text-white/70">
                                            Current: {kr.current} {kr.unit}
                                          </span>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-gray-600 dark:text-white/70">
                                            Target: {kr.target} {kr.unit}
                                          </span>
                                          <span className="text-gray-400">•</span>
                                          <span className="font-semibold text-gray-900 dark:text-white">
                                            {Math.round(krProgress)}%
                                          </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-[#181D23] overflow-hidden">
                                          <div
                                            className={`h-full transition-all ${getProgressColor(krProgress)}`}
                                            style={{ width: `${Math.min(krProgress, 100)}%` }}
                                          />
                                        </div>

                                        {/* Update Current Value */}
                                        {!kr.isCompleted && (
                                          <div className="mt-2 flex items-center gap-2">
                                            <input
                                              type="number"
                                              defaultValue={kr.current}
                                              onBlur={(e) => {
                                                const newValue = parseFloat(e.target.value);
                                                if (!isNaN(newValue) && newValue !== kr.current) {
                                                  updateKeyResultMutation.mutate({
                                                    goalId: goal.id,
                                                    krId: kr.id,
                                                    current: newValue,
                                                  });
                                                }
                                              }}
                                              className="w-24 rounded border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-2 py-1 text-xs text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                                            />
                                            <span className="text-xs text-gray-500 dark:text-[#6B7684]">
                                              Update current value
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#12161B] rounded-lg shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-[#8B5CF6]" />
                Create Goal (OKR)
              </h2>
              <Button variant="ghost" size="icon"
                onClick={() => setShowCreateGoal(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-[#181D23] transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45 text-gray-600 dark:text-white/70" />
              </Button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-6">
              {/* Goal Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Objective</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={goalFormData.title}
                    onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    placeholder="e.g., Increase platform adoption"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                    Description
                  </label>
                  <textarea
                    value={goalFormData.description}
                    onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    placeholder="Brief description of what you want to achieve"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                      Priority
                    </label>
                    <select
                      value={goalFormData.priority}
                      onChange={(e) => setGoalFormData({ ...goalFormData, priority: e.target.value as GoalPriority })}
                      className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                      Team
                    </label>
                    <select
                      value={goalFormData.teamId}
                      onChange={(e) => setGoalFormData({ ...goalFormData, teamId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    >
                      <option value="">No team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.icon} {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={goalFormData.dueDate}
                      onChange={(e) => setGoalFormData({ ...goalFormData, dueDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Key Results
                  </h3>
                  <Button
                    type="button"
                    onClick={addKeyResult}
                    className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
                  >
                    + Add Key Result
                  </Button>
                </div>

                {goalFormData.keyResults.map((kr, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 dark:border-white/[0.08] p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={kr.description}
                          onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                          placeholder="e.g., Reach 1000 active users"
                          className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                        />
                      </div>
                      {goalFormData.keyResults.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeKeyResult(index)}
                          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          placeholder="users"
                          className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">
                          Target
                        </label>
                        <input
                          type="number"
                          value={kr.target}
                          onChange={(e) => updateKeyResult(index, 'target', parseFloat(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.08]">
                <Button
                  type="button"
                  onClick={() => setShowCreateGoal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors shadow-sm disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
