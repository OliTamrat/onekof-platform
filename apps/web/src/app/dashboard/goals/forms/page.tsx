'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  Plus,
  Target,
  X
} from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms', active: true },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
];

const FORM_TEMPLATES = [
  {
    id: 'okr-objective',
    name: 'OKR - Objective',
    description: 'Create a new objective with key results',
    icon: '🎯',
    fields: [
      { name: 'Objective Title', type: 'text', placeholder: 'What do you want to achieve?', required: true },
      { name: 'Objective Description', type: 'textarea', placeholder: 'Describe the objective in detail...', required: true },
      { name: 'Owner', type: 'text', placeholder: 'Who is responsible?', required: true },
      { name: 'Team', type: 'select', options: ['Engineering', 'Design', 'Marketing', 'Sales', 'Customer Success'], required: true },
      { name: 'Cycle', type: 'select', options: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'], required: true },
      { name: 'Due Date', type: 'date', required: true },
      { name: 'Key Result 1', type: 'text', placeholder: 'Measurable key result', required: true },
      { name: 'Key Result 2', type: 'text', placeholder: 'Measurable key result', required: false },
      { name: 'Key Result 3', type: 'text', placeholder: 'Measurable key result', required: false },
    ],
  },
  {
    id: 'key-result',
    name: 'Key Result',
    description: 'Add a key result to an existing objective',
    icon: '📊',
    fields: [
      { name: 'Linked Objective', type: 'text', placeholder: 'Which objective does this support?', required: true },
      { name: 'Key Result', type: 'text', placeholder: 'Measurable outcome', required: true },
      { name: 'Target Metric', type: 'text', placeholder: 'e.g., 100 users, $50k revenue', required: true },
      { name: 'Current Value', type: 'text', placeholder: 'Starting point', required: true },
      { name: 'Measurement Frequency', type: 'select', options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'], required: true },
      { name: 'Owner', type: 'text', placeholder: 'Who is accountable?', required: true },
    ],
  },
  {
    id: 'goal-update',
    name: 'Goal Progress Update',
    description: 'Report progress on an existing goal',
    icon: '📈',
    fields: [
      { name: 'Goal', type: 'text', placeholder: 'Which goal are you updating?', required: true },
      { name: 'Progress Percentage', type: 'number', placeholder: '0-100', required: true },
      { name: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Behind'], required: true },
      { name: 'Achievements This Period', type: 'textarea', placeholder: 'What was accomplished?', required: true },
      { name: 'Blockers', type: 'textarea', placeholder: 'What\'s preventing progress?', required: false },
      { name: 'Next Steps', type: 'textarea', placeholder: 'What\'s planned next?', required: true },
    ],
  },
  {
    id: 'goal-retrospective',
    name: 'Goal Retrospective',
    description: 'Review completed goal outcomes',
    icon: '🔄',
    fields: [
      { name: 'Goal Title', type: 'text', placeholder: 'Completed goal', required: true },
      { name: 'Final Achievement', type: 'select', options: ['Exceeded', 'Met', 'Partially Met', 'Not Met'], required: true },
      { name: 'What Went Well', type: 'textarea', placeholder: 'Successes and wins...', required: true },
      { name: 'What Could Be Improved', type: 'textarea', placeholder: 'Challenges and learnings...', required: true },
      { name: 'Key Learnings', type: 'textarea', placeholder: 'Insights for future goals...', required: true },
      { name: 'Recommendations', type: 'textarea', placeholder: 'Suggestions for next cycle...', required: false },
    ],
  },
  {
    id: 'initiative-proposal',
    name: 'Initiative Proposal',
    description: 'Propose a new strategic initiative',
    icon: '💡',
    fields: [
      { name: 'Initiative Name', type: 'text', placeholder: 'What is the initiative?', required: true },
      { name: 'Business Case', type: 'textarea', placeholder: 'Why should we do this?', required: true },
      { name: 'Expected Impact', type: 'textarea', placeholder: 'What outcomes do we expect?', required: true },
      { name: 'Resources Needed', type: 'textarea', placeholder: 'What resources are required?', required: true },
      { name: 'Timeline', type: 'text', placeholder: 'Duration estimate', required: true },
      { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
    ],
  },
];

export default function GoalsFormsPage() {
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goal Forms</h1>
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Goal & OKR Form Templates</h2>
              <p className="text-gray-600 dark:text-[#9FADBC]">
                Create objectives, key results, and track goal progress with these templates
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
