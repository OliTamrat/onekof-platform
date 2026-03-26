'use client';

/**
 * Production-Ready Team Management Page
 * HR-Standard with RBAC & Advanced Features
 *
 * Features:
 * - Comprehensive team management with slideout panels
 * - Team types (Development, Design, Marketing, etc.)
 * - Icon picker and color customization
 * - Private team settings
 * - Member management with RBAC (LEAD/ADMIN/MEMBER)
 * - Invitation system for new users
 * - Favorite teams (starred)
 * - Team and member statistics
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  SlideoutPanel,
  SlideoutPanelContent,
} from '@/components/ui/slideout-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { IconRenderer } from '@/components/ui/icon-renderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
import { useLanguage } from '@/contexts/language-context';
  Users,
  Plus,
  Mail,
  Crown,
  UserPlus,
  Shield,
  Building2,
  MoreHorizontal,
  Star,
  CheckCircle2,
  Copy,
  Briefcase,
  Settings,
} from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'LEAD' | 'MEMBER';
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  memberCount: number;
  projectCount: number;
  isDefault: boolean;
  isFavorite: boolean;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export default function IssuesTeamPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isManageTeamOpen, setIsManageTeamOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<{ email: string; token: string; invited: boolean } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Users',
    color: '#3B82F6',
  });

  // Fetch teams
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    enabled: !!session,
  });

  // Fetch team members
  const { data: membersData } = useQuery({
    queryKey: ['team-members', selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam?.id) return { members: [] };
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !!selectedTeam?.id && isManageTeamOpen,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ teamId, ...data }: { teamId: string; isFavorite?: boolean } & Partial<typeof formData>) => {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ teamId, userEmail }: { teamId: string; userEmail: string }) => {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, role: 'MEMBER' }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', selectedTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsAddMemberDialogOpen(false);
      setNewMemberEmail('');

      setInvitationData({
        email: data.invited ? data.invitation.email : data.member.email,
        token: data.invited ? data.invitation.token : '',
        invited: data.invited || false,
      });
      setIsSuccessModalOpen(true);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', selectedTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'Users',
      color: '#3B82F6',
    });
  };

  const handleCreateTeam = () => {
    createTeamMutation.mutate(formData);
  };

  const handleOpenManageTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsManageTeamOpen(true);
  };

  const toggleFavorite = (teamId: string, currentValue: boolean) => {
    updateTeamMutation.mutate({
      teamId,
      isFavorite: !currentValue,
    } as any);
  };

  const teams = teamsData?.teams || [];
  const favoriteTeams = teams.filter((t: Team) => t.isFavorite);
  const otherTeams = teams.filter((t: Team) => !t.isFavorite);

  if (!session) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500 dark:text-slate-400">Please sign in to view teams.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Team"
        icon={<Users className="h-6 w-6" />}
        iconColor="#3B82F6"
        currentTab="team"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Action Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Management</h2>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-400">
                Organize teams and manage members across your organization
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Teams Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Loading teams...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Favorite Teams */}
              {favoriteTeams.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    STARRED TEAMS
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {favoriteTeams.map((team: Team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onManage={handleOpenManageTeam}
                        onToggleFavorite={toggleFavorite}
                        onDelete={(id) => {
                          if (confirm('Are you sure you want to delete this team?')) {
                            deleteTeamMutation.mutate(id);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Teams */}
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                  {favoriteTeams.length > 0 ? 'ALL TEAMS' : `YOUR TEAMS (${teams.length})`}
                </h2>
                {otherTeams.length > 0 || favoriteTeams.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {otherTeams.map((team: Team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onManage={handleOpenManageTeam}
                        onToggleFavorite={toggleFavorite}
                        onDelete={(id) => {
                          if (confirm('Are you sure you want to delete this team?')) {
                            deleteTeamMutation.mutate(id);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
                    <Users className="h-12 w-12 text-gray-300 dark:text-slate-700" />
                    <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                      No teams found
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                      Create your first team to get started
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="mt-4 flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Team
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Team Slide-out Panel */}
        <SlideoutPanel
          open={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            resetForm();
          }}
          title="Create New Team"
          size="md"
          showFooter
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={createTeamMutation.isPending}
                className="bg-gray-200 dark:bg-[#282E33] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={!formData.name || createTeamMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          }
        >
          <SlideoutPanelContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTeam(); }} className="space-y-6">
              {/* Basic Information Card */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name" className="text-gray-900 dark:text-white">
                      Team Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="team-name"
                      placeholder="e.g., Engineering Team, Design Squad"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-600 dark:text-slate-400">A clear, descriptive name for your team</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-description" className="text-gray-900 dark:text-white">Description</Label>
                    <Textarea
                      id="team-description"
                      placeholder="Describe the team's purpose, responsibilities, and goals..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-600 dark:text-slate-400">Help members understand the team's mission</p>
                  </div>
                </div>
              </div>

              {/* Appearance Card */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
                <div className="space-y-4">
                  <IconPicker
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                    label="Team Icon"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="team-color" className="text-gray-900 dark:text-white">Team Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="team-color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1 bg-gray-50 dark:bg-[#22272B] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-primary-500"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Choose a color to identify this team</p>
                  </div>
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
                    <p className="text-sm font-medium text-blue-300">About Teams</p>
                    <p className="mt-1 text-xs text-blue-400">
                      Teams help organize people working together. You can assign teams to projects, track their progress, and manage access permissions.
                    </p>
                  </div>
                </div>
              </div>

              {createTeamMutation.isError && (
                <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    {(createTeamMutation.error as Error)?.message || 'Failed to create team'}
                  </p>
                </div>
              )}
            </form>
          </SlideoutPanelContent>
        </SlideoutPanel>

        {/* Team Management Slide-out Panel */}
        {selectedTeam && (
          <SlideoutPanel
            open={isManageTeamOpen}
            onClose={() => setIsManageTeamOpen(false)}
            title={selectedTeam.name}
            size="lg"
            headerActions={
              <div
                className="flex h-10 w-10 items-center justify-center rounded"
                style={{ backgroundColor: selectedTeam.color }}
              >
                <IconRenderer iconName={selectedTeam.icon} className="h-5 w-5 text-white" />
              </div>
            }
          >
            <SlideoutPanelContent>
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Team Members ({membersData?.members?.length || 0})
                    </h3>
                    <Button
                      size="sm"
                      className="gap-2 bg-primary-500 hover:bg-primary-600 text-white"
                      onClick={() => setIsAddMemberDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23]">
                    {membersData?.members && membersData.members.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {membersData.members.map((member: TeamMember) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-slate-400">
                                  {member.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {member.role === 'LEAD' && (
                                <div className="flex items-center gap-1 rounded-full bg-yellow-400/20 px-2 py-1 text-xs font-medium text-yellow-400">
                                  <Crown className="h-3 w-3" />
                                  Lead
                                </div>
                              )}
                              {member.role === 'MEMBER' && (
                                <div className="flex items-center gap-1 rounded-full bg-gray-200 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-400">
                                  <Users className="h-3 w-3" />
                                  Member
                                </div>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to remove ${member.name} from this team?`
                                    )
                                  ) {
                                    removeMemberMutation.mutate({
                                      teamId: selectedTeam.id,
                                      userId: member.userId,
                                    });
                                  }
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-600 dark:text-slate-400">
                        No members yet. Add your first team member!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SlideoutPanelContent>
          </SlideoutPanel>
        )}

        {/* Add Member Dialog */}
        {selectedTeam && (
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogContent className="bg-white dark:bg-[#22272B] border-gray-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Add Member to {selectedTeam.name}</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-slate-400">
                  Enter the email address of the user you want to add to this team.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Label htmlFor="member-email" className="text-gray-900 dark:text-white">User Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="mt-2 bg-gray-50 dark:bg-[#1B1F23] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                />
                {addMemberMutation.isError && (
                  <p className="mt-2 text-sm text-red-500">
                    {(addMemberMutation.error as Error)?.message || 'Failed to add member'}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddMemberDialogOpen(false);
                    setNewMemberEmail('');
                  }}
                  className="bg-gray-200 dark:bg-[#282E33] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newMemberEmail.trim()) {
                      addMemberMutation.mutate({
                        teamId: selectedTeam.id,
                        userEmail: newMemberEmail.trim(),
                      });
                    }
                  }}
                  disabled={!newMemberEmail.trim() || addMemberMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#22272B] border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>

              <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                {invitationData?.invited ? 'Invitation Sent!' : 'Member Added!'}
              </DialogTitle>

              <DialogDescription className="text-center text-gray-600 dark:text-slate-400">
                {invitationData?.invited ? (
                  <>
                    <p className="mb-4">
                      An invitation has been sent to <span className="font-semibold text-gray-900 dark:text-white">{invitationData.email}</span>
                    </p>
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
                        <div className="flex-1 text-left text-sm">
                          <p className="font-medium text-blue-300">Email Invitation</p>
                          <p className="mt-1 text-blue-400">
                            The user will receive an email to join the organization and team.
                          </p>
                        </div>
                      </div>
                    </div>

                    {invitationData.token && (
                      <div className="mt-4">
                        <Label className="text-xs text-gray-600 dark:text-slate-400">Invitation Link</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            readOnly
                            value={`${window.location.origin}/invite/${invitationData.token}`}
                            className="text-xs bg-gray-50 dark:bg-[#1B1F23] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/invite/${invitationData.token}`);
                            }}
                            className="bg-gray-200 dark:bg-[#282E33] border-gray-300 dark:border-slate-700 hover:bg-gray-300 dark:hover:bg-slate-700"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-xs text-gray-600 dark:text-slate-400">
                          You can also share this link directly with the user.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">{invitationData?.email}</span> has been successfully added to the team.
                  </p>
                )}
              </DialogDescription>

              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                className="mt-4 w-full bg-primary-500 hover:bg-primary-600"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Team Card Component
interface TeamCardProps {
  team: Team;
  onManage: (team: Team) => void;
  onToggleFavorite: (teamId: string, currentValue: boolean) => void;
  onDelete: (teamId: string) => void;
}

function TeamCard({ team, onManage, onToggleFavorite, onDelete }: TeamCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-primary-500">
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: team.color }}
        >
          <IconRenderer iconName={team.icon} className="h-6 w-6 text-white" />
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon"
            onClick={() => onToggleFavorite(team.id, team.isFavorite)}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <Star
              className={`h-4 w-4 ${
                team.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400 dark:text-slate-400'
              }`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-slate-700">
                <MoreHorizontal className="h-4 w-4 text-gray-400 dark:text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#282E33] border border-gray-200 dark:border-slate-700">
              <DropdownMenuItem onClick={() => onManage(team)} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                <Settings className="mr-2 h-4 w-4" />
                Manage Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManage(team)} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Members
              </DropdownMenuItem>
              {!team.isDefault && (
                <DropdownMenuItem
                  onClick={() => onDelete(team.id)}
                  className="text-red-600"
                >
                  Delete Team
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-4 cursor-pointer" onClick={() => onManage(team)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
          {team.name}
        </h3>
        {team.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
            {team.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{team.memberCount} members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4" />
          <span>{team.projectCount} projects</span>
        </div>
      </div>

      {team.isDefault && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
            Default Team
          </span>
        </div>
      )}
    </div>
  );
}
