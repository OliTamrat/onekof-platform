'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Droplets,
  Filter,
  Plus,
  Search,
  Users,
  Wrench
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  type: 'infrastructure' | 'maintenance' | 'irrigation' | 'monitoring' | 'stakeholder';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'planned' | 'approved' | 'ready' | 'blocked';
  estimatedCost?: number;
  assignedTo?: string;
  dueDate?: string;
  dependencies?: string[];
}

const typeConfig = {
  infrastructure: { icon: Building2, label: 'Infrastructure', color: 'bg-blue-500' },
  maintenance: { icon: Wrench, label: 'Maintenance', color: 'bg-orange-500' },
  irrigation: { icon: Droplets, label: 'Irrigation', color: 'bg-green-500' },
  monitoring: { icon: AlertCircle, label: 'Monitoring', color: 'bg-purple-500' },
  stakeholder: { icon: Users, label: 'Stakeholder', color: 'bg-pink-500' }
};

const priorityConfig = {
  critical: { color: 'bg-red-600 text-white', label: 'Critical' },
  high: { color: 'bg-orange-600 text-white', label: 'High' },
  medium: { color: 'bg-yellow-600 text-white', label: 'Medium' },
  low: { color: 'bg-gray-500 text-white', label: 'Low' }
};

const statusConfig = {
  planned: { color: 'bg-gray-200 text-gray-800', label: 'Planned' },
  approved: { color: 'bg-blue-200 text-blue-800', label: 'Approved' },
  ready: { color: 'bg-green-200 text-green-800', label: 'Ready' },
  blocked: { color: 'bg-red-200 text-red-800', label: 'Blocked' }
};

export default function IssuesBacklogPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

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

  // Mock data for demonstration - replace with actual API call
  const backlogItems: BacklogItem[] = [
    {
      id: '1',
      title: 'Dam Safety Inspection - Q2 2026',
      description: 'Comprehensive structural integrity assessment of main dam wall and spillways',
      type: 'infrastructure',
      priority: 'critical',
      status: 'approved',
      estimatedCost: 250000,
      assignedTo: 'Engineering Team A',
      dueDate: '2026-06-30',
      dependencies: []
    },
    {
      id: '2',
      title: 'Install 50 New Drip Irrigation Units - Zone C',
      description: 'Deploy modern drip irrigation systems for 500 hectares in southern agricultural zone',
      type: 'irrigation',
      priority: 'high',
      status: 'ready',
      estimatedCost: 180000,
      assignedTo: 'Irrigation Specialists',
      dueDate: '2026-04-15'
    },
    {
      id: '3',
      title: 'Community Training Program - Water Conservation',
      description: 'Conduct training sessions for 500 farmers on efficient water usage techniques',
      type: 'stakeholder',
      priority: 'medium',
      status: 'planned',
      estimatedCost: 25000,
      assignedTo: 'Community Outreach Team',
      dueDate: '2026-05-20'
    },
    {
      id: '4',
      title: 'Upgrade Flow Monitoring Sensors',
      description: 'Replace outdated sensors with IoT-enabled real-time monitoring devices across 12 canal points',
      type: 'monitoring',
      priority: 'high',
      status: 'approved',
      estimatedCost: 95000,
      assignedTo: 'Tech Operations',
      dueDate: '2026-04-30'
    },
    {
      id: '5',
      title: 'Canal Sediment Removal - Main Channel',
      description: 'Annual sediment clearing to maintain optimal water flow capacity',
      type: 'maintenance',
      priority: 'medium',
      status: 'ready',
      estimatedCost: 65000,
      assignedTo: 'Maintenance Crew B',
      dueDate: '2026-03-31'
    },
    {
      id: '6',
      title: 'Environmental Impact Assessment Update',
      description: 'Update EIA report with latest biodiversity and water quality data',
      type: 'stakeholder',
      priority: 'medium',
      status: 'planned',
      estimatedCost: 40000,
      assignedTo: 'Environmental Team',
      dueDate: '2026-07-15'
    }
  ];

  const filteredItems = backlogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const groupedByStatus = {
    planned: filteredItems.filter(item => item.status === 'planned'),
    approved: filteredItems.filter(item => item.status === 'approved'),
    ready: filteredItems.filter(item => item.status === 'ready'),
    blocked: filteredItems.filter(item => item.status === 'blocked')
  };

  return (
    <AppLayout>
      <ProjectPageHeader
        project={currentProject}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 md:w-8 md:h-8" />
              Infrastructure Backlog
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Planned infrastructure, maintenance, and stakeholder activities
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Backlog Item
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search backlog items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="maintenance">Maintenance</option>
                <option value="irrigation">Irrigation</option>
                <option value="monitoring">Monitoring</option>
                <option value="stakeholder">Stakeholder</option>
              </Select>
              <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Items</CardDescription>
              <CardTitle className="text-2xl">{filteredItems.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Ready to Start</CardDescription>
              <CardTitle className="text-2xl text-green-600">{groupedByStatus.ready.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Awaiting Approval</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{groupedByStatus.approved.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t("status.blocked")}</CardDescription>
              <CardTitle className="text-2xl text-red-600">{groupedByStatus.blocked.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Backlog Items by Status */}
        <div className="space-y-6">
          {Object.entries(groupedByStatus).map(([status, items]) => (
            items.length > 0 && (
              <div key={status}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge className={statusConfig[status as keyof typeof statusConfig].color}>
                    {statusConfig[status as keyof typeof statusConfig].label}
                  </Badge>
                  <span className="text-muted-foreground">({items.length})</span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const TypeIcon = typeConfig[item.type].icon;
                    return (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <TypeIcon className="w-3 h-3" />
                                  {typeConfig[item.type].label}
                                </Badge>
                                <Badge className={priorityConfig[item.priority].color}>
                                  {priorityConfig[item.priority].label}
                                </Badge>
                              </div>
                              <CardTitle className="text-base md:text-lg break-words">
                                {item.title}
                              </CardTitle>
                              <CardDescription className="mt-2 text-sm">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            {item.estimatedCost && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Budget:</span>
                                <span className="text-muted-foreground">
                                  {item.estimatedCost.toLocaleString()} ETB
                                </span>
                              </div>
                            )}
                            {item.assignedTo && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{item.assignedTo}</span>
                              </div>
                            )}
                            {item.dueDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Due: {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No backlog items found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </AppLayout>
  );
}
