import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/security/superadmin';
import { getRuntimeInfo } from '@/lib/env/runtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorized, error } = await requireSuperAdmin();
  if (!authorized) return error!;

  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    const runtimeInfo = getRuntimeInfo();

    return NextResponse.json({
      databaseConfigured: dbUrl !== 'NOT_SET',
      databaseHost: maskedUrl.includes('supabase') ? 'Supabase' :
                     maskedUrl.includes('render') ? 'Render' :
                     maskedUrl.includes('localhost') ? 'Localhost' : 'Unknown',
      maskedUrl: maskedUrl,
      nodeEnv: process.env.NODE_ENV,
      runtime: runtimeInfo,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check database' }, { status: 500 });
  }
}
