import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          lockedUntil: true,
          failedLoginAttempts: true,
          organizations: {
            select: {
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  plan: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: where as any }),
    ]);

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isLocked: user.lockedUntil ? new Date(user.lockedUntil) > new Date() : false,
        lockedUntil: user.lockedUntil,
        failedLoginAttempts: user.failedLoginAttempts,
        organizations: user.organizations.map(m => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          plan: m.organization.plan,
          role: m.role,
        })),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }

    if (action === 'unlock') {
      await prisma.user.update({
        where: { id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return NextResponse.json({ message: 'Account unlocked' });
    }

    if (action === 'lock') {
      await prisma.user.update({
        where: { id },
        data: {
          lockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          failedLoginAttempts: 99,
        },
      });
      return NextResponse.json({ message: 'Account locked' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
