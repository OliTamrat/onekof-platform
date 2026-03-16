import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      authorized: false,
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const email = session.user.email.toLowerCase();
  if (!SUPERADMIN_EMAILS.includes(email)) {
    return {
      authorized: false,
      session,
      error: NextResponse.json({ error: 'Forbidden — superadmin access required' }, { status: 403 }),
    };
  }

  return { authorized: true, session, error: null };
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}
