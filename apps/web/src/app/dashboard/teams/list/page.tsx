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
  TrendingUp,
  Users
} from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list', active: true },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages' },
] as const;

// Mock team data
const TEAMS = [
  { id: 1, name: 'Engineering', description: 'Core product development team', members: 12, lead: 'Alice Johnson', status: 'ACTIVE', created: '2024-01-15', performance: 92 },
  { id: 2, name: 'Design', description: 'UX/UI and product design', members: 6, lead: 'Bob Smith', status: 'ACTIVE', created: '2024-02-01', performance: 88 },
  { id: 3, name: 'Marketing', description: 'Growth and brand marketing', members: 8, lead: 'Carol White', status: 'ACTIVE', created: '2024-01-20', performance: 85 },
  { id: 4, name: 'Sales', description: 'Enterprise and SMB sales', members: 10, lead: 'David Brown', status: 'ACTIVE', created: '2024-02-15', performance: 78 },
  { id: 5, name: 'Customer Success', description: 'Customer support and success', members: 7, lead: 'Eve Davis', status: 'ACTIVE', created: '2024-03-01', performance: 95 },
  { id: 6, name: 'Operations', description: 'Business operations and finance', members: 5, lead: 'Frank Miller', status: 'INACTIVE', created: '2024-01-10', performance: 70 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function TeamsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTeams = TEAMS.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600 dark:text-green-400';
    if (performance >= 75) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Teams List</h1>
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

        {/* Filters */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams, leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
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
            <thead className="bg-gray-50 dark:bg-[#22272B] sticky top-0 border-b border-gray-200 dark:border-[#2C333A]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1B1F23] divide-y divide-gray-200 dark:divide-[#2C333A]">
              {filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => router.push(`/dashboard/teams/${team.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-[#22272B] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-[#9FADBC]">
                        {team.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#0065FF] text-white flex items-center justify-center text-xs font-semibold">
                        {team.lead.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {team.lead}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                      <Users className="h-4 w-4 text-gray-400" />
                      {team.members}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${getPerformanceColor(team.performance)}`} />
                      <span className={`text-sm font-medium ${getPerformanceColor(team.performance)}`}>
                        {team.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#9FADBC]">
                      <Calendar className="h-4 w-4" />
                      {new Date(team.created).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeams.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-[#9FADBC]">No teams found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
