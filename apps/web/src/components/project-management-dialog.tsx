'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  UserPlus,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface Project {
  id: string;
  name: string;
  key: string;
  organizationId: string;
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
  const [activeTab, setActiveTab] = useState('members');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const queryClient = useQueryClient();

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

  // Add member mutation
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Project: {project?.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="teams">
              <UsersRound className="mr-2 h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {/* Add Member Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <Label className="mb-2 block">Add Member</Label>
              <div className="flex gap-2">
                <select
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-[#2D3748] dark:text-white"
                >
                  <option value="">Select a member...</option>
                  {availableMembers.map((member: any) => (
                    <option key={member.userId} value={member.userId}>
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
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              {addMemberMutation.isError && (
                <p className="mt-2 text-sm text-red-600">
                  {addMemberMutation.error?.message || 'Failed to add member'}
                </p>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.length > 0 ? (
                members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-medium">
                        {member.name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {member.name || member.email}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      disabled={removeMemberMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                  No members assigned to this project yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            {/* Add Team Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <Label className="mb-2 block">Assign Team</Label>
              <div className="flex gap-2">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-[#2D3748] dark:text-white"
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
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </div>
              {addTeamMutation.isError && (
                <p className="mt-2 text-sm text-red-600">
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
                    className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: team.color || '#3B82F6' }}
                      >
                        {team.icon || '👥'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {team.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {team.memberCount} members
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMutation.mutate(team.id)}
                      disabled={removeTeamMutation.isPending}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                  No teams assigned to this project yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
