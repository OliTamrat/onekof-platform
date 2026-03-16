import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  return NextResponse.json({ admin: auth.admin });
}
