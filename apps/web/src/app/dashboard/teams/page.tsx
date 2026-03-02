'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, Settings, MoreHorizontal, UserPlus, Crown, Shield, Star, CheckCircle2, Mail, Copy } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
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

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isManageTeamOpen, setIsManageTeamOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<{ email: string; token: string; invited: boolean } | null>(null);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '👥',
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
    mutationFn: async ({ teamId, ...data }: { teamId: string } & Partial<typeof formData>) => {
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

      // Show success modal with invitation details
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
      icon: '👥',
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
    });
  };

  // Filter teams
  const filteredTeams = teamsData?.teams?.filter((team: Team) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  }) || [];

  const favoriteTeams = filteredTeams.filter((t: Team) => t.isFavorite);
  const otherTeams = filteredTeams.filter((t: Team) => !t.isFavorite);

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-slate-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#22272B]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Teams
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Organize your workspace into teams to collaborate more effectively
              </p>
            </div>

            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-500">Loading teams...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Favorite Teams */}
              {favoriteTeams.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {favoriteTeams.length > 0 ? 'ALL TEAMS' : 'YOUR TEAMS'}
                </h2>
                {otherTeams.length > 0 ? (
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
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
                    <Users className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                      No teams found
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create your first team to get started
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Create Team
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Team Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to organize your projects and collaborate with members.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name *</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Engineering, Design, Marketing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  placeholder="What does this team work on?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team-icon">Icon</Label>
                  <Input
                    id="team-icon"
                    placeholder="👥"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-color">Color</Label>
                  <Input
                    id="team-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={!formData.name || createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Team Dialog */}
        {selectedTeam && (
          <Dialog open={isManageTeamOpen} onOpenChange={setIsManageTeamOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded text-xl"
                    style={{ backgroundColor: selectedTeam.color }}
                  >
                    {selectedTeam.icon}
                  </div>
                  {selectedTeam.name}
                </DialogTitle>
                <DialogDescription>
                  Manage team members, settings, and permissions
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Team Members ({membersData?.members?.length || 0})
                  </h3>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsAddMemberDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                {/* Member list */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700">
                  {membersData?.members && membersData.members.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                      {membersData.members.map((member: TeamMember) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-semibold text-white">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {member.role === 'LEAD' && (
                              <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Crown className="h-3 w-3" />
                                Lead
                              </div>
                            )}
                            {member.role === 'MEMBER' && (
                              <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
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
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No members yet. Add your first team member!
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Member Dialog */}
        {selectedTeam && (
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member to {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Enter the email address of the user you want to add to this team.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Label htmlFor="member-email">User Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="mt-2"
                />
                {addMemberMutation.isError && (
                  <p className="mt-2 text-sm text-red-600">
                    {addMemberMutation.error?.message || 'Failed to add member'}
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
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center gap-4 py-6">
              {/* Success Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              {/* Title */}
              <DialogTitle className="text-center text-2xl font-bold">
                {invitationData?.invited ? 'Invitation Sent!' : 'Member Added!'}
              </DialogTitle>

              {/* Message */}
              <DialogDescription className="text-center">
                {invitationData?.invited ? (
                  <>
                    <p className="mb-4">
                      An invitation has been sent to <span className="font-semibold text-gray-900 dark:text-white">{invitationData.email}</span>
                    </p>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1 text-left text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">Email Invitation</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-300">
                            The user will receive an email to join the organization and team.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Invitation Link */}
                    {invitationData.token && (
                      <div className="mt-4">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Invitation Link</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            readOnly
                            value={`${window.location.origin}/invite/${invitationData.token}`}
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/invite/${invitationData.token}`);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
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

              {/* Action Button */}
              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                className="mt-4 w-full"
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
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-[#22272B]">
      {/* Team Icon & Color */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
          style={{ backgroundColor: team.color }}
        >
          {team.icon}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onToggleFavorite(team.id, team.isFavorite)}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Star
              className={`h-4 w-4 ${
                team.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManage(team)}>
                <Settings className="mr-2 h-4 w-4" />
                Manage Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManage(team)}>
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

      {/* Team Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {team.name}
        </h3>
        {team.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {team.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{team.memberCount} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>{team.projectCount} projects</span>
        </div>
      </div>

      {/* Default badge */}
      {team.isDefault && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Default Team
          </span>
        </div>
      )}
    </div>
  );
}
