'use client';

/**
 * Rovo-style Insights Slideout
 * Shows contextual analytics for the current page — computed client-side from already-fetched data.
 * Supports multiple page contexts: issues, budget, team, goals, calendar, timeline.
 */

import { useMemo, useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Activity,
  Zap,
  Calendar,
  DollarSign,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type InsightsContext =
  | { type: 'issues'; issues: any[]; projectName?: string }
  | { type: 'budget'; budgets: any[]; expenses?: any[] }
  | { type: 'team'; members: any[]; teams?: any[] }
  | { type: 'goals'; goals: any[] }
  | { type: 'calendar'; issues: any[] }
  | { type: 'timeline'; projects: any[] }
  | { type: 'dashboard'; issues: any[]; projects: any[] };

interface InsightsSlideoutProps {
  open: boolean;
  onClose: () => void;
  context: InsightsContext;
}

function daysAgo(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number, currency = 'ETB'): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K ${currency}`;
  return `${amount.toFixed(0)} ${currency}`;
}

export function InsightsSlideout({ open, onClose, context }: InsightsSlideoutProps) {
  const insights = useMemo(() => computeInsights(context), [context]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiStats, setAiStats] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generateWeeklySummary = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/weekly-summary?days=7');
      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      setAiSummary(data.summary);
      setAiStats(data.stats);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out */}
      <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:max-w-md bg-white dark:bg-[#1B1F23] shadow-2xl z-50 flex flex-col animate-slide-in-right-insights">
        {/* Accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 via-purple-400 to-[#1C8C7D]" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">AI Insights</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{insights.subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {insights.summary && (
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-800/30 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insights.summary}</p>
              </div>
            </div>
          )}

          {/* AI Weekly Summary — powered by Claude */}
          <div className="rounded-lg border border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/5 dark:to-[#22272B] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI Weekly Summary
                </h3>
              </div>
              {!aiSummary && !aiLoading && (
                <Button
                  onClick={generateWeeklySummary}
                  size="sm"
                  className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                >
                  Generate
                </Button>
              )}
              {aiSummary && !aiLoading && (
                <Button
                  onClick={generateWeeklySummary}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Regenerate
                </Button>
              )}
            </div>

            {!aiSummary && !aiLoading && !aiError && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Claude will analyze the past 7 days of team activity and write a narrative summary of what your team accomplished, who contributed most, and notable trends.
              </p>
            )}

            {aiLoading && (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                Claude is analyzing your team's week...
              </div>
            )}

            {aiError && (
              <div className="flex items-center gap-2 py-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {aiError}
              </div>
            )}

            {aiSummary && !aiLoading && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {aiSummary}
                </p>
                {aiStats && (
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-purple-200/30 dark:border-purple-800/20">
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Total actions: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{aiStats.totalActivities}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Completed: </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{aiStats.tasksCompleted}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Created: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{aiStats.tasksCreated}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Metrics Grid */}
          {insights.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {insights.metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#22272B] p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded ${m.bg}`}>
                      <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</div>
                  {m.change && (
                    <div className={`text-xs mt-0.5 ${m.changeColor || 'text-gray-500'}`}>{m.change}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sections (alerts, top performers, trends) */}
          {insights.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <section.icon className="h-3.5 w-3.5" />
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No data</p>
                ) : (
                  section.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#22272B] px-3 py-2"
                    >
                      {item.accent && (
                        <div className={`h-2 w-2 rounded-full ${item.accent} shrink-0`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</div>
                        )}
                      </div>
                      {item.value && (
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">{item.value}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right-insights {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right-insights {
          animation: slide-in-right-insights 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}

// ===========================================================================
// Insight Computation — derives metrics and sections from context data
// ===========================================================================

interface Insights {
  subtitle: string;
  summary?: string;
  metrics: Array<{
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
    change?: string;
    changeColor?: string;
  }>;
  sections: Array<{
    title: string;
    icon: any;
    items: Array<{ title: string; subtitle?: string; value?: string; accent?: string }>;
  }>;
}

function computeInsights(context: InsightsContext): Insights {
  switch (context.type) {
    case 'issues':
      return computeIssuesInsights(context.issues, context.projectName);
    case 'budget':
      return computeBudgetInsights(context.budgets, context.expenses || []);
    case 'team':
      return computeTeamInsights(context.members, context.teams || []);
    case 'goals':
      return computeGoalsInsights(context.goals);
    case 'calendar':
      return computeCalendarInsights(context.issues);
    case 'timeline':
      return computeTimelineInsights(context.projects);
    case 'dashboard':
      return computeDashboardInsights(context.issues, context.projects);
  }
}

function computeIssuesInsights(issues: any[], projectName?: string): Insights {
  const total = issues.length;
  const done = issues.filter((i) => i.status === 'DONE').length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW').length;
  const todo = issues.filter((i) => i.status === 'TODO' || i.status === 'BACKLOG').length;
  const overdue = issues.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE').length;
  const highPriority = issues.filter((i) => i.priority === 'HIGHEST' || i.priority === 'HIGH').length;
  const unassigned = issues.filter((i) => !i.assignee && !i.assigneeId).length;

  // Recent activity (last 7 days)
  const createdLast7 = issues.filter((i) => i.createdAt && daysAgo(i.createdAt) <= 7).length;
  const completedLast7 = issues.filter((i) => i.status === 'DONE' && i.updatedAt && daysAgo(i.updatedAt) <= 7).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Top assignees
  const assigneeCounts = new Map<string, { name: string; count: number }>();
  issues.forEach((i) => {
    const name = i.assignee?.name || i.assignee?.email;
    if (name) {
      const existing = assigneeCounts.get(name);
      assigneeCounts.set(name, { name, count: (existing?.count || 0) + 1 });
    }
  });
  const topAssignees = Array.from(assigneeCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Alerts — things that need attention
  const alerts: Array<{ title: string; subtitle?: string; accent?: string }> = [];
  if (overdue > 0) alerts.push({ title: `${overdue} overdue ${overdue === 1 ? 'task' : 'tasks'}`, subtitle: 'Past due date, not yet completed', accent: 'bg-red-500' });
  if (unassigned > 0) alerts.push({ title: `${unassigned} unassigned ${unassigned === 1 ? 'task' : 'tasks'}`, subtitle: 'Nobody is working on these', accent: 'bg-orange-500' });
  if (highPriority > 5) alerts.push({ title: `${highPriority} high priority items`, subtitle: 'Consider rebalancing priorities', accent: 'bg-yellow-500' });
  if (todo > inProgress * 3 && inProgress > 0) alerts.push({ title: 'Backlog is growing', subtitle: `${todo} todo vs ${inProgress} in progress`, accent: 'bg-blue-500' });

  // Build summary
  let summary = '';
  if (total === 0) {
    summary = 'No tasks yet. Create your first issue to start tracking work.';
  } else if (completionRate >= 80) {
    summary = `Excellent progress! ${completionRate}% of tasks completed. ${completedLast7} finished in the last 7 days.`;
  } else if (completionRate >= 50) {
    summary = `On track with ${completionRate}% completion. ${createdLast7} new tasks created this week, ${completedLast7} completed.`;
  } else if (overdue > 0) {
    summary = `${overdue} overdue tasks need attention. ${completionRate}% completion rate overall.`;
  } else {
    summary = `${total} total tasks tracked. ${createdLast7} new this week, ${completedLast7} completed.`;
  }

  return {
    subtitle: projectName || 'Issues Overview',
    summary,
    metrics: [
      { label: 'Completion', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', change: `${done}/${total} done` },
      { label: 'In Progress', value: inProgress, icon: Activity, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', change: overdue > 0 ? 'Needs attention' : 'All on time', changeColor: overdue > 0 ? 'text-red-500' : 'text-green-500' },
      { label: 'This Week', value: createdLast7, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', change: 'New tasks' },
    ],
    sections: [
      { title: 'Alerts', icon: AlertCircle, items: alerts },
      {
        title: 'Top Contributors',
        icon: Users,
        items: topAssignees.map((a) => ({
          title: a.name,
          value: `${a.count} ${a.count === 1 ? 'task' : 'tasks'}`,
        })),
      },
    ],
  };
}

function computeBudgetInsights(budgets: any[], expenses: any[]): Insights {
  const total = budgets.length;
  if (total === 0) {
    return {
      subtitle: 'Budget Overview',
      summary: 'No budgets configured yet.',
      metrics: [],
      sections: [],
    };
  }

  const totalAllocated = budgets.reduce((sum, b) => sum + (Number(b.totalBudget) || Number(b.totalAllocated) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.totalSpent) || 0), 0);
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const remaining = totalAllocated - totalSpent;

  // Over-budget budgets
  const overBudget = budgets.filter((b) => {
    const spent = Number(b.totalSpent) || 0;
    const allocated = Number(b.totalBudget) || Number(b.totalAllocated) || 0;
    return allocated > 0 && spent / allocated > 0.9;
  });

  const recentExpenses = expenses
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.transactionDate || 0).getTime() - new Date(a.createdAt || a.transactionDate || 0).getTime())
    .slice(0, 5);

  let summary = '';
  if (utilization < 50) summary = `Healthy spending at ${utilization}% utilization across ${total} ${total === 1 ? 'budget' : 'budgets'}.`;
  else if (utilization < 80) summary = `On track at ${utilization}% utilization. Monitor closely.`;
  else if (utilization < 100) summary = `Approaching limit at ${utilization}% utilization. ${overBudget.length} categories near max.`;
  else summary = `Over budget! ${utilization}% utilized. Immediate review needed.`;

  return {
    subtitle: 'Budget Analytics',
    summary,
    metrics: [
      { label: 'Allocated', value: formatCurrency(totalAllocated), icon: DollarSign, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Spent', value: formatCurrency(totalSpent), icon: TrendingDown, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
      { label: 'Remaining', value: formatCurrency(remaining), icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
      { label: 'Utilization', value: `${utilization}%`, icon: Activity, color: utilization > 90 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400', bg: utilization > 90 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-purple-100 dark:bg-purple-900/30' },
    ],
    sections: [
      {
        title: 'At-Risk Budgets',
        icon: AlertCircle,
        items: overBudget.map((b) => ({
          title: b.project?.name || 'Unknown Project',
          subtitle: `${Math.round(((Number(b.totalSpent) || 0) / (Number(b.totalBudget) || 1)) * 100)}% utilized`,
          accent: 'bg-red-500',
        })),
      },
      {
        title: 'Recent Expenses',
        icon: Clock,
        items: recentExpenses.map((e) => ({
          title: e.description || e.vendor || 'Expense',
          subtitle: e.vendor || new Date(e.createdAt || e.transactionDate).toLocaleDateString(),
          value: formatCurrency(Number(e.amount) || 0, e.currency),
        })),
      },
    ],
  };
}

function computeTeamInsights(members: any[], teams: any[]): Insights {
  const activeMembers = members.filter((m) => !m.deletedAt).length;
  const admins = members.filter((m) => m.role === 'ADMIN' || m.role === 'OWNER').length;

  return {
    subtitle: 'Team Overview',
    summary: `${activeMembers} active ${activeMembers === 1 ? 'member' : 'members'} across ${teams.length} ${teams.length === 1 ? 'team' : 'teams'}.`,
    metrics: [
      { label: 'Members', value: activeMembers, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Teams', value: teams.length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { label: 'Admins', value: admins, icon: Sparkles, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    ],
    sections: [],
  };
}

function computeGoalsInsights(goals: any[]): Insights {
  const total = goals.length;
  const completed = goals.filter((g) => g.status === 'COMPLETED').length;
  const active = goals.filter((g) => g.status === 'IN_PROGRESS' || g.status === 'ACTIVE').length;
  const avgProgress = total > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / total) : 0;

  return {
    subtitle: 'Goals Progress',
    summary: total === 0 ? 'No goals set yet. Create goals to track team objectives.' : `${completed} of ${total} goals completed. Average progress: ${avgProgress}%.`,
    metrics: [
      { label: 'Total', value: total, icon: Target, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Active', value: active, icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
      { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    ],
    sections: [],
  };
}

function computeCalendarInsights(issues: any[]): Insights {
  const withDates = issues.filter((i) => i.dueDate);
  const thisWeek = withDates.filter((i) => {
    const d = new Date(i.dueDate);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });
  const overdue = withDates.filter((i) => new Date(i.dueDate) < new Date() && i.status !== 'DONE');
  const today = withDates.filter((i) => {
    const d = new Date(i.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return {
    subtitle: 'Calendar Insights',
    summary: `${thisWeek.length} ${thisWeek.length === 1 ? 'task' : 'tasks'} due this week, ${overdue.length} overdue.`,
    metrics: [
      { label: 'Due Today', value: today.length, icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { label: 'This Week', value: thisWeek.length, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Overdue', value: overdue.length, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
      { label: 'Scheduled', value: withDates.length, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    ],
    sections: [
      {
        title: 'Due Today',
        icon: Zap,
        items: today.slice(0, 5).map((i) => ({ title: i.title, subtitle: i.project?.name || 'No project', accent: 'bg-purple-500' })),
      },
      {
        title: 'Overdue',
        icon: AlertCircle,
        items: overdue.slice(0, 5).map((i) => ({
          title: i.title,
          subtitle: `${Math.abs(Math.floor((new Date(i.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days late`,
          accent: 'bg-red-500',
        })),
      },
    ],
  };
}

function computeTimelineInsights(projects: any[]): Insights {
  const total = projects.length;
  const atRisk = projects.filter((p) => (p.progress || 0) < 30).length;
  const onTrack = projects.filter((p) => (p.progress || 0) >= 30 && (p.progress || 0) < 80).length;
  const nearComplete = projects.filter((p) => (p.progress || 0) >= 80).length;

  return {
    subtitle: 'Timeline Overview',
    summary: `Tracking ${total} ${total === 1 ? 'project' : 'projects'}. ${atRisk} at risk, ${nearComplete} near completion.`,
    metrics: [
      { label: 'Total', value: total, icon: Target, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'At Risk', value: atRisk, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
      { label: 'On Track', value: onTrack, icon: Activity, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Almost Done', value: nearComplete, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    ],
    sections: [],
  };
}

function computeDashboardInsights(issues: any[], projects: any[]): Insights {
  // Use the same logic as issues but scoped to all
  return {
    ...computeIssuesInsights(issues, 'Organization'),
    subtitle: `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} · ${issues.length} total tasks`,
  };
}
