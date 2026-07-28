'use client';

/**
 * Legacy-organization banner (D9).
 *
 * Organizations created before onboarding captured the organization type
 * silently fall back to the Business edition. Their admins get one
 * dismissible prompt to choose the right industry edition — no forced
 * migration, no change to what they currently see.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, X } from 'lucide-react';
import { useWorkspace } from '@/contexts/workspace-context';
import { useLanguage } from '@/contexts/language-context';

const DISMISS_KEY = 'onekof-org-type-banner-dismissed';

export function ChooseOrgTypeBanner() {
  const { currentOrganization, userRole } = useWorkspace();
  const { t } = useLanguage();
  // Assume dismissed until localStorage is read, so the banner never flashes
  const [dismissed, setDismissed] = useState(true);

  const orgId = currentOrganization?.id;
  const orgType = (currentOrganization as unknown as Record<string, unknown> | null)?.type;
  const isAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    if (!orgId) return;
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setDismissed(list.includes(orgId));
    } catch {
      setDismissed(false);
    }
  }, [orgId]);

  const dismiss = () => {
    setDismissed(true);
    if (!orgId) return;
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      window.localStorage.setItem(DISMISS_KEY, JSON.stringify([...new Set([...list, orgId])]));
    } catch {
      /* dismissal is a convenience, never a failure path */
    }
  };

  if (!orgId || orgType || !isAdmin || dismissed) return null;

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-primary-200 dark:border-primary-900/40 bg-primary-50 dark:bg-primary-900/20 px-4 py-3">
      <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {t('customization.chooseOrgTypeTitle')}
        </p>
        <p className="text-xs text-gray-600 dark:text-white/70 mt-0.5">
          {t('customization.chooseOrgTypeBody')}
        </p>
        <Link
          href="/dashboard/settings/customization"
          className="inline-block mt-2 text-xs font-semibold text-primary-700 dark:text-primary-300 hover:underline"
        >
          {t('customization.chooseOrgTypeAction')}
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/80"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
