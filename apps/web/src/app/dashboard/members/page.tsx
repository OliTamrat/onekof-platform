'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
import { useLanguage } from '@/contexts/language-context';
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
  const { currentOrganization } = useWorkspace();
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN' | 'GUEST'>('MEMBER');
  const [showInviteForm, setShowInviteForm] = useState(false);
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
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      setInviteEmail('');
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
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  const isLoading = loadingMembers || loadingInvitations;

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                <Users className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h1>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                  {pendingInvitations.length > 0 && ` · ${pendingInvitations.length} pending`}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name or email..."
              className="pl-9 bg-gray-50 dark:bg-[#1B1F23] border-gray-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 space-y-4">
          {/* Invite Form */}
          {showInviteForm && (
            <div className="rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-primary-500" />
                Invite by Email
              </h3>
              <p className="mb-3 text-xs text-gray-600 dark:text-slate-400">
                Invite anyone to your organization — they don&apos;t need an existing account. An invitation email will be sent with a link to join.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="flex-1 bg-white dark:bg-[#22272B] border-gray-200 dark:border-slate-700"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="h-10 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 text-sm text-gray-900 dark:text-white"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="GUEST">Guest</option>
                </select>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviteMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1 h-4 w-4" />
                      Send
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
                  Invitation sent successfully!
                </div>
              )}
            </div>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Pending Invitations ({pendingInvitations.length})
              </h2>
              <div className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.email}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
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
                        title="Revoke invitation"
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
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {searchQuery ? 'No members match your search' : 'No members yet'}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Active Members ({filteredMembers.length})
              </h2>
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50 dark:bg-[#1B1F23] border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                        Budget Access
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors">
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
                                {member.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
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
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400 hidden sm:table-cell">
                          {member.budgetAccess?.replace(/_/g, ' ') || 'No Access'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-gray-500 dark:text-slate-400">
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
