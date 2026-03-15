'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  Zap,
  Search,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';

// Mock workflows data
const WORKFLOWS = [
  { id: 1, name: 'New Task Assignment', description: 'Automatically assign tasks to team members based on workload', status: 'ACTIVE', triggers: 3, actions: 5, lastRun: '2 hours ago', executions: 156 },
  { id: 2, name: 'Budget Approval', description: 'Route budget requests through approval chain', status: 'ACTIVE', triggers: 2, actions: 4, lastRun: '5 hours ago', executions: 89 },
  { id: 3, name: 'Project Status Update', description: 'Send weekly project status updates to stakeholders', status: 'ACTIVE', triggers: 1, actions: 3, lastRun: '1 day ago', executions: 234 },
  { id: 4, name: 'Goal Milestone Alert', description: 'Notify team when goal milestones are reached', status: 'PAUSED', triggers: 2, actions: 2, lastRun: '3 days ago', executions: 67 },
  { id: 5, name: 'New Member Onboarding', description: 'Automate new team member onboarding process', status: 'ACTIVE', triggers: 1, actions: 8, lastRun: '2 days ago', executions: 45 },
  { id: 6, name: 'Expense Report Generation', description: 'Generate monthly expense reports automatically', status: 'ACTIVE', triggers: 1, actions: 4, lastRun: '1 week ago', executions: 12 },
];

export default function AutomationsWorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredWorkflows = WORKFLOWS.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWorkflowClick = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsSlideoutOpen(true);
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Workflows"
        icon={<Zap className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="workflows"
        baseHref="/dashboard/automations"
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Workflows</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredWorkflows.length}</div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Active</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredWorkflows.filter(w => w.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Paused</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {filteredWorkflows.filter(w => w.status === 'PAUSED').length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Executions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {filteredWorkflows.reduce((sum, w) => sum + w.executions, 0)}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <Zap className="h-4 w-4" />
            Create Workflow
          </button>
        </div>

        {/* Workflows List */}
        <div className="space-y-3">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              onClick={() => handleWorkflowClick(workflow)}
              className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-[#EC4899]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{workflow.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {workflow.triggers} Triggers
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {workflow.actions} Actions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last run: {workflow.lastRun}
                    </span>
                    <span>{workflow.executions} executions</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  {workflow.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {workflow.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Panel for Workflow Details */}
      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedWorkflow?.name || 'Workflow Details'}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Workflow Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="text-sm mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkflow?.status)}`}>
                    {selectedWorkflow?.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Triggers</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.triggers} configured</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.actions} configured</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Execution</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedWorkflow?.lastRun}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Executions</label>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedWorkflow?.executions}</p>
              </div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
