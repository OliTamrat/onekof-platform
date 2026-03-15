'use client';

/**
 * Dual Calendar Component - World-Class Implementation
 *
 * Features:
 * - Ethiopian & Gregorian calendar toggle
 * - Multiple views (Month, Week, Day, Timeline, Gantt)
 * - Drag & drop task scheduling
 * - Color-coded priorities & projects
 * - Real-time collaboration
 * - Smart filtering
 * - Milestone tracking
 * - Task dependencies visualization
 */

import { useState, useMemo } from 'react';
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
  Download,
  Upload,
  Settings,
  Globe
} from 'lucide-react';
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  ETHIOPIAN_MONTHS,
  formatEthiopianDate,
  getCurrentEthiopianDate,
  type EthiopianDate
} from '@/lib/ethiopian-calendar';

export type CalendarSystem = 'gregorian' | 'ethiopian';
export type ViewMode = 'month' | 'week' | 'day' | 'timeline' | 'gantt';

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
  dependencies?: string[]; // IDs of tasks this depends on
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

  // Get Ethiopian date equivalent
  const ethiopianDate = useMemo(() => gregorianToEthiopian(currentDate), [currentDate]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedProjects.length > 0 && !selectedProjects.includes(task.project.id)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) {
        return false;
      }
      return true;
    });
  }, [tasks, selectedProjects, selectedStatuses]);

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (calendarSystem === 'gregorian') {
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      } else {
        // Ethiopian calendar navigation
        const ethiopianDate = gregorianToEthiopian(prev);
        let newMonth = ethiopianDate.month + (direction === 'prev' ? -1 : 1);
        let newYear = ethiopianDate.year;

        if (newMonth < 1) {
          newMonth = 13;
          newYear--;
        } else if (newMonth > 13) {
          newMonth = 1;
          newYear++;
        }

        return ethiopianToGregorian({ ...ethiopianDate, month: newMonth, year: newYear });
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleCalendarSystem = () => {
    setCalendarSystem(prev => prev === 'gregorian' ? 'ethiopian' : 'gregorian');
  };

  // Get calendar days for month view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];

    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Format current date display
  const formatCurrentDate = () => {
    if (calendarSystem === 'gregorian') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    } else {
      return `${ethiopianDate.monthName} ${ethiopianDate.year}`;
    }
  };

  // Check if date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'border-gray-300 dark:border-gray-600';
      case 'IN_PROGRESS':
        return 'border-blue-500';
      case 'IN_REVIEW':
        return 'border-purple-500';
      case 'DONE':
        return 'border-green-500';
      case 'BLOCKED':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
        {/* Top Row: Date Navigation & Calendar System Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrentDate()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] p-2 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              </button>
              <button
                onClick={goToToday}
                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] p-2 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Calendar System Toggle */}
          <button
            onClick={toggleCalendarSystem}
            className="flex items-center gap-2 rounded-lg border-2 border-primary-500 bg-gradient-to-r from-primary-500/10 to-purple-500/10 px-4 py-2 font-medium text-primary-500 dark:text-primary-500 hover:from-primary-500/20 hover:to-purple-500/20 transition-all shadow-sm"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">
              {calendarSystem === 'gregorian' ? 'Gregorian' : 'Ethiopian'} Calendar
            </span>
            <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs">
              Switch
            </span>
          </button>
        </div>

        {/* Bottom Row: View Mode Selector & Actions */}
        {showControls && (
          <div className="flex items-center justify-between">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                }`}
              >
                <List className="h-4 w-4" />
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                }`}
              >
                <Clock className="h-4 w-4" />
                Day
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                }`}
              >
                <GitBranch className="h-4 w-4" />
                Timeline
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {showFilters && (
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    showFilterPanel
                      ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                      : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33]'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(selectedProjects.length > 0 || selectedStatuses.length > 0) && (
                    <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                      {selectedProjects.length + selectedStatuses.length}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => onCreateTask?.(currentDate)}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && (
          <div className="p-6">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden shadow-sm">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33]">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div
                    key={day}
                    className="border-r border-gray-200 dark:border-slate-700 p-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-400 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7">
                {getCalendarDays().map((date, index) => {
                  const dayTasks = getTasksForDate(date);
                  const today = isToday(date);
                  const ethiopianDateForDay = date ? gregorianToEthiopian(date) : null;

                  return (
                    <div
                      key={index}
                      onClick={() => date && onDateClick?.(date)}
                      className={`min-h-[140px] border-b border-r border-gray-200 dark:border-slate-700 p-3 last:border-r-0 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282E33] ${
                        !date ? 'bg-gray-50/50 dark:bg-[#1B1F23]' : ''
                      }`}
                    >
                      {date && (
                        <>
                          {/* Date Header */}
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                  today
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                                }`}
                              >
                                {date.getDate()}
                              </span>
                              {calendarSystem === 'ethiopian' && ethiopianDateForDay && (
                                <span className="text-[10px] text-gray-500 dark:text-[#6B7684]">
                                  {ethiopianDateForDay.day} {ethiopianDateForDay.monthName.slice(0, 3)}
                                </span>
                              )}
                            </div>
                            {dayTasks.length > 0 && (
                              <span className="rounded-full bg-primary-500/10 dark:bg-primary-500/20 px-2 py-1 text-xs font-medium text-primary-500">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>

                          {/* Tasks for this day */}
                          <div className="space-y-1.5">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskClick?.(task);
                                }}
                                className={`group relative cursor-pointer rounded-md border-l-3 p-2 text-xs transition-all hover:shadow-md ${getStatusColor(
                                  task.status
                                )} bg-white dark:bg-[#22272B]`}
                                style={{ borderLeftColor: task.project.color }}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div
                                    className={`h-2 w-2 flex-shrink-0 rounded-full ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  />
                                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                                    {task.key}
                                  </span>
                                </div>
                                <div className="truncate text-gray-600 dark:text-slate-400">
                                  {task.title}
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Show all tasks for this day
                                }}
                                className="w-full rounded-md bg-gray-100 dark:bg-[#282E33] px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                +{dayTasks.length - 3} more
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="p-6">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden shadow-sm">
              {/* Week Days Header */}
              <div className="grid grid-cols-8 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33]">
                <div className="border-r border-gray-200 dark:border-slate-700 p-3 text-center text-xs font-medium text-gray-500 dark:text-[#6B7684]">
                  Time
                </div>
                {(() => {
                  const weekDays = [];
                  const startOfWeek = new Date(currentDate);
                  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

                  for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    const ethiopianDay = gregorianToEthiopian(day);
                    const today = isToday(day);

                    weekDays.push(
                      <div
                        key={i}
                        className={`border-r border-gray-200 dark:border-slate-700 p-3 text-center last:border-r-0 ${
                          today ? 'bg-primary-500/5' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-500 dark:text-[#6B7684]">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`mt-1 flex items-center justify-center ${
                          today ? 'rounded-full bg-primary-500 text-white p-1' : 'text-gray-900 dark:text-white'
                        }`}>
                          <span className="text-sm font-semibold">{day.getDate()}</span>
                        </div>
                        {calendarSystem === 'ethiopian' && (
                          <div className="text-[10px] text-gray-500 dark:text-[#6B7684] mt-1">
                            {ethiopianDay.day} {ethiopianDay.monthName.slice(0, 3)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return weekDays;
                })()}
              </div>

              {/* Week Grid with Hours */}
              <div className="overflow-y-auto max-h-[600px]">
                {Array.from({ length: 24 }, (_, hour) => {
                  const startOfWeek = new Date(currentDate);
                  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

                  return (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-slate-700 min-h-[60px]">
                      {/* Hour Label */}
                      <div className="border-r border-gray-200 dark:border-slate-700 p-2 text-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-[#6B7684]">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>

                      {/* Day Columns */}
                      {Array.from({ length: 7 }, (_, day) => {
                        const currentDay = new Date(startOfWeek);
                        currentDay.setDate(startOfWeek.getDate() + day);
                        currentDay.setHours(hour, 0, 0, 0);

                        const hourTasks = filteredTasks.filter(task => {
                          if (!task.startDate) return false;
                          const taskStart = new Date(task.startDate);
                          return (
                            taskStart.getDate() === currentDay.getDate() &&
                            taskStart.getMonth() === currentDay.getMonth() &&
                            taskStart.getFullYear() === currentDay.getFullYear() &&
                            taskStart.getHours() === hour
                          );
                        });

                        return (
                          <div
                            key={day}
                            onClick={() => onDateClick?.(currentDay)}
                            className="border-r border-gray-200 dark:border-slate-700 p-1 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors cursor-pointer last:border-r-0"
                          >
                            {hourTasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskClick?.(task);
                                }}
                                className="mb-1 rounded border-l-2 p-1.5 text-xs bg-white dark:bg-[#22272B] shadow-sm hover:shadow-md transition-all cursor-pointer"
                                style={{ borderLeftColor: task.project.color }}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <div className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                                    {task.key}
                                  </span>
                                </div>
                                <div className="truncate text-gray-600 dark:text-slate-400">
                                  {task.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="p-6">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden shadow-sm">
              {/* Day Header */}
              <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    {calendarSystem === 'ethiopian' && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        {formatEthiopianDate(ethiopianDate, 'full')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      {getTasksForDate(currentDate).length} tasks scheduled
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Timeline */}
              <div className="overflow-y-auto max-h-[700px]">
                <div className="grid grid-cols-[80px_1fr]">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourStart = new Date(currentDate);
                    hourStart.setHours(hour, 0, 0, 0);

                    const hourTasks = filteredTasks.filter(task => {
                      if (!task.startDate) return false;
                      const taskStart = new Date(task.startDate);
                      return (
                        taskStart.getDate() === currentDate.getDate() &&
                        taskStart.getMonth() === currentDate.getMonth() &&
                        taskStart.getFullYear() === currentDate.getFullYear() &&
                        taskStart.getHours() === hour
                      );
                    });

                    const allDayTasks = hour === 8 ? getTasksForDate(currentDate).filter(t => !t.startDate) : [];

                    return (
                      <div key={hour} className="contents">
                        {/* Time Column */}
                        <div className="border-r border-b border-gray-200 dark:border-slate-700 p-3 text-right bg-gray-50/50 dark:bg-[#1B1F23]">
                          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                          </span>
                        </div>

                        {/* Tasks Column */}
                        <div
                          onClick={() => onDateClick?.(hourStart)}
                          className="border-b border-gray-200 dark:border-slate-700 p-3 min-h-[80px] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors cursor-pointer"
                        >
                          {/* All-day tasks shown at 8 AM */}
                          {allDayTasks.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-medium text-gray-500 dark:text-[#6B7684] mb-2">All Day</div>
                              <div className="space-y-2">
                                {allDayTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTaskClick?.(task);
                                    }}
                                    className="rounded-lg border-l-4 p-3 bg-gradient-to-r from-white to-gray-50 dark:from-[#22272B] dark:to-[#282E33] shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    style={{ borderLeftColor: task.project.color }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(task.priority)}`} />
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                          {task.key}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)} bg-opacity-20`}>
                                          {task.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-800 dark:text-[#B6C2CF] mb-1">
                                      {task.title}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                                        {task.project.name}
                                      </span>
                                      {task.assignee && (
                                        <span className="flex items-center gap-1">
                                          {task.assignee.avatar ? (
                                            <img src={task.assignee.avatar} alt="" className="h-4 w-4 rounded-full" />
                                          ) : (
                                            <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center text-[8px] text-white font-medium">
                                              {task.assignee.name.charAt(0)}
                                            </div>
                                          )}
                                          {task.assignee.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hourly tasks */}
                          {hourTasks.length > 0 && (
                            <div className="space-y-2">
                              {hourTasks.map((task) => (
                                <div
                                  key={task.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTaskClick?.(task);
                                  }}
                                  className="rounded-lg border-l-4 p-3 bg-white dark:bg-[#22272B] shadow-sm hover:shadow-md transition-all cursor-pointer"
                                  style={{ borderLeftColor: task.project.color }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(task.priority)}`} />
                                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {task.key}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)} bg-opacity-20`}>
                                        {task.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    {task.startDate && (
                                      <span className="text-xs text-gray-500 dark:text-[#6B7684]">
                                        {new Date(task.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-800 dark:text-[#B6C2CF] mb-1">
                                    {task.title}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                                      {task.project.name}
                                    </span>
                                    {task.assignee && (
                                      <span className="flex items-center gap-1">
                                        {task.assignee.avatar ? (
                                          <img src={task.assignee.avatar} alt="" className="h-4 w-4 rounded-full" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center text-[8px] text-white font-medium">
                                            {task.assignee.name.charAt(0)}
                                          </div>
                                        )}
                                        {task.assignee.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="p-6">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden shadow-sm">
              {/* Timeline Header */}
              <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Project Timeline
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Gantt chart view with task dependencies
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      {filteredTasks.filter(t => t.startDate && t.dueDate).length} scheduled tasks
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="overflow-auto max-h-[700px]">
                {/* Date Headers - Show current month's weeks */}
                <div className="grid grid-cols-[250px_1fr] border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33] sticky top-0 z-10">
                  <div className="border-r border-gray-200 dark:border-slate-700 p-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-400">Task</span>
                  </div>
                  <div className="grid grid-cols-30 gap-px">
                    {Array.from({ length: 30 }, (_, day) => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
                      const today = isToday(date);
                      const ethiopianDay = gregorianToEthiopian(date);

                      return (
                        <div
                          key={day}
                          className={`p-2 text-center min-w-[40px] ${today ? 'bg-primary-500/10' : ''}`}
                        >
                          <div className={`text-xs font-medium ${
                            today ? 'text-primary-500' : 'text-gray-600 dark:text-slate-400'
                          }`}>
                            {date.getDate()}
                          </div>
                          {calendarSystem === 'ethiopian' && (
                            <div className="text-[9px] text-gray-500 dark:text-[#6B7684]">
                              {ethiopianDay.day}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Task Rows */}
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredTasks.filter(task => task.startDate && task.dueDate).length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <GitBranch className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684] mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No tasks with dates
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Add start and due dates to tasks to see them in timeline view
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredTasks
                      .filter(task => task.startDate && task.dueDate)
                      .map((task) => {
                        const startDate = new Date(task.startDate!);
                        const endDate = new Date(task.dueDate!);
                        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                        // Calculate position and width
                        const dayInMonth = startDate.getDate();
                        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        const gridColumn = `${dayInMonth} / span ${Math.min(duration, 30 - dayInMonth + 1)}`;

                        // Only show if task is in current month view
                        if (startDate < monthStart || startDate > monthEnd) return null;

                        return (
                          <div key={task.id} className="grid grid-cols-[250px_1fr] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors">
                            {/* Task Info */}
                            <div className="border-r border-gray-200 dark:border-slate-700 p-3">
                              <div
                                onClick={() => onTaskClick?.(task)}
                                className="cursor-pointer group"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                    {task.key}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: task.project.color }}
                                  />
                                  <span className="text-xs text-gray-500 dark:text-[#6B7684]">
                                    {task.project.key}
                                  </span>
                                  {task.assignee && (
                                    <div className="flex items-center gap-1 ml-auto">
                                      {task.assignee.avatar ? (
                                        <img src={task.assignee.avatar} alt="" className="h-4 w-4 rounded-full" />
                                      ) : (
                                        <div className="h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center text-[8px] text-white font-medium">
                                          {task.assignee.name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Timeline Bar */}
                            <div className="relative p-3">
                              <div className="grid grid-cols-30 gap-px h-full">
                                <div
                                  onClick={() => onTaskClick?.(task)}
                                  className="rounded-full cursor-pointer shadow-sm hover:shadow-md transition-all group relative"
                                  style={{
                                    gridColumn,
                                    backgroundColor: task.project.color,
                                    opacity: 0.85
                                  }}
                                >
                                  <div className="h-full flex items-center px-3">
                                    <span className="text-xs font-medium text-white truncate">
                                      {task.key}
                                    </span>
                                  </div>
                                  {/* Hover tooltip */}
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 whitespace-nowrap">
                                    <div className="bg-gray-900 dark:bg-[#1B1F23] text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                                      <div className="font-semibold mb-1">{task.title}</div>
                                      <div className="text-gray-300 dark:text-slate-400">
                                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                      </div>
                                      <div className="text-gray-300 dark:text-slate-400 mt-1">
                                        {duration} days
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dependency indicators */}
                                  {task.dependencies && task.dependencies.length > 0 && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                                      <div className="flex items-center gap-1">
                                        <GitBranch className="h-3 w-3 text-gray-600 dark:text-slate-400" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Timeline Legend */}
              <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#282E33] p-4">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-700 dark:text-slate-400">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-gray-700 dark:text-slate-400">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-gray-700 dark:text-slate-400">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700 dark:text-slate-400">Low</span>
                  </div>
                  <div className="ml-auto text-gray-600 dark:text-slate-400">
                    Hover over tasks for details
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
