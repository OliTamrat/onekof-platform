import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();

    // Check environment variables
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL || 'NOT_SET',
    };

    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      userCount,
      environment: envStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
