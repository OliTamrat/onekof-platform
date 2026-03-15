'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  critical: boolean;
}

interface Checklist {
  id: string;
  title: string;
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'emergency';
  type: 'dam-operations' | 'irrigation' | 'safety' | 'maintenance' | 'environmental';
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'critical' | 'high' | 'normal' | 'low';
  items: ChecklistItem[];
  completedItems: number;
  totalItems: number;
  lastUpdated?: string;
}

const checklists: Checklist[] = [
  {
    id: '1',
    title: 'Daily Dam Safety Inspection',
    category: 'daily',
    type: 'dam-operations',
    description: 'Critical daily inspection of main dam structure and control systems',
    assignedTo: 'Dam Operations Team A',
    dueDate: '2026-03-05',
    status: 'in-progress',
    priority: 'critical',
    completedItems: 8,
    totalItems: 12,
    lastUpdated: '2026-03-05T08:30:00',
    items: [
      { id: '1-1', task: 'Visual inspection of dam crest and upstream face', completed: true, critical: true },
      { id: '1-2', task: 'Check for seepage at downstream toe', completed: true, critical: true },
      { id: '1-3', task: 'Inspect spillway gates and control mechanisms', completed: true, critical: true },
      { id: '1-4', task: 'Monitor reservoir water level readings', completed: true, critical: true },
      { id: '1-5', task: 'Check instrumentation and monitoring systems', completed: true, critical: false },
      { id: '1-6', task: 'Verify emergency power systems operational', completed: true, critical: true },
      { id: '1-7', task: 'Inspect outlet works and valve operations', completed: true, critical: true },
      { id: '1-8', task: 'Review weather forecast and precipitation data', completed: true, critical: false },
      { id: '1-9', task: 'Document any unusual observations', completed: false, critical: true },
      { id: '1-10', task: 'Test communication systems', completed: false, critical: true },
      { id: '1-11', task: 'Update daily operations log', completed: false, critical: false },
      { id: '1-12', task: 'Brief incoming shift on any concerns', completed: false, critical: true }
    ]
  },
  {
    id: '2',
    title: 'Irrigation Canal Flow Verification - Zone A',
    category: 'daily',
    type: 'irrigation',
    description: 'Daily verification of water distribution in primary irrigation zone',
    assignedTo: 'Irrigation Team - Zone A',
    dueDate: '2026-03-05',
    status: 'completed',
    priority: 'high',
    completedItems: 10,
    totalItems: 10,
    lastUpdated: '2026-03-05T10:15:00',
    items: [
      { id: '2-1', task: 'Check main canal water level at intake', completed: true, critical: true },
      { id: '2-2', task: 'Verify flow rates at distribution points', completed: true, critical: true },
      { id: '2-3', task: 'Inspect gate operations at control structures', completed: true, critical: false },
      { id: '2-4', task: 'Clear debris from screens and filters', completed: true, critical: false },
      { id: '2-5', task: 'Check for canal erosion or damage', completed: true, critical: true },
      { id: '2-6', task: 'Verify farmer water allocation schedules', completed: true, critical: false },
      { id: '2-7', task: 'Monitor soil moisture sensors', completed: true, critical: false },
      { id: '2-8', task: 'Document any delivery issues', completed: true, critical: true },
      { id: '2-9', task: 'Update water distribution records', completed: true, critical: false },
      { id: '2-10', task: 'Coordinate with Zone B team on handover', completed: true, critical: false }
    ]
  },
  {
    id: '3',
    title: 'Weekly Safety Equipment Inspection',
    category: 'weekly',
    type: 'safety',
    description: 'Comprehensive inspection of all safety equipment and emergency systems',
    assignedTo: 'Safety Officer - Ahmed Hussen',
    dueDate: '2026-03-07',
    status: 'pending',
    priority: 'critical',
    completedItems: 0,
    totalItems: 15,
    items: [
      { id: '3-1', task: 'Test emergency alarm systems', completed: false, critical: true },
      { id: '3-2', task: 'Inspect life jackets and flotation devices', completed: false, critical: true },
      { id: '3-3', task: 'Check fire extinguishers and fire suppression systems', completed: false, critical: true },
      { id: '3-4', task: 'Verify first aid kits fully stocked', completed: false, critical: true },
      { id: '3-5', task: 'Test emergency lighting systems', completed: false, critical: true },
      { id: '3-6', task: 'Inspect safety railings and barriers', completed: false, critical: false },
      { id: '3-7', task: 'Check emergency evacuation routes clear', completed: false, critical: true },
      { id: '3-8', task: 'Test backup communication radios', completed: false, critical: true },
      { id: '3-9', task: 'Verify emergency contact lists updated', completed: false, critical: true },
      { id: '3-10', task: 'Inspect personal protective equipment (PPE)', completed: false, critical: true },
      { id: '3-11', task: 'Test emergency generator under load', completed: false, critical: true },
      { id: '3-12', task: 'Review and update emergency response procedures', completed: false, critical: false },
      { id: '3-13', task: 'Check safety signage visibility', completed: false, critical: false },
      { id: '3-14', task: 'Inspect rescue equipment and ropes', completed: false, critical: true },
      { id: '3-15', task: 'Document all findings and required actions', completed: false, critical: true }
    ]
  },
  {
    id: '4',
    title: 'Irrigation Pump Station B Preventive Maintenance',
    category: 'weekly',
    type: 'maintenance',
    description: 'Weekly maintenance check of irrigation pump station equipment',
    assignedTo: 'Maintenance Technician - Dawit Tesfaye',
    dueDate: '2026-03-06',
    status: 'overdue',
    priority: 'high',
    completedItems: 4,
    totalItems: 11,
    items: [
      { id: '4-1', task: 'Check pump motor temperatures and vibrations', completed: true, critical: true },
      { id: '4-2', task: 'Inspect pump seals for leakage', completed: true, critical: true },
      { id: '4-3', task: 'Verify electrical connections tight', completed: true, critical: true },
      { id: '4-4', task: 'Test automatic start/stop controls', completed: true, critical: true },
      { id: '4-5', task: 'Check oil levels in gearboxes', completed: false, critical: true },
      { id: '4-6', task: 'Inspect intake screens for debris', completed: false, critical: false },
      { id: '4-7', task: 'Test pressure switches and sensors', completed: false, critical: true },
      { id: '4-8', task: 'Lubricate bearings per schedule', completed: false, critical: true },
      { id: '4-9', task: 'Check alignment of pump and motor', completed: false, critical: true },
      { id: '4-10', task: 'Record flow rates and power consumption', completed: false, critical: false },
      { id: '4-11', task: 'Update maintenance log and schedule next service', completed: false, critical: false }
    ]
  }
];

