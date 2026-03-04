'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { BarChart3, Code, FileText, Clock, Book, Users, X, Plus } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms', active: true },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages' },
] as const;

const FORM_TEMPLATES = [
  {
    id: 'team-onboarding',
    name: 'Team Onboarding',
    description: 'Onboard new team members',
    icon: '👋',
    fields: [
      { name: 'Team Member Name', type: 'text', placeholder: 'Full name', required: true },
      { name: 'Email', type: 'email', placeholder: 'email@company.com', required: true },
      { name: 'Role', type: 'select', options: ['Engineer', 'Designer', 'Manager', 'Other'], required: true },
      { name: 'Start Date', type: 'date', required: true },
      { name: 'Mentor', type: 'text', placeholder: 'Assigned mentor name', required: false },
      { name: 'Onboarding Notes', type: 'textarea', placeholder: 'Special requirements, access needs...', required: false },
    ],
  },
  {
    id: 'team-performance-review',
    name: 'Performance Review',
    description: 'Quarterly team performance review',
    icon: '📊',
    fields: [
      { name: 'Team Name', type: 'text', placeholder: 'Team being reviewed', required: true },
      { name: 'Review Period', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
      { name: 'Overall Performance', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Improvement'], required: true },
      { name: 'Key Achievements', type: 'textarea', placeholder: 'Major accomplishments this quarter...', required: true },
      { name: 'Areas for Improvement', type: 'textarea', placeholder: 'Opportunities for growth...', required: true },
      { name: 'Goals for Next Quarter', type: 'textarea', placeholder: 'Objectives and key results...', required: true },
    ],
  },
  {
    id: 'team-meeting',
    name: 'Team Meeting',
    description: 'Schedule and document team meetings',
    icon: '🤝',
    fields: [
      { name: 'Meeting Title', type: 'text', placeholder: 'e.g., Sprint Planning', required: true },
      { name: 'Meeting Type', type: 'select', options: ['Planning', 'Retrospective', 'Sync', 'All-hands'], required: true },
      { name: 'Date & Time', type: 'datetime-local', required: true },
      { name: 'Duration', type: 'select', options: ['30 min', '1 hour', '2 hours'], required: true },
      { name: 'Agenda', type: 'textarea', placeholder: 'Meeting topics and objectives...', required: true },
      { name: 'Attendees', type: 'textarea', placeholder: 'List team members (one per line)', required: false },
    ],
  },
  {
    id: 'team-offboarding',
    name: 'Team Offboarding',
    description: 'Offboard departing team members',
    icon: '👋',
    fields: [
      { name: 'Team Member Name', type: 'text', placeholder: 'Full name', required: true },
      { name: 'Last Day', type: 'date', required: true },
      { name: 'Reason for Leaving', type: 'select', options: ['Resignation', 'Transfer', 'Retirement', 'Other'], required: true },
      { name: 'Exit Interview Completed', type: 'select', options: ['Yes', 'No', 'Scheduled'], required: true },
      { name: 'Knowledge Transfer Plan', type: 'textarea', placeholder: 'Documentation and handoff details...', required: true },
      { name: 'Access Revocation Checklist', type: 'textarea', placeholder: 'Systems and accounts to be disabled...', required: true },
    ],
  },
  {
    id: 'team-resource-request',
    name: 'Resource Request',
    description: 'Request additional team resources',
    icon: '📦',
    fields: [
      { name: 'Resource Type', type: 'select', options: ['Headcount', 'Budget', 'Tools', 'Training'], required: true },
      { name: 'Request Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
      { name: 'Requested By', type: 'text', placeholder: 'Your name', required: true },
      { name: 'Justification', type: 'textarea', placeholder: 'Why is this resource needed?', required: true },
      { name: 'Expected Impact', type: 'textarea', placeholder: 'How will this improve team performance?', required: true },
      { name: 'Budget Estimate', type: 'text', placeholder: 'Approximate cost if applicable', required: false },
    ],
  },
];

export default function TeamsFormsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof FORM_TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { template: selectedTemplate?.id, data: formData });
    alert(`${selectedTemplate?.name} submitted successfully!`);
    setSelectedTemplate(null);
    setFormData({});
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Title */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Forms</h1>
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
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Team Form Templates</h2>
              <p className="text-gray-600 dark:text-[#9FADBC]">
                Choose a template to create team-related requests, reviews, and documentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FORM_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="text-left p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] hover:border-[#0065FF] hover:shadow-md transition-all"
                >
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC] mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#0065FF]">
                    <Plus className="h-4 w-4" />
                    Create {template.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-[#22272B] rounded-lg shadow-xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C333A]">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        rows={4}
                        className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                      >
                        <option value="">Select {field.name}</option>
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
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                      />
                    )}
                  </div>
                ))}
              </form>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2C333A]">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0065FF] hover:bg-[#0052CC] rounded-md"
                >
                  Submit {selectedTemplate.name}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
