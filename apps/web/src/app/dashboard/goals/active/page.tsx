'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { GOALS_TABS } from '@/config/department-tabs';
import {
  Target,
  Search,
  Flag,
  Clock,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { useLanguage } from '@/contexts/language-context';

// Mock active goals data
const ACTIVE_GOALS = [
  { id: 1, title: 'Increase Product Revenue', progress: 65, status: 'ON_TRACK', priority: 'HIGH', team: 'Sales', owner: 'John Smith', dueDate: '2024-06-30', keyResults: 3, completedResults: 2 },
  { id: 2, title: 'Launch Mobile App', progress: 45, status: 'AT_RISK', priority: 'CRITICAL', team: 'Engineering', owner: 'Sarah Johnson', dueDate: '2024-05-15', keyResults: 5, completedResults: 2 },
  { id: 3, title: 'Improve Customer Satisfaction', progress: 75, status: 'ON_TRACK', priority: 'HIGH', team: 'Customer Success', owner: 'Mike Wilson', dueDate: '2024-07-31', keyResults: 4, completedResults: 3 },
  { id: 4, title: 'Expand Market Presence', progress: 30, status: 'BEHIND', priority: 'MEDIUM', team: 'Marketing', owner: 'Emily Brown', dueDate: '2024-08-30', keyResults: 6, completedResults: 1 },
  { id: 5, title: 'Build Design System', progress: 85, status: 'ON_TRACK', priority: 'HIGH', team: 'Design', owner: 'David Lee', dueDate: '2024-04-30', keyResults: 4, completedResults: 4 },
  { id: 6, title: 'Reduce Operational Costs', progress: 55, status: 'AT_RISK', priority: 'MEDIUM', team: 'Operations', owner: 'Lisa Anderson', dueDate: '2024-09-30', keyResults: 3, completedResults: 1 },
];

export default function GoalsActivePage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredGoals = ACTIVE_GOALS.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'AT_RISK': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'BEHIND': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'LOW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsSlideoutOpen(true);
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('goals.activeGoals')}
        icon={<Target className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="active"
        baseHref="/dashboard/goals"
        customTabs={GOALS_TABS}
        showTabs
      />

      <div className="p-3 md:p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('goals.activeGoals')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredGoals.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('goals.onTrack')}</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredGoals.filter(g => g.status === 'ON_TRACK').length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('goals.atRisk')}</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {filteredGoals.filter(g => g.status === 'AT_RISK').length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">{t('goals.behind')}</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {filteredGoals.filter(g => g.status === 'BEHIND').length}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('goals.searchActiveGoals')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleGoalClick(goal)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <Target className="h-5 w-5 text-[#8B5CF6]" />
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{goal.title}</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                  <span>{t('goals.progress')}</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-[#8B5CF6] h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                    <Users className="h-3 w-3" />
                    <span>{goal.team}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{goal.dueDate}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  <Flag className="h-3 w-3 inline mr-1" />
                  {goal.completedResults}/{goal.keyResults} {t('goals.keyResults')}
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
        title={selectedGoal?.title || t('goals.goalDetails')}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('goals.goalInformation')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.status')}</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGoal?.status)}`}>
                    {selectedGoal?.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.priority')}</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedGoal?.priority)}`}>
                    {selectedGoal?.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('goals.progress')}</label>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <span>{t('goals.overallProgress')}</span>
                    <span className="font-medium">{selectedGoal?.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-[#8B5CF6] h-2 rounded-full"
                      style={{ width: `${selectedGoal?.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('goals.team')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.team}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.owner')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.owner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.dueDate')}</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedGoal?.dueDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('goals.keyResults')}</label>
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
