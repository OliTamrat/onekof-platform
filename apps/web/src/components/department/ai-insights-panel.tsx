'use client';

import { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  Zap,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  key: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string | null;
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color: string };
}

type Category = 'development' | 'marketing' | 'operations' | 'research' | 'knowledge' | 'general';

interface AIInsightsPanelProps {
  tasks: Task[];
  category: Category;
  title: string;
}

interface Insight {
  type: 'warning' | 'success' | 'info' | 'action';
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  text: string;
}

const INSIGHT_STYLES = {
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20',
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20',
  action: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20',
};

const INSIGHT_ICON_STYLES = {
  warning: 'text-amber-600 dark:text-amber-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-blue-600 dark:text-blue-400',
  action: 'text-purple-600 dark:text-purple-400',
};

const CATEGORY_LABELS: Record<Category, string> = {
  development: 'Development',
  marketing: 'Marketing',
  operations: 'Operations',
  research: 'Research',
  knowledge: 'Knowledge',
  general: 'Project',
};

function analyzeWorkload(tasks: Task[]) {
  const assigneeMap: Record<string, { name: string; count: number; overdue: number; critical: number }> = {};
  const now = new Date();

  tasks.filter(t => t.status !== 'DONE').forEach(task => {
    const key = task.assignee?.id || 'unassigned';
    const name = task.assignee?.name || 'Unassigned';
    if (!assigneeMap[key]) assigneeMap[key] = { name, count: 0, overdue: 0, critical: 0 };
    assigneeMap[key].count++;
    if (task.dueDate && new Date(task.dueDate) < now) assigneeMap[key].overdue++;
    if (task.priority === 'CRITICAL') assigneeMap[key].critical++;
  });

  return Object.values(assigneeMap).sort((a, b) => b.count - a.count);
}

function detectBottleneck(tasks: Task[]) {
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const statusCounts: Record<string, number> = {};
  activeTasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  let bottleneck = '';
  let maxCount = 0;
  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > maxCount) { maxCount = count; bottleneck = status; }
  });

  return { status: bottleneck, count: maxCount, total: activeTasks.length };
}

