import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

function getAdminUsers() {
  const raw = process.env.ADMIN_USERS || '';
  if (!raw) return [];
  try {
    return JSON.parse(raw).map((u: any) => ({
      username: u.username,
      name: u.name,
      role: u.role,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const auth = await requireSuperAdmin('OWNER');
  if (!auth.authorized) return auth.error;

  const team = getAdminUsers();
  return NextResponse.json({ team });
}
