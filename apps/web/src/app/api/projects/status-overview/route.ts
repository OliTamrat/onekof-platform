import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import { deriveProjectHealth, HEALTH_ORDER } from '@/lib/project-health';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/status-overview
 *
 * Delivery health across every project the caller can see, for the leadership
 * rollup on the dashboard. Returns both the per-health counts the donut needs
 * and the project list behind each band, so clicking a segment can drill in
 * without a second round trip — the whole point of the view is to answer
 * "which ones are off track?", and that answer is one click away.
 */
export async function GET(_request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const projectAccessFilter = buildProjectAccessFilter({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      orgRole: ctx.role,
    });

    const projects = await prisma.project.findMany({
      where: {
        ...projectAccessFilter,
        deletedAt: null,
        // Archived projects are finished business and would inflate COMPLETE,
        // drowning the handful of live projects a leader actually acts on.
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        key: true,
        color: true,
        startDate: true,
        dueDate: true,
        healthOverride: true,
        healthOverrideReason: true,
        tasks: {
          where: { deletedAt: null },
          select: { status: true, dueDate: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      // Guard against an unbounded fan-out on a large tenant. A rollup over
      // more than this is not a dashboard widget, it is a report.
      take: 500,
    });

    const evaluated = projects.map((p) => {
      const result = deriveProjectHealth(
        {
          startDate: p.startDate,
          dueDate: p.dueDate,
          healthOverride: p.healthOverride,
          tasks: p.tasks,
        },
      );
      return {
        id: p.id,
        name: p.name,
        key: p.key,
        color: p.color,
        health: result.health,
        isOverridden: result.isOverridden,
        // A manual override's stored reason is more informative than the
        // generic "set by the lead" the deriver returns.
        reason: result.isOverridden && p.healthOverrideReason
          ? p.healthOverrideReason
          : result.reason,
        metrics: result.metrics,
      };
    });

    const segments = HEALTH_ORDER.map((health) => {
      const items = evaluated.filter((p) => p.health === health);
      return {
        health,
        count: items.length,
        // Zero-count bands are returned rather than filtered out: the legend
        // shows every state so a reader can see that nothing is off track,
        // which is different from the band being absent.
        projects: items,
      };
    });

    return NextResponse.json({
      total: evaluated.length,
      segments,
    });
  } catch (err) {
    logger.error('Project status overview error', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json(
      { error: 'Failed to load project status overview' },
      { status: 500 },
    );
  }
}
