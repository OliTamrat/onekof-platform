'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Clock,
  GitBranch,
  Filter,
  Plus,
  Globe,
  X,
} from 'lucide-react';
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  ETHIOPIAN_MONTHS,
  formatEthiopianDate,
  getCurrentEthiopianDate,
  type EthiopianDate
} from '@/lib/ethiopian-calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type CalendarSystem = 'gregorian' | 'ethiopian';
export type ViewMode = 'month' | 'week' | 'day' | 'timeline';

export interface CalendarTask {
  id: string;
  title: string;
  key: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: Date | null;
  startDate?: Date | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
  };
  tags?: string[];
  dependencies?: string[];
}

interface DualCalendarProps {
  tasks?: CalendarTask[];
  onTaskClick?: (task: CalendarTask) => void;
  onTaskUpdate?: (task: CalendarTask) => void;
  onDateClick?: (date: Date) => void;
  onCreateTask?: (date: Date) => void;
  defaultView?: ViewMode;
  defaultCalendarSystem?: CalendarSystem;
  showFilters?: boolean;
  showControls?: boolean;
  projectFilter?: string[];
  statusFilter?: string[];
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-blue-400',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: 'border-l-slate-300 dark:border-l-slate-600',
  IN_PROGRESS: 'border-l-blue-500',
  IN_REVIEW: 'border-l-purple-500',
  DONE: 'border-l-emerald-500',
  BLOCKED: 'border-l-red-500',
};

