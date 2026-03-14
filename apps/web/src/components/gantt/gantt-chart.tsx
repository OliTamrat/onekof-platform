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
  onTaskUpdate?: (taskId: string, updates: { startDate?: Date; endDate?: Date }) => void;
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

type DragMode = 'move' | 'resize-left' | 'resize-right';

export function GanttChart({ tasks, startDate: propStart, endDate: propEnd, onTaskUpdate, className }: GanttChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredTaskId, setHoveredTaskId] = React.useState<string | null>(null);
  const [dragState, setDragState] = React.useState<{
    taskId: string;
    mode: DragMode;
    startMouseX: number;
    originalStartDate: Date;
    originalEndDate: Date;
  } | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; task: GanttTask } | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        No tasks to display on the timeline
      </div>
    );
  }

  const dayWidth = 32;
  const rowHeight = 44;

  const allDates = tasks.flatMap((t) => [t.startDate, t.endDate]);
  const minDate = propStart || new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = propEnd || new Date(Math.max(...allDates.map((d) => d.getTime())));
  const chartStart = addDays(minDate, -3);
  const chartEnd = addDays(maxDate, 7);
  const totalDays = getDaysBetween(chartStart, chartEnd);
  const totalWidth = totalDays * dayWidth;

  const weeks: { date: Date; x: number; label: string }[] = [];
  const current = new Date(chartStart);
  current.setDate(current.getDate() - current.getDay());
  while (current <= chartEnd) {
    const x = getDaysBetween(chartStart, current) * dayWidth;
    weeks.push({ date: new Date(current), x, label: formatDate(current) });
    current.setDate(current.getDate() + 7);
  }

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

  const today = new Date();
  const todayX = getDaysBetween(chartStart, today) * dayWidth;
  const showToday = today >= chartStart && today <= chartEnd;

  const handleMouseDown = (e: React.MouseEvent, taskId: string, mode: DragMode) => {
    if (!onTaskUpdate) return;
    e.preventDefault();
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setDragState({
      taskId,
      mode,
      startMouseX: e.clientX,
      originalStartDate: new Date(task.startDate),
      originalEndDate: new Date(task.endDate),
    });
    setDragOffset(0);
  };

  React.useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startMouseX;
      setDragOffset(dx);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState || !onTaskUpdate) {
        setDragState(null);
        setDragOffset(0);
        return;
      }

      const dx = e.clientX - dragState.startMouseX;
      const daysDelta = Math.round(dx / dayWidth);

      if (daysDelta !== 0) {
        if (dragState.mode === 'move') {
          onTaskUpdate(dragState.taskId, {
            startDate: addDays(dragState.originalStartDate, daysDelta),
            endDate: addDays(dragState.originalEndDate, daysDelta),
          });
        } else if (dragState.mode === 'resize-left') {
          const newStart = addDays(dragState.originalStartDate, daysDelta);
          if (newStart < dragState.originalEndDate) {
            onTaskUpdate(dragState.taskId, { startDate: newStart });
          }
        } else if (dragState.mode === 'resize-right') {
          const newEnd = addDays(dragState.originalEndDate, daysDelta);
          if (newEnd > dragState.originalStartDate) {
            onTaskUpdate(dragState.taskId, { endDate: newEnd });
          }
        }
      }

      setDragState(null);
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onTaskUpdate]);

  const getBarPosition = (task: GanttTask) => {
    let startX = getDaysBetween(chartStart, task.startDate) * dayWidth;
    let barWidth = Math.max(getDaysBetween(task.startDate, task.endDate) * dayWidth, dayWidth);

    if (dragState?.taskId === task.id) {
      const daysDelta = Math.round(dragOffset / dayWidth);
      if (dragState.mode === 'move') {
        startX += daysDelta * dayWidth;
      } else if (dragState.mode === 'resize-left') {
        const newStartX = startX + daysDelta * dayWidth;
        barWidth = barWidth - daysDelta * dayWidth;
        if (barWidth >= dayWidth) {
          startX = newStartX;
        }
      } else if (dragState.mode === 'resize-right') {
        barWidth += daysDelta * dayWidth;
        if (barWidth < dayWidth) barWidth = dayWidth;
      }
    }

    return { startX, barWidth: Math.max(barWidth, dayWidth) };
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#22272B]', className)}>
      <div className="flex">
        {/* Left: Task names */}
        <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-14 items-center border-b border-gray-200 px-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
            Task
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center border-b border-gray-100 px-4 transition-colors dark:border-gray-700/50',
                hoveredTaskId === task.id && 'bg-teal-50/50 dark:bg-teal-900/10'
              )}
              style={{ height: rowHeight }}
              onMouseEnter={() => setHoveredTaskId(task.id)}
              onMouseLeave={() => setHoveredTaskId(null)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{task.name}</p>
                {task.assignee && (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{task.assignee}</p>
                )}
              </div>
              <span className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-500">{task.progress}%</span>
            </div>
          ))}
        </div>

        {/* Right: Gantt bars */}
        <div className="flex-1 overflow-x-auto" ref={containerRef}>
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Month headers */}
            <div className="relative flex h-7 border-b border-gray-200 dark:border-gray-700">
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
            <div className="relative" style={{ cursor: dragState ? (dragState.mode === 'move' ? 'grabbing' : 'col-resize') : undefined }}>
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
              {tasks.map((task) => {
                const { startX, barWidth } = getBarPosition(task);
                const colorClass = task.color || statusColors[task.status || 'default'] || statusColors.default;
                const isHovered = hoveredTaskId === task.id;
                const isDragging = dragState?.taskId === task.id;
                const isInteractive = !!onTaskUpdate;

                if (task.type === 'milestone') {
                  return (
                    <div
                      key={task.id}
                      className="relative flex items-center"
                      style={{ height: rowHeight }}
                    >
                      <div
                        className="absolute h-4 w-4 rotate-45 bg-purple-500 shadow-sm"
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
                    className={cn(
                      'relative flex items-center border-b border-gray-50 transition-colors dark:border-gray-700/20',
                      isHovered && 'bg-teal-50/30 dark:bg-teal-900/5'
                    )}
                    style={{ height: rowHeight }}
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => { if (!isDragging) setHoveredTaskId(null); }}
                  >
                    {/* Background bar */}
                    <div
                      className={cn('absolute h-8 rounded-md opacity-15 transition-opacity', colorClass, isHovered && 'opacity-25')}
                      style={{ left: startX, width: barWidth }}
                    />

                    {/* Progress bar */}
                    <div
                      className={cn('absolute h-8 rounded-md transition-shadow', colorClass, (isHovered || isDragging) && 'shadow-md')}
                      style={{ left: startX, width: barWidth * (task.progress / 100) }}
                      role="progressbar"
                      aria-valuenow={task.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${task.name}: ${task.progress}% complete`}
                    />

                    {/* Interactive overlay */}
                    {isInteractive && (
                      <>
                        {/* Left resize handle */}
                        <div
                          className={cn(
                            'absolute top-1/2 z-20 h-6 w-2 -translate-y-1/2 cursor-col-resize rounded-l-sm transition-opacity',
                            isHovered || isDragging ? 'opacity-100' : 'opacity-0',
                            'bg-white/80 dark:bg-gray-200/80 shadow-sm'
                          )}
                          style={{ left: startX }}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-left')}
                        >
                          <div className="flex h-full items-center justify-center">
                            <div className="h-3 w-0.5 rounded bg-gray-400" />
                          </div>
                        </div>

                        {/* Move handle (center) */}
                        <div
                          className="absolute z-10 h-8 cursor-grab active:cursor-grabbing"
                          style={{ left: startX + 8, width: Math.max(barWidth - 16, 4) }}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                        />

                        {/* Right resize handle */}
                        <div
                          className={cn(
                            'absolute top-1/2 z-20 h-6 w-2 -translate-y-1/2 cursor-col-resize rounded-r-sm transition-opacity',
                            isHovered || isDragging ? 'opacity-100' : 'opacity-0',
                            'bg-white/80 dark:bg-gray-200/80 shadow-sm'
                          )}
                          style={{ left: startX + barWidth - 8 }}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-right')}
                        >
                          <div className="flex h-full items-center justify-center">
                            <div className="h-3 w-0.5 rounded bg-gray-400" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Label */}
                    <div
                      className="pointer-events-none absolute flex h-8 items-center px-3 text-xs font-medium text-white"
                      style={{ left: startX, width: barWidth }}
                    >
                      <span className="truncate drop-shadow-sm">
                        {barWidth > 100 ? `${task.name} · ${task.progress}%` : barWidth > 50 ? `${task.progress}%` : ''}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    {isHovered && !isDragging && (
                      <div
                        className="pointer-events-none absolute z-30 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800"
                        style={{ left: startX + barWidth + 8, top: 2 }}
                      >
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{task.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {formatDate(task.startDate)} — {formatDate(task.endDate)}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Progress: {task.progress}%
                        </p>
                        {task.assignee && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Assignee: {task.assignee}
                          </p>
                        )}
                      </div>
                    )}
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
