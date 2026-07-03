'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import {
  FileBarChart,
  Download,
  Eye,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface Report {
  id: string;
  title: string;
  type: 'operational' | 'safety' | 'financial' | 'environmental' | 'compliance' | 'performance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  status: 'current' | 'overdue' | 'pending' | 'submitted';
  reportingPeriod: string;
  dueDate: string;
  submittedDate?: string;
  generatedBy: string;
  priority: 'critical' | 'high' | 'normal';
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Daily Operations Summary Report',
    type: 'operational',
    frequency: 'daily',
    status: 'current',
    reportingPeriod: 'March 5, 2026',
    dueDate: '2026-03-06',
    submittedDate: '2026-03-05',
    generatedBy: 'Operations Manager - Tekle Haile',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Weekly Safety Inspection Report',
    type: 'safety',
    frequency: 'weekly',
    status: 'pending',
    reportingPeriod: 'Week of Feb 26 - Mar 4',
    dueDate: '2026-03-07',
    generatedBy: 'Safety Team Lead - Mulugeta Asfaw',
    priority: 'critical'
  },
  {
    id: '3',
    title: 'Monthly Environmental Monitoring Report',
    type: 'environmental',
    frequency: 'monthly',
    status: 'overdue',
    reportingPeriod: 'February 2026',
    dueDate: '2026-03-05',
    generatedBy: 'Environmental Officer - Sara Ahmed',
    priority: 'critical'
  },
  {
    id: '4',
    title: 'Dam Safety Compliance Report',
    type: 'compliance',
    frequency: 'annual',
    status: 'pending',
    reportingPeriod: '2025 Annual Report',
    dueDate: '2026-03-31',
    generatedBy: 'Chief Engineer - Dr. Dawit Tadesse',
    priority: 'critical'
  },
  {
    id: '5',
    title: 'Irrigation Performance Analysis',
    type: 'performance',
    frequency: 'monthly',
    status: 'submitted',
    reportingPeriod: 'February 2026',
    dueDate: '2026-03-05',
    submittedDate: '2026-03-04',
    generatedBy: 'Irrigation Manager - Alemayehu Bekele',
    priority: 'normal'
  }
];

export default function IssuesReportsPage() {
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const currentProject = projectsData?.projects?.[0];

  const filteredReports = reports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* Filter Bar */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              Reports & Compliance
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="operational">Operational</option>
                <option value="safety">Safety</option>
                <option value="financial">Financial</option>
                <option value="environmental">Environmental</option>
                <option value="compliance">Compliance</option>
                <option value="performance">Performance</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="current">Current</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`p-3 bg-white dark:bg-[#12161B] rounded-lg border ${
                  report.status === 'overdue'
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-white/[0.08]'
                } hover:border-primary-500 cursor-pointer transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(report.status)}`} />
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/70">
                        {report.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/70">
                        {report.frequency.toUpperCase()}
                      </span>
                      {report.priority === 'critical' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white/70">
                      <span>Period: {report.reportingPeriod}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {formatDate(report.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.generatedBy.split(' - ')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'submitted' || report.status === 'current' ? (
                      <>
                        <Button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#181D23]">
                          <Eye className="h-4 w-4 text-gray-600 dark:text-white/70" />
                        </Button>
                        <Button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#181D23]">
                          <Download className="h-4 w-4 text-gray-600 dark:text-white/70" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
                {report.status === 'overdue' && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded text-xs text-red-900 dark:text-red-400">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Report is overdue
                  </div>
                )}
                {report.submittedDate && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Submitted {formatDate(report.submittedDate)}
                  </div>
                )}
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileBarChart className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                    No reports match the selected filters.
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
