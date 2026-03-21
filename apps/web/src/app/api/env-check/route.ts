import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorized, error } = await requireSuperAdmin();
  if (!authorized) return error!;

  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT_SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET (hidden)' : 'NOT_SET',
    AUTH_URL: process.env.AUTH_URL || 'NOT_SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  };

  return NextResponse.json({
    status: 'success',
    message: 'Environment variables check',
    env: envVars,
    timestamp: new Date().toISOString(),
  });
}
