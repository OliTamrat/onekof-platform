'use client';

import { useQuery } from '@tanstack/react-query';
import {
  UsersRound,
  Crown,
  ShieldCheck,
  Eye,
  Loader2,
  Copy,
  CheckCircle2,
  Info,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface TeamMember {
  username: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

export default function AdminTeamPage() {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const ROLE_CONFIG = {
    OWNER: {
      label: t('admin.ownerRole'),
      description: t('admin.ownerRoleDesc'),
      icon: Crown,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      gradient: 'from-amber-500 to-orange-500',
    },
    ADMIN: {
      label: t('admin.adminRole'),
      description: t('admin.adminRoleDesc'),
      icon: ShieldCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      gradient: 'from-purple-500 to-indigo-500',
    },
    VIEWER: {
      label: t('admin.viewerRole'),
      description: t('admin.viewerRoleDesc'),
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      gradient: 'from-blue-500 to-cyan-500',
    },
  };

  const { data, isLoading } = useQuery<{ team: TeamMember[] }>({
    queryKey: ['admin', 'team'],
    queryFn: async () => {
      const res = await fetch('/api/admin/team');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const team = data?.team || [];

  const exampleJson = JSON.stringify([
    { username: 'oli', password: 'YourSecurePassword', role: 'OWNER', name: 'Oli Tamrat' },
    { username: 'admin2', password: 'AnotherPassword', role: 'ADMIN', name: 'Team Member' },
    { username: 'viewer1', password: 'ViewerPassword', role: 'VIEWER', name: 'Read Only User' },
  ], null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ownerCount = team.filter(m => m.role === 'OWNER').length;
  const adminCount = team.filter(m => m.role === 'ADMIN').length;
  const viewerCount = team.filter(m => m.role === 'VIEWER').length;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
          <UsersRound className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('admin.adminTeam')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('admin.manageAdminAccess')} &middot; {team.length} {team.length !== 1 ? t('admin.membersCount', { count: team.length }).replace(`${team.length} `, '') : t('admin.memberCount', { count: team.length }).replace(`${team.length} `, '')}
          </p>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(ROLE_CONFIG) as [keyof typeof ROLE_CONFIG, typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([role, config]) => {
          const RoleIcon = config.icon;
          const count = role === 'OWNER' ? ownerCount : role === 'ADMIN' ? adminCount : viewerCount;
          return (
            <div key={role} className={cn('rounded-xl border p-4', config.border, config.bg)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RoleIcon className={cn('h-4 w-4', config.color)} />
                  <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
                </div>
                <span className={cn('text-lg font-bold', config.color)}>{count}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{config.description}</p>
            </div>
          );
        })}
      </div>

      {/* Current team */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('admin.currentTeamMembers')}</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-500" />
              <p className="mt-2 text-xs text-slate-400">{t('admin.loadingTeam')}</p>
            </div>
          </div>
        ) : team.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
            <UsersRound className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{t('admin.noAdminUsers')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('admin.addAdminUsersDesc')}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {team.map((member, index) => {
              const config = ROLE_CONFIG[member.role];
              const RoleIcon = config.icon;
              return (
                <div key={member.username} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#1B1F23] transition-colors">
                  <div className={cn('h-10 w-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0', config.gradient)}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">@{member.username}</p>
                  </div>
                  <div className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5', config.bg, config.border)}>
                    <RoleIcon className={cn('h-3.5 w-3.5', config.color)} />
                    <span className={cn('text-xs font-bold', config.color)}>{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How to manage admins */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 shrink-0">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              {t('admin.howToAddAdmins')}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed mb-4">
              {t('admin.adminUsersExplanation')}
            </p>

            <div className="rounded-lg bg-white dark:bg-[#1B1F23] border border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#22272B] border-b border-blue-200 dark:border-blue-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.exampleValue')}</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1.5">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>
              <pre className="p-3 text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto font-mono leading-relaxed">
                {exampleJson}
              </pre>
            </div>

            <div className="mt-4 space-y-1.5">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{t('admin.steps')}</p>
              <ol className="text-[11px] text-blue-700 dark:text-blue-400 space-y-1 list-decimal pl-4">
                <li>{t('admin.step1')}</li>
                <li>{t('admin.step2')}</li>
                <li>{t('admin.step3')}</li>
                <li>{t('admin.step4')}</li>
                <li>{t('admin.step5')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
