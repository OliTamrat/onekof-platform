'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  GitCommit,
  MessageSquare,
  Search,
  UserPlus,
  Users
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages' },
];

// Mock activity data
const ACTIVITIES = [
  { id: 1, type: 'member_joined', teamName: 'Engineering', user: 'John Smith', description: 'joined the team', time: '2 hours ago', icon: UserPlus, color: 'text-blue-500' },
  { id: 2, type: 'task_completed', teamName: 'Design', user: 'Sarah Johnson', description: 'completed task "Design mobile mockups"', time: '3 hours ago', icon: GitCommit, color: 'text-green-500' },
  { id: 3, type: 'comment', teamName: 'Marketing', user: 'Mike Wilson', description: 'commented on "Q2 Campaign Strategy"', time: '5 hours ago', icon: MessageSquare, color: 'text-purple-500' },
  { id: 4, type: 'member_joined', teamName: 'Sales', user: 'Emily Brown', description: 'joined the team', time: '1 day ago', icon: UserPlus, color: 'text-blue-500' },
  { id: 5, type: 'task_completed', teamName: 'Engineering', user: 'David Lee', description: 'completed task "API Integration"', time: '1 day ago', icon: GitCommit, color: 'text-green-500' },
  { id: 6, type: 'comment', teamName: 'Customer Success', user: 'Lisa Anderson', description: 'commented on "Customer Feedback Report"', time: '2 days ago', icon: MessageSquare, color: 'text-purple-500' },
  { id: 7, type: 'task_completed', teamName: 'Operations', user: 'Tom Martinez', description: 'completed task "Budget Review"', time: '2 days ago', icon: GitCommit, color: 'text-green-500' },
  { id: 8, type: 'member_joined', teamName: 'Design', user: 'Anna White', description: 'joined the team', time: '3 days ago', icon: UserPlus, color: 'text-blue-500' },
];

export default function TeamsActivityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredActivities = ACTIVITIES.filter((activity) =>
    activity.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setIsSlideoutOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#10B981] text-white font-semibold">
                <Activity className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Activity</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 ${activity.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{activity.user}</span>
                        <span className="text-sm text-gray-600 dark:text-slate-400">{activity.description}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activity.teamName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slideout Panel for Activity Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title="Activity Details"
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Activity Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedActivity?.user}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedActivity?.teamName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedActivity?.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedActivity?.time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{selectedActivity?.type.replace('_', ' ')}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
