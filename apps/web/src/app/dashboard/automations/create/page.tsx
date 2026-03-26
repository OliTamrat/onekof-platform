'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ChevronRight,
  Plus,
  X,
  ArrowLeft,
  Save,
  Play,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  UserCheck,
  RotateCcw,
  MessageSquare,
  Bell,
  Pencil,
  Target,
  Archive,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

// Entity Types
const ENTITY_TYPES = [
  { value: 'PROJECT', label: 'Project', description: 'Trigger on project events' },
  { value: 'TASK', label: 'Task', description: 'Trigger on task events' },
  { value: 'ISSUE', label: 'Issue', description: 'Trigger on issue events' },
  { value: 'GOAL', label: 'Goal', description: 'Trigger on goal events' },
  { value: 'KEY_RESULT', label: 'Key Result', description: 'Trigger on key result events' },
  { value: 'TEAM', label: 'Team', description: 'Trigger on team events' },
  { value: 'TEAM_MEMBER', label: 'Team Member', description: 'Trigger on team member events' },
  { value: 'MILESTONE', label: 'Milestone', description: 'Trigger on milestone events' },
];

// Trigger Events by Entity Type
const TRIGGER_EVENTS: Record<string, Array<{ value: string; label: string }>> = {
  PROJECT: [
    { value: 'CREATED', label: 'Project created' },
    { value: 'UPDATED', label: 'Project updated' },
    { value: 'STATUS_CHANGED', label: 'Status changed' },
    { value: 'ARCHIVED', label: 'Project archived' },
    { value: 'BUDGET_THRESHOLD_REACHED', label: 'Budget threshold reached' },
  ],
  TASK: [
    { value: 'CREATED', label: 'Task created' },
    { value: 'UPDATED', label: 'Task updated' },
    { value: 'STATUS_CHANGED', label: 'Status changed' },
    { value: 'ASSIGNED', label: 'Task assigned' },
    { value: 'PRIORITY_CHANGED', label: 'Priority changed' },
    { value: 'DUE_DATE_APPROACHING', label: 'Due date approaching' },
    { value: 'DUE_DATE_PASSED', label: 'Due date passed' },
    { value: 'COMPLETED', label: 'Task completed' },
    { value: 'COMMENTED', label: 'Comment added' },
  ],
  GOAL: [
    { value: 'CREATED', label: 'Goal created' },
    { value: 'UPDATED', label: 'Goal updated' },
    { value: 'STATUS_CHANGED', label: 'Status changed' },
    { value: 'PROGRESS_THRESHOLD_REACHED', label: 'Progress threshold reached' },
    { value: 'COMPLETED', label: 'Goal completed' },
  ],
  TEAM_MEMBER: [
    { value: 'MEMBER_ADDED', label: 'Member added to team' },
    { value: 'MEMBER_REMOVED', label: 'Member removed from team' },
  ],
};

// Operators
const OPERATORS = [
  { value: 'equals', label: 'equals', description: 'Field equals value' },
  { value: 'not_equals', label: 'does not equal', description: 'Field does not equal value' },
  { value: 'contains', label: 'contains', description: 'Field contains text' },
  { value: 'greater_than', label: 'is greater than', description: 'Number comparison' },
  { value: 'less_than', label: 'is less than', description: 'Number comparison' },
  { value: 'is_empty', label: 'is empty', description: 'Field has no value' },
  { value: 'is_not_empty', label: 'is not empty', description: 'Field has a value' },
];

// Action Types
const ACTION_TYPES: { value: string; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'assign_to_user', label: 'Assign to user', description: 'Assign task/project to a user', icon: UserCheck },
  { value: 'change_status', label: 'Change status', description: 'Update the status field', icon: RotateCcw },
  { value: 'add_comment', label: 'Add comment', description: 'Post an automated comment', icon: MessageSquare },
  { value: 'send_notification', label: 'Send notification', description: 'Notify users or teams', icon: Bell },
  { value: 'update_field', label: 'Update field', description: 'Change a specific field value', icon: Pencil },
  { value: 'create_task', label: 'Create task', description: 'Create a new task', icon: Plus },
  { value: 'update_goal_progress', label: 'Update goal progress', description: 'Recalculate goal progress', icon: Target },
  { value: 'archive_project', label: 'Archive project', description: 'Move project to archive', icon: Archive },
];

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string | null;
}

interface Action {
  id: string;
  type: string;
  params: Record<string, any>;
}

