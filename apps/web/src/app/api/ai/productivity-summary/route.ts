import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import Anthropic from '@anthropic-ai/sdk';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import { careItemExclusion, effectivePatientAccess } from '@/lib/security/patient-access';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Claude calls can take up to 30s

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

/**
 * GET /api/ai/productivity-summary?days=30[&projectId=]
 *
 * Where the organization's hours actually went, and what that says about how
 * work is running.
 *
 * The figures are computed here, in SQL, and the model is given only those
 * figures to interpret. It never sees raw rows and is never asked to count
 * anything — a summary that arrives at its own totals is a summary nobody can
 * check against the reports beside it.
 *
 * Measured and entered time are carried separately the whole way through,
 * including into the prompt. An hour a timer observed and an hour somebody
 * remembered are both worth having, but a productivity claim resting on the
 * second without saying so is exactly the false confidence this endpoint
 * would otherwise manufacture.
 *
 * Access: aggregates are built from tasks the caller can actually see —
 * project membership through buildProjectAccessFilter, care items through
 * careItemExclusion. The per-person breakdown is additionally limited to org
 * owners and admins; everyone else gets the project and work-type picture and
 * their own line, because "who logged least this month" is a management
 * report, not a team dashboard.
 */

const ADMIN_ROLES = new Set(['OWNER', 'ADMIN']);

interface Bucket {
  key: string;
  label: string;
  minutes: number;
  measuredMinutes: number;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function fmtHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const days = Math.max(1, Math.min(365, parseInt(request.nextUrl.searchParams.get('days') || '30', 10)));
    const projectId = request.nextUrl.searchParams.get('projectId');
    const isAdmin = ADMIN_ROLES.has(ctx.role);

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    // The window immediately before this one, same length, for the trend.
    const previousSince = new Date(since);
    previousSince.setDate(previousSince.getDate() - days);

    const projectAccess = buildProjectAccessFilter({
      userId: ctx.user.id,
      organizationId: ctx.organizationId,
      orgRole: ctx.role,
    });
    const patientLevel = effectivePatientAccess(ctx.patientAccess);

    // Every aggregate below hangs off this filter, so visibility is decided
    // once rather than per query.
    const visibleTask = {
      deletedAt: null,
      project: projectId ? { ...projectAccess, id: projectId } : projectAccess,
      ...careItemExclusion(patientLevel),
    };
    const inWindow = { deletedAt: null, task: visibleTask, workedOn: { gte: since } };

    const [entries, previousAgg, estimateRows, completedWithTime, completedTotal] = await Promise.all([
      prisma.workLog.findMany({
        where: inWindow,
        select: {
          minutes: true,
          source: true,
          workedOn: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
          task: {
            select: {
              type: true,
              project: { select: { id: true, name: true, key: true } },
            },
          },
        },
        // A ceiling rather than a cap on truth: organizations logging more
        // than this in a month are past the point where one prompt helps.
        take: 20000,
      }),
      prisma.workLog.aggregate({
        where: {
          deletedAt: null,
          task: visibleTask,
          workedOn: { gte: previousSince, lt: since },
        },
        _sum: { minutes: true },
      }),
      // Estimate vs actual, for items that carry both.
      prisma.task.findMany({
        where: { ...visibleTask, estimate: { not: null }, timeSpent: { gt: 0 } },
        select: { estimate: true, timeSpent: true },
        take: 2000,
      }),
      prisma.task.count({
        where: { ...visibleTask, status: 'DONE', completedAt: { gte: since }, timeSpent: { gt: 0 } },
      }),
      prisma.task.count({
        where: { ...visibleTask, status: 'DONE', completedAt: { gte: since } },
      }),
    ]);

    const totalMinutes = entries.reduce((n, e) => n + e.minutes, 0);
    const measuredMinutes = entries
      .filter((e) => e.source === 'TIMER')
      .reduce((n, e) => n + e.minutes, 0);

    const roll = (
      map: Map<string, Bucket>,
      key: string,
      label: string,
      minutes: number,
      measured: boolean
    ) => {
      const b = map.get(key) ?? { key, label, minutes: 0, measuredMinutes: 0 };
      b.minutes += minutes;
      if (measured) b.measuredMinutes += minutes;
      map.set(key, b);
    };

    const byProject = new Map<string, Bucket>();
    const byType = new Map<string, Bucket>();
    const byPerson = new Map<string, Bucket>();
    const byDay = new Map<string, number>();

