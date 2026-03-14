'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color?: string;
  dependencies?: string[];
  assignee?: string;
  status?: string;
  type?: 'task' | 'milestone' | 'group';
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

function getDaysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function GanttChart({ tasks, startDate: propStart, endDate: propEnd, className }: GanttChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        No tasks to display on the timeline
      </div>
    );
  }

  // Calculate date range
  const allDates = tasks.flatMap((t) => [t.startDate, t.endDate]);
  const minDate = propStart || new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = propEnd || new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Add padding
  const chartStart = addDays(minDate, -3);
  const chartEnd = addDays(maxDate, 7);
  const totalDays = getDaysBetween(chartStart, chartEnd);
  const dayWidth = 32;
  const totalWidth = totalDays * dayWidth;
  const rowHeight = 40;
  const headerHeight = 56;

  // Generate week markers
  const weeks: { date: Date; x: number; label: string }[] = [];
  const current = new Date(chartStart);
  current.setDate(current.getDate() - current.getDay()); // Start on Sunday
  while (current <= chartEnd) {
    const x = getDaysBetween(chartStart, current) * dayWidth;
    weeks.push({ date: new Date(current), x, label: formatDate(current) });
    current.setDate(current.getDate() + 7);
  }

  // Generate month headers
  const months: { label: string; x: number; width: number }[] = [];
  let monthStart = new Date(chartStart.getFullYear(), chartStart.getMonth(), 1);
  while (monthStart <= chartEnd) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const x = Math.max(0, getDaysBetween(chartStart, monthStart) * dayWidth);
    const endX = Math.min(totalWidth, getDaysBetween(chartStart, monthEnd) * dayWidth);
    months.push({ label: getMonthLabel(monthStart), x, width: endX - x });
    monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500',
    active: 'bg-teal-500',
    'in-progress': 'bg-teal-500',
    planning: 'bg-blue-400',
    'on-hold': 'bg-amber-500',
    cancelled: 'bg-red-400',
    default: 'bg-teal-500',
  };

  // Today marker
  const today = new Date();
  const todayX = getDaysBetween(chartStart, today) * dayWidth;
  const showToday = today >= chartStart && today <= chartEnd;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#22272B]', className)}>
      {/* Task list + Chart area */}
      <div className="flex">
        {/* Left: Task names */}
        <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-14 items-center border-b border-gray-200 px-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
            Task
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center border-b border-gray-100 px-4 dark:border-gray-700/50"
              style={{ height: rowHeight }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{task.name}</p>
                {task.assignee && (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{task.assignee}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Gantt bars */}
        <div className="flex-1 overflow-x-auto" ref={containerRef}>
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Month headers */}
            <div className="flex h-7 border-b border-gray-200 dark:border-gray-700">
              {months.map((month, i) => (
                <div
                  key={i}
                  className="absolute border-r border-gray-200 px-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  style={{ left: month.x, width: month.width, lineHeight: '28px' }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Week headers */}
            <div className="relative flex h-7 border-b border-gray-200 dark:border-gray-700">
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="absolute text-center text-[10px] text-gray-500 dark:text-gray-400"
                  style={{ left: week.x, width: dayWidth * 7, lineHeight: '28px' }}
                >
                  {week.label}
                </div>
              ))}
            </div>

            {/* Task rows */}
            <div className="relative">
              {/* Grid lines */}
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-100 dark:border-gray-700/30"
                  style={{ left: week.x }}
                />
              ))}

              {/* Today marker */}
              {showToday && (
                <div
                  className="absolute top-0 z-10 h-full w-0.5 bg-red-400"
                  style={{ left: todayX }}
                >
                  <div className="absolute -left-2.5 -top-0.5 rounded bg-red-400 px-1 text-[10px] font-medium text-white">
                    Today
                  </div>
                </div>
              )}

              {/* Gantt bars */}
              {tasks.map((task, index) => {
                const startX = getDaysBetween(chartStart, task.startDate) * dayWidth;
                const barWidth = Math.max(getDaysBetween(task.startDate, task.endDate) * dayWidth, dayWidth);
                const colorClass = task.color || statusColors[task.status || 'default'] || statusColors.default;

                if (task.type === 'milestone') {
                  return (
                    <div
                      key={task.id}
                      className="relative flex items-center"
                      style={{ height: rowHeight }}
                    >
                      <div
                        className="absolute h-4 w-4 rotate-45 bg-purple-500"
                        style={{ left: startX - 8, top: (rowHeight - 16) / 2 }}
                        title={`${task.name}: ${formatDate(task.startDate)}`}
                        role="img"
                        aria-label={`Milestone: ${task.name} on ${formatDate(task.startDate)}`}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className="relative flex items-center border-b border-gray-50 dark:border-gray-700/20"
                    style={{ height: rowHeight }}
                  >
                    {/* Background bar */}
                    <div
                      className={cn('absolute h-7 rounded-md opacity-20', colorClass)}
                      style={{ left: startX, width: barWidth }}
                    />
                    {/* Progress bar */}
                    <div
                      className={cn('absolute h-7 rounded-md', colorClass)}
                      style={{ left: startX, width: barWidth * (task.progress / 100) }}
                      role="progressbar"
                      aria-valuenow={task.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${task.name}: ${task.progress}% complete`}
                    />
                    {/* Label */}
                    <div
                      className="absolute flex h-7 items-center px-2 text-xs font-medium text-white"
                      style={{ left: startX, width: barWidth }}
                    >
                      <span className="truncate drop-shadow-sm">
                        {barWidth > 80 ? `${task.progress}%` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
