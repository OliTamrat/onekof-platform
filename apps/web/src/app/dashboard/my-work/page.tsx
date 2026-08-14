'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle, Bell, CalendarClock, ChevronRight, Clock, Inbox,
  Loader2, Star, UserCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLanguage } from '@/contexts/language-context';
import { CARD_SURFACE } from '@/components/ui/card-surface';

interface TaskCard {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
  project: { id: string; name: string; key: string; color: string | null } | null;
}

interface ProjectCard {
  id: string; name: string; key: string; color: string | null;
}

interface NotificationRow {
  id: string; title?: string | null; message?: string | null; createdAt: string;
}

interface Workspace {
  recommended: { overdue: TaskCard[]; dueSoon: TaskCard[]; notifications: NotificationRow[] };
  assigned: TaskCard[];
  starred: { tasks: TaskCard[]; projects: ProjectCard[] };
  workedOn: TaskCard[];
  viewed: TaskCard[];
  counts: { assigned: number; overdue: number; dueSoon: number; notifications: number };
}

type Tab = 'recommended' | 'assigned' | 'starred' | 'viewed';

const CARD = CARD_SURFACE;

export default function MyWorkPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('recommended');

  const { data, isLoading, error } = useQuery<Workspace>({
    queryKey: ['my-workspace'],
    queryFn: async () => {
      const res = await fetch('/api/me/workspace');
      if (!res.ok) throw new Error('Failed to load workspace');
      return res.json();
    },
  });

  const firstName = (session?.user?.name || '').split(' ')[0];

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'recommended', label: t('myWork.recommended'),
      count: (data?.counts.overdue ?? 0) + (data?.counts.dueSoon ?? 0) + (data?.counts.notifications ?? 0) },
    { id: 'assigned', label: t('myWork.assignedToMe'), count: data?.counts.assigned },
    { id: 'starred', label: t('myWork.starredAndWorkedOn'),
      count: (data?.starred.tasks.length ?? 0) + (data?.starred.projects.length ?? 0) },
    { id: 'viewed', label: t('myWork.viewed'), count: data?.viewed.length },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {firstName ? t('myWork.greetingNamed').replace('{name}', firstName) : t('myWork.greeting')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">{t('myWork.subtitle')}</p>

        {/* Tabs */}
        <div
          role="tablist"
          className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/[0.08]"
        >
          {TABS.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tb.id)}
                className={
                  'relative shrink-0 px-3 pb-2.5 pt-1 text-sm transition-colors ' +
                  (active
                    ? 'font-medium text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-white/55 dark:hover:text-white/85')
                }
              >
                {tb.label}
                {tb.count != null && tb.count > 0 && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-600 dark:bg-white/[0.08] dark:text-white/60">
                    {tb.count}
                  </span>
                )}
                {/* Underline sits on the container's border so the active tab
                    reads as continuous with the panel below it. */}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#1C8C7D]" />
                )}
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <p className="py-12 text-center text-sm text-red-600 dark:text-red-400">
            {t('myWork.loadError')}
          </p>
        )}

        {data && !isLoading && (
          <div className="mt-5 space-y-5">
            {tab === 'recommended' && (
              <>
                <Section
                  icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  title={t('myWork.overdue')}
                  empty={t('myWork.noOverdue')}
                  items={data.recommended.overdue}
                  onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                  t={t}
                />
                <Section
                  icon={<CalendarClock className="h-3.5 w-3.5 text-amber-500" />}
                  title={t('myWork.dueSoon')}
                  empty={t('myWork.nothingDueSoon')}
                  items={data.recommended.dueSoon}
                  onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                  t={t}
                />
                <div className={CARD + ' p-4'}>
                  <SectionHeading
                    icon={<Bell className="h-3.5 w-3.5 text-blue-500" />}
                    title={t('myWork.waitingOnYou')}
                  />
                  {data.recommended.notifications.length === 0 ? (
                    <Empty text={t('myWork.nothingWaiting')} />
                  ) : (
                    <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {data.recommended.notifications.map((n) => (
                        <li key={n.id} className="py-2 text-sm text-slate-700 dark:text-white/80">
                          {n.title || n.message || t('myWork.notification')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {tab === 'assigned' && (
              <Section
                icon={<UserCheck className="h-3.5 w-3.5 text-[#1C8C7D]" />}
                title={t('myWork.assignedToMe')}
                empty={t('myWork.nothingAssigned')}
                items={data.assigned}
                onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                t={t}
              />
            )}

            {tab === 'starred' && (
              <>
                {data.starred.projects.length > 0 && (
                  <div className={CARD + ' p-4'}>
                    <SectionHeading
                      icon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                      title={t('myWork.starredProjects')}
                    />
                    <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {data.starred.projects.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => router.push(`/projects/${p.id}`)}
                            className="flex w-full items-center gap-2 py-2 text-left hover:opacity-80"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: p.color || '#94A3B8' }}
                            />
                            <span className="shrink-0 text-[11px] font-semibold text-slate-400 dark:text-white/40">
                              {p.key}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-white/85">
                              {p.name}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-white/25" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Section
                  icon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                  title={t('myWork.starredItems')}
                  empty={t('myWork.nothingStarred')}
                  items={data.starred.tasks}
                  onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                  t={t}
                />
                <Section
                  icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                  title={t('myWork.workedOn')}
                  empty={t('myWork.nothingWorkedOn')}
                  items={data.workedOn}
                  onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                  t={t}
                />
              </>
            )}

            {tab === 'viewed' && (
              <Section
                icon={<Inbox className="h-3.5 w-3.5 text-slate-400" />}
                title={t('myWork.viewed')}
                empty={t('myWork.nothingViewed')}
                items={data.viewed}
                onOpen={(id) => router.push(`/dashboard/issues?taskId=${id}`)}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50">
        {title}
      </h2>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-sm text-slate-400 dark:text-white/35">{text}</p>;
}

function Section({
  icon, title, items, empty, onOpen, t,
}: {
  icon: React.ReactNode;
  title: string;
  items: TaskCard[];
  empty: string;
  onOpen: (id: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className={CARD + ' p-4'}>
      <SectionHeading icon={icon} title={title} />
      {items.length === 0 ? (
        <Empty text={empty} />
      ) : (
        <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/[0.06]">
          {items.map((it) => (
            <li key={it.id}>
              <button
                onClick={() => onOpen(it.id)}
                className="flex w-full items-center gap-2.5 py-2 text-left hover:opacity-80"
              >
                <span className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-white/40">
                  {it.key}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-white/85">
                  {it.title}
                </span>
                {it.project && (
                  <span className="hidden shrink-0 truncate text-[11px] text-slate-400 dark:text-white/35 sm:block">
                    {it.project.key}
                  </span>
                )}
                {it.dueDate && (
                  <span
                    className={
                      'shrink-0 text-[11px] tabular-nums ' +
                      (new Date(it.dueDate) < new Date()
                        ? 'text-red-500'
                        : 'text-slate-400 dark:text-white/35')
                    }
                  >
                    {new Date(it.dueDate).toLocaleDateString()}
                  </span>
                )}
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-white/25" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
