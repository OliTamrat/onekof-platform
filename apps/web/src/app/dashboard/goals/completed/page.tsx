'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { GOALS_TABS } from '@/config/department-tabs';
import {
  Target,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  Trophy
} from 'lucide-react';
import {
import { useLanguage } from '@/contexts/language-context';
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock completed goals data
const COMPLETED_GOALS = [
  { id: 1, title: 'Q1 Revenue Target Achievement', completedDate: '2024-03-31', team: 'Sales', owner: 'John Smith', duration: '90 days', keyResults: 3, achievement: 110 },
  { id: 2, title: 'Customer Onboarding Process Redesign', completedDate: '2024-03-25', team: 'Customer Success', owner: 'Sarah Johnson', duration: '45 days', keyResults: 4, achievement: 100 },
  { id: 3, title: 'Website Performance Optimization', completedDate: '2024-03-20', team: 'Engineering', owner: 'Mike Wilson', duration: '60 days', keyResults: 5, achievement: 105 },
  { id: 4, title: 'Social Media Campaign Launch', completedDate: '2024-03-15', team: 'Marketing', owner: 'Emily Brown', duration: '30 days', keyResults: 6, achievement: 95 },
  { id: 5, title: 'Team Training Program', completedDate: '2024-03-10', team: 'HR', owner: 'David Lee', duration: '75 days', keyResults: 4, achievement: 100 },
  { id: 6, title: 'Security Audit Completion', completedDate: '2024-03-05', team: 'IT Security', owner: 'Lisa Anderson', duration: '120 days', keyResults: 8, achievement: 100 },
];

export default function GoalsCompletedPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredGoals = COMPLETED_GOALS.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsSlideoutOpen(true);
  };

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Completed Goals"
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconColor="#10B981"
        currentTab="completed"
        baseHref="/dashboard/goals"
        customTabs={GOALS_TABS}
        showTabs
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-[#10B981]" />
              <div className="text-sm text-gray-600 dark:text-slate-400">Completed Goals</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredGoals.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
              <div className="text-sm text-gray-600 dark:text-slate-400">Exceeded Target</div>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredGoals.filter(g => g.achievement > 100).length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-[#3B82F6]" />
              <div className="text-sm text-gray-600 dark:text-slate-400">This Quarter</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredGoals.length}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Completed Goals List */}
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleGoalClick(goal)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    {goal.achievement > 100 && (
                      <Trophy className="h-4 w-4 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {goal.team}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Completed: {goal.completedDate}
                    </span>
                    <span>Duration: {goal.duration}</span>
                    <span>Key Results: {goal.keyResults}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getAchievementColor(goal.achievement)}`}>
                    {goal.achievement}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400">Achievement</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Goal Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedGoal?.title || 'Goal Details'}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Completion Details">
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-[#F59E0B] mx-auto mb-2" />
                  <div className={`text-4xl font-bold ${getAchievementColor(selectedGoal?.achievement)}`}>
                    {selectedGoal?.achievement}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">Goal Achievement</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.team}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.owner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.completedDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.duration}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Results Completed</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.keyResults}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
