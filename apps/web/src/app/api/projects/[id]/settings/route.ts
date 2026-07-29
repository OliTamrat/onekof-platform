import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuthentication, requireProjectAccess } from '@/lib/security/authorization';
import { updateProjectSettingsSchema } from '@/lib/validation/schemas';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { logActivity } from '@/lib/activity-logger';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/settings
 * Returns both the raw override row (nulls = inherit) and the resolved
 * effective settings, so the settings UI can show "inherited from org".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthentication();
    if (!auth.authorized) return auth.error;

    const access = await requireProjectAccess(params.id, auth.session.user.id);
    if (!access.authorized) return access.error;

    const [overrides, effective] = await Promise.all([
      prisma.projectSettings.findUnique({ where: { projectId: params.id } }),
      resolveProjectSettings(params.id),
    ]);

    if (!effective) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      overrides: overrides ?? {
        sprintsEnabled: null,
        estimationUnit: null,
        enforceWorkflow: null,
        workflowTransitions: null,
      },
      effective,
    });
  } catch (error) {
    logger.error('Error fetching project settings', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[id]/settings
 * Field-level override updates. Setting a field to null restores inheritance.
 * Project ADMIN+ only. Every change is activity-logged and org-audited.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthentication();
    if (!auth.authorized) return auth.error;
    const userId = auth.session.user.id;

    const access = await requireProjectAccess(params.id, userId, 'ADMIN');
    if (!access.authorized) return access.error;

    const parsed = updateProjectSettingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { organizationId: true, name: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const before = await prisma.projectSettings.findUnique({
      where: { projectId: params.id },
    });

    const data = parsed.data as Record<string, unknown>;
    const updated = await prisma.projectSettings.upsert({
      where: { projectId: params.id },
      create: { projectId: params.id, ...data },
      update: data,
    });

    logActivity({
      organizationId: project.organizationId,
      userId,
      entityType: 'PROJECT',
      entityId: params.id,
      action: 'SETTINGS_CHANGED',
      metadata: { before: before ?? null, after: data },
    });

    logOrgAction({
      organizationId: project.organizationId,
      actorId: userId,
      actorEmail: auth.session.user.email || '',
      actorRole: access.membership?.role || 'MEMBER',
      action: OrgActions.PROJECT_SETTINGS_UPDATED,
      resource: 'project_settings',
      resourceId: params.id,
      resourceName: project.name,
      before: before ? { sprintsEnabled: before.sprintsEnabled, estimationUnit: before.estimationUnit, enforceWorkflow: before.enforceWorkflow } : undefined,
      after: data as Record<string, unknown>,
      request: req,
    });

    const effective = await resolveProjectSettings(params.id);
    return NextResponse.json({ overrides: updated, effective });
  } catch (error) {
    logger.error('Error updating project settings', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
