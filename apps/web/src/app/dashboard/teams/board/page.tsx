'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { BarChart3, Code, FileText, Clock, Book, Users, Search, TrendingUp } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board', active: true },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages' },
] as const;

const TEAMS = [
  { id: 1, name: 'Engineering', description: 'Core product development', members: 12, lead: 'Alice Johnson', status: 'ACTIVE', performance: 92 },
  { id: 2, name: 'Design', description: 'UX/UI and product design', members: 6, lead: 'Bob Smith', status: 'ACTIVE', performance: 88 },
  { id: 3, name: 'Marketing', description: 'Growth and brand marketing', members: 8, lead: 'Carol White', status: 'ACTIVE', performance: 85 },
  { id: 4, name: 'Sales', description: 'Enterprise sales', members: 10, lead: 'David Brown', status: 'ONBOARDING', performance: 78 },
  { id: 5, name: 'Customer Success', description: 'Customer support', members: 7, lead: 'Eve Davis', status: 'ACTIVE', performance: 95 },
  { id: 6, name: 'Operations', description: 'Business operations', members: 5, lead: 'Frank Miller', status: 'INACTIVE', performance: 70 },
  { id: 7, name: 'Product', description: 'Product management', members: 4, lead: 'Grace Lee', status: 'ONBOARDING', performance: 82 },
];

const COLUMNS = [
  { id: 'ONBOARDING', label: 'Onboarding', color: 'border-blue-500' },
  { id: 'ACTIVE', label: 'Active', color: 'border-green-500' },
  { id: 'INACTIVE', label: 'Inactive', color: 'border-gray-500' },
];

export default function TeamsBoardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = TEAMS.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.lead.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const teamsByStatus = filteredTeams.reduce((acc: Record<string, any[]>, team) => {
    const status = team.status || 'ACTIVE';
    if (!acc[status]) acc[status] = [];
    acc[status].push(team);
    return acc;
  }, {});

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (performance >= 75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
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
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Teams Board</h1>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Users className="h-4 w-4" />
              Create Team
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
              placeholder="Search teams..."
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
                    {teamsByStatus[column.id]?.length || 0}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {teamsByStatus[column.id]?.map((team) => (
                    <div
                      key={team.id}
                      className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {team.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPerformanceColor(team.performance)}`}>
                          {team.performance}%
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-[#9FADBC] mb-3">
                        {team.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2C333A]">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#0065FF] text-white flex items-center justify-center text-xs font-semibold">
                            {team.lead.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-[#9FADBC]">
                            {team.lead}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#9FADBC]">
                          <Users className="h-3 w-3" />
                          {team.members}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!teamsByStatus[column.id] || teamsByStatus[column.id].length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-400 dark:text-[#6B7684]">
                      No teams
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
