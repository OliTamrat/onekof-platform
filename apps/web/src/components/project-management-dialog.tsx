'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SlideoutPanel,
  SlideoutPanelContent,
} from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  UserPlus,
  Trash2,
  UsersRound,
  X,
  FileText,
  Settings2,
  Info,
  Globe,
  Lock,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { IconPicker } from '@/components/ui/icon-picker';

interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
  organizationId: string;
  leadId?: string;
  defaultAssignee?: string;
  isArchived?: boolean;
}

interface ProjectManagementDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectManagementDialog({
  project,
  open,
  onOpenChange,
}: ProjectManagementDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const queryClient = useQueryClient();

  // Project details form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    key: '',
    description: '',
    icon: 'FileText',
    color: '#1C8C7D',
    leadId: '',
    defaultAssignee: 'UNASSIGNED',
  });

  // Update form when project changes
  useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        icon: project.icon || 'FileText',
        color: project.color || '#1C8C7D',
        leadId: project.leadId || '',
        defaultAssignee: project.defaultAssignee || 'UNASSIGNED',
      });
    }
  }, [project]);

  // Fetch project members
  const { data: membersData, error: membersError } = useQuery({
    queryKey: ['project-members', project?.id],
    queryFn: async () => {
      if (!project) return { members: [] };
      const res = await fetch(`/api/projects/${project.id}/members`);
      if (!res.ok) {
        const error = await res.json();
        console.error('Error fetching members:', error);
        throw new Error(error.error || 'Failed to fetch members');
      }
      return res.json();
    },
    enabled: !!project?.id && open,
    retry: false,
  });

  // Fetch project teams
  const { data: teamsData } = useQuery({
    queryKey: ['project-teams', project?.id],
    queryFn: async () => {
      if (!project) return { teams: [] };
      const res = await fetch(`/api/projects/${project.id}/teams`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    enabled: !!project?.id && open,
  });

  // Fetch organization members for selection
  const { data: orgMembersData } = useQuery({
    queryKey: ['organization-members', project?.organizationId],
    queryFn: async () => {
      if (!project) return { members: [] };
      const res = await fetch(`/api/organizations/${project.organizationId}/members`);
      if (!res.ok) throw new Error('Failed to fetch organization members');
      return res.json();
    },
    enabled: !!project?.organizationId && open,
  });

  // Fetch organization teams for selection
  const { data: orgTeamsData } = useQuery({
    queryKey: ['organization-teams', project?.organizationId],
    queryFn: async () => {
      if (!project) return { teams: [] };
      const res = await fetch(`/api/teams`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    enabled: !!project?.organizationId && open,
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<typeof projectForm>) => {
      const res = await fetch(`/api/projects/${project?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['organization-projects'] });
    },
  });

  const [externalEmail, setExternalEmail] = useState('');
  const [inviteMode, setInviteMode] = useState<'org' | 'external'>('org');

  // Add member mutation (existing org member by userId)
  const addMemberMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await fetch(`/api/projects/${project?.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'MEMBER' }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
      setNewMemberEmail('');
    },
  });

  // Invite external user by email
  const inviteExternalMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await fetch(`/api/projects/${project?.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'MEMBER' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite');
      return data;
    },
    onSuccess: (data) => {
      if (data.member) {
        queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
      }
      setExternalEmail('');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/projects/${project?.id}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
    },
  });

  // Add team mutation
  const addTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/projects/${project?.id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add team');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-teams', project?.id] });
      setSelectedTeamId('');
    },
  });

  // Remove team mutation
  const removeTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/projects/${project?.id}/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-teams', project?.id] });
    },
  });

  const members = membersData?.members || [];
  const teams = teamsData?.teams || [];
  const orgMembers = orgMembersData?.members || [];
  const orgTeams = orgTeamsData?.teams || [];

  // Filter out members already in project
  const availableMembers = orgMembers.filter(
    (orgMember: any) => !members.some((m: any) => m.userId === orgMember.userId)
  );

  // Filter out teams already in project
  const availableTeams = orgTeams.filter(
    (orgTeam: any) => !teams.some((t: any) => t.id === orgTeam.id)
  );

  return (
    <SlideoutPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Manage Project: ${project?.name || ''}`}
      size="lg"
    >
      <SlideoutPanelContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-[#1B1F23] border border-gray-200 dark:border-slate-700">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white text-gray-600 dark:text-slate-400"
            >
              <Info className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white text-gray-600 dark:text-slate-400"
            >
              <Users className="mr-2 h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white text-gray-600 dark:text-slate-400"
            >
              <UsersRound className="mr-2 h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white text-gray-600 dark:text-slate-400"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-gray-900 dark:text-white">
                    Project Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="project-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-key" className="text-gray-900 dark:text-white">
                    Project Key <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="project-key"
                    value={projectForm.key}
                    onChange={(e) => setProjectForm({ ...projectForm, key: e.target.value.toUpperCase() })}
                    placeholder="PROJ"
                    maxLength={10}
                    className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    A short identifier for your project (used in issue keys)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description" className="text-gray-900 dark:text-white">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your project's purpose and goals..."
                    className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
              <div className="space-y-4">
                <IconPicker
                  value={projectForm.icon}
                  onChange={(icon) => setProjectForm({ ...projectForm, icon })}
                  label="Project Icon"
                />

                <div className="space-y-2">
                  <Label htmlFor="project-color" className="text-gray-900 dark:text-white">Project Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="project-color"
                      type="color"
                      value={projectForm.color}
                      onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700"
                    />
                    <Input
                      type="text"
                      value={projectForm.color}
                      onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                      placeholder="#1C8C7D"
                      className="flex-1 bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    Choose a color to identify this project
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => updateProjectMutation.mutate(projectForm)}
                disabled={updateProjectMutation.isPending || !projectForm.name || !projectForm.key}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            {updateProjectMutation.isError && (
              <p className="text-sm text-red-400 text-center">
                {updateProjectMutation.error?.message || 'Failed to update project'}
              </p>
            )}
            {updateProjectMutation.isSuccess && (
              <p className="text-sm text-green-400 text-center">Project updated successfully!</p>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-4">
            {/* Add Member Section */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-900 dark:text-white">Add Member</Label>
                <div className="flex rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden text-xs">
                  <button
                    onClick={() => setInviteMode('org')}
                    className={`px-3 py-1.5 transition-colors ${
                      inviteMode === 'org'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-50 dark:bg-[#22272B] text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                    }`}
                  >
                    Organization
                  </button>
                  <button
                    onClick={() => setInviteMode('external')}
                    className={`px-3 py-1.5 transition-colors ${
                      inviteMode === 'external'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-50 dark:bg-[#22272B] text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                    }`}
                  >
                    External Invite
                  </button>
                </div>
              </div>

              {inviteMode === 'org' ? (
                <div className="flex gap-2">
                  <select
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex h-10 flex-1 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Select an organization member...</option>
                    {availableMembers.map((member: any) => (
                      <option key={member.userId || member.id} value={member.userId || member.id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      if (newMemberEmail) {
                        addMemberMutation.mutate({ userId: newMemberEmail });
                      }
                    }}
                    disabled={!newMemberEmail || addMemberMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs text-gray-500 dark:text-slate-400">
                    Invite anyone by email — they&apos;ll receive an invitation to join your organization and project.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={externalEmail}
                      onChange={(e) => setExternalEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="flex h-10 flex-1 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && externalEmail.trim()) {
                          inviteExternalMutation.mutate({ email: externalEmail.trim() });
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (externalEmail.trim()) {
                          inviteExternalMutation.mutate({ email: externalEmail.trim() });
                        }
                      }}
                      disabled={!externalEmail.trim() || inviteExternalMutation.isPending}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      {inviteExternalMutation.isPending ? (
                        <span className="flex items-center">
                          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {addMemberMutation.isError && inviteMode === 'org' && (
                <p className="mt-2 text-sm text-red-400">
                  {addMemberMutation.error?.message || 'Failed to add member'}
                </p>
              )}
              {inviteExternalMutation.isError && inviteMode === 'external' && (
                <p className="mt-2 text-sm text-red-400">
                  {inviteExternalMutation.error?.message || 'Failed to send invitation'}
                </p>
              )}
              {inviteExternalMutation.isSuccess && inviteMode === 'external' && (
                <p className="mt-2 text-sm text-green-400">
                  {inviteExternalMutation.data?.message || 'Invitation sent!'}
                </p>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.length > 0 ? (
                members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] p-3 hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-medium">
                        {member.name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.name || member.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      disabled={removeMemberMutation.isPending}
                      className="hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-600 dark:text-slate-400 py-8">
                  No members assigned to this project yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4 mt-4">
            {/* Add Team Section */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-4">
              <Label className="mb-2 block text-gray-900 dark:text-white">Assign Team</Label>
              <div className="flex gap-2">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select a team...</option>
                  {availableTeams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.memberCount} members)
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    if (selectedTeamId) {
                      addTeamMutation.mutate(selectedTeamId);
                    }
                  }}
                  disabled={!selectedTeamId || addTeamMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </div>
              {addTeamMutation.isError && (
                <p className="mt-2 text-sm text-red-400">
                  {addTeamMutation.error?.message || 'Failed to assign team'}
                </p>
              )}
            </div>

            {/* Teams List */}
            <div className="space-y-2">
              {teams.length > 0 ? (
                teams.map((team: any) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] p-3 hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: team.color || '#1C8C7D' }}
                      >
                        <IconRenderer iconName={team.icon} className="h-5 w-5 text-white" fallback="👥" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {team.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {team.memberCount} members
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMutation.mutate(team.id)}
                      disabled={removeTeamMutation.isPending}
                      className="hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-600 dark:text-slate-400 py-8">
                  No teams assigned to this project yet
                </p>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-4">
            {/* Project Lead */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Project Lead</h3>
              <div className="space-y-2">
                <Label htmlFor="project-lead" className="text-gray-900 dark:text-white">Assign Project Lead</Label>
                <select
                  id="project-lead"
                  value={projectForm.leadId}
                  onChange={(e) => setProjectForm({ ...projectForm, leadId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="">No lead assigned</option>
                  {members.map((member: any) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  The project lead has full permissions to manage the project
                </p>
              </div>
            </div>

            {/* Default Assignee */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Default Assignee</h3>
              <div className="space-y-2">
                <Label htmlFor="default-assignee" className="text-gray-900 dark:text-white">Default Assignee for New Issues</Label>
                <select
                  id="default-assignee"
                  value={projectForm.defaultAssignee}
                  onChange={(e) => setProjectForm({ ...projectForm, defaultAssignee: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="UNASSIGNED">Unassigned</option>
                  <option value="PROJECT_LEAD">Project Lead</option>
                  <option value="COMPONENT_LEAD">Component Lead</option>
                </select>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Who should new issues be assigned to by default?
                </p>
              </div>
            </div>

            {/* Access Settings */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Access & Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-md border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 flex-shrink-0">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Public Project</h4>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      All organization members can view and access this project
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-md border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] p-4 opacity-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/20 flex-shrink-0">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Private Project</h4>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      Only assigned members and teams can access (Premium feature)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => updateProjectMutation.mutate(projectForm)}
                disabled={updateProjectMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {updateProjectMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
            {updateProjectMutation.isError && (
              <p className="text-sm text-red-400 text-center">
                {updateProjectMutation.error?.message || 'Failed to update settings'}
              </p>
            )}
            {updateProjectMutation.isSuccess && (
              <p className="text-sm text-green-400 text-center">Settings updated successfully!</p>
            )}
          </TabsContent>
        </Tabs>
      </SlideoutPanelContent>
    </SlideoutPanel>
  );
}
