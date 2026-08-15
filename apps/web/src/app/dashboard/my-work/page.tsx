'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle, Bell, Bug, CalendarClock, CheckSquare, ChevronRight, Clock,
  Flag, Inbox, Layers, Loader2, Star, UserCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLanguage } from '@/contexts/language-context';
import { CARD_SURFACE, CARD_ICON_CHIP } from '@/components/ui/card-surface';
import { PersonalPerformance } from '@/components/dashboard/personal-performance';

interface TaskCard {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
  /** When this user worked on or viewed the item — absent outside those feeds. */
  when?: string | null;
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

/** Type chip — same colors as the dashboard's Types of Work card, so a task
 * reads as the same "kind of thing" wherever it appears in the product. */
const TYPE_CONFIG: Record<string, { icon: typeof CheckSquare; color: string }> = {
  TASK: { icon: CheckSquare, color: '#3B82F6' },
  STORY: { icon: Layers, color: '#22C55E' },
  BUG: { icon: Bug, color: '#EF4444' },
  EPIC: { icon: Flag, color: '#A855F7' },
  SUBTASK: { icon: CheckSquare, color: '#94A3B8' },
};

/** Same palette as the priority breakdown on the dashboard. */
const PRIORITY_COLOR: Record<string, string> = {
  HIGHEST: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E', LOWEST: '#94A3B8',
};

/** Same palette as the task status overview donut. */
const STATUS_COLOR: Record<string, string> = {
  BACKLOG: '#94A3B8', TODO: '#22C55E', IN_PROGRESS: '#3B82F6',
  IN_REVIEW: '#F59E0B', DONE: '#10B981', BLOCKED: '#EF4444',
};

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Today / Yesterday / This week / Earlier — the grouping Jira's Recent view
 * uses, and the reason "worked on" and "viewed" carry a `when` timestamp
 * instead of just being flat lists. */
function dateBucket(iso: string | null | undefined, t: (k: string) => string): string {
  if (!iso) return t('myWork.earlier');
  const ts = new Date(iso).getTime();
  const start = todayStart();
  const day = 24 * 60 * 60 * 1000;
  if (ts >= start) return t('myWork.today');
  if (ts >= start - day) return t('myWork.yesterday');
  if (ts >= start - 6 * day) return t('myWork.thisWeek');
  return t('myWork.earlier');
}

function groupByDate(items: TaskCard[], t: (k: string) => string): { label: string; items: TaskCard[] }[] {
  const order = [t('myWork.today'), t('myWork.yesterday'), t('myWork.thisWeek'), t('myWork.earlier')];
  const groups = new Map<string, TaskCard[]>();
  for (const it of items) {
    const label = dateBucket(it.when, t);
    (groups.get(label) ?? groups.set(label, []).get(label)!).push(it);
  }
  return order.filter((l) => groups.has(l)).map((label) => ({ label, items: groups.get(label)! }));
}

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
  const openTask = (id: string) => router.push(`/dashboard/issues?taskId=${id}`);

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'recommended', label: t('myWork.recommended'),
      count: (data?.counts.overdue ?? 0) + (data?.counts.dueSoon ?? 0) + (data?.counts.notifications ?? 0) },
    { id: 'assigned', label: t('myWork.assignedToMe'), count: data?.counts.assigned },
    { id: 'starred', label: t('myWork.starredAndWorkedOn'),
      count: (data?.starred.tasks.length ?? 0) + (data?.starred.projects.length ?? 0) },
    { id: 'viewed', label: t('myWork.viewed'), count: data?.viewed.length },
  ];

  const workedOnGroups = useMemo(
    () => (data ? groupByDate(data.workedOn, t) : []),
    [data, t],
  );
  const viewedGroups = useMemo(
    () => (data ? groupByDate(data.viewed, t) : []),
    [data, t],
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {firstName ? t('myWork.greetingNamed').replace('{name}', firstName) : t('myWork.greeting')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">{t('myWork.subtitle')}</p>

        {/* At-a-glance scoreboard — jump straight to the tab that matters
            instead of reading four numbers then hunting for the tab. */}
        {data && !isLoading && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill
              icon={<UserCheck className="h-3.5 w-3.5" />}
              value={data.counts.assigned}
              label={t('myWork.assignedToMe')}
              onClick={() => setTab('assigned')}
            />
            <StatPill
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              value={data.counts.overdue}
              label={t('myWork.overdue')}
              tone={data.counts.overdue > 0 ? 'danger' : undefined}
              onClick={() => setTab('recommended')}
            />
            <StatPill
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              value={data.counts.dueSoon}
              label={t('myWork.dueSoon')}
              tone={data.counts.dueSoon > 0 ? 'warn' : undefined}
              onClick={() => setTab('recommended')}
            />
            <StatPill
              icon={<Bell className="h-3.5 w-3.5" />}
              value={data.counts.notifications}
              label={t('myWork.waitingOnYou')}
              onClick={() => setTab('recommended')}
            />
          </div>
        )}

        {/* Your own completion, on-time and time-logged read — visible above
            the tabs since it is about the person, not any one feed. */}
        <div className="mt-5">
          <PersonalPerformance />
        </div>

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
                  onOpen={openTask}
                  t={t}
                />
                <Section
                  icon={<CalendarClock className="h-3.5 w-3.5 text-amber-500" />}
                  title={t('myWork.dueSoon')}
                  empty={t('myWork.nothingDueSoon')}
                  items={data.recommended.dueSoon}
                  onOpen={openTask}
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
                onOpen={openTask}
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
                            className="flex w-full items-center gap-2.5 py-2 text-left hover:opacity-80"
                          >
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                              style={{ backgroundColor: p.color || '#94A3B8' }}
                            >
                              {p.key.slice(0, 2)}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-white/85">
                              {p.name}
                            </span>
                            <span className="shrink-0 text-[11px] font-semibold text-slate-400 dark:text-white/40">
                              {p.key}
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
                  onOpen={openTask}
                  t={t}
                />
                <GroupedSection
                  icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
                  title={t('myWork.workedOn')}
                  empty={t('myWork.nothingWorkedOn')}
                  groups={workedOnGroups}
                  onOpen={openTask}
                  t={t}
                />
              </>
            )}

            {tab === 'viewed' && (
              <GroupedSection
                icon={<Inbox className="h-3.5 w-3.5 text-slate-400" />}
                title={t('myWork.viewed')}
                empty={t('myWork.nothingViewed')}
                groups={viewedGroups}
                onOpen={openTask}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatPill({
  icon, value, label, tone, onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone?: 'danger' | 'warn';
  onClick: () => void;
}) {
  const valueColor =
    tone === 'danger'
      ? 'text-red-500'
      : tone === 'warn'
        ? 'text-amber-500'
        : 'text-slate-900 dark:text-white';
  return (
    <button
      onClick={onClick}
      className={CARD_SURFACE + ' flex items-center gap-2.5 p-3 text-left'}
    >
      <span className={CARD_ICON_CHIP} style={{ backgroundColor: 'rgba(28,140,125,0.1)', color: '#1C8C7D' }}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className={`block text-lg font-semibold tabular-nums leading-none ${valueColor}`}>
          {value}
        </span>
        <span className="block truncate text-[11px] text-slate-500 dark:text-white/45">{label}</span>
      </span>
    </button>
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

/** One task row: type, key, title, project, priority, status, due date. Every
 * signal a Jira "Your work" row carries, reusing the exact colors those
 * signals already have on the dashboard so a task looks like the same task
 * everywhere it appears. */
function TaskRow({ item, onOpen }: { item: TaskCard; onOpen: (id: string) => void }) {
  const type = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.TASK;
  const TypeIcon = type.icon;
  const overdue = item.dueDate && new Date(item.dueDate) < new Date();
  return (
    <button
      onClick={() => onOpen(item.id)}
      className="flex w-full items-center gap-2.5 py-2 text-left hover:opacity-80"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: `${type.color}1A`, color: type.color }}
        title={item.type}
      >
        <TypeIcon className="h-3 w-3" />
      </span>
      <span className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-white/40">
        {item.key}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-white/85">
        {item.title}
      </span>
      {item.project && (
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item.project.color || '#94A3B8' }}
          />
          <span className="text-[11px] text-slate-400 dark:text-white/35">{item.project.key}</span>
        </span>
      )}
      <span
        className="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block"
        style={{ backgroundColor: PRIORITY_COLOR[item.priority] ?? PRIORITY_COLOR.MEDIUM }}
        title={item.priority}
      />
      <span
        className="hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium sm:block"
        style={{
          backgroundColor: `${STATUS_COLOR[item.status] ?? STATUS_COLOR.TODO}1A`,
          color: STATUS_COLOR[item.status] ?? STATUS_COLOR.TODO,
        }}
      >
        {item.status.replace('_', ' ')}
      </span>
      {item.dueDate && (
        <span
          className={
            'shrink-0 text-[11px] tabular-nums ' +
            (overdue ? 'text-red-500' : 'text-slate-400 dark:text-white/35')
          }
        >
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      )}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-white/25" />
    </button>
  );
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
              <TaskRow item={it} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Same card as Section, but the list is broken into Today / Yesterday /
 * This week / Earlier — the grouping that makes a "recent" feed skimmable
 * instead of an undifferentiated wall of rows. */
function GroupedSection({
  icon, title, groups, empty, onOpen, t,
}: {
  icon: React.ReactNode;
  title: string;
  groups: { label: string; items: TaskCard[] }[];
  empty: string;
  onOpen: (id: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className={CARD + ' p-4'}>
      <SectionHeading icon={icon} title={title} />
      {groups.length === 0 ? (
        <Empty text={empty} />
      ) : (
        <div className="mt-2 space-y-4">
          {groups.map((g) => (
            <div key={g.label}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-white/30">
                {g.label}
              </h3>
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/[0.06]">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <TaskRow item={it} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
