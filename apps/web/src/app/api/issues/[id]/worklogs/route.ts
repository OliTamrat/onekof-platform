import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { requireTaskAccess } from '@/lib/security/authorization';
import { checkRateLimit } from '@/lib/security/rate-limit';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Time logging for a task.
 *
 * The dashboard's "work spent time" never moved because tasks.time_spent had
 * no writer: the field was accepted by the PATCH route and shown by every
 * report, but no UI ever set it. These routes are the missing writer — and
 * they write per-entry (who, how many minutes, which day) rather than
 * mutating one cumulative number, because an effort figure nobody can
 * attribute is unusable for reporting and unauditable.
 *
 * tasks.time_spent survives as a cached sum so boards keep reading a single
 * column. It is stored in HOURS (its historical unit — sprint insights and
 * reports interpret it that way), rounded from the minute-level truth here.
 * The rounding loss lives only in the cache; the entries stay exact.
 */

/** A person has one day per day, however many tasks they touched in it. */
const MINUTES_IN_DAY = 1440;
/** Beyond this, a forgotten entry is a correction for an admin, not a log. */
const MAX_BACKDATE_DAYS = 90;

const CreateWorkLogSchema = z.object({
  /** 1 minute to 24 hours. A single entry longer than a day is a typo. */
  minutes: z.number().int().min(1).max(1440),
  /** The day the work happened — backdating is normal. Defaults to today. */
  workedOn: z.string().date().optional(),
  description: z.string().max(500).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requireTaskAccess(params.id, ctx.user.id);
    if (!access.authorized) return access.error!;

    const logs = await prisma.workLog.findMany({
      where: { taskId: params.id, deletedAt: null },
      orderBy: [{ workedOn: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      select: {
        id: true,
        minutes: true,
        workedOn: true,
        description: true,
        createdAt: true,
        source: true,
        startedAt: true,
        endedAt: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const totalMinutes = logs.reduce((n, l) => n + l.minutes, 0);
    return NextResponse.json({ logs, totalMinutes });
  } catch (err) {
    logger.error('Worklog list error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to load work log' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimited = await checkRateLimit(request, 'dataMutation');
    if (rateLimited) return rateLimited;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requireTaskAccess(params.id, ctx.user.id);
    if (!access.authorized) return access.error!;

    const parsed = CreateWorkLogSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    const { minutes, workedOn, description } = parsed.data;

    // Guardrails on typed time. None of these can make an asserted figure
    // true — only the timer does that — but they rule out the entries that
    // are certainly wrong, and an effort report is worth more without them.
    const workedOnDate = workedOn ? new Date(workedOn) : new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (workedOnDate > endOfToday) {
      return NextResponse.json(
        { error: 'Time cannot be logged against a future date' },
        { status: 400 }
      );
    }
    const earliest = new Date();
    earliest.setDate(earliest.getDate() - MAX_BACKDATE_DAYS);
    if (workedOnDate < earliest) {
      return NextResponse.json(
        { error: `Time can only be backdated ${MAX_BACKDATE_DAYS} days` },
        { status: 400 }
      );
    }

    // A person has one day per day. The per-entry cap alone never caught the
    // real error — ten separate entries against one Tuesday — so the check
    // that matters is the running total for that person on that date, across
    // every task rather than this one.
    const dayStart = new Date(workedOnDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(workedOnDate);
    dayEnd.setHours(23, 59, 59, 999);
    const already = await prisma.workLog.aggregate({
      where: {
        userId: ctx.user.id,
        deletedAt: null,
        workedOn: { gte: dayStart, lte: dayEnd },
      },
      _sum: { minutes: true },
    });
    const dayTotal = (already._sum.minutes ?? 0) + minutes;
    if (dayTotal > MINUTES_IN_DAY) {
      return NextResponse.json(
        {
          error: `That would put you over 24 hours logged for one day (${Math.round(dayTotal / 60)}h)`,
          dayTotalMinutes: already._sum.minutes ?? 0,
        },
        { status: 400 }
      );
    }

    // The entry and the cache move together or not at all. A log written
    // without the cache update would make the board disagree with the
    // task's own history — the exact inconsistency this feature exists
    // to remove.
    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.workLog.create({
        data: {
          taskId: params.id,
          userId: ctx.user.id,
          minutes,
          workedOn: workedOnDate,
          description: description || null,
        },
      });
      const sum = await tx.workLog.aggregate({
        where: { taskId: params.id, deletedAt: null },
        _sum: { minutes: true },
      });
      await tx.task.update({
        where: { id: params.id },
        data: { timeSpent: Math.round((sum._sum.minutes ?? 0) / 60) },
      });
      return created;
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    logger.error('Worklog create error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to log time' }, { status: 500 });
  }
}

const DeleteSchema = z.object({ workLogId: z.string().min(1) });

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requireTaskAccess(params.id, ctx.user.id);
    if (!access.authorized) return access.error!;

    const parsed = DeleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const log = await prisma.workLog.findFirst({
      where: { id: parsed.data.workLogId, taskId: params.id, deletedAt: null },
      select: { id: true, userId: true },
    });
    if (!log) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only the person who logged the time may remove it. Effort history is
    // reporting data; letting anyone with task access edit someone else's
    // hours would quietly corrupt it.
    if (log.userId !== ctx.user.id) {
      return NextResponse.json(
        { error: 'Only the author of an entry can remove it' },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete: removing effort changes historical reports, so the row
      // is retained and excluded from sums rather than destroyed.
      await tx.workLog.update({
        where: { id: log.id },
        data: { deletedAt: new Date() },
      });
      const sum = await tx.workLog.aggregate({
        where: { taskId: params.id, deletedAt: null },
        _sum: { minutes: true },
      });
      await tx.task.update({
        where: { id: params.id },
        data: { timeSpent: Math.round((sum._sum.minutes ?? 0) / 60) },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Worklog delete error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to remove entry' }, { status: 500 });
  }
}
