'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { BarChart3, Code, FileText, Clock, Book, Target, Search, Calendar, Users } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board', active: true },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
] as const;

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
  { id: 'ON_TRACK', label: 'On Track', color: 'border-green-500' },
  { id: 'AT_RISK', label: 'At Risk', color: 'border-yellow-500' },
  { id: 'BEHIND', label: 'Behind', color: 'border-red-500' },
];

export default function GoalsBoardPage() {
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
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Target className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals Board</h1>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Target className="h-4 w-4" />
              Create Goal
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
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
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
                    {column.label}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-[#9FADBC] bg-gray-100 dark:bg-[#282E33] px-2 py-0.5 rounded-full">
                    {goalsByStatus[column.id]?.length || 0}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {goalsByStatus[column.id]?.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex-1">
                          {goal.title}
                        </h4>
                        <Target className="h-4 w-4 text-[#0065FF] flex-shrink-0 ml-2" />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-[#9FADBC] mb-3">
                        {goal.description}
                      </p>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#9FADBC] mb-1">
                          <span>Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="bg-gray-200 dark:bg-[#2C333A] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2C333A]">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#0065FF] text-white flex items-center justify-center text-xs font-semibold">
                            {goal.owner.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-[#9FADBC]">
                            {goal.owner.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#9FADBC]">
                          <Calendar className="h-3 w-3" />
                          {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-[#9FADBC]">
                        <Users className="h-3 w-3" />
                        {goal.team}
                      </div>
                    </div>
                  ))}

                  {(!goalsByStatus[column.id] || goalsByStatus[column.id].length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-400 dark:text-[#6B7684]">
                      No goals
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