export default function CreateAutomationPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Zap',
    color: '#8B5CF6',
    scope: 'ORGANIZATION',
    entityType: '',
    triggerEvent: '',
    runMode: 'AUTOMATIC',
  });

  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // Create automation mutation
  const createAutomationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create automation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      router.push('/dashboard/automations');
    },
  });

  const handleSubmit = () => {
    if (!currentOrganization?.id) return;

    createAutomationMutation.mutate({
      organizationId: currentOrganization.id,
      ...formData,
      conditions: conditions.map(({ id, ...rest }) => rest),
      actions: actions.map(({ id, ...rest }) => rest),
      isEnabled: true,
    });
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(36).substr(2, 9),
        field: '',
        operator: 'equals',
        value: '',
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: '',
        params: {},
      },
    ]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.entityType && formData.triggerEvent;
      case 2:
        return true; // Conditions are optional
      case 3:
        return actions.length > 0 && actions.every((a) => a.type);
      default:
        return true;
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Automation
                </h1>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Build a custom automation rule step by step
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-300 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createAutomationMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {createAutomationMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Automation
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center gap-2">
            {[
              { num: 1, label: 'Configure & Trigger' },
              { num: 2, label: 'Add Conditions' },
              { num: 3, label: 'Define Actions' },
              { num: 4, label: 'Review' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                    step === s.num
                      ? 'bg-primary-500 text-white'
                      : step > s.num
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-200 dark:bg-[#282E33] text-gray-600 dark:text-slate-400'
                  )}
                  onClick={() => setStep(s.num)}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                      step === s.num
                        ? 'bg-white/20'
                        : step > s.num
                        ? 'bg-green-500/30'
                        : 'bg-gray-300 dark:bg-slate-700'
                    )}
                  >
                    {step > s.num ? <CheckCircle2 className="h-3 w-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {index < 3 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            {/* Step 1: Configure & Trigger */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Automation Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Auto-assign new tasks"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this automation does..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <IconPicker
                          value={formData.icon}
                          onChange={(icon) => setFormData({ ...formData, icon })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            placeholder="#8B5CF6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trigger Configuration */}
                <div className="rounded-lg border-2 border-blue-500 dark:border-blue-500 bg-blue-500/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                      1
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      When: Set the Trigger
                    </h2>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    Choose what event will trigger this automation to run
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="entityType">Entity Type *</Label>
                      <select
                        id="entityType"
                        value={formData.entityType}
                        onChange={(e) =>
                          setFormData({ ...formData, entityType: e.target.value, triggerEvent: '' })
                        }
                        className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                      >
                        <option value="">Select entity type...</option>
                        {ENTITY_TYPES.map((entity) => (
                          <option key={entity.value} value={entity.value}>
                            {entity.label} - {entity.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.entityType && (
                      <div>
                        <Label htmlFor="triggerEvent">Trigger Event *</Label>
                        <select
                          id="triggerEvent"
                          value={formData.triggerEvent}
                          onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                        >
                          <option value="">Select trigger event...</option>
                          {(TRIGGER_EVENTS[formData.entityType] || []).map((event) => (
                            <option key={event.value} value={event.value}>
                              {event.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {formData.entityType && formData.triggerEvent && (
                    <div className="mt-4 rounded-md bg-blue-500/10 border border-blue-500/30 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          This automation will trigger when a{' '}
                          <strong>
                            {ENTITY_TYPES.find((e) => e.value === formData.entityType)?.label}
                          </strong>{' '}
                          is{' '}
                          <strong>
                            {
                              TRIGGER_EVENTS[formData.entityType]?.find(
                                (e) => e.value === formData.triggerEvent
                              )?.label
                            }
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceed()}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Next: Add Conditions
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Conditions */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-amber-500 dark:border-amber-500 bg-amber-500/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold">
                      2
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      If: Add Conditions (Optional)
                    </h2>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    Conditions filter when the automation should run. Leave empty to run on every trigger.
                  </p>

                  {conditions.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        No conditions added
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                        This automation will run every time the trigger event occurs
                      </p>
                      <Button onClick={addCondition} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Condition
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conditions.map((condition, index) => (
                        <div
                          key={condition.id}
                          className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                              {index + 1}
                            </span>

                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Field</Label>
                                <Input
                                  placeholder="e.g., status"
                                  value={condition.field}
                                  onChange={(e) =>
                                    updateCondition(condition.id, { field: e.target.value })
                                  }
                                  className="mt-1 h-9"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Operator</Label>
                                <select
                                  value={condition.operator}
                                  onChange={(e) =>
                                    updateCondition(condition.id, { operator: e.target.value })
                                  }
                                  className="flex h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                >
                                  {OPERATORS.map((op) => (
                                    <option key={op.value} value={op.value}>
                                      {op.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <Label className="text-xs">Value</Label>
                                <Input
                                  placeholder="e.g., COMPLETED"
                                  value={condition.value || ''}
                                  onChange={(e) =>
                                    updateCondition(condition.id, { value: e.target.value })
                                  }
                                  disabled={
                                    condition.operator === 'is_empty' ||
                                    condition.operator === 'is_not_empty'
                                  }
                                  className="mt-1 h-9"
                                />
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCondition(condition.id)}
                              className="h-8 w-8 shrink-0 hover:bg-red-500/10 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button onClick={addCondition} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Condition
                      </Button>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-primary-500 hover:bg-primary-600">
                    Next: Define Actions
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Actions */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-green-500 dark:border-green-500 bg-green-500/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold">
                      3
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Then: Define Actions *
                    </h2>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    Actions are what the automation will do when triggered and conditions are met
                  </p>

                  {actions.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 text-center">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        No actions added
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                        Add at least one action for this automation to perform
                      </p>
                      <Button onClick={addAction}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Action
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actions.map((action, index) => (
                        <div
                          key={action.id}
                          className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold shrink-0">
                              {index + 1}
                            </span>

                            <div className="flex-1 space-y-3">
                              <div>
                                <Label className="text-xs">Action Type *</Label>
                                <select
                                  value={action.type}
                                  onChange={(e) =>
                                    updateAction(action.id, { type: e.target.value, params: {} })
                                  }
                                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                >
                                  <option value="">Select action...</option>
                                  {ACTION_TYPES.map((actionType) => (
                                    <option key={actionType.value} value={actionType.value}>
                                      {actionType.label} - {actionType.description}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Action-specific parameters */}
                              {action.type === 'add_comment' && (
                                <div>
                                  <Label className="text-xs">Comment Text</Label>
                                  <Textarea
                                    placeholder="Enter comment text..."
                                    value={action.params.comment || ''}
                                    onChange={(e) =>
                                      updateAction(action.id, {
                                        params: { ...action.params, comment: e.target.value },
                                      })
                                    }
                                    rows={2}
                                    className="mt-1"
                                  />
                                </div>
                              )}

                              {action.type === 'change_status' && (
                                <div>
                                  <Label className="text-xs">New Status</Label>
                                  <Input
                                    placeholder="e.g., IN_PROGRESS"
                                    value={action.params.status || ''}
                                    onChange={(e) =>
                                      updateAction(action.id, {
                                        params: { ...action.params, status: e.target.value },
                                      })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              )}

                              {action.type === 'send_notification' && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-xs">Message</Label>
                                    <Textarea
                                      placeholder="Notification message..."
                                      value={action.params.message || ''}
                                      onChange={(e) =>
                                        updateAction(action.id, {
                                          params: { ...action.params, message: e.target.value },
                                        })
                                      }
                                      rows={2}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Recipients (comma-separated)</Label>
                                    <Input
                                      placeholder="e.g., assignee, project_lead"
                                      value={action.params.recipients?.join(', ') || ''}
                                      onChange={(e) =>
                                        updateAction(action.id, {
                                          params: {
                                            ...action.params,
                                            recipients: e.target.value.split(',').map((r) => r.trim()),
                                          },
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAction(action.id)}
                              className="h-8 w-8 shrink-0 hover:bg-red-500/10 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button onClick={addAction} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Action
                      </Button>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!canProceed()}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Next: Review
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Review Your Automation
                  </h2>

                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
                        style={{ backgroundColor: formData.color }}
                      >
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formData.name || 'Untitled Automation'}
                        </h3>
                        {formData.description && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            {formData.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trigger */}
                    <div className="rounded-lg border-2 border-blue-500 dark:border-blue-500 bg-blue-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                          1
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          When: Trigger
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                        <strong>
                          {ENTITY_TYPES.find((e) => e.value === formData.entityType)?.label}
                        </strong>
                        {' → '}
                        <strong>
                          {
                            TRIGGER_EVENTS[formData.entityType]?.find(
                              (e) => e.value === formData.triggerEvent
                            )?.label
                          }
                        </strong>
                      </p>
                    </div>

                    {/* Conditions */}
                    <div className="rounded-lg border-2 border-amber-500 dark:border-amber-500 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                          2
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          If: Conditions
                        </h4>
                      </div>
                      {conditions.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-slate-400 ml-8 italic">
                          No conditions - runs on every trigger
                        </p>
                      ) : (
                        <div className="ml-8 space-y-1">
                          {conditions.map((condition, index) => (
                            <p key={condition.id} className="text-sm text-gray-700 dark:text-gray-300">
                              {index > 0 && <span className="text-gray-500">AND </span>}
                              <strong>{condition.field}</strong>{' '}
                              {OPERATORS.find((o) => o.value === condition.operator)?.label}{' '}
                              {condition.value && <strong>"{condition.value}"</strong>}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="rounded-lg border-2 border-green-500 dark:border-green-500 bg-green-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                          3
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Then: Actions
                        </h4>
                      </div>
                      <div className="ml-8 space-y-1">
                        {actions.map((action, index) => (
                          <p key={action.id} className="text-sm text-gray-700 dark:text-gray-300">
                            {index + 1}.{' '}
                            <strong>
                              {ACTION_TYPES.find((a) => a.value === action.type)?.label}
                            </strong>
                            {Object.keys(action.params).length > 0 && (
                              <span className="text-gray-600 dark:text-slate-400 ml-1">
                                ({Object.entries(action.params).map(([key, val]) =>
                                  Array.isArray(val) ? `${key}: ${val.join(', ')}` : `${key}: ${val}`
                                ).join(', ')})
                              </span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createAutomationMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    {createAutomationMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Automation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
