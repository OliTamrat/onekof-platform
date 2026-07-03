'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  Package,
  Plus,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function TeamsFormsPage() {
  const { t } = useLanguage();
  const toast = useToast();

  const TAB_ITEMS = [
    { id: 'summary', label: t('tabs.summary'), icon: BarChart3, href: '/dashboard/teams/overview' },
    { id: 'list', label: t('tabs.list'), icon: null, href: '/dashboard/teams/list' },
    { id: 'board', label: t('tabs.board'), icon: null, href: '/dashboard/teams/board' },
    { id: 'code', label: t('tabs.code'), icon: Code, href: '/dashboard/teams/code' },
    { id: 'forms', label: t('tabs.forms'), icon: FileText, href: '/dashboard/teams/forms', active: true },
    { id: 'timeline', label: t('tabs.timeline'), icon: Clock, href: '/dashboard/teams/timeline' },
    { id: 'pages', label: t('tabs.pages'), icon: Book, href: '/dashboard/teams/pages' },
  ];

  const FORM_TEMPLATES: { id: string; nameKey: string; descKey: string; icon: LucideIcon; fields: { nameKey: string; type: string; placeholderKey?: string; options?: string[]; required: boolean }[] }[] = [
    {
      id: 'team-onboarding',
      nameKey: 'teamForms.teamOnboarding',
      descKey: 'teamForms.teamOnboardingDesc',
      icon: UserPlus,
      fields: [
        { nameKey: 'teamForms.teamMemberName', type: 'text', placeholderKey: 'teamForms.fullName', required: true },
        { nameKey: 'teamForms.email', type: 'email', placeholderKey: 'teamForms.emailPlaceholder', required: true },
        { nameKey: 'teamForms.role', type: 'select', options: ['Engineer', 'Designer', 'Manager', 'Other'], required: true },
        { nameKey: 'teamForms.startDate', type: 'date', required: true },
        { nameKey: 'teamForms.mentor', type: 'text', placeholderKey: 'teamForms.mentorPlaceholder', required: false },
        { nameKey: 'teamForms.onboardingNotes', type: 'textarea', placeholderKey: 'teamForms.onboardingNotesPlaceholder', required: false },
      ],
    },
    {
      id: 'team-performance-review',
      nameKey: 'teamForms.performanceReview',
      descKey: 'teamForms.performanceReviewDesc',
      icon: BarChart3,
      fields: [
        { nameKey: 'teamForms.teamName', type: 'text', placeholderKey: 'teamForms.teamBeingReviewed', required: true },
        { nameKey: 'teamForms.reviewPeriod', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
        { nameKey: 'teamForms.overallPerformance', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Improvement'], required: true },
        { nameKey: 'teamForms.keyAchievements', type: 'textarea', placeholderKey: 'teamForms.keyAchievementsPlaceholder', required: true },
        { nameKey: 'teamForms.areasForImprovement', type: 'textarea', placeholderKey: 'teamForms.areasForImprovementPlaceholder', required: true },
        { nameKey: 'teamForms.goalsForNextQuarter', type: 'textarea', placeholderKey: 'teamForms.goalsForNextQuarterPlaceholder', required: true },
      ],
    },
    {
      id: 'team-meeting',
      nameKey: 'teamForms.teamMeeting',
      descKey: 'teamForms.teamMeetingDesc',
      icon: Users,
      fields: [
        { nameKey: 'teamForms.meetingTitle', type: 'text', placeholderKey: 'teamForms.meetingTitlePlaceholder', required: true },
        { nameKey: 'teamForms.meetingType', type: 'select', options: ['Planning', 'Retrospective', 'Sync', 'All-hands'], required: true },
        { nameKey: 'teamForms.dateTime', type: 'datetime-local', required: true },
        { nameKey: 'teamForms.duration', type: 'select', options: ['30 min', '1 hour', '2 hours'], required: true },
        { nameKey: 'teamForms.agenda', type: 'textarea', placeholderKey: 'teamForms.agendaPlaceholder', required: true },
        { nameKey: 'teamForms.attendees', type: 'textarea', placeholderKey: 'teamForms.attendeesPlaceholder', required: false },
      ],
    },
    {
      id: 'team-offboarding',
      nameKey: 'teamForms.teamOffboarding',
      descKey: 'teamForms.teamOffboardingDesc',
      icon: UserPlus,
      fields: [
        { nameKey: 'teamForms.teamMemberName', type: 'text', placeholderKey: 'teamForms.fullName', required: true },
        { nameKey: 'teamForms.lastDay', type: 'date', required: true },
        { nameKey: 'teamForms.reasonForLeaving', type: 'select', options: ['Resignation', 'Transfer', 'Retirement', 'Other'], required: true },
        { nameKey: 'teamForms.exitInterviewCompleted', type: 'select', options: ['Yes', 'No', 'Scheduled'], required: true },
        { nameKey: 'teamForms.knowledgeTransferPlan', type: 'textarea', placeholderKey: 'teamForms.knowledgeTransferPlanPlaceholder', required: true },
        { nameKey: 'teamForms.accessRevocationChecklist', type: 'textarea', placeholderKey: 'teamForms.accessRevocationChecklistPlaceholder', required: true },
      ],
    },
    {
      id: 'team-resource-request',
      nameKey: 'teamForms.resourceRequest',
      descKey: 'teamForms.resourceRequestDesc',
      icon: Package,
      fields: [
        { nameKey: 'teamForms.resourceType', type: 'select', options: ['Headcount', 'Budget', 'Tools', 'Training'], required: true },
        { nameKey: 'teamForms.requestPriority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
        { nameKey: 'teamForms.requestedBy', type: 'text', placeholderKey: 'teamForms.yourName', required: true },
        { nameKey: 'teamForms.justification', type: 'textarea', placeholderKey: 'teamForms.justificationPlaceholder', required: true },
        { nameKey: 'teamForms.expectedImpact', type: 'textarea', placeholderKey: 'teamForms.expectedImpactPlaceholder', required: true },
        { nameKey: 'teamForms.budgetEstimate', type: 'text', placeholderKey: 'teamForms.budgetEstimatePlaceholder', required: false },
      ],
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<typeof FORM_TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { template: selectedTemplate?.id, data: formData });
    toast.success(t('teamForms.formSubmitted'), t('teamForms.formSubmittedSuccess', { name: t(selectedTemplate?.nameKey || '') }));
    setSelectedTemplate(null);
    setFormData({});
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Title */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('teamForms.title')}</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('teamForms.heading')}</h2>
              <p className="text-gray-600 dark:text-white/70">
                {t('teamForms.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FORM_TEMPLATES.map((template) => (
                <Button variant="outline"
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="text-left p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                    <template.icon className="h-5 w-5 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(template.nameKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                    {t(template.descKey)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary-500">
                    <Plus className="h-4 w-4" />
                    {t('teamForms.create', { name: t(template.nameKey) })}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-[#12161B] rounded-lg shadow-xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.08]">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t(selectedTemplate.nameKey)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                    {t(selectedTemplate.descKey)}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.nameKey}>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t(field.nameKey)}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                        value={formData[field.nameKey] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.nameKey]: e.target.value })}
                        rows={4}
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={formData[field.nameKey] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.nameKey]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="">{t('teamForms.select', { name: t(field.nameKey) })}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                        value={formData[field.nameKey] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.nameKey]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    )}
                  </div>
                ))}
              </form>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/[0.08]">
                <Button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#181D23] rounded-md"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  {t('teamForms.submit', { name: t(selectedTemplate.nameKey) })}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
