'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  SlideoutPanel,
  SlideoutPanelContent,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { IconPicker } from '@/components/ui/icon-picker';
import { DateRangePicker } from '@/components/ui/date-picker';
import { PROJECT_TYPE_CONFIGS } from '@/config/project-types';
import {
  FolderKanban, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Shield, Building2, Users, Calendar,
  Palette, Eye, Loader2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

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
  memberIds: { userId: string; role: string }[];
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
  // visibility defaults to PUBLIC so new projects are org-wide-visible
  // out of the box — matches user expectation that "I created this project,
  // my teammates should see it". Admins can restrict to INTERNAL/PRIVATE/
  // CONFIDENTIAL during creation or later via project settings.
  name: '', key: '', description: '', projectType: 'SOFTWARE',
  department: '', category: '', entityType: 'INTERNAL', visibility: 'PUBLIC',
  riskLevel: 'NOT_ASSESSED', budgetCode: '', tags: '',
  ownerId: '', leadId: '', defaultAssignee: '', teamIds: [], memberIds: [],
  priority: 'MEDIUM', startDate: '', dueDate: '',
  template: 'KANBAN', icon: 'Briefcase', color: '#1C8C7D',
};

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

// Step definitions - titles/descriptions use translation keys resolved in render
const STEPS_META = [
  { id: 1, titleKey: 'createProject.basics', icon: FolderKanban, descKey: 'createProject.nameKeyType' },
  { id: 2, titleKey: 'createProject.organization', icon: Building2, descKey: 'createProject.deptCompliance' },
  { id: 3, titleKey: 'createProject.team', icon: Users, descKey: 'createProject.ownershipMembers' },
  { id: 4, titleKey: 'createProject.timeline', icon: Calendar, descKey: 'createProject.schedulePriority' },
  { id: 5, titleKey: 'createProject.appearance', icon: Palette, descKey: 'createProject.workflowBranding' },
  { id: 6, titleKey: 'createProject.review', icon: Eye, descKey: 'createProject.confirmCreate' },
] as const;

// ---------------------------------------------------------------------------
// Shared styles — matches SlideoutPanel design system used across the app
// ---------------------------------------------------------------------------

const inputClass = 'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';
const helpClass = 'mt-1 text-xs text-slate-400 dark:text-slate-500';

