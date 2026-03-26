'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Bug,
  CheckSquare,
  Clock,
  Code,
  FileText,
  Lightbulb,
  Plus,
  Target,
  X,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms', active: true },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages' },
];

const FORM_TEMPLATES = [
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Report bugs and technical issues with detailed reproduction steps',
    icon: Bug,
    color: 'red',
    fields: [
      { name: 'Summary', type: 'text', placeholder: 'Brief description of the bug', required: true },
      { name: 'Description', type: 'textarea', placeholder: 'Detailed description of the issue', required: true },
      { name: 'Steps to Reproduce', type: 'textarea', placeholder: '1. Go to...\n2. Click on...\n3. See error', required: true },
      { name: 'Expected Behavior', type: 'textarea', placeholder: 'What should happen', required: true },
      { name: 'Actual Behavior', type: 'textarea', placeholder: 'What actually happens', required: true },
      { name: 'Environment', type: 'text', placeholder: 'OS, Browser, Version', required: false },
      { name: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
      { name: 'Screenshots', type: 'file', required: false },
    ],
  },
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Propose new features and enhancements',
    icon: Lightbulb,
    color: 'purple',
    fields: [
      { name: 'Feature Title', type: 'text', placeholder: 'Clear, concise feature name', required: true },
      { name: 'Problem Statement', type: 'textarea', placeholder: 'What problem does this solve?', required: true },
      { name: 'Proposed Solution', type: 'textarea', placeholder: 'How should this work?', required: true },
      { name: 'User Stories', type: 'textarea', placeholder: 'As a [user], I want to [action] so that [benefit]', required: false },
      { name: 'Alternatives Considered', type: 'textarea', placeholder: 'Other approaches considered', required: false },
      { name: 'Priority', type: 'select', options: ['Must Have', 'Should Have', 'Nice to Have'], required: true },
      { name: 'Target Users', type: 'text', placeholder: 'Who will use this feature?', required: false },
    ],
  },
  {
    id: 'task',
    name: 'Task',
    description: 'Create actionable tasks and to-dos',
    icon: CheckSquare,
    color: 'blue',
    fields: [
      { name: 'Task Name', type: 'text', placeholder: 'What needs to be done?', required: true },
      { name: 'Description', type: 'textarea', placeholder: 'Additional context and details', required: false },
      { name: 'Acceptance Criteria', type: 'textarea', placeholder: 'How do we know when this is done?', required: true },
      { name: 'Assignee', type: 'user-select', required: false },
      { name: 'Due Date', type: 'date', required: false },
      { name: 'Priority', type: 'select', options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'], required: true },
      { name: 'Labels', type: 'tags', placeholder: 'Add labels', required: false },
    ],
  },
  {
    id: 'epic',
    name: 'Epic',
    description: 'Large body of work that can be broken down into stories',
    icon: Target,
    color: 'green',
    fields: [
      { name: 'Epic Name', type: 'text', placeholder: 'High-level initiative name', required: true },
      { name: 'Epic Summary', type: 'textarea', placeholder: 'Overview of the initiative', required: true },
      { name: 'Business Value', type: 'textarea', placeholder: 'Why is this important?', required: true },
      { name: 'Success Metrics', type: 'textarea', placeholder: 'How will we measure success?', required: true },
      { name: 'Timeline', type: 'date-range', required: false },
      { name: 'Owner', type: 'user-select', required: true },
      { name: 'Strategic Goal', type: 'text', placeholder: 'Which company goal does this support?', required: false },
    ],
  },
  {
    id: 'improvement',
    name: 'Improvement',
    description: 'Enhancements to existing features or processes',
    icon: Zap,
    color: 'yellow',
    fields: [
      { name: 'Title', type: 'text', placeholder: 'What are we improving?', required: true },
      { name: 'Current State', type: 'textarea', placeholder: 'How does it work now?', required: true },
      { name: 'Proposed Improvement', type: 'textarea', placeholder: 'What should change?', required: true },
      { name: 'Expected Impact', type: 'textarea', placeholder: 'Benefits and outcomes', required: true },
      { name: 'Effort Estimate', type: 'select', options: ['Small', 'Medium', 'Large', 'X-Large'], required: true },
      { name: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
    ],
  },
];

export default function ProjectsFormsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<typeof FORM_TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { template: selectedTemplate?.id, data: formData });
    // Here you would typically send this to your API
    toast.success('Form submitted', `${selectedTemplate?.name} submitted successfully`);
    setSelectedTemplate(null);
    setFormData({});
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-900' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900' },
      green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-900' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-900' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Project Forms
              </h1>
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
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Choose a template
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                Select a template to quickly create standardized project items
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FORM_TEMPLATES.map((template) => {
                const Icon = template.icon;
                const colors = getColorClasses(template.color);
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-6 bg-white dark:bg-[#22272B] rounded-lg border-2 ${colors.border} hover:border-primary-500 cursor-pointer transition-all group`}
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                      {template.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-[#6B7684]">
                      {template.fields.length} fields
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#22272B] rounded-lg shadow-xl flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getColorClasses(selectedTemplate.color).bg} rounded-lg flex items-center justify-center`}>
                    <selectedTemplate.icon className={`h-5 w-5 ${getColorClasses(selectedTemplate.color).text}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                  {selectedTemplate.fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6B7684] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={4}
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6B7684] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          required={field.required}
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        >
                          <option value="">Select...</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          required={field.required}
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        />
                      )}

                      {field.type === 'file' && (
                        <input
                          type="file"
                          required={field.required}
                          className="w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
                <Button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  Create {selectedTemplate.name}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
