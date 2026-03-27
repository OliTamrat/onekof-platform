'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, ArrowDown, Zap, Filter, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface WorkflowTrigger {
  id: string;
  type: string;
  label: string;
  config: Record<string, string>;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface WorkflowAction {
  id: string;
  type: string;
  label: string;
  config: Record<string, string>;
}

interface WorkflowRule {
  trigger: WorkflowTrigger | null;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

const TRIGGER_OPTIONS = [
  { type: 'CREATED', label: 'When item is created' },
  { type: 'STATUS_CHANGED', label: 'When status changes' },
  { type: 'ASSIGNED', label: 'When assigned' },
  { type: 'DUE_DATE_APPROACHING', label: 'When due date approaches' },
  { type: 'DUE_DATE_PASSED', label: 'When due date passes' },
  { type: 'BUDGET_THRESHOLD_REACHED', label: 'When budget threshold reached' },
  { type: 'COMMENTED', label: 'When commented on' },
  { type: 'COMPLETED', label: 'When completed' },
  { type: 'FIELD_CHANGED', label: 'When field changes' },
];

const ACTION_OPTIONS = [
  { type: 'CHANGE_STATUS', label: 'Change status' },
  { type: 'ASSIGN_TO', label: 'Assign to member' },
  { type: 'SEND_NOTIFICATION', label: 'Send notification' },
  { type: 'SEND_EMAIL', label: 'Send email' },
  { type: 'ADD_LABEL', label: 'Add label' },
  { type: 'SET_PRIORITY', label: 'Set priority' },
  { type: 'CREATE_SUBTASK', label: 'Create subtask' },
  { type: 'ADD_COMMENT', label: 'Add comment' },
];

const OPERATORS = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];

interface WorkflowDesignerProps {
  initialRule?: WorkflowRule;
  onSave?: (rule: WorkflowRule) => void;
  className?: string;
}

export function WorkflowDesigner({ initialRule, onSave, className }: WorkflowDesignerProps) {
  const { t } = useLanguage();
  const [rule, setRule] = React.useState<WorkflowRule>(
    initialRule || { trigger: null, conditions: [], actions: [] }
  );

  const addCondition = () => {
    setRule((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { id: crypto.randomUUID(), field: '', operator: 'equals', value: '' }],
    }));
  };

  const removeCondition = (id: string) => {
    setRule((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const addAction = (type: string, label: string) => {
    setRule((prev) => ({
      ...prev,
      actions: [...prev.actions, { id: crypto.randomUUID(), type, label, config: {} }],
    }));
  };

  const removeAction = (id: string) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== id),
    }));
  };

  const setTrigger = (type: string, label: string) => {
    setRule((prev) => ({
      ...prev,
      trigger: { id: crypto.randomUUID(), type, label, config: {} },
    }));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Trigger */}
      <div className="rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900/20">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400">
          <Zap className="h-4 w-4" />
          {t('automation.trigger')}
        </div>
        {rule.trigger ? (
          <div className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{rule.trigger.label}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRule((prev) => ({ ...prev, trigger: null }))}
              className="h-auto w-auto p-1 text-gray-400 hover:text-red-500"
              aria-label="Remove trigger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <select
            onChange={(e) => {
              const opt = TRIGGER_OPTIONS.find((o) => o.type === e.target.value);
              if (opt) setTrigger(opt.type, opt.label);
            }}
            value=""
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            aria-label="Select trigger"
          >
            <option value="" disabled>{t('automation.selectTrigger')}</option>
            {TRIGGER_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Arrow */}
      {rule.trigger && (
        <div className="flex justify-center">
          <ArrowDown className="h-5 w-5 text-gray-400" />
        </div>
      )}

      {/* Conditions */}
      {rule.trigger && (
        <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <Filter className="h-4 w-4" />
            {t('automation.conditions')}
          </div>
          <div className="space-y-2">
            {rule.conditions.map((condition) => (
              <div key={condition.id} className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
                <input
                  type="text"
                  placeholder={t('automation.field')}
                  value={condition.field}
                  onChange={(e) => {
                    setRule((prev) => ({
                      ...prev,
                      conditions: prev.conditions.map((c) =>
                        c.id === condition.id ? { ...c, field: e.target.value } : c
                      ),
                    }));
                  }}
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Condition field"
                />
                <select
                  value={condition.operator}
                  onChange={(e) => {
                    setRule((prev) => ({
                      ...prev,
                      conditions: prev.conditions.map((c) =>
                        c.id === condition.id ? { ...c, operator: e.target.value } : c
                      ),
                    }));
                  }}
                  className="rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Condition operator"
                >
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>{op.replace('_', ' ')}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t('automation.value')}
                  value={condition.value}
                  onChange={(e) => {
                    setRule((prev) => ({
                      ...prev,
                      conditions: prev.conditions.map((c) =>
                        c.id === condition.id ? { ...c, value: e.target.value } : c
                      ),
                    }));
                  }}
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Condition value"
                />
                <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)} className="h-auto w-auto p-1 text-gray-400 hover:text-red-500" aria-label="Remove condition">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={addCondition}
              className="h-auto px-2 py-1 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              <Plus className="h-3 w-3" /> {t('automation.addCondition')}
            </Button>
          </div>
        </div>
      )}

      {/* Arrow */}
      {rule.trigger && (
        <div className="flex justify-center">
          <ArrowDown className="h-5 w-5 text-gray-400" />
        </div>
      )}

      {/* Actions */}
      {rule.trigger && (
        <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
            <Play className="h-4 w-4" />
            Actions
          </div>
          <div className="space-y-2">
            {rule.actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
                <Button variant="ghost" size="icon" onClick={() => removeAction(action.id)} className="h-auto w-auto p-1 text-gray-400 hover:text-red-500" aria-label="Remove action">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <select
              onChange={(e) => {
                const opt = ACTION_OPTIONS.find((o) => o.type === e.target.value);
                if (opt) addAction(opt.type, opt.label);
              }}
              value=""
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              aria-label="Add action"
            >
              <option value="" disabled>{t('automation.addAction')}</option>
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.type} value={opt.type}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Save */}
      {rule.trigger && rule.actions.length > 0 && onSave && (
        <div className="flex justify-end">
          <Button
            onClick={() => onSave(rule)}
            className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {t('automation.saveAutomation')}
          </Button>
        </div>
      )}
    </div>
  );
}
