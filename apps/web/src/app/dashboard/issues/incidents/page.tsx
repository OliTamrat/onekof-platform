'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  MapPin,
  Plus,
  Search,
  TrendingUp,
  User,
  XCircle,
  Zap
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';

interface Incident {
  id: string;
  title: string;
  type: 'safety' | 'equipment' | 'environmental' | 'operational' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  resolvedDate?: string;
  impact?: string;
  actions?: string[];
}

const typeConfig = {
  safety: { icon: AlertTriangle, label: 'Safety', color: 'bg-red-500' },
  equipment: { icon: Zap, label: 'Equipment', color: 'bg-orange-500' },
  environmental: { icon: Droplets, label: 'Environmental', color: 'bg-green-500' },
  operational: { icon: TrendingUp, label: 'Operational', color: 'bg-blue-500' },
  security: { icon: AlertCircle, label: 'Security', color: 'bg-purple-500' }
};

const severityConfig = {
  critical: { color: 'bg-red-600 text-white', label: 'Critical' },
  high: { color: 'bg-orange-600 text-white', label: 'High' },
  medium: { color: 'bg-yellow-600 text-white', label: 'Medium' },
  low: { color: 'bg-gray-500 text-white', label: 'Low' }
};

const statusConfig = {
  open: { color: 'bg-red-200 text-red-800', label: 'Open', icon: AlertCircle },
  investigating: { color: 'bg-yellow-200 text-yellow-800', label: 'Investigating', icon: Clock },
  resolved: { color: 'bg-blue-200 text-blue-800', label: 'Resolved', icon: CheckCircle2 },
  closed: { color: 'bg-green-200 text-green-800', label: 'Closed', icon: CheckCircle2 }
};

export default function IssuesIncidentsPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'active' | 'resolved' | 'all'>('active');

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

  // Mock data for demonstration
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Spillway Gate Malfunction - Emergency Response',
      type: 'equipment',
      severity: 'critical',
      status: 'investigating',
      description: 'Gate #3 spillway control system unresponsive. Emergency manual override activated. Water discharge rate affected.',
      location: 'Main Dam - Spillway Control Room',
      reportedBy: 'Operations Manager - Ahmed Yusuf',
      reportedDate: '2026-03-05T08:30:00',
      assignedTo: 'Engineering Response Team',
      impact: 'Reduced spillway capacity by 30%, potential flood risk if heavy rainfall occurs',
      actions: [
        'Manual override activated',
        'Engineering team dispatched',
        'Backup power systems checked',
        'Weather monitoring increased'
      ]
    },
    {
      id: '2',
      title: 'Water Quality Alert - Elevated Turbidity',
      type: 'environmental',
      severity: 'high',
      status: 'investigating',
      description: 'Automated sensors detected turbidity levels exceeding acceptable thresholds in Zone B irrigation canal',
      location: 'Zone B - Main Irrigation Canal KM 12.5',
      reportedBy: 'Water Quality Monitor System',
      reportedDate: '2026-03-04T14:15:00',
      assignedTo: 'Environmental Team',
      impact: 'Irrigation suspended in affected zone affecting 500 hectares',
      actions: [
        'Water samples collected',
        'Source investigation underway',
        'Alternative water routing activated',
        'Farmers notified'
      ]
    },
    {
      id: '3',
      title: 'Unauthorized Access Attempt - Security Breach',
      type: 'security',
      severity: 'high',
      status: 'resolved',
      description: 'Security cameras detected unauthorized personnel attempting to access restricted dam control area',
      location: 'Dam Control Facility - North Entrance',
      reportedBy: 'Security System',
      reportedDate: '2026-03-03T22:45:00',
      assignedTo: 'Security Team',
      resolvedDate: '2026-03-04T02:30:00',
      impact: 'No breach occurred, security protocols effective',
      actions: [
        'Security personnel responded immediately',
        'Individuals identified and detained',
        'Local authorities notified',
        'Additional patrols implemented',
        'Access control systems verified'
      ]
    },
    {
      id: '4',
      title: 'Minor Leak Detected - Dam Wall Section C',
      type: 'safety',
      severity: 'medium',
      status: 'resolved',
      description: 'Routine inspection discovered small seepage in dam wall concrete section C-14',
      location: 'Main Dam Wall - Section C-14',
      reportedBy: 'Dam Safety Inspector - Rahel Assefa',
      reportedDate: '2026-02-28T10:20:00',
      assignedTo: 'Maintenance Crew A',
      resolvedDate: '2026-03-02T16:00:00',
      impact: 'Minimal impact, within safety parameters',
      actions: [
        'Area cordoned off',
        'Structural engineer assessment completed',
        'Repair materials procured',
        'Sealing completed',
        'Monitoring increased for 30 days'
      ]
    },
    {
      id: '5',
      title: 'Pump Station Power Failure - Zone A',
      type: 'operational',
      severity: 'medium',
      status: 'closed',
      description: 'Power outage at Pump Station A-3 caused irrigation interruption',
      location: 'Pump Station A-3',
      reportedBy: 'Station Operator - Michael Tesfaye',
      reportedDate: '2026-02-25T07:00:00',
      assignedTo: 'Electrical Team',
      resolvedDate: '2026-02-25T11:30:00',
      impact: 'Irrigation delayed by 4.5 hours for 200 hectares',
      actions: [
        'Backup generator activated',
        'Main power system diagnostics',
        'Faulty transformer replaced',
        'System tested and restored',
        'Preventive maintenance scheduled'
      ]
    }
  ];

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;

    let matchesView = true;
    if (selectedView === 'active') {
      matchesView = incident.status === 'open' || incident.status === 'investigating';
    } else if (selectedView === 'resolved') {
      matchesView = incident.status === 'resolved' || incident.status === 'closed';
    }

    return matchesSearch && matchesType && matchesSeverity && matchesView;
  });

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
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              Incident Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Track and manage safety, operational, and environmental incidents
            </p>
          </div>
          <Button variant="destructive" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
        </div>

        {/* View Tabs */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="safety">Safety</option>
                <option value="equipment">Equipment</option>
                <option value="environmental">Environmental</option>
                <option value="operational">Operational</option>
                <option value="security">Security</option>
              </Select>
              <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Incidents</CardDescription>
              <CardTitle className="text-2xl">{incidents.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Open</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {incidents.filter(i => i.status === 'open').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Investigating</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {incidents.filter(i => i.status === 'investigating').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Resolved</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {incidents.filter(i => i.status === 'resolved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Critical</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {incidents.filter(i => i.severity === 'critical').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const TypeIcon = typeConfig[incident.type].icon;
            const StatusIcon = statusConfig[incident.status].icon;
            return (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig[incident.type].label}
                        </Badge>
                        <Badge className={statusConfig[incident.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[incident.status].label}
                        </Badge>
                        <Badge className={severityConfig[incident.severity].color}>
                          {severityConfig[incident.severity].label}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg md:text-xl break-words mb-2">
                        {incident.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {incident.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(incident.reportedDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{incident.reportedBy}</span>
                    </div>
                    {incident.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          Assigned: <span className="font-medium">{incident.assignedTo}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {incident.impact && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">Impact</p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">{incident.impact}</p>
                    </div>
                  )}

                  {incident.actions && incident.actions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Actions Taken</h4>
                      <ul className="space-y-1">
                        {incident.actions.map((action, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {incident.resolvedDate && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved on {new Date(incident.resolvedDate).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t">
                    <Button variant="outline" size="sm">View Full Report</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No incidents found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