const cardClass = (active: boolean) =>
  `flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
    active
      ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
      : 'border-slate-200 dark:border-slate-700 hover:border-primary-500/50 bg-white dark:bg-[#1B1F23]'
  }`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { currentOrganization, refreshProjects } = useWorkspace();
  const { t } = useLanguage();

  const STEPS = STEPS_META.map(s => ({ ...s, title: t(s.titleKey), description: t(s.descKey) }));
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

  const update = useCallback((field: keyof FormData, value: string | string[] | { userId: string; role: string }[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Step validation
  const validateStep = useCallback((step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return t('projects.nameRequired');
        if (!formData.key.trim()) return t('projects.keyRequired');
        if (!/^[A-Z0-9]+$/.test(formData.key)) return t('projects.keyFormat');
        if (formData.key.length < 2) return t('projects.keyMinLength');
        return null;
      case 4:
        if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate)
          return t('projects.dueDateAfterStart');
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
      setError(t('projects.noWorkspaceSelected'));
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
    <div className="space-y-4">
      <div>
        <label className={labelClass}>
          {t('projects.projectName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Website Redesign, Mobile App, Q1 Marketing Campaign"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          autoFocus
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {t('projects.projectKey')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="MAP"
            value={formData.key}
            onChange={(e) => update('key', e.target.value.toUpperCase())}
            maxLength={10}
            required
            className={inputClass}
          />
          <p className={helpClass}>Used in issue keys (e.g., {formData.key || 'MAP'}-1)</p>
        </div>

        <div>
          <label className={labelClass}>{t('projects.projectType')}</label>
          <select
            value={formData.projectType}
            onChange={(e) => update('projectType', e.target.value)}
            className={inputClass}
          >
            {Object.entries(PROJECT_TYPE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('common.description')}</label>
        <textarea
          placeholder={t('projects.describeGoals')}
          value={formData.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Type feature preview */}
      {formData.projectType && PROJECT_TYPE_CONFIGS[formData.projectType] && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B] p-3">
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('projects.department')}</label>
          <input
            type="text"
            placeholder="e.g., Engineering, Finance, HR"
            value={formData.department}
            onChange={(e) => update('department', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('projects.categoryProgram')}</label>
          <input
            type="text"
            placeholder="e.g., Digital Transformation, R&D"
            value={formData.category}
            onChange={(e) => update('category', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> {t('projects.entityType')}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'INTERNAL', label: 'Internal', desc: t('projects.withinOrg') },
            { value: 'EXTERNAL', label: 'External', desc: t('projects.clientVendor') },
            { value: 'JOINT_VENTURE', label: 'Joint Venture', desc: t('projects.partnership') },
            { value: 'GOVERNMENT', label: 'Government', desc: t('projects.governmentContracted') },
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
                <p className="text-xs text-slate-500 dark:text-slate-400">{entity.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> {t('projects.visibility')}
            </span>
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => update('visibility', e.target.value)}
            className={inputClass}
          >
            <option value="PUBLIC">{t('projects.publicAll')}</option>
            <option value="INTERNAL">{t('projects.internalMembers')}</option>
            <option value="PRIVATE">{t('projects.privateExplicit')}</option>
            <option value="CONFIDENTIAL">{t('projects.confidentialRestricted')}</option>
          </select>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
            {formData.visibility === 'PUBLIC' && 'Everyone in your organization can see this project.'}
            {formData.visibility === 'INTERNAL' && 'Only people added as project members can see this project. Org admins still have access.'}
            {formData.visibility === 'PRIVATE' && 'Only explicit project members can see this — even org admins must be added.'}
            {formData.visibility === 'CONFIDENTIAL' && 'Restricted access with audit logging. Org admins cannot bypass this.'}
          </p>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {t('projects.riskLevel')}
            </span>
          </label>
          <select
            value={formData.riskLevel}
            onChange={(e) => update('riskLevel', e.target.value)}
            className={inputClass}
          >
            <option value="NOT_ASSESSED">{t('projects.notAssessed')}</option>
            <option value="LOW">{t('priority.low')}</option>
            <option value="MODERATE">{t('projects.moderate')}</option>
            <option value="HIGH">{t('priority.high')}</option>
            <option value="CRITICAL">{t('priority.critical')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('projects.budgetCode')}</label>
          <input
            type="text"
            placeholder="e.g., FY26-ENG-001"
            value={formData.budgetCode}
            onChange={(e) => update('budgetCode', e.target.value)}
            className={inputClass}
          />
          <p className={helpClass}>{t('projects.financialTrackingCode')}</p>
        </div>

        <div>
          <label className={labelClass}>{t('common.tags')}</label>
          <input
            type="text"
            placeholder="e.g., urgent, q1-2026, client-acme"
            value={formData.tags}
            onChange={(e) => update('tags', e.target.value)}
            className={inputClass}
          />
          <p className={helpClass}>{t('projects.commaSeparatedLabels')}</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('projects.projectOwner')}</label>
          <select
            value={formData.ownerId}
            onChange={(e) => update('ownerId', e.target.value)}
            className={inputClass}
          >
            <option value="">{t('projects.sameAsCreator')}</option>
            {orgMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name || member.email}
                {member.role ? ` (${member.role})` : ''}
              </option>
            ))}
          </select>
          <p className={helpClass}>{t('projects.executiveSponsor')}</p>
        </div>

        <div>
          <label className={labelClass}>{t('projects.projectLead')}</label>
          <select
            value={formData.leadId}
            onChange={(e) => update('leadId', e.target.value)}
            className={inputClass}
          >
            <option value="">{t('common.unassigned')}</option>
            {orgMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name || member.email}
              </option>
            ))}
          </select>
          <p className={helpClass}>{t('projects.dayToDay')}</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('projects.defaultAssignee')}</label>
        <select
          value={formData.defaultAssignee}
          onChange={(e) => update('defaultAssignee', e.target.value)}
          className={inputClass}
        >
          <option value="">Unassigned</option>
          <option value="PROJECT_LEAD">Project Lead</option>
          {orgMembers.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name || member.email}
            </option>
          ))}
        </select>
        <p className={helpClass}>{t('projects.autoAssigned')}</p>
      </div>

      <div>
        <label className={labelClass}>Teams</label>
        {orgTeams.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-2">{t('projects.noTeamsAvailable')}</p>
        ) : (
          <div className="max-h-[200px] overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            {orgTeams.map((team) => {
              const isSelected = formData.teamIds.includes(team.id);
              return (
                <label
                  key={team.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-500/5 dark:bg-primary-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-[#22272B]'
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
                    <p className="text-xs text-slate-400 dark:text-slate-500">{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>{t('projects.projectMembers') || 'Project Members'}</label>
        <p className={helpClass}>{t('projects.selectMembersDesc') || 'Select organization members to add to this project'}</p>
        {orgMembers.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-2">No members available</p>
        ) : (
          <div className="max-h-[240px] overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 mt-2">
            {orgMembers.map((member) => {
              const existing = formData.memberIds.find(m => m.userId === member.userId);
              const isSelected = !!existing;
              return (
                <div
                  key={member.userId}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    isSelected
                      ? 'bg-primary-500/5 dark:bg-primary-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-[#22272B]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        update('memberIds', formData.memberIds.filter(m => m.userId !== member.userId));
                      } else {
                        update('memberIds', [...formData.memberIds, { userId: member.userId, role: 'MEMBER' }]);
                      }
                    }}
                    className="h-4 w-4 rounded text-primary-500 focus:ring-primary-500 border-slate-300 dark:border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.name || member.email}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{member.email}</p>
                  </div>
                  {isSelected && (
                    <select
                      value={existing.role}
                      onChange={(e) => {
                        update('memberIds', formData.memberIds.map(m =>
                          m.userId === member.userId ? { ...m, role: e.target.value } : m
                        ));
                      }}
                      className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] text-slate-700 dark:text-slate-300 px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                      <option value="CONTRACTOR">Contractor</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {formData.memberIds.length > 0 && (
          <p className="mt-2 text-xs text-[#1C8C7D]">{formData.memberIds.length} member{formData.memberIds.length !== 1 ? 's' : ''} selected</p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t('common.priority')}</label>
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

      <div>
        <label className={labelClass}>{t('projects.projectTimeline')}</label>
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
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B] p-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Duration: {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t('projects.workflowTemplate')}</label>
        <div className="space-y-2">
          {[
            { value: 'KANBAN', name: 'Kanban', desc: t('projects.continuousFlow') },
            { value: 'SCRUM', name: 'Scrum', desc: t('projects.sprintBased') },
            { value: 'CUSTOM', name: 'Custom', desc: t('projects.customWorkflow') },
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <IconPicker
            value={formData.icon}
            onChange={(icon) => update('icon', icon)}
            label="Icon"
          />
        </div>

        <div>
          <label className={labelClass}>{t('projects.color')}</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => update('color', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer rounded-md border border-slate-200 dark:border-slate-700"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => update('color', e.target.value)}
              placeholder="#1C8C7D"
              className={inputClass + ' flex-1'}
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
      <div className="space-y-3">
        <div className="rounded-lg border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/5 p-3">
          <p className="text-sm text-primary-700 dark:text-primary-400">
            {t('projects.reviewConfig')}
          </p>
        </div>

        {reviewSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-[#22272B] px-3 py-2 border-b border-slate-200 dark:border-slate-700">
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
  // Layout — SlideoutPanel matching app-wide design system
  // -------------------------------------------------------------------------

  return (
    <SlideoutPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('projects.createNewProject')}
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
                <ChevronLeft className="h-4 w-4" /> {t('common.back')}
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
              {t('common.cancel')}
            </Button>
            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-primary-500 hover:bg-primary-600 text-white gap-1.5"
              >
                {t('common.next')} <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary-500 hover:bg-primary-600 text-white gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? t('common.creating') : t('nav.createProject')}
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
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <li key={step.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
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
                          ? 'hover:bg-slate-100 dark:hover:bg-[#22272B] cursor-pointer'
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
