'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  AlertCircle,
  BarChart3,
  Book,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Flag,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline', active: true },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
];

const TIMELINE_EVENTS = [
  {
    id: 1,
    type: 'goal_created',
    goal: 'Increase Product Revenue',
    description: 'New objective created for Q2 2024',
    date: '2024-01-15',
    icon: Target,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    type: 'key_result_added',
    goal: 'Increase Product Revenue',
    description: 'Key result added: Achieve 25% revenue growth',
    date: '2024-01-15',
    icon: Flag,
    color: 'bg-purple-500',
  },
  {
    id: 3,
    type: 'progress_update',
    goal: 'Launch Mobile App',
    description: 'Progress updated to 45% - At risk due to resource constraints',
    date: '2024-02-01',
    icon: TrendingUp,
    color: 'bg-orange-500',
  },
  {
    id: 4,
    type: 'goal_created',
    goal: 'Improve Customer Satisfaction',
    description: 'New objective created for Q2 2024',
    date: '2024-02-05',
    icon: Target,
    color: 'bg-blue-500',
  },
  {
    id: 5,
    type: 'milestone_reached',
    goal: 'Improve Customer Satisfaction',
    description: 'NPS score reached 70 - Goal on track',
    date: '2024-02-20',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    id: 6,
    type: 'status_change',
    goal: 'Launch Mobile App',
    description: 'Status changed from On Track to At Risk',
    date: '2024-03-01',
    icon: AlertCircle,
    color: 'bg-yellow-500',
  },
  {
    id: 7,
    type: 'goal_created',
    goal: 'Expand Market Presence',
    description: 'New objective created for Q3 2024',
    date: '2024-03-05',
    icon: Target,
    color: 'bg-blue-500',
  },
  {
    id: 8,
    type: 'progress_update',
    goal: 'Build Design System',
    description: 'Progress updated to 90% - Near completion',
    date: '2024-03-10',
    icon: TrendingUp,
    color: 'bg-orange-500',
  },
  {
    id: 9,
    type: 'milestone_reached',
    goal: 'Build Design System',
    description: 'Component library fully documented',
    date: '2024-03-15',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    id: 10,
    type: 'goal_created',
    goal: 'Reduce Technical Debt',
    description: 'New objective created for Q3 2024',
    date: '2024-03-20',
    icon: Target,
    color: 'bg-blue-500',
  },
];

export default function GoalsTimelinePage() {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredEvents = TIMELINE_EVENTS.filter((event) =>
    selectedFilter === 'all' || event.type === selectedFilter
  );

  const groupedEvents = filteredEvents.reduce((acc: Record<string, any[]>, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Title */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Clock className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals Timeline</h1>
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
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
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
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              All Events
            </Button>
            <Button
              onClick={() => setSelectedFilter('goal_created')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedFilter === 'goal_created'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              Goals Created
            </Button>
            <Button
              onClick={() => setSelectedFilter('progress_update')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedFilter === 'progress_update'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              Progress Updates
            </Button>
            <Button
              onClick={() => setSelectedFilter('milestone_reached')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedFilter === 'milestone_reached'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              Milestones
            </Button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedEvents).map(([month, events]) => (
              <div key={month} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{month}</h2>
                </div>

                <div className="space-y-4 ml-8 border-l-2 border-gray-200 dark:border-white/[0.08] pl-6">
                  {events.map((event) => {
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className="relative">
                        <div className={`absolute -left-9 w-6 h-6 rounded-full ${event.color} flex items-center justify-center`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>

                        <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-primary-500" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {event.goal}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-white/50 mt-1">
                                {event.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-[#6B7684] whitespace-nowrap ml-4">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <Clock className="h-12 w-12 text-gray-400 dark:text-[#6B7684] mx-auto mb-4" />
                <p className="text-gray-500 dark:text-white/50">No events found for the selected filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
