import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/security/superadmin';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';


export async function GET() {
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ROUTES) {
      return NextResponse.json({ error: 'Debug routes disabled in production' }, { status: 404 });
    }

  const { authorized, error } = await requireSuperAdmin();
  if (!authorized) return error!;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
      take: 20,
    });

    return NextResponse.json({ users, count: users.length });
  } catch (error) {
    logger.error('Error fetching users', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
