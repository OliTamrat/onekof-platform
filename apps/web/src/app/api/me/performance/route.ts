import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import { careItemExclusion, effectivePatientAccess } from '@/lib/security/patient-access';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me/performance?days=30
 *
 * A person's own read on their own work: how much finished, how much of it
 * landed on time, how many hours went in and how much of that was actually
 * measured, and how many of the last days had any activity at all.
 *
 * This is deliberately scoped to the caller's own data only — there is no
 * "view someone else's performance" mode and no admin override, unlike the
 * org-wide productivity summary. A number about a colleague read by someone
 * else is a management report; the same number read by the person it
 * describes is feedback. Those are different features, and mixing them into
 * one endpoint is how the first one leaks into being used as the second.
 *
 * On-time rate is reported only when there is something to rate — completed
 * items that actually carried a due date. Items with no due date were never
 * "on time" or "late"; counting them either way manufactures a number.
 */

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const days = Math.max(1, Math.min(365, parseInt(request.nextUrl.searchParams.get('days') || '30', 10)));
    const userId = ctx.user.id;

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    const previousSince = new Date(since);
    previousSince.setDate(previousSince.getDate() - days);

    const projectAccess = buildProjectAccessFilter({
      userId,
      organizationId: ctx.organizationId,
      orgRole: ctx.role,
    });
    const patientLevel = effectivePatientAccess(ctx.patientAccess);
    const visibleTask = {
      deletedAt: null,
      project: projectAccess,
      ...careItemExclusion(patientLevel),
    };

    const [
      completed,
      previousCompleted,
      completedWithDueDate,
      onTime,
      timeEntries,
      previousTimeAgg,
      activeDayRows,
    ] = await Promise.all([
      prisma.task.count({
        where: { ...visibleTask, assigneeId: userId, status: 'DONE', completedAt: { gte: since } },
      }),
      prisma.task.count({
        where: {
          ...visibleTask,
          assigneeId: userId,
          status: 'DONE',
          completedAt: { gte: previousSince, lt: since },
        },
      }),
      prisma.task.count({
        where: {
          ...visibleTask,
          assigneeId: userId,
          status: 'DONE',
          completedAt: { gte: since },
          dueDate: { not: null },
        },
      }),
      // Prisma can't compare two columns in a `where`, so on-time is counted
      // by pulling the (small) completed-with-due-date set and comparing in
      // JS rather than trying to force it through the query layer.
      prisma.task.findMany({
        where: {
          ...visibleTask,
          assigneeId: userId,
          status: 'DONE',
          completedAt: { gte: since },
          dueDate: { not: null },
        },
        select: { completedAt: true, dueDate: true },
        take: 2000,
      }),
      prisma.workLog.findMany({
        where: { deletedAt: null, userId, workedOn: { gte: since }, task: visibleTask },
        select: { minutes: true, source: true, workedOn: true },
        take: 5000,
      }),
      prisma.workLog.aggregate({
        where: { deletedAt: null, userId, workedOn: { gte: previousSince, lt: since }, task: visibleTask },
        _sum: { minutes: true },
      }),
      // Distinct days with either a completed item or a logged entry —
      // the raw material for the activity streak, computed below.
      prisma.workLog.findMany({
        where: { deletedAt: null, userId, workedOn: { gte: since }, task: visibleTask },
        select: { workedOn: true },
        distinct: ['workedOn'],
        take: 400,
      }),
    ]);

    const onTimeCount = onTime.filter((t) => t.completedAt && t.dueDate && t.completedAt <= t.dueDate).length;
    const lateCount = onTime.length - onTimeCount;

    const totalMinutes = timeEntries.reduce((n, e) => n + e.minutes, 0);
    const measuredMinutes = timeEntries.filter((e) => e.source === 'TIMER').reduce((n, e) => n + e.minutes, 0);
    const previousMinutes = previousTimeAgg._sum.minutes ?? 0;

    // Also fold in days completed-but-unlogged tasks landed, so the streak
    // reflects "did anything" rather than only "logged time".
    const completedDayRows = await prisma.task.findMany({
      where: { ...visibleTask, assigneeId: userId, status: 'DONE', completedAt: { gte: since } },
      select: { completedAt: true },
      take: 2000,
    });
    const activeDaySet = new Set<string>([
      ...activeDayRows.map((r) => r.workedOn.toISOString().slice(0, 10)),
      ...completedDayRows.map((r) => r.completedAt!.toISOString().slice(0, 10)),
    ]);

    // Current streak: consecutive days with activity, walking back from
    // today. A gap today doesn't break yesterday's streak until tomorrow —
    // the streak is allowed to include "today, not yet active".
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!activeDaySet.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (activeDaySet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return NextResponse.json({
      periodDays: days,
      completed: {
        count: completed,
        previousCount: previousCompleted,
        changePct:
          previousCompleted > 0 ? Math.round(((completed - previousCompleted) / previousCompleted) * 100) : null,
      },
      onTime: {
        rated: onTime.length,
        onTimeCount,
        lateCount,
        rate: pct(onTimeCount, onTime.length),
        // Distinguished from "0% on time": no due-dated completions to judge.
        hasData: onTime.length > 0,
      },
      time: {
        totalMinutes,
        measuredMinutes,
        measuredShare: pct(measuredMinutes, totalMinutes),
        previousMinutes,
        changePct: previousMinutes > 0 ? Math.round(((totalMinutes - previousMinutes) / previousMinutes) * 100) : null,
      },
      streak: {
        activeDays: activeDaySet.size,
        currentStreak: streak,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Personal performance error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to load your performance' }, { status: 500 });
  }
}