function getCategoryInsights(tasks: Task[], category: Category): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
  const inReview = tasks.filter(t => t.status === 'IN_REVIEW').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;
  const critical = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length;
  const high = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length;
  const unassigned = tasks.filter(t => !t.assignee && t.status !== 'DONE').length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const bottleneck = detectBottleneck(tasks);

  // Universal insights
  if (completionRate >= 75) {
    insights.push({
      type: 'success', icon: TrendingUp,
      title: 'Strong progress',
      description: `${completionRate}% completion rate — the team is on track to close out remaining items.`,
      metric: `${done}/${total}`,
    });
  } else if (completionRate < 30 && total > 3) {
    insights.push({
      type: 'warning', icon: TrendingDown,
      title: 'Low completion rate',
      description: `Only ${completionRate}% of tasks are done. Consider reviewing scope or reallocating resources.`,
      metric: `${done}/${total}`,
    });
  }

  if (blocked > 0) {
    insights.push({
      type: 'warning', icon: ShieldAlert,
      title: `${blocked} blocked ${blocked === 1 ? 'item' : 'items'}`,
      description: 'Blocked tasks halt downstream work. Review dependencies and reassign if needed.',
      metric: `${blocked}`,
    });
  }

  if (overdue > 0) {
    insights.push({
      type: 'warning', icon: Clock,
      title: `${overdue} overdue ${overdue === 1 ? 'task' : 'tasks'}`,
      description: overdue > 3
        ? 'Multiple tasks are past due. Prioritize critical items and consider adjusting deadlines for non-critical work.'
        : 'Review overdue items and update timelines or escalate as needed.',
      metric: `${overdue}`,
    });
  }

  if (critical > 0) {
    insights.push({
      type: 'action', icon: AlertTriangle,
      title: `${critical} critical ${critical === 1 ? 'task requires' : 'tasks require'} attention`,
      description: 'Critical priority items should be addressed before moving to lower-priority work.',
      metric: `${critical}`,
    });
  }

  if (unassigned > 2) {
    insights.push({
      type: 'info', icon: Users,
      title: `${unassigned} unassigned tasks`,
      description: 'Distribute unassigned work across team members to prevent bottlenecks and ensure accountability.',
      metric: `${unassigned}`,
    });
  }

  if (bottleneck.count > 3 && bottleneck.status) {
    const statusLabel = bottleneck.status.replace('_', ' ').toLowerCase();
    insights.push({
      type: 'info', icon: BarChart3,
      title: `Bottleneck detected: ${statusLabel}`,
      description: `${bottleneck.count} of ${bottleneck.total} active tasks are in "${statusLabel}". Consider moving items forward or adding capacity.`,
      metric: `${bottleneck.count}`,
    });
  }

  // Category-specific insights
  switch (category) {
    case 'development':
      if (inReview > 2) {
        insights.push({
          type: 'action', icon: Zap,
          title: 'Code review queue growing',
          description: `${inReview} items awaiting review. Schedule a review session to unblock the pipeline and keep velocity up.`,
          metric: `${inReview}`,
        });
      }
      if (inProgress > 5) {
        insights.push({
          type: 'info', icon: Target,
          title: 'High WIP count',
          description: `${inProgress} items in progress simultaneously. Consider limiting work-in-progress to improve focus and throughput.`,
          metric: `${inProgress}`,
        });
      }
      break;

    case 'marketing':
      {
        const dueSoon = tasks.filter(t => {
          if (!t.dueDate || t.status === 'DONE') return false;
          const days = (new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 7;
        }).length;
        if (dueSoon > 0) {
          insights.push({
            type: 'action', icon: Clock,
            title: `${dueSoon} items due this week`,
            description: 'Upcoming deadlines for campaigns or content. Ensure assets are ready and approvals are in place.',
            metric: `${dueSoon}`,
          });
        }
        if (high + critical > total * 0.4 && total > 3) {
          insights.push({
            type: 'info', icon: Target,
            title: 'Heavy high-priority load',
            description: 'Over 40% of marketing tasks are high or critical priority. Consider staggering launches to manage quality.',
          });
        }
      }
      break;

    case 'operations':
      if (critical > 0 && blocked > 0) {
        insights.push({
          type: 'warning', icon: ShieldAlert,
          title: 'Critical incidents blocked',
          description: 'Critical operational items are blocked. This may indicate a dependency on external teams or resources that needs escalation.',
        });
      }
      {
        const resolvedRate = total > 0 ? Math.round((done / total) * 100) : 0;
        if (resolvedRate > 60) {
          insights.push({
            type: 'success', icon: CheckCircle2,
            title: `${resolvedRate}% resolution rate`,
            description: 'Most operational items are resolved. Continue monitoring for recurring patterns.',
            metric: `${resolvedRate}%`,
          });
        }
      }
      break;

    case 'research':
      if (total > 0 && done === 0) {
        insights.push({
          type: 'info', icon: Lightbulb,
          title: 'Research in early stages',
          description: 'No items completed yet. Focus on defining clear deliverables and milestones to track progress effectively.',
        });
      }
      {
        const dataGaps = tasks.filter(t => t.status === 'TODO' && t.priority !== 'LOW').length;
        if (dataGaps > 3) {
          insights.push({
            type: 'action', icon: Target,
            title: `${dataGaps} items pending kickoff`,
            description: 'Multiple research items are waiting to start. Prioritize by impact and resource availability.',
            metric: `${dataGaps}`,
          });
        }
      }
      break;
  }

  return insights.slice(0, 6); // Cap at 6 insights
}

