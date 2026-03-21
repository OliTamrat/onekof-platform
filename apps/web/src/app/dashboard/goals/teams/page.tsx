'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { GOALS_TABS } from '@/config/department-tabs';
import {
  Target,
  Search,
  Users,
  TrendingUp,
  Flag,
  BarChart3
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock team goals data
const TEAM_GOALS = [
  { id: 1, teamName: 'Engineering', activeGoals: 8, completedGoals: 12, totalProgress: 72, members: 15, topGoal: 'Launch Mobile App' },
  { id: 2, teamName: 'Design', activeGoals: 5, completedGoals: 18, totalProgress: 85, members: 8, topGoal: 'Complete Design System' },
  { id: 3, teamName: 'Marketing', activeGoals: 6, completedGoals: 10, totalProgress: 65, members: 10, topGoal: 'Increase Brand Awareness' },
  { id: 4, teamName: 'Sales', activeGoals: 7, completedGoals: 15, totalProgress: 78, members: 12, topGoal: 'Achieve Revenue Target' },
  { id: 5, teamName: 'Customer Success', activeGoals: 4, completedGoals: 14, totalProgress: 88, members: 9, topGoal: 'Improve NPS Score' },
  { id: 6, teamName: 'Operations', activeGoals: 3, completedGoals: 8, totalProgress: 55, members: 6, topGoal: 'Reduce Costs' },
];

export default function GoalsTeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredTeams = TEAM_GOALS.filter((team) =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.topGoal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamClick = (team: any) => {
    setSelectedTeam(team);
    setIsSlideoutOpen(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Team Goals"
        icon={<Users className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="teams"
        baseHref="/dashboard/goals"
        customTabs={GOALS_TABS}
        showTabs
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Teams</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredTeams.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Active Goals</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {filteredTeams.reduce((sum, team) => sum + team.activeGoals, 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Completed Goals</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredTeams.reduce((sum, team) => sum + team.completedGoals, 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Avg Progress</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {Math.round(filteredTeams.reduce((sum, team) => sum + team.totalProgress, 0) / filteredTeams.length)}%
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleTeamClick(team)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B5CF6]/10">
                    <Users className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{team.teamName}</h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400">{team.members} members</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Active Goals</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{team.activeGoals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Completed</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{team.completedGoals}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{team.totalProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getProgressColor(team.totalProgress)} h-2 rounded-full`}
                      style={{ width: `${team.totalProgress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">Top Priority Goal</div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-[#8B5CF6]" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{team.topGoal}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Team Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={`${selectedTeam?.teamName} Goals` || 'Team Goals'}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Team Overview">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Name</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTeam?.teamName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTeam?.members} members</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Goals</label>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{selectedTeam?.activeGoals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Goals</label>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{selectedTeam?.completedGoals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</label>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <span>Team Progress</span>
                    <span className="font-medium">{selectedTeam?.totalProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getProgressColor(selectedTeam?.totalProgress)} h-2 rounded-full`}
                      style={{ width: `${selectedTeam?.totalProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Priority Goal</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTeam?.topGoal}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
