'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import { PROJECT_TYPE_CONFIGS } from '@/config/project-types';
import {
  FolderKanban, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Shield, Building2, Users, Calendar,
  Palette, Settings2, Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrgMember {
  userId: string;
  name?: string;
  email: string;
  role?: string;
}

interface OrgTeam {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
}

type ProjectType = 'SOFTWARE' | 'BUSINESS' | 'MARKETING' | 'OPERATIONS' | 'RESEARCH' | 'CONSTRUCTION' | 'CUSTOM';
type ProjectTemplate = 'KANBAN' | 'SCRUM' | 'CUSTOM';
type ProjectPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
type EntityType = 'INTERNAL' | 'EXTERNAL' | 'JOINT_VENTURE' | 'GOVERNMENT';
type Visibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE' | 'CONFIDENTIAL';
type RiskLevel = 'NOT_ASSESSED' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface FormData {
  // Step 1: Basics
  name: string;
  key: string;
  description: string;
  projectType: ProjectType;
  // Step 2: Organization & Compliance
  department: string;
  category: string;
  entityType: EntityType;
  visibility: Visibility;
  riskLevel: RiskLevel;
  budgetCode: string;
  tags: string;
  // Step 3: Team & Ownership
  ownerId: string;
  leadId: string;
  defaultAssignee: string;
  teamIds: string[];
  // Step 4: Timeline & Priority
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  // Step 5: Workflow & Appearance
  template: ProjectTemplate;
  icon: string;
  color: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '', key: '', description: '', projectType: 'SOFTWARE',
  department: '', category: '', entityType: 'INTERNAL', visibility: 'INTERNAL',
  riskLevel: 'NOT_ASSESSED', budgetCode: '', tags: '',
  ownerId: '', leadId: '', defaultAssignee: '', teamIds: [],
  priority: 'MEDIUM', startDate: '', dueDate: '',
  template: 'KANBAN', icon: 'Briefcase', color: '#1C8C7D',
};

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, title: 'Basics', icon: FolderKanban, description: 'Name, key & type' },
  { id: 2, title: 'Organization', icon: Building2, description: 'Department & compliance' },
  { id: 3, title: 'Team', icon: Users, description: 'Ownership & members' },
  { id: 4, title: 'Timeline', icon: Calendar, description: 'Schedule & priority' },
  { id: 5, title: 'Appearance', icon: Palette, description: 'Workflow & branding' },
  { id: 6, title: 'Review', icon: Eye, description: 'Confirm & create' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { currentOrganization, refreshProjects } = useWorkspace();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [orgTeams, setOrgTeams] = useState<OrgTeam[]>([]);

  // Fetch org data on open
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

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setFormData(INITIAL_FORM_DATA);
      setError('');
    }
  }, [open]);

  const generateKey = useCallback((name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.slice(0, 3))
      .join('')
      .slice(0, 10);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: prev.key === '' || prev.key === generateKey(prev.name)
        ? generateKey(name)
        : prev.key,
    }));
  }, [generateKey]);

  const update = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Step validation
  const validateStep = useCallback((step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Project name is required';
        if (!formData.key.trim()) return 'Project key is required';
        if (!/^[A-Z0-9]+$/.test(formData.key)) return 'Key must contain only uppercase letters and numbers';
        if (formData.key.length < 2) return 'Key must be at least 2 characters';
        return null;
      case 4:
        if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate)
          return 'Due date must be after start date';
        return null;
      default:
        return null;
    }
  }, [formData]);

  const canProceed = validateStep(currentStep) === null;

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setCurrentStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!currentOrganization) {
      setError('No workspace selected');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
      };

      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/projects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      await refreshProjects();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared styles
  const selectClass = 'flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors';
  const inputOverride = 'bg-white dark:bg-[#1B1F23] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500';
  const cardClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
      active
        ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
        : 'border-slate-200 dark:border-slate-700 hover:border-primary-500/50 bg-white dark:bg-[#1B1F23]'
    }`;

  // Helper to get member name
  const getMemberName = (id: string) => {
    const m = orgMembers.find(m => m.userId === id);
    return m ? (m.name || m.email) : 'Unassigned';
  };

  const getTeamNames = (ids: string[]) => {
    if (!ids.length) return 'None';
    return ids.map(id => orgTeams.find(t => t.id === id)?.name || id).join(', ');
  };

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Project Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Website Redesign, Mobile App, Q1 Marketing Campaign"
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
            onChange={(e) => update('key', e.target.value.toUpperCase())}
            maxLength={10}
            required
            className={inputOverride}
          />
          <p className="text-[11px] text-slate-400">Used in issue keys (e.g., {formData.key || 'MAP'}-1)</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="project-type">Project Type</Label>
          <select
            id="project-type"
            value={formData.projectType}
            onChange={(e) => update('projectType', e.target.value)}
            className={selectClass}
          >
            {Object.entries(PROJECT_TYPE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe goals, objectives, and key deliverables..."
          value={formData.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          className={inputOverride}
        />
      </div>

      {/* Type feature preview */}
      {formData.projectType && PROJECT_TYPE_CONFIGS[formData.projectType] && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Default views for {PROJECT_TYPE_CONFIGS[formData.projectType].name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_TYPE_CONFIGS[formData.projectType].defaultViews.map((view) => (
              <span key={view} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                {view}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g., Engineering, Finance, HR"
            value={formData.department}
            onChange={(e) => update('department', e.target.value)}
            className={inputOverride}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category / Program</Label>
          <Input
            id="category"
            placeholder="e.g., Digital Transformation, R&D"
            value={formData.category}
            onChange={(e) => update('category', e.target.value)}
            className={inputOverride}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entity-type">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Entity Type
          </span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'INTERNAL', label: 'Internal', desc: 'Within your organization' },
            { value: 'EXTERNAL', label: 'External', desc: 'Client or vendor project' },
            { value: 'JOINT_VENTURE', label: 'Joint Venture', desc: 'Partnership with another org' },
            { value: 'GOVERNMENT', label: 'Government', desc: 'Government-contracted' },
          ] as const).map((entity) => (
            <label key={entity.value} className={cardClass(formData.entityType === entity.value)}>
              <input
                type="radio"
                name="entityType"
                value={entity.value}
                checked={formData.entityType === entity.value}
                onChange={() => update('entityType', entity.value)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{entity.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{entity.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="visibility">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Visibility
            </span>
          </Label>
          <select
            id="visibility"
            value={formData.visibility}
            onChange={(e) => update('visibility', e.target.value)}
            className={selectClass}
          >
            <option value="PUBLIC">Public - All org members</option>
            <option value="INTERNAL">Internal - Project members & admins</option>
            <option value="PRIVATE">Private - Explicit members only</option>
            <option value="CONFIDENTIAL">Confidential - Restricted with audit</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="risk-level">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Risk Level
            </span>
          </Label>
          <select
            id="risk-level"
            value={formData.riskLevel}
            onChange={(e) => update('riskLevel', e.target.value)}
            className={selectClass}
          >
            <option value="NOT_ASSESSED">Not Assessed</option>
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget-code">
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Budget Code
            </span>
          </Label>
          <Input
            id="budget-code"
            placeholder="e.g., FY26-ENG-001"
            value={formData.budgetCode}
            onChange={(e) => update('budgetCode', e.target.value)}
            className={inputOverride}
          />
          <p className="text-[11px] text-slate-400">Financial tracking code for this project</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="e.g., urgent, q1-2026, client-acme"
            value={formData.tags}
            onChange={(e) => update('tags', e.target.value)}
            className={inputOverride}
          />
          <p className="text-[11px] text-slate-400">Comma-separated labels</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="owner">Project Owner</Label>
          <select
            id="owner"
            value={formData.ownerId}
            onChange={(e) => update('ownerId', e.target.value)}
            className={selectClass}
          >
            <option value="">Same as creator</option>
            {orgMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name || member.email}
                {member.role ? ` (${member.role})` : ''}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Executive sponsor or budget holder</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead">Project Lead</Label>
          <select
            id="lead"
            value={formData.leadId}
            onChange={(e) => update('leadId', e.target.value)}
            className={selectClass}
          >
            <option value="">Unassigned</option>
            {orgMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name || member.email}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Day-to-day project manager</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="default-assignee">Default Assignee</Label>
        <select
          id="default-assignee"
          value={formData.defaultAssignee}
          onChange={(e) => update('defaultAssignee', e.target.value)}
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
        <p className="text-[11px] text-slate-400">New issues are automatically assigned to this person</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="teams">Teams</Label>
        <div className="space-y-2">
          {orgTeams.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-2">No teams available</p>
          ) : (
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
              {orgTeams.map((team) => {
                const isSelected = formData.teamIds.includes(team.id);
                return (
                  <label
                    key={team.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-500/5 dark:bg-primary-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = isSelected
                          ? formData.teamIds.filter(id => id !== team.id)
                          : [...formData.teamIds, team.id];
                        update('teamIds', next);
                      }}
                      className="h-4 w-4 rounded text-primary-500 focus:ring-primary-500 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{team.name}</p>
                      <p className="text-[11px] text-slate-400">{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <div className="grid grid-cols-5 gap-2">
          {([
            { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500' },
            { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
            { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
            { value: 'LOW', label: 'Low', color: 'bg-blue-500' },
            { value: 'NONE', label: 'None', color: 'bg-slate-400' },
          ] as const).map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update('priority', p.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                formData.priority === p.value
                  ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-500/50'
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${p.color}`} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Project Timeline</Label>
        <DateRangePicker
          startDate={formData.startDate}
          endDate={formData.dueDate}
          onStartDateChange={(date) => update('startDate', date)}
          onEndDateChange={(date) => update('dueDate', date)}
          startLabel="Start Date"
          endLabel="Target Due Date"
        />
      </div>

      {formData.startDate && formData.dueDate && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B1F23] p-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Duration: {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Workflow Template</Label>
        <div className="space-y-2">
          {[
            { value: 'KANBAN', name: 'Kanban', desc: 'Continuous flow: To Do, In Progress, Done' },
            { value: 'SCRUM', name: 'Scrum', desc: 'Sprint-based development with backlog grooming' },
            { value: 'CUSTOM', name: 'Custom', desc: 'Build your own workflow from scratch' },
          ].map((t) => (
            <label key={t.value} className={cardClass(formData.template === t.value)}>
              <input
                type="radio"
                name="template"
                value={t.value}
                checked={formData.template === t.value}
                onChange={() => update('template', t.value)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <IconPicker
            value={formData.icon}
            onChange={(icon) => update('icon', icon)}
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
              onChange={(e) => update('color', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer border-slate-200 dark:border-slate-700"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => update('color', e.target.value)}
              placeholder="#1C8C7D"
              className={inputOverride + ' flex-1'}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => {
    const typeConfig = PROJECT_TYPE_CONFIGS[formData.projectType];
    const reviewSections = [
      {
        title: 'Basics',
        items: [
          { label: 'Name', value: formData.name },
          { label: 'Key', value: formData.key },
          { label: 'Type', value: typeConfig?.name || formData.projectType },
          { label: 'Description', value: formData.description || 'None' },
        ],
      },
      {
        title: 'Organization',
        items: [
          { label: 'Department', value: formData.department || 'None' },
          { label: 'Category', value: formData.category || 'None' },
          { label: 'Entity Type', value: formData.entityType.replace(/_/g, ' ') },
          { label: 'Visibility', value: formData.visibility },
          { label: 'Risk Level', value: formData.riskLevel.replace(/_/g, ' ') },
          { label: 'Budget Code', value: formData.budgetCode || 'None' },
          { label: 'Tags', value: formData.tags || 'None' },
        ],
      },
      {
        title: 'Team',
        items: [
          { label: 'Owner', value: formData.ownerId ? getMemberName(formData.ownerId) : 'Creator' },
          { label: 'Lead', value: formData.leadId ? getMemberName(formData.leadId) : 'Unassigned' },
          { label: 'Default Assignee', value: formData.defaultAssignee === 'PROJECT_LEAD' ? 'Project Lead' : formData.defaultAssignee ? getMemberName(formData.defaultAssignee) : 'Unassigned' },
          { label: 'Teams', value: getTeamNames(formData.teamIds) },
        ],
      },
      {
        title: 'Timeline & Priority',
        items: [
          { label: 'Priority', value: formData.priority },
          { label: 'Start Date', value: formData.startDate || 'Not set' },
          { label: 'Due Date', value: formData.dueDate || 'Not set' },
        ],
      },
      {
        title: 'Workflow & Appearance',
        items: [
          { label: 'Template', value: formData.template },
          { label: 'Color', value: formData.color },
        ],
      },
    ];

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/5 p-3">
          <p className="text-sm text-primary-700 dark:text-primary-400">
            Review your project configuration below. Click <strong>Create Project</strong> to finalize.
          </p>
        </div>

        {reviewSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-[#1B1F23] px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{section.title}</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white max-w-[60%] truncate text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
  };

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  return (
    <SlideoutPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Project"
      size="lg"
      headerActions={<FolderKanban className="h-5 w-5 text-primary-500" />}
      showFooter
      footer={
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-primary-500 hover:bg-primary-600 text-white gap-1.5"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary-500 hover:bg-primary-600 text-white gap-1.5"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <SlideoutPanelContent>
        {/* Stepper navigation */}
        <nav className="mb-6">
          <ol className="flex items-center gap-1">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <li key={step.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      // Allow clicking back to completed steps
                      if (isComplete) {
                        setError('');
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!isComplete}
                    className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-2 transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 dark:bg-primary-500/15'
                        : isComplete
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                          : 'opacity-50 cursor-default'
                    }`}
                  >
                    <div className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                      isComplete
                        ? 'bg-primary-500 text-white'
                        : isActive
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
                    </div>
                    <div className="hidden lg:block min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>{step.title}</p>
                    </div>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-px w-4 flex-shrink-0 ${
                      isComplete ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step header */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {STEPS[currentStep - 1].title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Step content */}
        {stepRenderers[currentStep]?.()}

        {/* Error display */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </SlideoutPanelContent>
    </SlideoutPanel>
  );
}
