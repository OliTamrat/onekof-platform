import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { aggregateSprintInsights, summarizeChurn } from '@/components/sprints/insights';
import { buildSprintReport } from '@/lib/reports/sprint-report';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sprints/[id]/report.pdf
 *
 * The ministry artifact (Tier 2c): a branded, signed-and-dated sprint
 * report rendered server-side. Assets (fonts incl. Abyssinica SIL for
 * Ge'ez, the Onekof logo) load from this deployment's own origin — no
 * external calls, so Tier 2 on-prem renders identically. Generation is
 * an OrgAuditLog event: documents leaving the system are audit surface.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;

    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, deletedAt: null },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            organization: { select: { name: true, organizationSettings: true } },
          },
        },
      },
    });
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, auth.session.user.id);
    if (!access.authorized) return access.error;

    const settings = await resolveProjectSettings(sprint.projectId);
    const orgSettings = sprint.project.organization.organizationSettings;
    const language = (orgSettings?.language ?? 'EN').toLowerCase();

    // Delivered issues (post-rollover survivors for completed sprints)
    const issues = await prisma.task.findMany({
      where: { sprintId: sprint.id, deletedAt: null },
      select: {
        id: true,
        status: true,
        timeSpent: true,
        estimate: true,
        storyPoints: true,
        assignee: { select: { id: true, name: true } },
      },
    });
    const insights = aggregateSprintInsights(
      issues as any[],
      settings?.estimationUnit ?? 'HOURS'
    );

    // Churn: same window rule as the churn endpoint (SPRINT_STARTED instant)
    let churn = { added: 0, removed: 0 };
    if (sprint.startDate) {
      const startedEvent = await prisma.userActivity.findFirst({
        where: { entityType: 'SPRINT', entityId: sprint.id, activityType: 'SPRINT_STARTED' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });
      const events = await prisma.userActivity.findMany({
        where: {
          organizationId: sprint.project.organizationId,
          activityType: 'TASK_SPRINT_CHANGED',
          entityType: 'TASK',
          createdAt: {
            gte: startedEvent?.createdAt ?? sprint.startDate,
            ...(sprint.completedAt && { lte: sprint.completedAt }),
          },
          OR: [
            { metadata: { path: ['to'], equals: sprint.id } },
            { metadata: { path: ['from'], equals: sprint.id } },
          ],
        },
        select: { entityId: true, metadata: true },
        take: 500,
      });
      const summary = summarizeChurn(
        sprint.id,
        events.map((e) => ({ entityId: e.entityId, metadata: e.metadata as any }))
      );
      churn = { added: summary.added, removed: summary.removed };
    }

    // Velocity: rolling average of the last 3 completed sprints
    const recentCompleted = await prisma.sprint.findMany({
      where: { projectId: sprint.projectId, status: 'COMPLETED', deletedAt: null },
      orderBy: { completedAt: 'desc' },
      take: 3,
      select: { completedCount: true },
    });
    const velocity = recentCompleted.length
      ? Math.round(
          (recentCompleted.reduce((acc, s) => acc + (s.completedCount ?? 0), 0) /
            recentCompleted.length) * 10
        ) / 10
      : null;

    const doc = buildSprintReport({
      language,
      terminologyScheme:
        (orgSettings as any)?.terminologyScheme === 'FORMAL' ? 'FORMAL' : 'AGILE',
      orgName: sprint.project.organization.name,
      projectName: sprint.project.name,
      sprintName: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate?.toISOString() ?? null,
      endDate: sprint.endDate?.toISOString() ?? null,
      completedAtDate: sprint.completedAt?.toISOString().slice(0, 10) ?? null,
      committedCount: sprint.committedCount,
      completedCount: sprint.completedCount,
      committedEstimate: sprint.committedEstimate,
      completedEstimate: sprint.completedEstimate,
      estimationUnit: settings?.estimationUnit ?? 'HOURS',
      budgetPlanned: sprint.budgetPlanned != null ? Number(sprint.budgetPlanned) : null,
      budgetInvested: sprint.budgetInvested != null ? Number(sprint.budgetInvested) : null,
      budgetCurrency: orgSettings?.budgetCurrency ?? 'ETB',
      churn,
      velocity,
      contributions: insights.contributions.map((c) => ({
        name: c.name,
        issues: c.issues,
        done: c.done,
        timeSpent: c.timeSpent,
        estimated: c.estimated,
      })),
      assetBaseUrl: req.nextUrl.origin,
    });

    const buffer = await renderToBuffer(doc);

    // Documents leaving the system are audit events (INSA posture)
    logOrgAction({
      organizationId: sprint.project.organizationId,
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email || '',
      actorRole: access.membership?.role || 'MEMBER',
      action: OrgActions.SPRINT_REPORT_EXPORTED,
      resource: 'sprint',
      resourceId: sprint.id,
      resourceName: sprint.name,
      request: req,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sprint.name.replace(/[^\w.-]+/g, '_')}-report.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logger.error('Error generating sprint report', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
