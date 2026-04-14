'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
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
  X,
  TrendingUp,
  RotateCcw,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms', active: true },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
];

const FORM_TEMPLATES: { id: string; name: string; description: string; icon: LucideIcon; fields: { name: string; type: string; placeholder?: string; required: boolean; options?: string[] }[] }[] = [
  {
    id: 'okr-objective',
    name: 'OKR - Objective',
    description: 'Create a new objective with key results',
    icon: Target,
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
    icon: BarChart3,
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
    icon: TrendingUp,
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
    icon: RotateCcw,
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
    icon: Lightbulb,
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
  const { t } = useLanguage();
  const toast = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<typeof FORM_TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { template: selectedTemplate?.id, data: formData });
    toast.success('Form submitted', `${selectedTemplate?.name} submitted successfully`);
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
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
              <p className="text-gray-600 dark:text-white/50">
                Create objectives, key results, and track goal progress with these templates
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
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white/50 mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary-500">
                    <Plus className="h-4 w-4" />
                    Create {template.name}
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
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-white/50 mt-1">
                    {selectedTemplate.description}
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
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  Submit {selectedTemplate.name}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
