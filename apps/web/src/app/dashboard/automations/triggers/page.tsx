'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Activity, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';

const TRIGGERS = [
  { id: 1, name: 'Task Created', type: 'Event', condition: 'When a new task is created', workflows: 5, status: 'ACTIVE', lastTriggered: '10 min ago' },
  { id: 2, name: 'Budget Exceeded', type: 'Threshold', condition: 'When budget exceeds 90% of limit', workflows: 2, status: 'ACTIVE', lastTriggered: '2 hours ago' },
  { id: 3, name: 'Goal Completed', type: 'Event', condition: 'When a goal reaches 100% completion', workflows: 3, status: 'ACTIVE', lastTriggered: '1 day ago' },
  { id: 4, name: 'Weekly Report', type: 'Schedule', condition: 'Every Monday at 9:00 AM', workflows: 4, status: 'ACTIVE', lastTriggered: '2 days ago' },
  { id: 5, name: 'New Team Member', type: 'Event', condition: 'When a user joins a team', workflows: 2, status: 'INACTIVE', lastTriggered: '1 week ago' },
];

export default function AutomationsTriggersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredTriggers = TRIGGERS.filter((trigger) =>
    trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <AppLayout>
      <UnifiedPageHeader title="Triggers" icon={<Activity className="h-6 w-6" />} iconColor="#EC4899" currentTab="triggers" baseHref="/dashboard/automations" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search triggers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <Activity className="h-4 w-4" />Create Trigger
          </Button>
        </div>
        <div className="space-y-3">
          {filteredTriggers.map((trigger) => (
            <div key={trigger.id} onClick={() => { setSelectedTrigger(trigger); setIsSlideoutOpen(true); }} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-[#EC4899]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{trigger.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trigger.status)}`}>{trigger.status}</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">{trigger.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{trigger.condition}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span>{trigger.workflows} workflows</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last triggered: {trigger.lastTriggered}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideoutPanel isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} title={selectedTrigger?.name || 'Trigger Details'}>
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Trigger Information">
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.type}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.condition}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label><p className="text-sm mt-1"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrigger?.status)}`}>{selectedTrigger?.status}</span></p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Workflows</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.workflows}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Triggered</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTrigger?.lastTriggered}</p></div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
