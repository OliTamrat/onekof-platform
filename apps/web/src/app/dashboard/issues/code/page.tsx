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
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Plus,
  Search,
  User,
  Waves,
  XCircle
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';

interface TechnicalReview {
  id: string;
  title: string;
  type: 'design' | 'safety' | 'environmental' | 'quality' | 'procurement';
  description: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'revision-needed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  submittedBy: string;
  submittedDate: string;
  reviewer?: string;
  reviewDate?: string;
  documents: string[];
  comments?: number;
  findings?: string[];
}

const typeConfig = {
  design: { icon: FileText, label: 'Design Review', color: 'bg-blue-500' },
  safety: { icon: AlertCircle, label: 'Safety Review', color: 'bg-red-500' },
  environmental: { icon: Waves, label: 'Environmental', color: 'bg-green-500' },
  quality: { icon: CheckCircle2, label: 'Quality Assurance', color: 'bg-purple-500' },
  procurement: { icon: Building2, label: 'Procurement', color: 'bg-orange-500' }
};

const statusConfig = {
  pending: { color: 'bg-gray-200 text-gray-800', label: 'Pending Review', icon: Clock },
  'in-review': { color: 'bg-blue-200 text-blue-800', label: 'In Review', icon: FileCheck },
  approved: { color: 'bg-green-200 text-green-800', label: 'Approved', icon: CheckCircle2 },
  rejected: { color: 'bg-red-200 text-red-800', label: 'Rejected', icon: XCircle },
  'revision-needed': { color: 'bg-yellow-200 text-yellow-800', label: 'Needs Revision', icon: AlertCircle }
};

const priorityConfig = {
  critical: { color: 'bg-red-600 text-white', label: 'Critical' },
  high: { color: 'bg-orange-600 text-white', label: 'High' },
  medium: { color: 'bg-yellow-600 text-white', label: 'Medium' },
  low: { color: 'bg-gray-500 text-white', label: 'Low' }
};

export default function IssuesCodePage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'pending' | 'in-review' | 'completed'>('pending');

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
  const reviews: TechnicalReview[] = [
    {
      id: '1',
      title: 'Dam Spillway Design - Final Review',
      type: 'design',
      description: 'Final technical design review for main spillway system including hydraulic calculations and structural integrity assessment',
      status: 'in-review',
      priority: 'critical',
      submittedBy: 'Lead Engineer - John Bekele',
      submittedDate: '2026-02-28',
      reviewer: 'Chief Technical Officer',
      documents: ['Spillway_Design_v3.2.pdf', 'Hydraulic_Calculations.xlsx', 'Structural_Analysis.pdf'],
      comments: 8,
      findings: [
        'Hydraulic capacity meets design requirements',
        'Minor adjustments needed for emergency discharge rate',
        'Structural reinforcement specifications approved'
      ]
    },
    {
      id: '2',
      title: 'Environmental Impact Assessment - Update',
      type: 'environmental',
      description: 'Updated EIA incorporating latest biodiversity surveys and water quality monitoring data',
      status: 'pending',
      priority: 'high',
      submittedBy: 'Environmental Team - Sara Ahmed',
      submittedDate: '2026-03-01',
      documents: ['EIA_Update_2026.pdf', 'Biodiversity_Survey.pdf', 'Water_Quality_Report.pdf'],
      comments: 0
    },
    {
      id: '3',
      title: 'Pump Station Equipment - Quality Inspection',
      type: 'quality',
      description: 'Quality assurance inspection of imported pump station equipment before installation',
      status: 'approved',
      priority: 'high',
      submittedBy: 'QA Inspector - Michael Tesfaye',
      submittedDate: '2026-02-15',
      reviewer: 'Quality Manager',
      reviewDate: '2026-02-20',
      documents: ['Equipment_Inspection_Report.pdf', 'Manufacturer_Certificates.pdf', 'Test_Results.pdf'],
      comments: 3,
      findings: [
        'All equipment meets ISO standards',
        'Factory acceptance tests passed',
        'Documentation complete and verified'
      ]
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || review.type === filterType;
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;

    let matchesView = true;
    if (selectedView === 'pending') {
      matchesView = review.status === 'pending';
    } else if (selectedView === 'in-review') {
      matchesView = review.status === 'in-review' || review.status === 'revision-needed';
    } else if (selectedView === 'completed') {
      matchesView = review.status === 'approved' || review.status === 'rejected';
    }

    return matchesSearch && matchesType && matchesStatus && matchesView;
  });

  return (
    <AppLayout>
      <ProjectPageHeader
        project={currentProject}
        onCreateClick={() => {}}
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FileCheck className="w-6 h-6 md:w-8 md:h-8" />
              Technical Reviews
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Engineering design, safety, quality, and compliance reviews
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>

        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-review">{t("status.inReview")}</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="design">Design Review</option>
                <option value="safety">Safety Review</option>
                <option value="environmental">Environmental</option>
                <option value="quality">Quality Assurance</option>
                <option value="procurement">Procurement</option>
              </Select>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-review">{t("status.inReview")}</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revision-needed">Needs Revision</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Reviews</CardDescription>
              <CardTitle className="text-2xl">{reviews.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Pending</CardDescription>
              <CardTitle className="text-2xl text-gray-600">
                {reviews.filter(r => r.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t("status.inReview")}</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {reviews.filter(r => r.status === 'in-review').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Approved</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {reviews.filter(r => r.status === 'approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => {
            const TypeIcon = typeConfig[review.type].icon;
            const StatusIcon = statusConfig[review.status].icon;
            return (
              <Card key={review.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" />
                      {typeConfig[review.type].label}
                    </Badge>
                    <Badge className={statusConfig[review.status].color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[review.status].label}
                    </Badge>
                    <Badge className={priorityConfig[review.priority].color}>
                      {priorityConfig[review.priority].label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg md:text-xl break-words mb-2">
                    {review.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {review.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {review.submittedBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(review.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {review.documents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Documents ({review.documents.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {review.documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.findings && review.findings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Findings</h4>
                      <ul className="space-y-1">
                        {review.findings.map((finding, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      {review.comments !== undefined && `${review.comments} comments`}
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No technical reviews found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