export default function IssuesChecklistsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const currentProject = projectsData?.projects?.[0];

  // Filter checklists
  const filteredChecklists = selectedCategory === 'all'
    ? checklists
    : checklists.filter(c => c.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* Filter Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Operations Checklists
            </h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="seasonal">Seasonal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Checklists Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {filteredChecklists.map((checklist) => {
              const progress = Math.round((checklist.completedItems / checklist.totalItems) * 100);
              const criticalRemaining = checklist.items.filter(i => i.critical && !i.completed).length;

              return (
                <div
                  key={checklist.id}
                  className={`p-4 bg-white dark:bg-[#22272B] rounded-lg border ${
                    checklist.status === 'overdue'
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-slate-700'
                  } hover:border-primary-500 cursor-pointer transition-colors`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(checklist.status)}`} />
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-slate-400">
                          {checklist.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-slate-400">
                          {checklist.type.replace('-', ' ').toUpperCase()}
                        </span>
                        {checklist.priority === 'critical' && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {checklist.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        {checklist.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                      <span>{checklist.completedItems} of {checklist.totalItems} tasks completed</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          progress === 100 ? 'bg-green-500' :
                          checklist.status === 'overdue' ? 'bg-red-500' :
                          'bg-primary-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Critical Items Warning */}
                  {criticalRemaining > 0 && (
                    <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50 rounded text-xs text-orange-900 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {criticalRemaining} critical {criticalRemaining === 1 ? 'task' : 'tasks'} remaining
                    </div>
                  )}

                  {/* Checklist Items (First 5) */}
                  <div className="space-y-1.5 mb-3 text-sm">
                    {checklist.items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400 dark:text-[#6B7684] flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500 dark:text-[#6B7684]' : 'text-gray-900 dark:text-white'}`}>
                          {item.task}
                          {item.critical && !item.completed && (
                            <span className="ml-2 text-xs text-red-600 dark:text-red-400">CRITICAL</span>
                          )}
                        </span>
                      </div>
                    ))}
                    {checklist.items.length > 5 && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 pl-6">
                        +{checklist.items.length - 5} more tasks
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{checklist.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due {formatDate(checklist.dueDate)}</span>
                    </div>
                    {checklist.lastUpdated && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {formatDate(checklist.lastUpdated)}</span>
                      </div>
                    )}
                  </div>

                  {/* Overdue Warning */}
                  {checklist.status === 'overdue' && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded text-xs text-red-900 dark:text-red-400">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Checklist is overdue - immediate attention required
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChecklists.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No checklists found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    No checklists match the selected filter.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
