'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import {
import { useLanguage } from '@/contexts/language-context';
  BookOpen,
  Search,
  Users,
  Clock,
  Star,
  Eye
} from 'lucide-react';

interface WikiArticle {
  id: string;
  title: string;
  category: 'operations' | 'safety' | 'maintenance' | 'emergency' | 'procedures' | 'training';
  description: string;
  content: string;
  author: string;
  lastModified: string;
  views: number;
  featured: boolean;
  status: 'published' | 'draft' | 'review';
  tags: string[];
}

const categoryLabels = {
  operations: 'Operations',
  safety: 'Safety',
  maintenance: 'Maintenance',
  emergency: 'Emergency',
  procedures: 'Procedures',
  training: 'Training'
};

export default function IssuesWikiPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const wikiArticles: WikiArticle[] = [
    {
      id: '1',
      title: 'Dam Safety Inspection Best Practices',
      category: 'safety',
      description: 'Comprehensive guide for conducting daily, weekly, and monthly dam safety inspections',
      content: 'Detailed procedures for visual inspection of dam crest, spillways, and downstream areas...',
      author: 'Safety Team Lead - Mulugeta Asfaw',
      lastModified: '2026-02-28T10:30:00',
      views: 456,
      featured: true,
      status: 'published',
      tags: ['safety', 'inspection', 'dam', 'best-practices']
    },
    {
      id: '2',
      title: 'Irrigation Water Allocation Standard Operating Procedure',
      category: 'operations',
      description: 'Step-by-step procedures for calculating and distributing irrigation water to farming zones',
      content: 'This SOP outlines the process for determining daily water allocation based on crop requirements...',
      author: 'Irrigation Manager - Alemayehu Bekele',
      lastModified: '2026-03-01T14:20:00',
      views: 328,
      featured: true,
      status: 'published',
      tags: ['irrigation', 'water-allocation', 'operations', 'SOP']
    },
    {
      id: '3',
      title: 'Emergency Response Plan - Dam Breach Scenario',
      category: 'emergency',
      description: 'Critical emergency procedures for responding to potential dam breach or failure',
      content: 'In the unlikely event of a dam breach, follow these critical steps immediately...',
      author: 'Emergency Coordinator - Dr. Rahel Tesfaye',
      lastModified: '2026-01-15T09:00:00',
      views: 892,
      featured: true,
      status: 'published',
      tags: ['emergency', 'dam-breach', 'safety', 'critical']
    },
    {
      id: '4',
      title: 'Turbine Maintenance Schedule and Procedures',
      category: 'maintenance',
      description: 'Preventive maintenance schedule and detailed procedures for hydroelectric turbines',
      content: 'Turbine maintenance is critical for reliable power generation. Follow this schedule...',
      author: 'Chief Mechanic - Dawit Mengiste',
      lastModified: '2026-02-20T11:45:00',
      views: 267,
      featured: false,
      status: 'published',
      tags: ['maintenance', 'turbine', 'power-generation', 'preventive']
    },
    {
      id: '5',
      title: 'Water Quality Monitoring and Testing Protocols',
      category: 'procedures',
      description: 'Standard protocols for collecting samples and testing water quality parameters',
      content: 'Water quality testing must be conducted daily according to these standardized protocols...',
      author: 'Environmental Officer - Sara Ahmed',
      lastModified: '2026-03-03T08:15:00',
      views: 189,
      featured: false,
      status: 'published',
      tags: ['water-quality', 'testing', 'environmental', 'protocols']
    },
    {
      id: '6',
      title: 'New Operator Training Program - Week 1',
      category: 'training',
      description: 'Training curriculum for new dam operators covering basic safety and operations',
      content: 'Welcome to the dam operations team. This first week covers fundamental safety protocols...',
      author: 'Training Coordinator - Yohannes Tadesse',
      lastModified: '2026-02-10T13:00:00',
      views: 145,
      featured: false,
      status: 'published',
      tags: ['training', 'onboarding', 'safety', 'operations']
    },
    {
      id: '7',
      title: 'Spillway Gate Operation Manual',
      category: 'operations',
      description: 'Complete operating manual for spillway gate control systems and emergency procedures',
      content: 'The spillway gates are the most critical flood control mechanism. Operating procedures are...',
      author: 'Operations Manager - Tekle Haile',
      lastModified: '2026-02-25T16:30:00',
      views: 412,
      featured: true,
      status: 'published',
      tags: ['spillway', 'operations', 'flood-control', 'manual']
    },
    {
      id: '8',
      title: 'Flood Season Preparedness Checklist',
      category: 'emergency',
      description: 'Pre-season checklist to ensure readiness for high-water periods and potential floods',
      content: 'Before the rainy season begins, complete all items on this critical preparedness checklist...',
      author: 'Safety Team Lead - Mulugeta Asfaw',
      lastModified: '2026-04-01T07:00:00',
      views: 523,
      featured: true,
      status: 'published',
      tags: ['flood', 'preparedness', 'seasonal', 'emergency']
    },
    {
      id: '9',
      title: 'SCADA System User Guide',
      category: 'procedures',
      description: 'User guide for the supervisory control and data acquisition (SCADA) monitoring system',
      content: 'The SCADA system provides real-time monitoring and control. This guide covers...',
      author: 'Systems Engineer - Biruk Desta',
      lastModified: '2026-02-18T10:00:00',
      views: 298,
      featured: false,
      status: 'published',
      tags: ['SCADA', 'monitoring', 'automation', 'technology']
    },
    {
      id: '10',
      title: 'Irrigation Pump Station Troubleshooting Guide',
      category: 'maintenance',
      description: 'Common issues with irrigation pumps and step-by-step troubleshooting procedures',
      content: 'When irrigation pumps fail, quick diagnosis is critical. Use this guide to identify issues...',
      author: 'Maintenance Technician - Habtamu Worku',
      lastModified: '2026-03-02T15:20:00',
      views: 234,
      featured: false,
      status: 'published',
      tags: ['pumps', 'irrigation', 'troubleshooting', 'maintenance']
    },
    {
      id: '11',
      title: 'Environmental Compliance Reporting Requirements',
      category: 'procedures',
      description: 'Guide to regulatory reporting requirements for environmental monitoring and compliance',
      content: 'Dam operations must comply with environmental regulations. This guide outlines...',
      author: 'Environmental Officer - Sara Ahmed',
      lastModified: '2026-01-20T09:30:00',
      views: 176,
      featured: false,
      status: 'published',
      tags: ['compliance', 'environmental', 'reporting', 'regulations']
    },
    {
      id: '12',
      title: 'Electrical Safety Procedures for High Voltage Systems',
      category: 'safety',
      description: 'Critical safety procedures when working with or near high voltage power generation equipment',
      content: 'Working with high voltage systems requires strict adherence to safety protocols...',
      author: 'Electrical Safety Officer - Mesfin Gebre',
      lastModified: '2026-02-15T11:00:00',
      views: 367,
      featured: false,
      status: 'published',
      tags: ['electrical-safety', 'high-voltage', 'power', 'safety']
    },
    {
      id: '13',
      title: 'Stakeholder Communication Guidelines',
      category: 'procedures',
      description: 'Best practices for communicating with downstream communities and stakeholders',
      content: 'Effective stakeholder communication is essential for project success. Follow these guidelines...',
      author: 'Community Liaison - Tigist Abebe',
      lastModified: '2026-02-28T14:00:00',
      views: 201,
      featured: false,
      status: 'published',
      tags: ['stakeholders', 'communication', 'community', 'engagement']
    },
    {
      id: '14',
      title: 'Advanced Turbine Diagnostics Training',
      category: 'training',
      description: 'Advanced training module for diagnosing complex turbine performance issues',
      content: 'This advanced course covers sophisticated diagnostic techniques for turbine problems...',
      author: 'Training Coordinator - Yohannes Tadesse',
      lastModified: '2026-03-04T10:00:00',
      views: 89,
      featured: false,
      status: 'review',
      tags: ['training', 'advanced', 'turbine', 'diagnostics']
    }
  ];

  // Filter articles
  const filteredArticles = wikiArticles.filter(article => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !article.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Wiki"
        icon={<BookOpen className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="wiki"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">

        {/* Search & Filter Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </h2>
            <div className="flex items-center gap-2 flex-1 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-600 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="operations">Operations</option>
                <option value="safety">Safety</option>
                <option value="maintenance">Maintenance</option>
                <option value="emergency">Emergency</option>
                <option value="procedures">Procedures</option>
                <option value="training">Training</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-3 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 hover:border-primary-500 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-slate-400">
                        {categoryLabels[article.category].toUpperCase()}
                      </span>
                      {article.featured && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          FEATURED
                        </span>
                      )}
                      {article.status === 'review' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                          IN REVIEW
                        </span>
                      )}
                      {article.status === 'draft' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-slate-400">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mb-2 line-clamp-1">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {article.author.split(' - ')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {formatDate(article.lastModified)}
                      </span>
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                        {article.tags.length > 4 && (
                          <span className="text-xs px-1.5 py-0.5 text-gray-600 dark:text-slate-400">
                            +{article.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredArticles.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No articles found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {searchQuery ? 'Try a different search term' : 'No articles match the selected filters'}
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
