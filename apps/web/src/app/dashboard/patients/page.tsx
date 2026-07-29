'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, ShieldAlert, Lock, Search, Globe2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface MedicalStatus {
  residency: { tier: 1 | 2 | 3; location: string; canHoldPatientData: boolean };
  access: { level: string | null; canSeeIdentifiers: boolean; canRegister: boolean };
}

interface Patient {
  id: string;
  identifier?: string;
  displayName?: string;
  birthYear: number | null;
  erased: boolean;
  lastActivityAt?: string | null;
  identifiersVisible: boolean;
}

/**
 * M3 — the patient registry, surfaced.
 *
 * The page asks /api/medical/status BEFORE asking for patients, because three
 * different reasons produce an empty list and only one of them is "no
 * patients yet":
 *
 *   - the deployment may not hold patient data (Tier 3)
 *   - the member holds no patient access (organization role confers none)
 *   - there genuinely are no patients
 *
 * A bare empty state for the first two would tell a nurse the ward has no
 * patients, when the truth is that this screen cannot show them.
 */
export default function PatientsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data: status, isLoading: statusLoading } = useQuery<MedicalStatus>({
    queryKey: ['medical-status'],
    queryFn: async () => {
      const res = await fetch('/api/medical/status');
      if (!res.ok) throw new Error('status');
      return res.json();
    },
  });

  const eligible = Boolean(status?.residency.canHoldPatientData);
  const hasAccess = Boolean(status?.access.level && status.access.level !== 'NO_ACCESS');

  const { data, isLoading } = useQuery<{ patients: Patient[] }>({
    // Only asked once the answer can mean something. On an ineligible
    // deployment this request 404s by design, and a 404 is not something a
    // screen can explain to anybody.
    enabled: eligible && hasAccess,
    queryKey: ['patients', submitted],
    queryFn: async () => {
      const qs = submitted ? `?identifier=${encodeURIComponent(submitted)}` : '';
      const res = await fetch(`/api/patients${qs}`);
      if (!res.ok) throw new Error('patients');
      return res.json();
    },
  });

  const patients = data?.patients ?? [];

  if (statusLoading) {
    return <div className="p-8 text-sm text-slate-500">{t('common.loading')}</div>;
  }

  // ---- The deployment itself may not hold patient data -------------------
  // Deliberately not an error. The platform is behaving correctly and the
  // user has done nothing wrong, so this explains rather than warns.
  if (!eligible) {
    return (
      <div className="p-8">
        <Header t={t} />
        <div className="mt-8 max-w-2xl rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-6">
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t('medical.residencyBlockedTitle')}
              </h2>
              <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-200/80">
                {t('medical.residencyBlockedBody')}
              </p>
              <p className="mt-3 text-xs font-mono text-amber-800/70 dark:text-amber-300/70">
                {status?.residency.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Eligible deployment, but this member holds no grant ---------------
  if (!hasAccess) {
    return (
      <div className="p-8">
        <Header t={t} />
        <div className="mt-8 max-w-2xl rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('medical.noAccessTitle')}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('medical.noAccessBody')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Header t={t} />

      {/* Lookup is by exact identifier, never by name. The blind index matches
          a normalised identifier and nothing else, so a box implying partial
          or name matching would promise what the storage design cannot do. */}
      <form
        className="mt-6 flex flex-wrap gap-2 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('medical.lookupPlaceholder')}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" variant="default">{t('medical.lookup')}</Button>
        {submitted && (
          <Button type="button" variant="ghost" onClick={() => { setQuery(''); setSubmitted(''); }}>
            {t('common.clear')}
          </Button>
        )}
      </form>

      {!status?.access.canSeeIdentifiers && (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          {t('medical.limitedNotice')}
        </p>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-slate-500">{t('common.loading')}</p>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={submitted ? t('medical.noMatch') : t('emptyStates.noPatients')}
          description={submitted ? t('medical.noMatchDesc') : t('emptyStates.noPatientsDesc')}
          className="mt-8"
        />
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
          {patients.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {/* Below FULL the API returns no name at all. Showing the
                      record id instead would be worse than saying so. */}
                  {p.identifiersVisible
                    ? p.displayName || t('medical.unnamed')
                    : t('medical.identityWithheld')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {p.identifiersVisible && p.identifier ? `${p.identifier} · ` : ''}
                  {/* Birth YEAR only — the record never holds a full date. */}
                  {p.birthYear
                    ? t('medical.bornIn').replace('{year}', String(p.birthYear))
                    : t('medical.birthYearUnknown')}
                </p>
              </div>
              {p.erased && (
                <span className="shrink-0 rounded px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {t('medical.erased')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Header({ t }: { t: (k: string) => string }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('patientsPage.title')}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('patientsPage.description')}</p>
    </>
  );
}
