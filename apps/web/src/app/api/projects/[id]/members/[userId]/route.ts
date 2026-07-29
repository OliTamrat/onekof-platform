import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// DELETE /api/projects/[id]/members/[userId] - Remove a member from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const userId = params.userId;

    // Verify project exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify current user is a project admin or org admin
    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    const currentUserProjectMembership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    const isOrgAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';
    const isProjectAdmin = currentUserProjectMembership?.role === 'ADMIN';

    if (!isOrgAdmin && !isProjectAdmin) {
      return NextResponse.json(
        { error: 'Only project admins and org admins can remove members' },
        { status: 403 }
      );
    }

    // Find and delete the member
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 404 }
      );
    }

    await prisma.projectMember.delete({
      where: {
        id: member.id,
      },
    });

    // INSA audit trail: removal revokes this person's access to the project.
    logOrgAction({
      organizationId: project.organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: orgMembership?.role ?? 'MEMBER',
      action: OrgActions.PROJECT_MEMBER_REMOVED,
      resource: 'project_member',
      resourceId: params.userId,
      before: { projectId, role: member.role },
      request: req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error removing project member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to remove project member' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]/members/[userId] - Update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const userId = params.userId;
    const body = await req.json();
    const { role } = body;

    if (!role || !['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Verify project exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify current user is a project admin or org admin
    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    const currentUserProjectMembership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    const isOrgAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';
    const isProjectAdmin = currentUserProjectMembership?.role === 'ADMIN';

    if (!isOrgAdmin && !isProjectAdmin) {
      return NextResponse.json(
        { error: 'Only project admins and org admins can update member roles' },
        { status: 403 }
      );
    }

    // Capture the previous role before overwriting it. updateMany does not
    // return the old value, and an audit entry saying only "X is now ADMIN"
    // is far less useful to an investigator than "X was VIEWER and was made
    // ADMIN by Y". One extra read is worth a usable record.
    const priorMembership = await prisma.projectMember.findFirst({
      where: { projectId, userId },
      select: { role: true },
    });

    // Update the member role
    const updatedMember = await prisma.projectMember.updateMany({
      where: {
        projectId,
        userId,
      },
      data: {
        role,
      },
    });

    if (updatedMember.count === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 404 }
      );
    }

    // INSA audit trail: project role changes alter what this person can see
    // and do inside the project.
    logOrgAction({
      organizationId: project.organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: orgMembership?.role ?? 'MEMBER',
      action: OrgActions.PROJECT_MEMBER_ROLE_CHANGED,
      resource: 'project_member',
      resourceId: userId,
      before: { projectId, role: priorMembership?.role ?? null },
      after: { projectId, role },
      request: req,
    });

    return NextResponse.json({ role });
  } catch (error) {
    logger.error('Error updating project member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update project member' },
      { status: 500 }
    );
  }
}
