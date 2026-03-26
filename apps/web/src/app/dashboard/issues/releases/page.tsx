'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Rocket,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';

interface Release {
  id: string;
  name: string;
  version: string;
  phase: string;
  description: string;
  status: 'planning' | 'in-progress' | 'testing' | 'completed' | 'delayed';
  startDate: string;
  targetDate: string;
  actualDate?: string;
  progress: number;
  budget: number;
  spent: number;
  milestones: Milestone[];
  deliverables: string[];
  stakeholders: string[];
}

interface Milestone {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  dueDate: string;
  completionDate?: string;
}

const statusConfig = {
  planning: { color: 'bg-gray-200 text-gray-800', label: 'Planning' },
  'in-progress': { color: 'bg-blue-200 text-blue-800', label: t('status.inProgress') },
  testing: { color: 'bg-yellow-200 text-yellow-800', label: 'Testing' },
  completed: { color: 'bg-green-200 text-green-800', label: 'Completed' },
  delayed: { color: 'bg-red-200 text-red-800', label: 'Delayed' }
};

export default function IssuesReleasesPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'completed'>('active');

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

  // Mock data - replace with actual API
  const releases: Release[] = [
    {
      id: '1',
      name: 'Phase 1: Main Dam Commissioning',
      version: 'v1.0',
      phase: 'Infrastructure Foundation',
      description: 'Complete construction and initial water impoundment of the main dam structure',
      status: 'in-progress',
      startDate: '2025-01-15',
      targetDate: '2026-12-31',
      progress: 68,
      budget: 15000000,
      spent: 9800000,
      stakeholders: ['Ministry of Water', 'Regional Government', 'Local Communities'],
      deliverables: [
        'Main dam wall completion',
        'Spillway installation',
        'Initial water impoundment',
        'Safety systems activation',
        'Environmental compliance certification'
      ],
      milestones: [
        {
          id: 'm1',
          title: 'Foundation completion',
          status: 'completed',
          dueDate: '2025-06-30',
          completionDate: '2025-06-28'
        },
        {
          id: 'm2',
          title: 'Dam wall construction 50%',
          status: 'completed',
          dueDate: '2025-12-31',
          completionDate: '2025-12-15'
        },
        {
          id: 'm3',
          title: 'Spillway installation',
          status: 'in-progress',
          dueDate: '2026-06-30'
        },
        {
          id: 'm4',
          title: 'Safety systems commissioning',
          status: 'pending',
          dueDate: '2026-10-31'
        },
        {
          id: 'm5',
          title: 'Initial impoundment',
          status: 'pending',
          dueDate: '2026-12-31'
        }
      ]
    },
    {
      id: '2',
      name: 'Phase 2: Primary Irrigation Network',
      version: 'v2.0',
      phase: 'Agricultural Infrastructure',
      description: 'Deploy primary canal system and irrigation infrastructure for 10,000 hectares',
      status: 'planning',
      startDate: '2026-07-01',
      targetDate: '2027-12-31',
      progress: 15,
      budget: 8500000,
      spent: 450000,
      stakeholders: ['Ministry of Agriculture', 'Farmers Cooperatives', 'Water User Associations'],
      deliverables: [
        'Primary canal construction (85 km)',
        'Secondary canal network (320 km)',
        'Pump station installation (12 units)',
        'Control gate systems (45 points)',
        'Farmer training programs'
      ],
      milestones: [
        {
          id: 'm6',
          title: 'Design approval',
          status: 'completed',
          dueDate: '2026-03-31',
          completionDate: '2026-03-15'
        },
        {
          id: 'm7',
          title: 'Primary canal excavation start',
          status: 'in-progress',
          dueDate: '2026-07-15'
        },
        {
          id: 'm8',
          title: 'Pump station procurement',
          status: 'pending',
          dueDate: '2026-09-30'
        }
      ]
    },
    {
      id: '3',
      name: 'Phase 3: Smart Monitoring System',
      version: 'v3.0',
      phase: 'Technology Integration',
      description: 'Deploy IoT sensors and automated monitoring across dam and irrigation network',
      status: 'planning',
      startDate: '2027-01-01',
      targetDate: '2027-06-30',
      progress: 5,
      budget: 2200000,
      spent: 120000,
      stakeholders: ['Tech Operations Team', 'Data Analytics Unit', 'Maintenance Division'],
      deliverables: [
        'Water level sensors (25 units)',
        'Flow monitoring devices (50 units)',
        'Weather stations (8 units)',
        'Central dashboard system',
        'Mobile app for field staff',
        'Automated alert system'
      ],
      milestones: [
        {
          id: 'm9',
          title: 'Technology assessment',
          status: 'completed',
          dueDate: '2026-11-30',
          completionDate: '2026-11-20'
        },
        {
          id: 'm10',
          title: 'Vendor selection',
          status: 'pending',
          dueDate: '2027-02-28'
        },
        {
          id: 'm11',
          title: 'Installation and testing',
          status: 'pending',
          dueDate: '2027-05-31'
        }
      ]
    }
  ];

  const filteredReleases = releases.filter(release => {
    if (selectedView === 'active') return release.status !== 'completed';
    if (selectedView === 'completed') return release.status === 'completed';
    return true;
  });

  const getStatusIcon = (status: Release['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'delayed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <AppLayout>
      <ProjectPageHeader
        project={currentProject}
        onCreateClick={() => {}}
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Rocket className="w-6 h-6 md:w-8 md:h-8" />
              Project Phases & Releases
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Track major project milestones and commissioning phases
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Plan New Phase
          </Button>
        </div>

        {/* View Tabs */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Phases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Phases</CardDescription>
              <CardTitle className="text-2xl">{releases.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Active</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {releases.filter(r => r.status === 'in-progress').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Completed</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {releases.filter(r => r.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Budget</CardDescription>
              <CardTitle className="text-xl md:text-2xl">
                {(releases.reduce((acc, r) => acc + r.budget, 0) / 1000000).toFixed(1)}M ETB
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Releases List */}
        <div className="space-y-6">
          {filteredReleases.map((release) => (
            <Card key={release.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(release.status)}
                      <Badge className={statusConfig[release.status].color}>
                        {statusConfig[release.status].label}
                      </Badge>
                      <Badge variant="outline">{release.version}</Badge>
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{release.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      {release.phase}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(release.startDate).toLocaleDateString()} - {new Date(release.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Description */}
                <p className="text-muted-foreground">{release.description}</p>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-semibold">{release.progress}%</span>
                  </div>
                  <Progress value={release.progress} className="h-2" />
                </div>

                {/* Budget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-lg font-semibold">{(release.budget / 1000000).toFixed(2)}M ETB</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-lg font-semibold text-blue-600">{(release.spent / 1000000).toFixed(2)}M ETB</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className="text-lg font-semibold text-green-600">
                      {((release.budget - release.spent) / 1000000).toFixed(2)}M ETB
                    </p>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Milestones
                  </h4>
                  <div className="space-y-2">
                    {release.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        {milestone.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        {milestone.status === 'in-progress' && (
                          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                        {milestone.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            {milestone.completionDate && ` | Completed: ${new Date(milestone.completionDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="font-semibold mb-3">Key Deliverables</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {release.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stakeholders */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Key Stakeholders
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {release.stakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="outline">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReleases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No phases found for this view</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
