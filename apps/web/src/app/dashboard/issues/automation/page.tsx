'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import {
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface AutomationRule {
  id: string;
  name: string;
  category: 'irrigation' | 'monitoring' | 'safety' | 'power' | 'maintenance';
  description: string;
  status: 'active' | 'paused' | 'inactive' | 'error';
  trigger: string;
  action: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  nextScheduled?: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

const categoryLabels = {
  irrigation: 'Irrigation',
  monitoring: 'Monitoring',
  safety: 'Safety',
  power: 'Power',
  maintenance: 'Maintenance'
};

export default function IssuesAutomationPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

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

  const automationRules: AutomationRule[] = [
    {
      id: '1',
      name: 'Automatic Irrigation Scheduling - Zone A',
      category: 'irrigation',
      description: 'Automatically adjusts irrigation schedules based on soil moisture sensors and weather forecast',
      status: 'active',
      trigger: 'Daily at 06:00 OR when soil moisture drops below 40%',
      action: 'Calculate optimal water allocation and update valve schedules for Zone A',
      lastExecuted: '2026-03-05T06:00:00',
      executionCount: 1247,
      successRate: 99.2,
      nextScheduled: '2026-03-06T06:00:00',
      priority: 'high'
    },
    {
      id: '2',
      name: 'High Water Level Alert & Spillway Automation',
      category: 'safety',
      description: 'Monitors reservoir level and automatically opens spillway gates when reaching 95% capacity',
      status: 'active',
      trigger: 'When reservoir level exceeds 95% of maximum capacity',
      action: 'Open spillway gates incrementally, send alert to operations team, log event',
      lastExecuted: '2026-02-28T14:30:00',
      executionCount: 12,
      successRate: 100,
      priority: 'critical'
    },
    {
      id: '3',
      name: 'Turbine Performance Monitoring',
      category: 'monitoring',
      description: 'Continuously monitors turbine efficiency and vibration levels, alerts on anomalies',
      status: 'active',
      trigger: 'Every 5 minutes',
      action: 'Collect sensor data, analyze performance metrics, send alerts if thresholds exceeded',
      lastExecuted: '2026-03-05T14:25:00',
      executionCount: 52840,
      successRate: 98.7,
      nextScheduled: '2026-03-05T14:30:00',
      priority: 'high'
    },
    {
      id: '4',
      name: 'Emergency Power Switchover',
      category: 'power',
      description: 'Automatically switches to backup generators when main grid power fails',
      status: 'active',
      trigger: 'When main grid voltage drops below 80% for more than 2 seconds',
      action: 'Start backup generators, switch power source, notify maintenance team',
      lastExecuted: '2026-02-15T09:12:00',
      executionCount: 3,
      successRate: 100,
      priority: 'critical'
    },
    {
      id: '5',
      name: 'Weekly Pump Station Cycling Test',
      category: 'maintenance',
      description: 'Runs automated cycling test on standby pumps to ensure operational readiness',
      status: 'active',
      trigger: 'Every Sunday at 02:00',
      action: 'Start each standby pump for 15 minutes, log performance data, check for anomalies',
      lastExecuted: '2026-03-02T02:00:00',
      executionCount: 156,
      successRate: 97.4,
      nextScheduled: '2026-03-09T02:00:00',
      priority: 'normal'
    },
    {
      id: '6',
      name: 'Water Quality Sampling Reminder',
      category: 'monitoring',
      description: 'Sends automated reminders to water quality team for daily sampling schedule',
      status: 'active',
      trigger: 'Daily at 05:00, 12:00, and 18:00',
      action: 'Send notification to assigned team members, log acknowledgment, track completion',
      lastExecuted: '2026-03-05T12:00:00',
      executionCount: 2891,
      successRate: 99.8,
      nextScheduled: '2026-03-05T18:00:00',
      priority: 'high'
    },
    {
      id: '7',
      name: 'Canal Gate Control - Irrigation Zone B',
      category: 'irrigation',
      description: 'Automatically controls canal gates based on approved water allocation schedules',
      status: 'active',
      trigger: 'Per scheduled allocation times (6am-8pm daily)',
      action: 'Adjust gate positions to maintain target flow rates, log actual vs. target',
      lastExecuted: '2026-03-05T13:00:00',
      executionCount: 3654,
      successRate: 96.8,
      nextScheduled: '2026-03-05T14:00:00',
      priority: 'high'
    },
    {
      id: '8',
      name: 'Seepage Detection & Alert',
      category: 'safety',
      description: 'Monitors piezometer readings for abnormal seepage patterns in dam structure',
      status: 'active',
      trigger: 'Every 30 minutes',
      action: 'Analyze piezometer data trends, alert if rapid changes detected, log all readings',
      lastExecuted: '2026-03-05T14:00:00',
      executionCount: 17520,
      successRate: 99.9,
      nextScheduled: '2026-03-05T14:30:00',
      priority: 'critical'
    },
    {
      id: '9',
      name: 'Generator Fuel Level Monitoring',
      category: 'power',
      description: 'Monitors fuel levels in backup generators and schedules refueling when needed',
      status: 'active',
      trigger: 'Daily at 08:00 OR when fuel level drops below 30%',
      action: 'Check fuel levels, create refueling work order if below threshold, notify procurement',
      lastExecuted: '2026-03-05T08:00:00',
      executionCount: 892,
      successRate: 100,
      nextScheduled: '2026-03-06T08:00:00',
      priority: 'high'
    },
    {
      id: '10',
      name: 'Heavy Rainfall Response Protocol',
      category: 'safety',
      description: 'Automatically adjusts dam operations when heavy rainfall is forecasted',
      status: 'paused',
      trigger: 'When weather forecast predicts >50mm rainfall in 24 hours',
      action: 'Pre-release water to create flood storage capacity, alert operations team, update schedule',
      lastExecuted: '2026-02-20T10:00:00',
      executionCount: 8,
      successRate: 100,
      priority: 'critical'
    },
    {
      id: '11',
      name: 'Maintenance Schedule Automation',
      category: 'maintenance',
      description: 'Automatically generates preventive maintenance work orders based on equipment run hours',
      status: 'active',
      trigger: 'When equipment reaches scheduled maintenance interval',
      action: 'Create work order, assign to maintenance team, schedule technician, order parts if needed',
      lastExecuted: '2026-03-04T10:30:00',
      executionCount: 234,
      successRate: 98.3,
      priority: 'normal'
    },
    {
      id: '12',
      name: 'Real-Time Data Dashboard Refresh',
      category: 'monitoring',
      description: 'Updates all monitoring dashboards with latest sensor data from SCADA system',
      status: 'error',
      trigger: 'Every 60 seconds',
      action: 'Query SCADA database, process data, update dashboard displays, archive historical data',
      lastExecuted: '2026-03-05T14:20:00',
      executionCount: 524160,
      successRate: 94.2,
      nextScheduled: '2026-03-05T14:30:00',
      priority: 'high'
    }
  ];

  // Filter automation rules
  const filteredRules = automationRules.filter(rule => {
    if (selectedCategory !== 'all' && rule.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && rule.status !== selectedStatus) return false;
    return true;
  });

  const toggleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Automation"
        icon={<Zap className="h-6 w-6" />}
        iconColor="#EAB308"
        currentTab="automation"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">

        {/* Filter Bar */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation Rules
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="irrigation">Irrigation</option>
                <option value="monitoring">Monitoring</option>
                <option value="safety">Safety</option>
                <option value="power">Power</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automation Rules List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-3">
            {filteredRules.map((rule) => {
              const isExpanded = expandedRules.has(rule.id);

              return (
                <div
                  key={rule.id}
                  className={`p-3 bg-white dark:bg-[#12161B] rounded-lg border ${
                    rule.status === 'error'
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-white/[0.08]'
                  } hover:border-primary-500 cursor-pointer transition-colors`}
                >
                  <div
                    className="flex items-start justify-between gap-4"
                    onClick={() => toggleExpanded(rule.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(rule.status)}`} />
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/50">
                          {categoryLabels[rule.category].toUpperCase()}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/50">
                          {rule.status.toUpperCase()}
                        </span>
                        {rule.priority === 'critical' && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {rule.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white/50">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {rule.executionCount.toLocaleString()} executions
                        </span>
                        <span>
                          {rule.successRate}% success
                        </span>
                        {rule.lastExecuted && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {formatDate(rule.lastExecuted)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`h-4 w-4 text-gray-600 dark:text-white/50 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.08] space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-white/50 mb-1">Description:</p>
                        <p className="text-xs text-gray-900 dark:text-white">{rule.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-white/50 mb-1">Trigger:</p>
                        <p className="text-xs text-gray-900 dark:text-white">{rule.trigger}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-white/50 mb-1">Action:</p>
                        <p className="text-xs text-gray-900 dark:text-white">{rule.action}</p>
                      </div>
                      {rule.nextScheduled && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-white/50">
                          <Calendar className="h-3 w-3" />
                          Next scheduled: {formatDate(rule.nextScheduled)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error/Paused Alerts */}
                  {rule.status === 'error' && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded text-xs text-red-900 dark:text-red-400">
                      ⚠️ Rule experiencing errors - check system logs
                    </div>
                  )}
                  {rule.status === 'paused' && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded text-xs text-yellow-900 dark:text-yellow-400">
                      ⏸️ Rule is currently paused
                    </div>
                  )}
                </div>
              );
            })}

            {filteredRules.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Zap className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No automation rules found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                    No rules match the selected filters.
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
