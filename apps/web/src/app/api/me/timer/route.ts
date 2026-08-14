import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { requireTaskAccess } from '@/lib/security/authorization';
import { checkRateLimit } from '@/lib/security/rate-limit';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * The running timer — measured time, as opposed to time somebody types in.
 *
 * Manual entry cannot be made trustworthy by validation: any number a person
 * types is, at best, their honest recollection. So this does not try to police
 * the typed figure. It offers a second kind of evidence beside it — a start
 * and a stop the server read from its own clock — and records which kind every
 * entry is, so a report can say "measured" or "entered" rather than implying
 * both are the same thing.
 *
 * It is deliberately a timer the person starts and stops, visible to them the
 * whole time, and not activity monitoring. Watching keystrokes or focus would
 * produce a worse number (thinking, meetings and whiteboards are work) while
 * costing the trust that makes people log anything at all.
 *
 * The elapsed figure is computed server-side from startedAt. A client that
 * sleeps, reloads or moves to another machine picks the same timer back up,
 * because the browser was never where the truth lived.
 */

/** A timer left running past this is not work; it is a forgotten tab. */
const MAX_TIMER_MINUTES = 16 * 60;

const StartSchema = z.object({ taskId: z.string().min(1) });
const StopSchema = z.object({
  /** Throw the interval away instead of logging it. */
  discard: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

/** Whole minutes elapsed, never negative, capped at the runaway limit. */
function elapsedMinutes(startedAt: Date): number {
  const raw = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  return Math.min(Math.max(raw, 0), MAX_TIMER_MINUTES);
}

async function runningTimerFor(userId: string) {
  return prisma.timerSession.findUnique({
    where: { userId },
    select: {
      id: true,
      startedAt: true,
      taskId: true,
      task: { select: { id: true, key: true, title: true, projectId: true } },
    },
  });
}

/** GET — what, if anything, is running right now. */
export async function GET() {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const timer = await runningTimerFor(ctx.user.id);
    if (!timer) return NextResponse.json({ timer: null });

    return NextResponse.json({
      timer: {
        id: timer.id,
        taskId: timer.taskId,
        task: timer.task,
        startedAt: timer.startedAt,
        elapsedMinutes: elapsedMinutes(timer.startedAt),
        maxMinutes: MAX_TIMER_MINUTES,
      },
    });
  } catch (err) {
    logger.error('Timer read error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to read timer' }, { status: 500 });
  }
}

/**
 * POST — start timing a task.
 *
 * Starting while another timer runs stops the first one and logs it, rather
 * than refusing. Someone who moves to a new task has stopped working on the
 * old one, and the alternative — an error telling them to go and stop it
 * themselves — loses the time they just spent while they go and do that.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit(request, 'dataMutation');
    if (rateLimited) return rateLimited;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const parsed = StartSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const access = await requireTaskAccess(parsed.data.taskId, ctx.user.id);
    if (!access.authorized) return access.error!;

    const existing = await runningTimerFor(ctx.user.id);
    if (existing?.taskId === parsed.data.taskId) {
      return NextResponse.json({ error: 'Already timing this item' }, { status: 409 });
    }

    let switchedFrom: { taskKey: string; minutes: number } | null = null;
    if (existing) {
      const logged = await stopAndLog(existing.id, existing.taskId, ctx.user.id, existing.startedAt, null);
      switchedFrom = { taskKey: existing.task.key, minutes: logged };
    }

    const timer = await prisma.timerSession.create({
      data: { taskId: parsed.data.taskId, userId: ctx.user.id },
      select: { id: true, startedAt: true, taskId: true },
    });

    return NextResponse.json({ timer: { ...timer, elapsedMinutes: 0 }, switchedFrom }, { status: 201 });
  } catch (err) {
    logger.error('Timer start error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to start timer' }, { status: 500 });
  }
}

/**
 * Stop a timer and write what it measured.
 *
 * The entry and the task's cached sum move together, the same way manual
 * entries do — a log written without the cache update would make the board
 * disagree with the task's own history.
 *
 * Returns the minutes logged; zero means the interval rounded to nothing and
 * no entry was written, because a work log of "0m" is noise in a report.
 */
async function stopAndLog(
  timerId: string,
  taskId: string,
  userId: string,
  startedAt: Date,
  description: string | null
): Promise<number> {
  const minutes = elapsedMinutes(startedAt);
  const endedAt = new Date();

  await prisma.$transaction(async (tx) => {
    // Delete first: if the log write fails the timer is gone rather than
    // still running, which is the safer of the two wrong states — a stopped
    // clock is visible, a phantom one silently accrues.
    await tx.timerSession.delete({ where: { id: timerId } });
    if (minutes < 1) return;

    await tx.workLog.create({
      data: {
        taskId,
        userId,
        minutes,
        // Attributed to the day the work started. A session running past
        // midnight belongs to the evening it began, not to the small hours.
        workedOn: startedAt,
        description,
        source: 'TIMER',
        startedAt,
        endedAt,
      },
    });
    const sum = await tx.workLog.aggregate({
      where: { taskId, deletedAt: null },
      _sum: { minutes: true },
    });
    await tx.task.update({
      where: { id: taskId },
      data: { timeSpent: Math.round((sum._sum.minutes ?? 0) / 60) },
    });
  });

  return minutes;
}

/** DELETE — stop the running timer, logging what it measured. */
export async function DELETE(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit(request, 'dataMutation');
    if (rateLimited) return rateLimited;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await request.json().catch(() => ({}));
    const parsed = StopSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const timer = await runningTimerFor(ctx.user.id);
    if (!timer) {
      return NextResponse.json({ error: 'No timer running' }, { status: 409 });
    }

    if (parsed.data.discard) {
      await prisma.timerSession.delete({ where: { id: timer.id } });
      return NextResponse.json({ discarded: true, minutes: 0 });
    }

    const minutes = await stopAndLog(
      timer.id,
      timer.taskId,
      ctx.user.id,
      timer.startedAt,
      parsed.data.description?.trim() || null
    );

    return NextResponse.json({ minutes, taskId: timer.taskId });
  } catch (err) {
    logger.error('Timer stop error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to stop timer' }, { status: 500 });
  }
}
