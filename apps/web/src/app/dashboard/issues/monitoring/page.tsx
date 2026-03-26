'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
import { useLanguage } from '@/contexts/language-context';
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
  Zap
} from 'lucide-react';

interface MonitoringPoint {
  id: string;
  name: string;
  type: 'water-level' | 'flow-rate' | 'pressure' | 'temperature' | 'power' | 'weather';
  location: string;
  currentValue: number;
  unit: string;
  minValue: number;
  maxValue: number;
  optimalMin: number;
  optimalMax: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  trend: 'stable' | 'increasing' | 'decreasing';
}

const typeConfig = {
  'water-level': { icon: Droplets, label: 'Water Level', color: 'bg-blue-500' },
  'flow-rate': { icon: Waves, label: 'Flow Rate', color: 'bg-cyan-500' },
  'pressure': { icon: Gauge, label: 'Pressure', color: 'bg-purple-500' },
  'temperature': { icon: ThermometerSun, label: 'Temperature', color: 'bg-orange-500' },
  'power': { icon: Zap, label: 'Power', color: 'bg-yellow-500' },
  'weather': { icon: Wind, label: 'Weather', color: 'bg-gray-500' }
};

const statusConfig = {
  normal: { color: 'bg-green-200 text-green-800', label: 'Normal', icon: CheckCircle2 },
  warning: { color: 'bg-yellow-200 text-yellow-800', label: 'Warning', icon: AlertTriangle },
  critical: { color: 'bg-red-200 text-red-800', label: 'Critical', icon: AlertTriangle }
};

export default function IssuesMonitoringPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();

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

  // Mock real-time monitoring data
  const monitoringPoints: MonitoringPoint[] = [
    {
      id: '1',
      name: 'Main Dam Reservoir Level',
      type: 'water-level',
      location: 'Main Dam - Central',
      currentValue: 142.5,
      unit: 'm',
      minValue: 100,
      maxValue: 180,
      optimalMin: 130,
      optimalMax: 165,
      status: 'normal',
      lastUpdated: '2026-03-05T14:30:00',
      trend: 'stable'
    },
    {
      id: '2',
      name: 'Spillway Discharge Rate',
      type: 'flow-rate',
      location: 'Main Dam - Spillway',
      currentValue: 850,
      unit: 'm³/s',
      minValue: 0,
      maxValue: 2000,
      optimalMin: 200,
      optimalMax: 1200,
      status: 'normal',
      lastUpdated: '2026-03-05T14:30:00',
      trend: 'decreasing'
    },
    {
      id: '3',
      name: 'Pump Station A-3 Pressure',
      type: 'pressure',
      location: 'Irrigation Zone A',
      currentValue: 4.2,
      unit: 'bar',
      minValue: 0,
      maxValue: 8,
      optimalMin: 3.5,
      optimalMax: 5.5,
      status: 'normal',
      lastUpdated: '2026-03-05T14:29:00',
      trend: 'stable'
    },
    {
      id: '4',
      name: 'Canal B-12 Flow Rate',
      type: 'flow-rate',
      location: 'Irrigation Zone B - Canal 12',
      currentValue: 2.1,
      unit: 'm³/s',
      minValue: 0,
      maxValue: 5,
      optimalMin: 1.5,
      optimalMax: 3.5,
      status: 'warning',
      lastUpdated: '2026-03-05T14:28:00',
      trend: 'decreasing'
    },
    {
      id: '5',
      name: 'Turbine Temperature - Unit 2',
      type: 'temperature',
      location: 'Powerhouse - Generator 2',
      currentValue: 68,
      unit: '°C',
      minValue: 20,
      maxValue: 90,
      optimalMin: 45,
      optimalMax: 75,
      status: 'normal',
      lastUpdated: '2026-03-05T14:30:00',
      trend: 'increasing'
    },
    {
      id: '6',
      name: 'Main Grid Power Output',
      type: 'power',
      location: 'Powerhouse - Main Grid',
      currentValue: 42.5,
      unit: 'MW',
      minValue: 0,
      maxValue: 60,
      optimalMin: 30,
      optimalMax: 55,
      status: 'normal',
      lastUpdated: '2026-03-05T14:30:00',
      trend: 'stable'
    },
    {
      id: '7',
      name: 'Upstream Water Level',
      type: 'water-level',
      location: 'Upstream Sensor Station',
      currentValue: 156.8,
      unit: 'm',
      minValue: 120,
      maxValue: 200,
      optimalMin: 140,
      optimalMax: 180,
      status: 'normal',
      lastUpdated: '2026-03-05T14:29:00',
      trend: 'stable'
    },
    {
      id: '8',
      name: 'Dam Foundation Pressure',
      type: 'pressure',
      location: 'Main Dam - Foundation',
      currentValue: 6.8,
      unit: 'bar',
      minValue: 0,
      maxValue: 10,
      optimalMin: 4,
      optimalMax: 8,
      status: 'critical',
      lastUpdated: '2026-03-05T14:27:00',
      trend: 'increasing'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getValuePercentage = (point: MonitoringPoint) => {
    return ((point.currentValue - point.minValue) / (point.maxValue - point.minValue)) * 100;
  };

  const normalCount = monitoringPoints.filter(p => p.status === 'normal').length;
  const warningCount = monitoringPoints.filter(p => p.status === 'warning').length;
  const criticalCount = monitoringPoints.filter(p => p.status === 'critical').length;

  return (
    <AppLayout>
      <ProjectPageHeader
        project={currentProject}
        onCreateClick={() => {}}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Real-Time Monitoring
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Monitor dam operations, water systems, and infrastructure in real-time
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Sensors</CardDescription>
              <CardTitle className="text-2xl">{monitoringPoints.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Normal</CardDescription>
              <CardTitle className="text-2xl text-green-600">{normalCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Warning</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{warningCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Critical</CardDescription>
              <CardTitle className="text-2xl text-red-600">{criticalCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Monitoring Points Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {monitoringPoints.map((point) => {
            const TypeIcon = typeConfig[point.type].icon;
            const StatusIcon = statusConfig[point.status].icon;
            const valuePercentage = getValuePercentage(point);

            return (
              <Card key={point.id} className={`${point.status === 'critical' ? 'border-red-500 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig[point.type].label}
                        </Badge>
                        <Badge className={statusConfig[point.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[point.status].label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base md:text-lg">{point.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{point.location}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Value */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold">{point.currentValue}</span>
                      <span className="text-lg text-muted-foreground ml-2">{point.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getTrendIcon(point.trend)}
                      <span className="capitalize">{point.trend}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{point.minValue} {point.unit}</span>
                      <span>{point.maxValue} {point.unit}</span>
                    </div>
                    <Progress
                      value={valuePercentage}
                      className={`h-2 ${
                        point.status === 'critical' ? '[&>div]:bg-red-600' :
                        point.status === 'warning' ? '[&>div]:bg-yellow-600' :
                        '[&>div]:bg-green-600'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Optimal: {point.optimalMin} - {point.optimalMax} {point.unit}</span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Last updated: {new Date(point.lastUpdated).toLocaleString()}
                  </div>

                  {point.status === 'critical' && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                        ⚠️ Critical Alert: Value outside safe operating range
                      </p>
                    </div>
                  )}
                  {point.status === 'warning' && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        ⚠️ Warning: Approaching operational limits
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
