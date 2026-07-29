'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, ClipboardList, ChevronRight, Globe2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface MedicalStatus {
  residency: { tier: 1 | 2 | 3; location: string; canHoldPatientData: boolean };
  access: { level: string | null; canSeeIdentifiers: boolean; canRegister: boolean };
}

/**
 * The Medical section landing page.
 *
 * Deliberately a short index rather than a dashboard. The two things a
 * healthcare institution actually does here are "find a patient" and "see the
 * care work" — the second of which is the ordinary issue board filtered to the
 * medical department, because M7 decided care items are Tasks rather than a
 * parallel work system. Sending people to the board they already know is the
 * point of that decision, so this page links there rather than rebuilding it.
 */
export default function MedicalPage() {
  const { t } = useLanguage();

  const { data: status } = useQuery<MedicalStatus>({
    queryKey: ['medical-status'],
    queryFn: async () => {
      const res = await fetch('/api/medical/status');
      if (!res.ok) throw new Error('status');
      return res.json();
    },
  });

  const blocked = status && !status.residency.canHoldPatientData;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('medicalPage.title')}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('medicalPage.description')}</p>

      {/* Stated once, here, rather than left for the user to discover by
          clicking through to an empty list. */}
      {blocked && (
        <div className="mt-6 max-w-2xl rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t('medical.residencyBlockedTitle')}
              </p>
              <p className="mt-1 text-xs font-mono text-amber-800/70 dark:text-amber-300/70">
                {status?.residency.location}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-3xl">
        <Link
          href="/dashboard/patients"
          className="group rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-[#1C8C7D] transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <Users className="h-5 w-5 text-[#1C8C7D]" />
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#1C8C7D]" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {t('patientsPage.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('patientsPage.description')}
          </p>
        </Link>

        {/* Care work lives on the ordinary board. M7: care items are Tasks, so
            they inherit statuses, sprints, assignment, comments and reporting
            rather than duplicating them. */}
        <Link
          href="/dashboard/issues?department=medical"
          className="group rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-[#1C8C7D] transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <ClipboardList className="h-5 w-5 text-[#1C8C7D]" />
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#1C8C7D]" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {t('medical.careWorkTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('medical.careWorkDesc')}
          </p>
        </Link>
      </div>
    </div>
  );
}
