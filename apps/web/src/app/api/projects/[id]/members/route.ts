import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/members - Get all members of a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get project members
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
      },
      orderBy: [
        { role: 'desc' }, // ADMIN first
        { addedAt: 'asc' },
      ],
    });

    // Fetch user details for each member
    const userIds = projectMembers.map((m: { userId: string }) => m.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    const userMap = new Map(users.map((u: { id: string; email: string; name: string | null; avatar: string | null }) => [u.id, u]));

    const formattedMembers = projectMembers.map((member: { id: string; userId: string; role: string; addedAt: Date }) => {
      const user = userMap.get(member.userId);
      return {
        id: member.id,
        userId: member.userId,
        name: user?.name || user?.email || 'Unknown',
        email: user?.email || '',
        avatar: user?.avatar || null,
        role: member.role,
        addedAt: member.addedAt.toISOString(),
      };
    });

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project members' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add a member to a project
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await req.json();
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
        { error: 'Only project admins and org admins can add members' },
        { status: 403 }
      );
    }

    // Verify user to add exists and is in organization
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userOrgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: userToAdd.id,
        },
      },
    });

    if (!userOrgMembership) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Add member to project
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role,
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        userId: userToAdd.id,
        name: userToAdd.name || userToAdd.email,
        email: userToAdd.email,
        avatar: userToAdd.avatar,
        role: newMember.role,
        addedAt: newMember.addedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    return NextResponse.json(
      { error: 'Failed to add project member' },
      { status: 500 }
    );
  }
}
