'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Calendar,
  Clock,
  Code,
  FileText,
  Search,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS: { id: string; labelKey: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', labelKey: 'tabs.summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', labelKey: 'tabs.list', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', labelKey: 'tabs.board', icon: null, href: '/dashboard/goals/board', active: true },
  { id: 'code', labelKey: 'tabs.code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', labelKey: 'teams.forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', labelKey: 'tabs.timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', labelKey: 'tabs.pages', icon: Book, href: '/dashboard/goals/pages' },
];

const GOALS = [
  { id: 1, title: 'Increase Product Revenue', description: 'Achieve 25% revenue growth', owner: 'Alice Johnson', team: 'Sales', progress: 68, status: 'ON_TRACK', dueDate: '2024-06-30' },
  { id: 2, title: 'Launch Mobile App', description: 'Release iOS and Android apps', owner: 'Bob Smith', team: 'Engineering', progress: 45, status: 'AT_RISK', dueDate: '2024-05-15' },
  { id: 3, title: 'Improve Customer Satisfaction', description: 'Achieve NPS score of 70+', owner: 'Carol White', team: 'Customer Success', progress: 82, status: 'ON_TRACK', dueDate: '2024-06-30' },
  { id: 4, title: 'Expand Market Presence', description: 'Enter 3 new markets', owner: 'David Brown', team: 'Marketing', progress: 30, status: 'BEHIND', dueDate: '2024-08-31' },
  { id: 5, title: 'Reduce Technical Debt', description: 'Refactor legacy systems', owner: 'Eve Davis', team: 'Engineering', progress: 55, status: 'ON_TRACK', dueDate: '2024-07-31' },
  { id: 6, title: 'Build Design System', description: 'Create unified design language', owner: 'Frank Miller', team: 'Design', progress: 90, status: 'ON_TRACK', dueDate: '2024-04-30' },
  { id: 7, title: 'Improve Code Quality', description: 'Increase test coverage to 80%', owner: 'Grace Lee', team: 'Engineering', progress: 25, status: 'BEHIND', dueDate: '2024-07-15' },
];

const COLUMNS = [
  { id: 'ON_TRACK', labelKey: 'goals.onTrack', color: 'border-green-500' },
  { id: 'AT_RISK', labelKey: 'goals.atRisk', color: 'border-yellow-500' },
  { id: 'BEHIND', labelKey: 'goals.behind', color: 'border-red-500' },
];

export default function GoalsBoardPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGoals = GOALS.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goalsByStatus = filteredGoals.reduce((acc: Record<string, any[]>, goal) => {
    const status = goal.status || 'ON_TRACK';
    if (!acc[status]) acc[status] = [];
    acc[status].push(goal);
    return acc;
  }, {});

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Target className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('goals.goalsBoard')}</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Target className="h-4 w-4" />
              {t('goals.createGoal')}
            </Button>
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('goals.searchGoalsShort')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6 h-full">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
                <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${column.color}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t(column.labelKey)}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-[#282E33] px-2 py-0.5 rounded-full">
                    {goalsByStatus[column.id]?.length || 0}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {goalsByStatus[column.id]?.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex-1">
                          {goal.title}
                        </h4>
                        <Target className="h-4 w-4 text-primary-500 flex-shrink-0 ml-2" />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                        {goal.description}
                      </p>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                          <span>{t('goals.progress')}</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
                            {goal.owner.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-slate-400">
                            {goal.owner.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-slate-400">
                        <Users className="h-3 w-3" />
                        {goal.team}
                      </div>
                    </div>
                  ))}

                  {(!goalsByStatus[column.id] || goalsByStatus[column.id].length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-400 dark:text-[#6B7684]">
                      {t('goals.noGoalsBoard')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