    for (const e of entries) {
      const measured = e.source === 'TIMER';
      const proj = e.task?.project;
      if (proj) roll(byProject, proj.id, `${proj.key} · ${proj.name}`, e.minutes, measured);
      roll(byType, e.task?.type ?? 'UNKNOWN', e.task?.type ?? 'UNKNOWN', e.minutes, measured);
      roll(
        byPerson,
        e.userId,
        e.user?.name || e.user?.email || 'Unknown',
        e.minutes,
        measured
      );
      const day = e.workedOn.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + e.minutes);
    }

    const rank = (m: Map<string, Bucket>) =>
      [...m.values()]
        .sort((a, b) => b.minutes - a.minutes)
        .map((b) => ({
          ...b,
          share: pct(b.minutes, totalMinutes),
          measuredShare: pct(b.measuredMinutes, b.minutes),
        }));

    const projects = rank(byProject);
    const types = rank(byType);
    const people = rank(byPerson);
    // Non-admins see their own line only — enough to check their own record
    // without handing everyone a league table of their colleagues.
    const visiblePeople = isAdmin ? people : people.filter((p) => p.key === ctx.user.id);

    const overrun = estimateRows.filter((r) => (r.timeSpent ?? 0) > (r.estimate ?? 0)).length;
    const previousMinutes = previousAgg._sum.minutes ?? 0;

    const stats = {
      periodDays: days,
      totalMinutes,
      measuredMinutes,
      measuredShare: pct(measuredMinutes, totalMinutes),
      previousMinutes,
      changePct: previousMinutes > 0
        ? Math.round(((totalMinutes - previousMinutes) / previousMinutes) * 100)
        : null,
      activeDays: byDay.size,
      contributors: people.length,
      projects,
      types,
      people: visiblePeople,
      personBreakdownRestricted: !isAdmin,
      estimateVsActual: {
        compared: estimateRows.length,
        overrun,
        overrunShare: pct(overrun, estimateRows.length),
      },
      completedCoverage: {
        completed: completedTotal,
        withLoggedTime: completedWithTime,
        share: pct(completedWithTime, completedTotal),
      },
      generatedAt: new Date().toISOString(),
    };

    // Nothing logged yet: say so plainly rather than paying for a paragraph
    // of AI prose about an empty table.
    if (totalMinutes === 0) {
      return NextResponse.json({
        summary: null,
        empty: true,
        stats,
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // The numbers are the product; the narrative is the garnish. Without a
      // key the caller still gets everything it needs to render the panel.
      return NextResponse.json({ summary: null, aiUnavailable: true, stats });
    }

    const line = (b: (typeof projects)[number]) =>
      `- ${b.label}: ${fmtHours(b.minutes)} (${b.share}% of logged time, ${b.measuredShare}% of it timer-measured)`;

    const prompt = `You are analysing time-tracking data for an organization using a project management platform. Interpret the figures below. Do not recompute or restate them all.

PERIOD: last ${days} days
TOTAL LOGGED: ${fmtHours(totalMinutes)} across ${stats.contributors} people on ${stats.activeDays} days with any activity
MEASURED BY TIMER: ${stats.measuredShare}% of logged time (the rest was typed in from memory)
PREVIOUS ${days} DAYS: ${fmtHours(previousMinutes)}${stats.changePct !== null ? ` (${stats.changePct >= 0 ? '+' : ''}${stats.changePct}% change)` : ' (no prior data)'}

TIME BY PROJECT:
${projects.slice(0, 8).map(line).join('\n')}

TIME BY TYPE OF WORK:
${types.map(line).join('\n')}

${isAdmin ? `TIME BY PERSON:\n${people.slice(0, 10).map(line).join('\n')}` : ''}

ESTIMATE VS ACTUAL: ${stats.estimateVsActual.compared} items carried both an estimate and logged time; ${overrun} of them (${stats.estimateVsActual.overrunShare}%) ran over estimate.
COMPLETION COVERAGE: ${completedWithTime} of ${completedTotal} items completed in this period have any time logged against them (${stats.completedCoverage.share}%).

Write 3 short paragraphs for a manager:
1. Where the time actually went and what that concentration suggests.
2. What the data supports about how work is running — estimate accuracy, spread across projects, whether effort is going into planned work or into bugs and unplanned items.
3. One or two specific, actionable suggestions.

Rules you must follow:
- If measured share is below 50%, say plainly that most of this is self-reported and conclusions are indicative rather than firm. Never present typed time as if it were observed.
- If completion coverage is low, note that the picture covers only the work people logged, not all the work done.
- Judge the process, not the people. Do not rank individuals by hours or imply that fewer logged hours means less contribution — logging discipline varies and hours are not output.
- Do not invent numbers, names, causes or events that are not in the data above.
- Flowing prose, no bullet points or headers, under 220 words total.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = message.content[0]?.type === 'text' ? message.content[0].text : null;

    return NextResponse.json({ summary, stats });
  } catch (err) {
    logger.error('Productivity summary error', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: 'Failed to generate productivity summary' }, { status: 500 });
  }
}
