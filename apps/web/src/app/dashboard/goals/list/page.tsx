'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Book,
  Calendar,
  Clock,
  Code,
  FileText,
  Filter,
  Search,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list', active: true },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
];

// Mock goals data
const GOALS = [
  { id: 1, title: 'Increase Product Revenue', description: 'Achieve 25% revenue growth', owner: 'Alice Johnson', team: 'Sales', progress: 68, status: 'ON_TRACK', dueDate: '2024-06-30', cycle: 'Q2 2024' },
  { id: 2, title: 'Launch Mobile App', description: 'Release iOS and Android apps', owner: 'Bob Smith', team: 'Engineering', progress: 45, status: 'AT_RISK', dueDate: '2024-05-15', cycle: 'Q2 2024' },
  { id: 3, title: 'Improve Customer Satisfaction', description: 'Achieve NPS score of 70+', owner: 'Carol White', team: 'Customer Success', progress: 82, status: 'ON_TRACK', dueDate: '2024-06-30', cycle: 'Q2 2024' },
  { id: 4, title: 'Expand Market Presence', description: 'Enter 3 new markets', owner: 'David Brown', team: 'Marketing', progress: 30, status: 'BEHIND', dueDate: '2024-08-31', cycle: 'Q3 2024' },
  { id: 5, title: 'Reduce Technical Debt', description: 'Refactor legacy systems', owner: 'Eve Davis', team: 'Engineering', progress: 55, status: 'ON_TRACK', dueDate: '2024-07-31', cycle: 'Q3 2024' },
  { id: 6, title: 'Build Design System', description: 'Create unified design language', owner: 'Frank Miller', team: 'Design', progress: 90, status: 'ON_TRACK', dueDate: '2024-04-30', cycle: 'Q2 2024' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ON_TRACK', label: 'On Track' },
  { value: 'AT_RISK', label: 'At Risk' },
  { value: 'BEHIND', label: 'Behind' },
];

export default function GoalsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredGoals = GOALS.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'AT_RISK': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'BEHIND': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals List</h1>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search goals, owners, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#22272B] sticky top-0 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Cycle
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1B1F23] divide-y divide-gray-200 dark:divide-slate-700">
              {filteredGoals.map((goal) => (
                <tr
                  key={goal.id}
                  onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-[#22272B] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary-500" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {goal.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
                        {goal.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {goal.owner}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      {goal.team}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-10">
                        {goal.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(goal.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {goal.cycle}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGoals.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-slate-400">No goals found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
