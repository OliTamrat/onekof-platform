'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { useWorkspace } from '@/contexts/workspace-context';

/**
 * Shows a contextual upgrade banner when the current org is on the FREE plan
 * and approaching or at plan limits.
 *
 * Usage: <UpgradeBanner resource="members" /> or <UpgradeBanner resource="projects" />
 *
 * Shows nothing if:
 * - Org is on a paid plan
 * - Usage is below 80% of limit
 * - Org data not yet loaded
 */
export function UpgradeBanner({ resource }: { resource: 'members' | 'projects' }) {
  const { currentOrganization } = useWorkspace();
  if (!currentOrganization) return null;

  const plan = currentOrganization.plan || 'FREE';
  if (plan !== 'FREE') return null;

  const current = resource === 'members'
    ? (currentOrganization.memberCount ?? 0)
    : (currentOrganization.projectCount ?? 0);
  const max = resource === 'members'
    ? (currentOrganization.maxMembers ?? 5)
    : (currentOrganization.maxProjects ?? 3);

  const pct = max > 0 ? (current / max) * 100 : 0;

  // Don't show if under 80% usage
  if (pct < 80) return null;

  const atLimit = current >= max;
  const label = resource === 'members' ? 'team members' : 'projects';

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
      atLimit
        ? 'border-amber-500/20 bg-amber-500/[0.06]'
        : 'border-primary-500/15 bg-primary-500/[0.04]'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          atLimit ? 'bg-amber-500/15' : 'bg-primary-500/10'
        }`}>
          <Zap className={`h-4 w-4 ${atLimit ? 'text-amber-400' : 'text-primary-400'}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-[14px] font-medium ${atLimit ? 'text-amber-300' : 'text-white'}`}>
            {atLimit
              ? `You've reached the limit of ${max} ${label}`
              : `${current} of ${max} ${label} used`
            }
          </p>
          <p className="text-[13px] text-white/60">
            {atLimit
              ? `Upgrade to add more ${label} and unlock premium features.`
              : `You're approaching your Free plan limit.`
            }
          </p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-500 to-[#2BB5A2] px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-primary-500/15 transition-all hover:shadow-xl hover:brightness-110"
      >
        Upgrade
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/**
 * Inline limit indicator — shows "3/3 projects" with color coding.
 * Use next to "Create" buttons.
 */
export function LimitBadge({ resource }: { resource: 'members' | 'projects' }) {
  const { currentOrganization } = useWorkspace();
  if (!currentOrganization) return null;

  const plan = currentOrganization.plan || 'FREE';
  if (plan !== 'FREE') return null;

  const current = resource === 'members'
    ? (currentOrganization.memberCount ?? 0)
    : (currentOrganization.projectCount ?? 0);
  const max = resource === 'members'
    ? (currentOrganization.maxMembers ?? 5)
    : (currentOrganization.maxProjects ?? 3);

  const pct = max > 0 ? (current / max) * 100 : 0;
  const color = pct >= 100
    ? 'text-amber-400'
    : pct >= 80
      ? 'text-yellow-400'
      : 'text-white/50';

  return (
    <span className={`text-[13px] font-medium ${color}`}>
      {current}/{max}
    </span>
  );
}
