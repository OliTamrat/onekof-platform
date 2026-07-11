'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UpgradeBanner, LimitBadge } from '@/components/upgrade-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  UserPlus,
  Send,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
  budgetAccess?: string | null;
  joinedAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export default function MembersPage() {
  const { t } = useLanguage();
  const { currentOrganization, projects } = useWorkspace();
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN' | 'GUEST'>('MEMBER');
  const [inviteProjectId, setInviteProjectId] = useState('');
  const [inviteProjectRole, setInviteProjectRole] = useState<'MEMBER' | 'ADMIN' | 'VIEWER'>('MEMBER');
  const [showInviteForm, setShowInviteForm] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('invite') === 'true';
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const organizationId = currentOrganization?.id;

  // Fetch organization members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['organization-members'],
    queryFn: async () => {
      const res = await fetch('/api/organization-members');
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });

  // Fetch pending invitations
  const { data: invitationsData, isLoading: loadingInvitations } = useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return { invitations: [] };
      const res = await fetch(`/api/organizations/${organizationId}/invitations`);
      if (!res.ok) throw new Error('Failed to fetch invitations');
      return res.json();
    },
    enabled: !!organizationId,
  });

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (payload: { email: string; role: string; projectId?: string; projectRole?: string }) => {
      const res = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      setInviteEmail('');
      setInviteProjectId('');
      setShowInviteForm(false);
    },
  });

  // Revoke invitation mutation
  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(
        `/api/organizations/${organizationId}/invitations?invitationId=${invitationId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to revoke invitation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
    },
  });

  const members: OrganizationMember[] = membersData?.members || [];
  const invitations: PendingInvitation[] = invitationsData?.invitations || [];
  const pendingInvitations = invitations.filter((i) => !i.isExpired);

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-3.5 w-3.5" />;
      case 'ADMIN': return <Shield className="h-3.5 w-3.5" />;
      case 'GUEST': return <User className="h-3.5 w-3.5" />;
      default: return <User className="h-3.5 w-3.5" />;
    }
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'GUEST': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const payload: { email: string; role: string; projectId?: string; projectRole?: string } = {
      email: inviteEmail.trim(),
      role: inviteRole,
    };
    if (inviteProjectId) {
      payload.projectId = inviteProjectId;
      payload.projectRole = inviteProjectRole;
    }
    inviteMutation.mutate(payload);
  };

  const isLoading = loadingMembers || loadingInvitations;

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                <Users className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t('membersPage.title')}</h1>
                <p className="text-xs text-gray-600 dark:text-white/70">
                  {members.length} {members.length === 1 ? t('membersPage.member') : t('membersPage.memberPlural')}
                  {pendingInvitations.length > 0 && ` · ${pendingInvitations.length} pending`}
                  {' '}<LimitBadge resource="members" />
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('membersPage.inviteMember')}
            </Button>
          </div>

          <div className="mt-3">
            <UpgradeBanner resource="members" />
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('membersPage.searchPlaceholder')}
              className="pl-9 bg-gray-50 dark:bg-[#0B0E11] border-gray-200 dark:border-white/[0.08]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 space-y-4">
          {/* Invite Form */}
          {showInviteForm && (
            <div className="rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-primary-500" />
                {t('membersPage.inviteByEmail')}
              </h3>
              <p className="mb-3 text-xs text-gray-600 dark:text-white/70">
                {t('membersPage.inviteDesc')}
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-1 bg-white dark:bg-[#12161B] border-gray-200 dark:border-white/[0.08]"
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="h-10 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="MEMBER">{t('membersPage.roleMember')}</option>
                    <option value="ADMIN">{t('membersPage.roleAdmin')}</option>
                    <option value="GUEST">{t('membersPage.roleGuest')}</option>
                  </select>
                </div>

                {projects.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={inviteProjectId}
                      onChange={(e) => {
                        setInviteProjectId(e.target.value);
                        if (e.target.value) setInviteRole('GUEST');
                      }}
                      className="flex-1 h-10 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="">{t('membersPage.allProjects')}</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {inviteProjectId && (
                      <select
                        value={inviteProjectRole}
                        onChange={(e) => setInviteProjectRole(e.target.value as any)}
                        className="h-10 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 text-sm text-gray-900 dark:text-white"
                      >
                        <option value="VIEWER">{t('membersPage.projectViewer')}</option>
                        <option value="MEMBER">{t('membersPage.projectMember')}</option>
                        <option value="ADMIN">{t('membersPage.projectAdmin')}</option>
                      </select>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviteMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white w-full sm:w-auto self-end"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1 h-4 w-4" />
                      {t('membersPage.send')}
                    </>
                  )}
                </Button>
              </div>
              {inviteMutation.isError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {inviteMutation.error?.message}
                </div>
              )}
              {inviteMutation.isSuccess && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('membersPage.inviteSuccess')}
                </div>
              )}
            </div>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/70 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {t('membersPage.pendingInvitations')} ({pendingInvitations.length})
              </h2>
              <div className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-white/[0.08]">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-white/70" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.email}</p>
                        <p className="text-xs text-gray-500 dark:text-white/70">
                          Invited by {inv.invitedBy} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClasses(inv.role)}`}>
                        {inv.role}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeMutation.mutate(inv.id)}
                        disabled={revokeMutation.isPending}
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/10"
                        title={t('membersPage.revokeInvitation')}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-gray-600 dark:text-white/70">
                {searchQuery ? t('membersPage.noMembersSearch') : t('membersPage.noMembers')}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/70">
                {t('membersPage.activeMembers')} ({filteredMembers.length})
              </h2>
              <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50 dark:bg-[#0B0E11] border-b border-gray-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('membersPage.colMember')}
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('membersPage.colRole')}
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider hidden sm:table-cell">
                        {t('membersPage.colBudgetAccess')}
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider hidden md:table-cell">
                        {t('membersPage.colJoined')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#181D23] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {member.avatar ? (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={member.avatar}
                                  alt={member.name}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold">
                                  {(member.name || member.email).charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {member.name || t('membersPage.unknown')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-white/70 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClasses(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-white/70 hidden sm:table-cell">
                          {member.budgetAccess?.replace(/_/g, ' ') || t('membersPage.noAccess')}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-gray-500 dark:text-white/70">
                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