function getRecommendations(tasks: Task[], category: Category): Recommendation[] {
  const recs: Recommendation[] = [];
  const now = new Date();
  const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;
  const critical = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length;
  const unassigned = tasks.filter(t => !t.assignee && t.status !== 'DONE').length;
  const inReview = tasks.filter(t => t.status === 'IN_REVIEW').length;
  const workload = analyzeWorkload(tasks);
  const overloaded = workload.filter(w => w.count > 5);

  if (critical > 0) {
    recs.push({ priority: 'high', text: `Address ${critical} critical-priority ${critical === 1 ? 'item' : 'items'} before moving to lower-priority work` });
  }
  if (blocked > 0) {
    recs.push({ priority: 'high', text: `Unblock ${blocked} ${blocked === 1 ? 'task' : 'tasks'} — review dependencies and escalate where needed` });
  }
  if (overdue > 2) {
    recs.push({ priority: 'high', text: `Triage ${overdue} overdue items — close, reschedule, or escalate each one` });
  }
  if (inReview > 3) {
    recs.push({ priority: 'medium', text: `Clear the review queue (${inReview} items waiting) to maintain delivery flow` });
  }
  if (unassigned > 2) {
    recs.push({ priority: 'medium', text: `Assign ${unassigned} unowned tasks to prevent them from falling through the cracks` });
  }
  if (overloaded.length > 0) {
    recs.push({ priority: 'medium', text: `Redistribute work — ${overloaded.map(w => w.name).join(', ')} ${overloaded.length === 1 ? 'has' : 'have'} 5+ active tasks` });
  }

  // Category-specific
  if (category === 'development' && inReview > 2) {
    recs.push({ priority: 'medium', text: 'Schedule a focused code review session to clear the review backlog' });
  }
  if (category === 'operations' && critical > 0) {
    recs.push({ priority: 'high', text: 'Ensure incident response runbooks are up to date for critical items' });
  }
  if (category === 'research' && unassigned > 0) {
    recs.push({ priority: 'medium', text: 'Assign research owners early to maintain data collection timelines' });
  }
  if (category === 'marketing') {
    const dueSoon = tasks.filter(t => t.dueDate && new Date(t.dueDate) > now && (new Date(t.dueDate).getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000 && t.status !== 'DONE').length;
    if (dueSoon > 0) {
      recs.push({ priority: 'high', text: `Finalize ${dueSoon} items due this week — ensure creative assets and approvals are ready` });
    }
  }

  return recs.slice(0, 5);
}

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function AIInsightsPanel({ tasks, category, title }: AIInsightsPanelProps) {
  const insights = useMemo(() => getCategoryInsights(tasks, category), [tasks, category]);
  const recommendations = useMemo(() => getRecommendations(tasks, category), [tasks, category]);
  const workload = useMemo(() => analyzeWorkload(tasks), [tasks]);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const active = total - done;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20 px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insights</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create tasks to see AI-powered analysis and recommendations for your {CATEGORY_LABELS[category].toLowerCase()} workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20 px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          AI Insights — {CATEGORY_LABELS[category]}
        </h3>
        <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
          {total} items analyzed
        </span>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Progress</span>
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{completionRate}%</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', completionRate >= 70 ? 'bg-emerald-500' : completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active</span>
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{active}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{done} completed</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Overdue</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className={cn('text-xl font-bold', tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>
            {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">need attention</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Critical</span>
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          </div>
          <p className={cn('text-xl font-bold', tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
            {tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">high urgency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis column */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Analysis</h4>
          <div className="space-y-2">
            {insights.length > 0 ? insights.map((insight, i) => {
              const InsightIcon = insight.icon;
              return (
                <div key={i} className={cn('rounded-lg border p-3 flex items-start gap-3', INSIGHT_STYLES[insight.type])}>
                  <InsightIcon className={cn('h-4 w-4 shrink-0 mt-0.5', INSIGHT_ICON_STYLES[insight.type])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{insight.title}</p>
                      {insight.metric && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#22272B] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">All clear — no issues detected in your {CATEGORY_LABELS[category].toLowerCase()} tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations + Workload column */}
        <div className="space-y-4">
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Recommendations</h4>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] divide-y divide-slate-100 dark:divide-slate-800">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3">
                    <ArrowRight className="h-3.5 w-3.5 text-primary-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec.text}</p>
                    </div>
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0', PRIORITY_BADGE[rec.priority])}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workload distribution */}
          {workload.length > 0 && workload[0].name !== 'Unassigned' && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Team Workload</h4>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3">
                <div className="space-y-2">
                  {workload.slice(0, 5).map((member, i) => {
                    const maxTasks = workload[0].count;
                    const pct = maxTasks > 0 ? Math.round((member.count / maxTasks) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] text-white font-medium shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{member.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500">{member.count} tasks</span>
                              {member.overdue > 0 && (
                                <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">{member.overdue} late</span>
                              )}
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', member.count > 5 ? 'bg-amber-500' : 'bg-primary-500')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
