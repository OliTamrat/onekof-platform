'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, Loader2, Users, Crown, Shield, Sparkles, LogOut, FolderKanban, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
  type?: string | null;
  memberCount?: number;
}

const ROLE_CONFIG = {
  OWNER: { icon: Crown, color: 'amber', label: 'Owner' },
  ADMIN: { icon: Shield, color: 'purple', label: 'Admin' },
  MEMBER: { icon: Users, color: 'blue', label: 'Member' },
};

const PLAN_CONFIG = {
  ENTERPRISE: { color: 'emerald', label: 'Enterprise' },
  PROFESSIONAL: { color: 'blue', label: 'Professional' },
  FREE: { color: 'gray', label: 'Free' },
};

export default function SelectOrganizationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrg, setHoveredOrg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchOrganizations();
    }
  }, [status, router]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/user/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = async (org: Organization) => {
    // Set default organization (fire-and-forget — don't block navigation)
    fetch('/api/user/default-organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: org.id }),
    }).catch((error) => {
      console.error('Failed to set default organization:', error);
    });

    // Redirect based on environment
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const hostname = window.location.hostname;

    // For Vercel deployments (*.vercel.app) - use path-based routing
    if (hostname.includes('vercel.app')) {
      router.push('/dashboard');
    }
    // For custom domain production (onekof.com) - use subdomain
    else if (hostname.includes('onekof.com') && hostname !== 'localhost') {
      window.location.href = `${protocol}//${org.slug}.onekof.com/dashboard`;
    }
    // For local development - use path-based routing (subdomain DNS often not configured)
    else {
      router.push('/dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#1B1F23]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1C8C7D] mx-auto mb-4" />
          <p className="text-slate-400 text-sm">{t('selectOrg.loadingOrgs')}</p>
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[organizations[0]?.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.MEMBER;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#1B1F23] relative overflow-hidden">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Ethiopian flag accent */}
      <div className="absolute top-0 left-0 right-0 h-1 flex z-50">
        <div className="flex-1 bg-[#078930]" />
        <div className="flex-1 bg-[#FCDD09]" />
        <div className="flex-1 bg-[#DA121A]" />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#1C8C7D]/20 to-emerald-600/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[#1C8C7D]/15 to-primary-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 pt-8">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C8C7D] to-emerald-600 shadow-lg">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">Onekof</h1>
                <p className="text-sm text-slate-400">Enterprise Project Management</p>
              </div>
            </div>

            {/* Greeting */}
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-white mb-3">
                {t('selectOrg.welcomeBackName', { name: session?.user?.name?.split(' ')[0] || '' })}
              </h2>
              <p className="text-lg text-slate-300">
                {t('selectOrg.selectWorkspace')}
              </p>
            </div>
          </div>

          {/* Organizations Grid */}
          {organizations.length === 0 ? (
            <div className="rounded-2xl bg-[#22272B]/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl p-12 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1C8C7D]/10 mb-6">
                <Building2 className="h-10 w-10 text-[#1C8C7D]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Organizations Yet</h3>
              <p className="text-slate-400 mb-6">
                You haven&apos;t been added to any organizations yet.
              </p>
              <div className="rounded-xl bg-[#1C8C7D]/10 border border-[#1C8C7D]/20 p-4 mb-6 text-left">
                <p className="text-sm text-[#1C8C7D] font-medium mb-1">Have a pending invitation?</p>
                <p className="text-sm text-slate-400">
                  Check your email for an invitation link to join an existing organization.
                  Click the link in the email to accept and join.
                </p>
              </div>
              <p className="text-sm text-slate-400">
                Or create a new workspace to get started.
              </p>
              <Button
                onClick={() => router.push('/onboarding')}
                className="mt-8 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create Organization</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => {
                const roleConfig = ROLE_CONFIG[org.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.MEMBER;
                const planConfig = PLAN_CONFIG[org.plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.FREE;
                const RoleIcon = roleConfig.icon;
                const isHovered = hoveredOrg === org.id;

                return (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    onMouseEnter={() => setHoveredOrg(org.id)}
                    onMouseLeave={() => setHoveredOrg(null)}
                    className="group relative rounded-2xl bg-[#22272B]/60 backdrop-blur-xl border-2 border-slate-700/50 p-6 text-left transition-all hover:bg-[#22272B]/80 hover:border-[#1C8C7D]/50 hover:shadow-2xl hover:shadow-[#1C8C7D]/20 hover:scale-[1.02]"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1C8C7D]/5 to-emerald-600/5 opacity-0 transition-opacity ${isHovered ? 'opacity-100' : ''}`} />

                    <div className="relative">
                      {/* Header with Icon and Arrow */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D]/20 to-emerald-600/20 border border-[#1C8C7D]/30">
                          {org.type === 'personal' ? (
                            <User className="h-7 w-7 text-[#1C8C7D]" />
                          ) : (
                            <Building2 className="h-7 w-7 text-[#1C8C7D]" />
                          )}
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#1C8C7D]/10 border border-[#1C8C7D]/30 transition-all ${isHovered ? 'bg-[#1C8C7D] border-[#1C8C7D]' : ''}`}>
                          <ArrowRight className={`h-5 w-5 transition-all ${isHovered ? 'text-white translate-x-1' : 'text-[#1C8C7D]'}`} />
                        </div>
                      </div>

                      {/* Organization Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#1C8C7D] transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-mono">
                          {org.slug}.onekof.com
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {org.type === 'personal' ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 px-3 py-1.5">
                            <User className="h-3.5 w-3.5 text-primary-400" />
                            <span className="text-xs font-semibold text-primary-300">Personal</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5">
                            <Building2 className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-xs font-semibold text-blue-300">Organization</span>
                          </div>
                        )}
                        <div className={`inline-flex items-center gap-1.5 rounded-lg bg-${roleConfig.color}-500/10 border border-${roleConfig.color}-500/20 px-3 py-1.5`}>
                          <RoleIcon className={`h-3.5 w-3.5 text-${roleConfig.color}-400`} />
                          <span className={`text-xs font-semibold text-${roleConfig.color}-300`}>
                            {roleConfig.label}
                          </span>
                        </div>
                        <div className={`inline-flex items-center rounded-lg bg-${planConfig.color}-500/10 border border-${planConfig.color}-500/20 px-3 py-1.5`}>
                          <span className={`text-xs font-semibold text-${planConfig.color}-300`}>
                            {planConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Member count if available */}
                      {org.memberCount && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{org.memberCount} members</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Create New Project Card */}
              <button
                onClick={() => router.push('/dashboard/projects?create=true')}
                className="group relative rounded-2xl border-2 border-dashed border-slate-700/50 p-6 text-center transition-all hover:border-[#1C8C7D]/50 hover:bg-[#22272B]/40"
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1C8C7D]/10 border border-[#1C8C7D]/30 mb-4 group-hover:bg-[#1C8C7D]/20 transition-colors">
                    <FolderKanban className="h-7 w-7 text-[#1C8C7D]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1C8C7D] transition-colors">
                    Create Project
                  </h3>
                  <p className="text-sm text-slate-400">
                    Start a new project
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sm text-slate-400 hover:text-white hover:bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              © 2026 Onekof. Built with ❤️ for Ethiopia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
