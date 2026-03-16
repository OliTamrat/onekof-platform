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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TeamMember {
  username: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

const ROLE_CONFIG = {
  OWNER: {
    label: 'Owner',
    description: 'Full access — manage admins, orgs, users, and system settings',
    icon: Crown,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Can manage organizations and users, but cannot manage admin team',
    icon: ShieldCheck,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-800',
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to dashboard, organizations, and user data',
    icon: Eye,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

export default function AdminTeamPage() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<{ team: TeamMember[] }>({
    queryKey: ['admin', 'team'],
    queryFn: async () => {
      const res = await fetch('/api/admin/team');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const team = data?.team || [];

  const exampleEnv = `ADMIN_USERS=${JSON.stringify([
    { username: 'oli', password: 'YourSecurePassword', role: 'OWNER', name: 'Oli Tamrat' },
    { username: 'admin2', password: 'AnotherPassword', role: 'ADMIN', name: 'Team Member' },
    { username: 'viewer1', password: 'ViewerPassword', role: 'VIEWER', name: 'Read Only User' },
  ])}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-amber-500" />
          Admin Team
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage who has access to the platform admin dashboard
        </p>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {(Object.entries(ROLE_CONFIG) as [keyof typeof ROLE_CONFIG, typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([role, config]) => {
          const RoleIcon = config.icon;
          return (
            <div key={role} className={cn('rounded-xl border p-4', config.border, config.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <RoleIcon className={cn('h-4 w-4', config.color)} />
                <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{config.description}</p>
            </div>
          );
        })}
      </div>

      {/* Current team */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Current Team Members</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : team.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
            <UsersRound className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No admin users configured</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {team.map(member => {
              const config = ROLE_CONFIG[member.role];
              const RoleIcon = config.icon;
              return (
                <div key={member.username} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
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

      {/* How to add/remove admins */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
              How to add or remove admin users
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed mb-4">
              Admin users are managed via the <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded font-mono text-[11px]">ADMIN_USERS</code> environment variable in Vercel.
              Update the JSON array to add, remove, or change roles for admin users, then redeploy.
            </p>

            <div className="rounded-lg bg-white dark:bg-[#1B1F23] border border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#22272B] border-b border-blue-200 dark:border-blue-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Example ADMIN_USERS value</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="p-3 text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto font-mono leading-relaxed">
{JSON.stringify([
  { username: 'oli', password: 'YourSecurePassword', role: 'OWNER', name: 'Oli Tamrat' },
  { username: 'admin2', password: 'AnotherPassword', role: 'ADMIN', name: 'Team Member' },
  { username: 'viewer1', password: 'ViewerPassword', role: 'VIEWER', name: 'Read Only User' },
], null, 2)}
              </pre>
            </div>

            <div className="mt-4 space-y-1.5">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Steps:</p>
              <ol className="text-[11px] text-blue-700 dark:text-blue-400 space-y-1 list-decimal pl-4">
                <li>Go to Vercel → Project Settings → Environment Variables</li>
                <li>Edit the <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">ADMIN_USERS</code> variable</li>
                <li>Update the JSON array (add/remove users, change roles)</li>
                <li>Use strong, unique passwords for each admin</li>
                <li>Redeploy for changes to take effect</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
