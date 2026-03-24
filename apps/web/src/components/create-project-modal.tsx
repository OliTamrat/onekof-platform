'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  SlideoutPanel,
  SlideoutPanelContent,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { DateRangePicker } from '@/components/ui/date-picker';
import { FolderKanban } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const { currentOrganization, refreshProjects } = useWorkspace();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    icon: 'Briefcase',
    color: '#1C8C7D',
    template: 'KANBAN' as 'KANBAN' | 'SCRUM' | 'CUSTOM',
    projectType: 'SOFTWARE' as 'SOFTWARE' | 'BUSINESS' | 'MARKETING' | 'OPERATIONS' | 'RESEARCH' | 'CONSTRUCTION' | 'CUSTOM',
    priority: 'MEDIUM' as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE',
    startDate: '',
    dueDate: '',
    leadId: '',
    defaultAssignee: '',
    teamIds: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgMembers, setOrgMembers] = useState<{ userId: string; name?: string; email: string }[]>([]);
  const [orgTeams, setOrgTeams] = useState<{ id: string; name: string; icon?: string; memberCount: number }[]>([]);

  useEffect(() => {
    if (open && currentOrganization) {
      fetch(`/api/organizations/${currentOrganization.id}/members`)
        .then(res => res.json())
        .then(data => setOrgMembers(data.members || []))
        .catch(() => {});

      fetch(`/api/teams`)
        .then(res => res.json())
        .then(data => setOrgTeams(data.teams || []))
        .catch(() => {});
    }
  }, [open, currentOrganization]);

  const generateKey = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.slice(0, 3))
      .join('')
      .slice(0, 10);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: prev.key === '' || prev.key === generateKey(prev.name)
        ? generateKey(name)
        : prev.key,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentOrganization) {
      setError('No workspace selected');
      return;
    }

    if (!formData.name || !formData.key) {
      setError('Name and key are required');
      return;
    }

    if (!/^[A-Z0-9]+$/.test(formData.key)) {
      setError('Key must contain only uppercase letters and numbers');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/projects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      setFormData({
        name: '', key: '', description: '', icon: 'Briefcase', color: '#1C8C7D',
        template: 'KANBAN', projectType: 'SOFTWARE', priority: 'MEDIUM',
        startDate: '', dueDate: '', leadId: '', defaultAssignee: '', teamIds: [],
      });

      await refreshProjects();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = 'flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors';
  const inputOverride = 'bg-white dark:bg-[#282E33] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500';

  return (
    <SlideoutPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Project"
      size="md"
      headerActions={<FolderKanban className="h-5 w-5 text-primary-500" />}
      showFooter
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.key}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      }
    >
      <SlideoutPanelContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Basic Information</h3>

            <div className="space-y-1.5">
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign, Mobile App"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
                className={inputOverride}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="key">
                  Project Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="key"
                  placeholder="MAP"
                  value={formData.key}
                  onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  maxLength={10}
                  required
                  className={inputOverride}
                />
                <p className="text-[11px] text-slate-400">Used in issue keys (e.g., MAP-1)</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="project-type">Type</Label>
                <select
                  id="project-type"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as typeof formData.projectType })}
                  className={selectClass}
                >
                  <option value="SOFTWARE">Software</option>
                  <option value="BUSINESS">Business</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="RESEARCH">Research</option>
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe goals, objectives, and key deliverables..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={inputOverride}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
                className={selectClass}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Timeline */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Timeline</h3>
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.dueDate}
              onStartDateChange={(date) => setFormData({ ...formData, startDate: date })}
              onEndDateChange={(date) => setFormData({ ...formData, dueDate: date })}
              startLabel="Start Date"
              endLabel="Target Due Date"
            />
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Team */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Team</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead">Project Lead</Label>
                <select
                  id="lead"
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  {orgMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="default-assignee">Default Assignee</Label>
                <select
                  id="default-assignee"
                  value={formData.defaultAssignee}
                  onChange={(e) => setFormData({ ...formData, defaultAssignee: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  <option value="PROJECT_LEAD">Project Lead</option>
                  {orgMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Auto-assign new issues to this person</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teams">Teams</Label>
              <select
                id="teams"
                multiple
                value={formData.teamIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, teamIds: selected });
                }}
                className={selectClass + ' min-h-[80px]'}
              >
                {orgTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.memberCount})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">Hold Ctrl/Cmd to select multiple teams</p>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Appearance */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  label="Icon"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 p-1 cursor-pointer border-slate-200 dark:border-slate-700"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    placeholder="#1C8C7D"
                    className={inputOverride + ' flex-1'}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Workflow */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Workflow</h3>
            <div className="space-y-2">
              {[
                { value: 'KANBAN', name: 'Kanban', desc: 'To Do, In Progress, Done' },
                { value: 'SCRUM', name: 'Scrum', desc: 'Sprint-based with backlog' },
                { value: 'CUSTOM', name: 'Custom', desc: 'Build your own workflow' }
              ].map((template) => (
                <label
                  key={template.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    formData.template === template.value
                      ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-500/50 bg-white dark:bg-[#282E33]'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.value}
                    checked={formData.template === template.value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, template: e.target.value as typeof formData.template }))}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{template.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{template.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {error && (
            <div className="rounded-md border border-red-200 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </form>
      </SlideoutPanelContent>
    </SlideoutPanel>
  );
}
