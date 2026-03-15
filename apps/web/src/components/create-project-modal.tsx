'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { DateRangePicker } from '@/components/ui/date-picker';

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
    projectType: 'SOFTWARE' as 'SOFTWARE' | 'BUSINESS' | 'MARKETING' | 'OPERATIONS' | 'OTHER',
    startDate: '',
    dueDate: '',
    leadId: '',
    teamIds: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [orgTeams, setOrgTeams] = useState<any[]>([]);

  // Fetch organization members and teams when modal opens
  useEffect(() => {
    if (open && currentOrganization) {
      // Fetch members
      fetch(`/api/organizations/${currentOrganization.id}/members`)
        .then(res => res.json())
        .then(data => setOrgMembers(data.members || []))
        .catch(err => console.error('Failed to fetch members:', err));

      // Fetch teams
      fetch(`/api/teams`)
        .then(res => res.json())
        .then(data => setOrgTeams(data.teams || []))
        .catch(err => console.error('Failed to fetch teams:', err));
    }
  }, [open, currentOrganization]);

  // Auto-generate project key from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate key if it hasn't been manually edited
      key: prev.key === '' || prev.key === generateKey(prev.name)
        ? generateKey(name)
        : prev.key,
    }));
  };

  const generateKey = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.slice(0, 3))
      .join('')
      .slice(0, 10);
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

      // Reset form
      setFormData({
        name: '',
        key: '',
        description: '',
        icon: 'Briefcase',
        color: '#1C8C7D',
        template: 'KANBAN',
        projectType: 'SOFTWARE',
        startDate: '',
        dueDate: '',
        leadId: '',
        teamIds: [],
      });

      // Refresh projects list
      await refreshProjects();

      // Close modal
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SlideoutPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Project"
      size="md"
      showFooter
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="bg-[#282E33] border-slate-700 text-white hover:bg-slate-700"
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
          {/* Basic Information Card */}
          <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Project Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Website Redesign, Mobile App, Q4 Campaign"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="bg-[#22272B] border-slate-700 text-white placeholder-slate-400 focus:border-primary-500"
                />
                <p className="text-xs text-slate-400">A clear, descriptive name for your project</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key" className="text-white">
                  Project Key <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="key"
                  placeholder="MAP"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      key: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={10}
                  required
                  className="bg-[#22272B] border-slate-700 text-white placeholder-slate-400 focus:border-primary-500"
                />
                <p className="text-xs text-slate-400">
                  Short identifier (auto-generated from name, e.g., MAP)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-type" className="text-white">Project Type</Label>
                <select
                  id="project-type"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as typeof formData.projectType })}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-[#22272B] px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="SOFTWARE">Software Development</option>
                  <option value="BUSINESS">Business Project</option>
                  <option value="MARKETING">Marketing Campaign</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="OTHER">Other</option>
                </select>
                <p className="text-xs text-slate-400">What kind of project is this?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project's goals, objectives, and key deliverables..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="bg-[#22272B] border-slate-700 text-white placeholder-slate-400 focus:border-primary-500"
                />
                <p className="text-xs text-slate-400">Help team members understand the project scope</p>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Project Timeline</h3>
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.dueDate}
              onStartDateChange={(date) => setFormData({ ...formData, startDate: date })}
              onEndDateChange={(date) => setFormData({ ...formData, dueDate: date })}
              startLabel="Start Date"
              endLabel="Target Due Date"
            />
          </div>

          {/* Team & Leadership Card */}
          <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Team & Leadership</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lead" className="text-white">Project Lead</Label>
                <select
                  id="lead"
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-[#22272B] px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="">No lead assigned</option>
                  {orgMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Person responsible for this project's success</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teams" className="text-white">Assign Teams</Label>
                <select
                  id="teams"
                  multiple
                  value={formData.teamIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, teamIds: selected });
                  }}
                  className="flex min-h-[120px] w-full rounded-md border border-slate-700 bg-[#22272B] px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  {orgTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.icon} {team.name} ({team.memberCount} members)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Hold Ctrl/Cmd to select multiple teams</p>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Appearance</h3>
            <div className="space-y-4">
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
                label="Project Icon"
              />

              <div className="space-y-2">
                <Label htmlFor="color" className="text-white">Project Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-16 h-10 p-1 cursor-pointer bg-[#22272B] border-slate-700"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    placeholder="#1C8C7D"
                    className="flex-1 bg-[#22272B] border-slate-700 text-white focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Choose a color to identify this project</p>
              </div>
            </div>
          </div>

          {/* Workflow Template Card */}
          <div className="rounded-lg border border-slate-700 bg-[#1B1F23] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Workflow Template</h3>
            <div className="space-y-3">
              {[
                { value: 'KANBAN', name: 'Kanban Board', desc: 'Flexible workflow with columns like To Do, In Progress, Done' },
                { value: 'SCRUM', name: 'Scrum Board', desc: 'Sprint-based workflow for agile teams with backlog and sprint planning' },
                { value: 'CUSTOM', name: 'Custom Workflow', desc: 'Start with a blank board and create your own workflow' }
              ].map((template) => (
                <label
                  key={template.value}
                  className={`flex items-start gap-3 rounded-md border p-4 cursor-pointer transition-colors ${
                    formData.template === template.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 bg-[#22272B] hover:border-primary-500/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.value}
                    checked={formData.template === template.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        template: e.target.value as typeof formData.template,
                      }))
                    }
                    className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{template.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300">About Projects</p>
                <p className="mt-1 text-xs text-blue-400">
                  Projects help organize work into manageable units. You can track issues, assign tasks to team members, and monitor progress toward your goals.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </form>
      </SlideoutPanelContent>
    </SlideoutPanel>
  );
}
