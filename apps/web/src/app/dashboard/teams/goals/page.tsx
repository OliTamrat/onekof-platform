'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  Flag,
  Search,
  Target,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages' },
];

// Mock team goals data
const TEAM_GOALS = [
  { id: 1, teamName: 'Engineering', goal: 'Launch Mobile App', progress: 75, status: 'ON_TRACK', dueDate: '2024-06-30', keyResults: 3, completedResults: 2 },
  { id: 2, teamName: 'Design', goal: 'Complete Design System', progress: 90, status: 'ON_TRACK', dueDate: '2024-05-15', keyResults: 4, completedResults: 4 },
  { id: 3, teamName: 'Marketing', goal: 'Increase Brand Awareness', progress: 45, status: 'AT_RISK', dueDate: '2024-07-31', keyResults: 5, completedResults: 2 },
  { id: 4, teamName: 'Sales', goal: 'Achieve 150% Revenue Target', progress: 60, status: 'ON_TRACK', dueDate: '2024-12-31', keyResults: 3, completedResults: 2 },
  { id: 5, teamName: 'Customer Success', goal: 'Improve NPS Score to 70', progress: 85, status: 'ON_TRACK', dueDate: '2024-08-31', keyResults: 4, completedResults: 3 },
  { id: 6, teamName: 'Operations', goal: 'Reduce Operational Costs', progress: 30, status: 'BEHIND', dueDate: '2024-09-30', keyResults: 2, completedResults: 0 },
];

export default function TeamsGoalsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredGoals = TEAM_GOALS.filter((goal) =>
    goal.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.goal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'AT_RISK': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'BEHIND': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsSlideoutOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#10B981] text-white font-semibold">
                <Target className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Goals</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Target className="h-4 w-4" />
              Create Goal
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
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#10B981]" />
                    <span className="text-xs font-medium text-gray-600 dark:text-white/50">{goal.teamName}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{goal.goal}</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white/50">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/[0.08] rounded-full h-2">
                    <div
                      className="bg-[#10B981] h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-white/50">
                      <Flag className="h-3 w-3" />
                      <span>{goal.completedResults}/{goal.keyResults} Key Results</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-white/50">
                      <Clock className="h-3 w-3" />
                      <span>{goal.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slideout Panel for Goal Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedGoal?.goal || 'Goal Details'}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Goal Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.teamName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGoal?.status)}`}>
                    {selectedGoal?.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</label>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white/50 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{selectedGoal?.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/[0.08] rounded-full h-2">
                    <div
                      className="bg-[#10B981] h-2 rounded-full"
                      style={{ width: `${selectedGoal?.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.dueDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Results</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedGoal?.completedResults} of {selectedGoal?.keyResults} completed
                </p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