const STATUS_BG: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  IN_REVIEW: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  BLOCKED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function DualCalendar({
  tasks = [],
  onTaskClick,
  onTaskUpdate,
  onDateClick,
  onCreateTask,
  defaultView = 'month',
  defaultCalendarSystem = 'gregorian',
  showFilters = true,
  showControls = true,
  projectFilter = [],
  statusFilter = []
}: DualCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(defaultCalendarSystem);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(projectFilter);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusFilter);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const today = useMemo(() => new Date(), []);

  const ethiopianDate = useMemo(() => gregorianToEthiopian(currentDate), [currentDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedProjects.length > 0 && !selectedProjects.includes(task.project.id)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) return false;
      return true;
    });
  }, [tasks, selectedProjects, selectedStatuses]);

  const uniqueProjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    tasks.forEach(t => map.set(t.project.id, { id: t.project.id, name: t.project.name, color: t.project.color }));
    return Array.from(map.values());
  }, [tasks]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      const offset = direction === 'prev' ? -1 : 1;
      if (viewMode === 'day') {
        d.setDate(d.getDate() + offset);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + offset * 7);
      } else {
        if (calendarSystem === 'ethiopian') {
          const eth = gregorianToEthiopian(prev);
          let newMonth = eth.month + offset;
          let newYear = eth.year;
          if (newMonth < 1) { newMonth = 13; newYear--; }
          else if (newMonth > 13) { newMonth = 1; newYear++; }
          return ethiopianToGregorian({ ...eth, month: newMonth, year: newYear });
        }
        d.setMonth(d.getMonth() + offset);
      }
      return d;
    });
  }, [viewMode, calendarSystem]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const formatCurrentDate = useCallback(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (calendarSystem === 'ethiopian') {
      return `${ethiopianDate.monthName} ${ethiopianDate.year}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode, calendarSystem, ethiopianDate]);

  const getCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Next month padding to fill last row
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate]);

  const getTasksForDate = useCallback((date: Date) => {
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  }, [filteredTasks]);

  const getWeekDays = useCallback(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const activeFilterCount = selectedProjects.length + selectedStatuses.length;

  // --- VIEW MODES ---
  const viewModes: { id: ViewMode; icon: typeof CalendarIcon; label: string }[] = [
    { id: 'month', icon: LayoutGrid, label: 'Month' },
    { id: 'week', icon: List, label: 'Week' },
    { id: 'day', icon: Clock, label: 'Day' },
    { id: 'timeline', icon: GitBranch, label: 'Timeline' },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#1B1F23]">
      {/* ===== HEADER ===== */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
        {/* Top row: Navigation + Calendar toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Left: Date nav */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('prev')}
                className="h-auto w-auto p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-[#282E33]"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282E33]"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('next')}
                className="h-auto w-auto p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-[#282E33]"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              {formatCurrentDate()}
            </h2>
            {calendarSystem === 'ethiopian' && viewMode !== 'day' && (
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
                ({currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
              </span>
            )}
          </div>

          {/* Right: Calendar toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalendarSystem(prev => prev === 'gregorian' ? 'ethiopian' : 'gregorian')}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282E33] shrink-0"
          >
            <Globe className="h-3.5 w-3.5 text-primary-500" />
            <span className="hidden sm:inline">{calendarSystem === 'gregorian' ? 'Gregorian' : 'Ethiopian'}</span>
            <span className="sm:hidden">{calendarSystem === 'gregorian' ? 'GC' : 'EC'}</span>
          </Button>
        </div>

        {/* Bottom row: View mode + actions */}
        {showControls && (
          <div className="flex items-center justify-between px-3 pb-2.5 sm:px-4 sm:pb-3 gap-2">
            {/* View mode tabs */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#1B1F23] p-0.5 sm:p-1">
              {viewModes.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant="ghost"
                  onClick={() => setViewMode(id)}
                  className={cn(
                    'flex h-auto items-center gap-1.5 rounded-md px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all',
                    viewMode === id
                      ? 'bg-white dark:bg-[#22272B] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    showFilterPanel || activeFilterCount > 0
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282E33]'
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onCreateTask?.(currentDate)}
                className="bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Create Task</span>
              </Button>
            </div>
          </div>
        )}

        {/* Filter panel */}
        {showFilterPanel && (
          <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-3 sm:px-4">
            <div className="flex flex-wrap gap-4">
              {/* Project filters */}
              <div className="min-w-0">
                <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Projects</p>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueProjects.map(p => {
                    const active = selectedProjects.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProjects(prev =>
                          active ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        )}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                          active
                            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/30'
                            : 'bg-slate-100 dark:bg-[#282E33] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                      >
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status filters */}
              <div className="min-w-0">
                <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'] as const).map(s => {
                    const active = selectedStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedStatuses(prev =>
                          active ? prev.filter(x => x !== s) : [...prev, s]
                        )}
                        className={cn(
                          'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                          active
                            ? STATUS_BG[s]
                            : 'bg-slate-100 dark:bg-[#282E33] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedProjects([]); setSelectedStatuses([]); }}
                  className="self-end text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== CALENDAR BODY ===== */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && <MonthView
          days={getCalendarDays()}
          currentDate={currentDate}
          today={today}
          calendarSystem={calendarSystem}
          getTasksForDate={getTasksForDate}
          onDateClick={onDateClick}
          onTaskClick={onTaskClick}
        />}
        {viewMode === 'week' && <WeekView
          days={getWeekDays()}
          currentDate={currentDate}
          today={today}
          calendarSystem={calendarSystem}
          filteredTasks={filteredTasks}
          onDateClick={onDateClick}
          onTaskClick={onTaskClick}
        />}
        {viewMode === 'day' && <DayView
          currentDate={currentDate}
          today={today}
          calendarSystem={calendarSystem}
          ethiopianDate={ethiopianDate}
          filteredTasks={filteredTasks}
          getTasksForDate={getTasksForDate}
          onDateClick={onDateClick}
          onTaskClick={onTaskClick}
        />}
        {viewMode === 'timeline' && <TimelineView
          currentDate={currentDate}
          today={today}
          calendarSystem={calendarSystem}
          filteredTasks={filteredTasks}
          onTaskClick={onTaskClick}
        />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TASK CHIP — Reusable compact task display
// ──────────────────────────────────────────────
function TaskChip({
  task,
  compact = false,
  onClick,
}: {
  task: CalendarTask;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={cn(
        'w-full text-left rounded-md border-l-[3px] transition-all cursor-pointer group',
        'hover:shadow-md hover:scale-[1.01]',
        'bg-white dark:bg-[#22272B]',
        STATUS_COLORS[task.status] || 'border-l-slate-300',
        compact ? 'px-1.5 py-0.5' : 'px-2 py-1.5'
      )}
      style={!STATUS_COLORS[task.status] ? { borderLeftColor: task.project.color } : undefined}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_COLORS[task.priority])} />
        {!compact && (
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {task.key}
          </span>
        )}
        <span className={cn(
          'truncate text-slate-800 dark:text-slate-200',
          compact ? 'text-[10px]' : 'text-xs'
        )}>
          {task.title}
        </span>
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────
// MONTH VIEW
// ──────────────────────────────────────────────
function MonthView({
  days,
  currentDate,
  today,
  calendarSystem,
  getTasksForDate,
  onDateClick,
  onTaskClick,
}: {
  days: (Date | null)[];
  currentDate: Date;
  today: Date;
  calendarSystem: CalendarSystem;
  getTasksForDate: (date: Date) => CalendarTask[];
  onDateClick?: (date: Date) => void;
  onTaskClick?: (task: CalendarTask) => void;
}) {
  const dayNames = {
    short: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    medium: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="h-full flex flex-col">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B]">
        {dayNames.short.map((short, i) => (
          <div
            key={i}
            className="py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline lg:hidden">{dayNames.medium[i]}</span>
            <span className="hidden lg:inline">{dayNames.long[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 last:border-b-0 min-h-0">
            {week.map((date, dayIdx) => {
              if (!date) return <div key={dayIdx} className="border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-slate-50/50 dark:bg-[#1B1F23]/50" />;

              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(date, today);
              const dayTasks = getTasksForDate(date);
              const ethDay = calendarSystem === 'ethiopian' ? gregorianToEthiopian(date) : null;

              return (
                <div
                  key={dayIdx}
                  onClick={() => onDateClick?.(date)}
                  className={cn(
                    'border-r border-slate-200 dark:border-slate-700 last:border-r-0 p-1 sm:p-1.5 lg:p-2 cursor-pointer transition-colors overflow-hidden flex flex-col',
                    'hover:bg-slate-50 dark:hover:bg-[#282E33]',
                    !isCurrentMonth && 'bg-slate-50/60 dark:bg-[#1B1F23]/40'
                  )}
                >
                  {/* Date number */}
                  <div className="flex items-start justify-between mb-0.5 sm:mb-1">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium',
                          isToday
                            ? 'bg-primary-500 text-white font-semibold'
                            : isCurrentMonth
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {ethDay && (
                        <span className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                          {ethDay.day}
                        </span>
                      )}
                    </div>
                    {dayTasks.length > 0 && (
                      <span className="hidden sm:flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500/10 px-1 text-[9px] font-semibold text-primary-600 dark:text-primary-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task list */}
                  <div className="flex-1 space-y-0.5 overflow-hidden min-h-0">
                    {/* Mobile: show dots only */}
                    <div className="sm:hidden flex flex-wrap gap-0.5">
                      {dayTasks.slice(0, 4).map(task => (
                        <span
                          key={task.id}
                          className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_COLORS[task.priority])}
                          onClick={(e) => { e.stopPropagation(); onTaskClick?.(task); }}
                        />
                      ))}
                      {dayTasks.length > 4 && (
                        <span className="text-[8px] text-slate-400">+{dayTasks.length - 4}</span>
                      )}
                    </div>

                    {/* Tablet+: show task chips */}
                    <div className="hidden sm:block space-y-0.5">
                      {dayTasks.slice(0, 2).map(task => (
                        <TaskChip
                          key={task.id}
                          task={task}
                          compact
                          onClick={() => onTaskClick?.(task)}
                        />
                      ))}
                      {dayTasks.length > 2 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="w-full text-center rounded-md py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282E33] transition-colors"
                        >
                          +{dayTasks.length - 2} more
                        </button>
                      )}
                    </div>

                    {/* Desktop: show more task chips */}
                    <div className="hidden lg:block space-y-0.5">
                      {dayTasks.slice(2, 3).map(task => (
                        <TaskChip
                          key={task.id}
                          task={task}
                          compact
                          onClick={() => onTaskClick?.(task)}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="w-full text-center rounded-md py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282E33] transition-colors"
                        >
                          +{dayTasks.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// WEEK VIEW
// ──────────────────────────────────────────────
function WeekView({
  days,
  currentDate,
  today,
  calendarSystem,
  filteredTasks,
  onDateClick,
  onTaskClick,
}: {
  days: Date[];
  currentDate: Date;
  today: Date;
  calendarSystem: CalendarSystem;
  filteredTasks: CalendarTask[];
  onDateClick?: (date: Date) => void;
  onTaskClick?: (task: CalendarTask) => void;
}) {
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getHourTasks = useCallback((day: Date, hour: number) => {
    return filteredTasks.filter(task => {
      const d = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : null;
      if (!d) return false;
      return isSameDay(d, day) && d.getHours() === hour;
    });
  }, [filteredTasks]);

  const getAllDayTasks = useCallback((day: Date) => {
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      if (task.startDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  }, [filteredTasks]);

  return (
    <div className="h-full flex flex-col">
      {/* Day headers — sticky */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#22272B] border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_repeat(7,1fr)]">
          <div className="border-r border-slate-200 dark:border-slate-700" />
          {/* Mobile: show all 7 days in scrollable row */}
          <div className="grid grid-cols-7 sm:contents">
            {days.map((day, i) => {
              const isToday = isSameDay(day, today);
              const ethDay = calendarSystem === 'ethiopian' ? gregorianToEthiopian(day) : null;
              return (
                <div
                  key={i}
                  className={cn(
                    'py-2 sm:py-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0',
                    isToday && 'bg-primary-500/5'
                  )}
                >
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    <span className="sm:hidden">{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                    <span className="hidden sm:inline">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                  <div className={cn(
                    'mt-0.5 inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-sm sm:text-base font-semibold',
                    isToday
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-900 dark:text-white'
                  )}>
                    {day.getDate()}
                  </div>
                  {ethDay && (
                    <div className="hidden sm:block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {ethDay.day} {ethDay.monthName.slice(0, 3)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* All-day tasks row */}
        {days.some(d => getAllDayTasks(d).length > 0) && (
          <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_repeat(7,1fr)] border-t border-slate-200 dark:border-slate-700">
            <div className="border-r border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">ALL DAY</span>
            </div>
            <div className="grid grid-cols-7 sm:contents">
              {days.map((day, i) => {
                const allDay = getAllDayTasks(day);
                return (
                  <div key={i} className="border-r border-slate-200 dark:border-slate-700 last:border-r-0 p-1 min-h-[28px]">
                    {allDay.slice(0, 2).map(task => (
                      <TaskChip key={task.id} task={task} compact onClick={() => onTaskClick?.(task)} />
                    ))}
                    {allDay.length > 2 && (
                      <span className="text-[9px] text-slate-400">+{allDay.length - 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100 dark:border-slate-800 min-h-[48px] sm:min-h-[56px]">
            {/* Hour label */}
            <div className="border-r border-slate-200 dark:border-slate-700 px-1 py-1 text-right">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
                {formatHour(hour)}
              </span>
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-7 sm:contents">
              {days.map((day, i) => {
                const hourTasks = getHourTasks(day, hour);
                const hourDate = new Date(day);
                hourDate.setHours(hour, 0, 0, 0);

                return (
                  <div
                    key={i}
                    onClick={() => onDateClick?.(hourDate)}
                    className={cn(
                      'border-r border-slate-100 dark:border-slate-800 last:border-r-0 p-0.5 sm:p-1 cursor-pointer',
                      'hover:bg-slate-50 dark:hover:bg-[#282E33] transition-colors',
                      isSameDay(day, today) && 'bg-primary-500/[0.02]'
                    )}
                  >
                    {hourTasks.map(task => (
                      <TaskChip key={task.id} task={task} compact onClick={() => onTaskClick?.(task)} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// DAY VIEW
// ──────────────────────────────────────────────
function DayView({
  currentDate,
  today,
  calendarSystem,
  ethiopianDate,
  filteredTasks,
  getTasksForDate,
  onDateClick,
  onTaskClick,
}: {
  currentDate: Date;
  today: Date;
  calendarSystem: CalendarSystem;
  ethiopianDate: EthiopianDate;
  filteredTasks: CalendarTask[];
  getTasksForDate: (date: Date) => CalendarTask[];
  onDateClick?: (date: Date) => void;
  onTaskClick?: (task: CalendarTask) => void;
}) {
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const allDayTasks = getTasksForDate(currentDate).filter(t => !t.startDate);

  const getHourTasks = (hour: number) => {
    return filteredTasks.filter(task => {
      const d = task.startDate ? new Date(task.startDate) : null;
      if (!d) return false;
      return isSameDay(d, currentDate) && d.getHours() === hour;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day header with Ethiopian date */}
      {calendarSystem === 'ethiopian' && (
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B]">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatEthiopianDate(ethiopianDate, 'full')}
          </p>
        </div>
      )}

      {/* All-day tasks section */}
      {allDayTasks.length > 0 && (
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1B1F23]/50">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">All Day</p>
          <div className="space-y-1">
            {allDayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={cn(
                  'rounded-lg border-l-[3px] p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md',
                  'bg-white dark:bg-[#22272B]',
                  STATUS_COLORS[task.status]
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('h-2 w-2 rounded-full', PRIORITY_COLORS[task.priority])} />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{task.key}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium', STATUS_BG[task.status])}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-900 dark:text-white">{task.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.project.color }} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{task.project.name}</span>
                  {task.assignee && (
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-[9px] text-white font-medium">
                        {task.assignee.name.charAt(0)}
                      </div>
                      <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">{task.assignee.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly grid */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => {
          const hourTasks = getHourTasks(hour);
          const hourDate = new Date(currentDate);
          hourDate.setHours(hour, 0, 0, 0);
          const isNow = isSameDay(currentDate, today) && today.getHours() === hour;

          return (
            <div
              key={hour}
              onClick={() => onDateClick?.(hourDate)}
              className={cn(
                'grid grid-cols-[48px_1fr] sm:grid-cols-[64px_1fr] border-b border-slate-100 dark:border-slate-800 min-h-[56px] sm:min-h-[64px] cursor-pointer',
                'hover:bg-slate-50/50 dark:hover:bg-[#282E33]/50 transition-colors',
                isNow && 'bg-primary-500/5'
              )}
            >
              {/* Time label */}
              <div className="px-2 py-2 text-right border-r border-slate-200 dark:border-slate-700">
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium',
                  isNow ? 'text-primary-500 font-semibold' : 'text-slate-400 dark:text-slate-500'
                )}>
                  {formatHour(hour)}
                </span>
              </div>

              {/* Tasks area */}
              <div className="p-1.5 sm:p-2 space-y-1">
                {hourTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick?.(task); }}
                    className={cn(
                      'rounded-lg border-l-[3px] p-2 sm:p-2.5 cursor-pointer transition-all hover:shadow-md',
                      'bg-white dark:bg-[#22272B]',
                      STATUS_COLORS[task.status]
                    )}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('h-2 w-2 rounded-full', PRIORITY_COLORS[task.priority])} />
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{task.key}</span>
                      {task.startDate && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                          {new Date(task.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 dark:text-white">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.project.color }} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{task.project.name}</span>
                      {task.assignee && (
                        <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center text-[8px] text-white font-medium ml-auto">
                          {task.assignee.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TIMELINE VIEW
// ──────────────────────────────────────────────
function TimelineView({
  currentDate,
  today,
  calendarSystem,
  filteredTasks,
  onTaskClick,
}: {
  currentDate: Date;
  today: Date;
  calendarSystem: CalendarSystem;
  filteredTasks: CalendarTask[];
  onTaskClick?: (task: CalendarTask) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const timelineTasks = useMemo(() =>
    filteredTasks.filter(t => t.startDate && t.dueDate),
    [filteredTasks]
  );

  const dayWidth = 36;

  return (
    <div className="h-full flex flex-col">
      {timelineTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <GitBranch className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No scheduled tasks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add start and due dates to see tasks in timeline view</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="inline-flex flex-col min-w-full">
            {/* Date header row */}
            <div className="sticky top-0 z-10 flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B]">
              {/* Task name column */}
              <div className="sticky left-0 z-20 w-40 sm:w-56 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B] px-3 py-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task</span>
              </div>

              {/* Day columns */}
              <div className="flex">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = new Date(year, month, i + 1);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isTodayCol = isSameDay(date, today);
                  const ethDay = calendarSystem === 'ethiopian' ? gregorianToEthiopian(date) : null;

                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex flex-col items-center justify-center py-2 border-r border-slate-100 dark:border-slate-800',
                        isWeekend && 'bg-slate-100/50 dark:bg-[#1B1F23]/30',
                        isTodayCol && 'bg-primary-500/10'
                      )}
                      style={{ width: dayWidth, minWidth: dayWidth }}
                    >
                      <span className={cn(
                        'text-[9px] font-medium',
                        isTodayCol ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                      )}>
                        {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                      <span className={cn(
                        'text-[11px] font-semibold mt-0.5',
                        isTodayCol
                          ? 'bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center'
                          : 'text-slate-600 dark:text-slate-300'
                      )}>
                        {date.getDate()}
                      </span>
                      {ethDay && (
                        <span className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5">{ethDay.day}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task rows */}
            <div>
              {timelineTasks.map(task => {
                const start = new Date(task.startDate!);
                const end = new Date(task.dueDate!);
                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);

                // Clamp bars to visible month
                const barStart = start < monthStart ? monthStart : start;
                const barEnd = end > monthEnd ? monthEnd : end;
                const startDay = barStart.getDate() - 1;
                const duration = Math.max(1, Math.ceil((barEnd.getTime() - barStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                const isVisible = start <= monthEnd && end >= monthStart;

                if (!isVisible) return null;

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-[#282E33]/30 transition-colors"
                  >
                    {/* Task info — pinned left */}
                    <div
                      onClick={() => onTaskClick?.(task)}
                      className="sticky left-0 z-10 w-40 sm:w-56 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-2 sm:px-3 py-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_COLORS[task.priority])} />
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary-500 truncate">
                          {task.key}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{task.title}</p>
                      <div className="hidden sm:flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.project.color }} />
                        <span className="text-[9px] text-slate-400">{task.project.key}</span>
                        {task.assignee && (
                          <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center text-[7px] text-white font-medium ml-auto">
                            {task.assignee.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline bar area */}
                    <div className="relative flex items-center" style={{ width: daysInMonth * dayWidth }}>
                      {/* Weekend shading */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const d = new Date(year, month, i + 1);
                        if (d.getDay() !== 0 && d.getDay() !== 6) return null;
                        return (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 bg-slate-50/50 dark:bg-[#1B1F23]/20"
                            style={{ left: i * dayWidth, width: dayWidth }}
                          />
                        );
                      })}

                      {/* Today line */}
                      {today.getMonth() === month && today.getFullYear() === year && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-primary-500 z-[5]"
                          style={{ left: (today.getDate() - 1) * dayWidth + dayWidth / 2 }}
                        />
                      )}

                      {/* Task bar */}
                      <div
                        onClick={() => onTaskClick?.(task)}
                        className="absolute top-1/2 -translate-y-1/2 h-6 sm:h-7 rounded-full cursor-pointer shadow-sm hover:shadow-md hover:brightness-110 transition-all z-[4] flex items-center px-2"
                        style={{
                          left: startDay * dayWidth + 2,
                          width: Math.max(duration * dayWidth - 4, 20),
                          backgroundColor: task.project.color,
                        }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-semibold text-white truncate">
                          {task.key}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="sticky left-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B] px-3 py-2">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
                {Object.entries(PRIORITY_COLORS).map(([label, cls]) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className={cn('h-2 w-2 rounded-full', cls)} />
                    <span className="text-slate-500 dark:text-slate-400 capitalize">{label.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
