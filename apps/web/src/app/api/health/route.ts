import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Basic health check endpoint
 * Returns 200 if service is healthy
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      service: 'onekof-platform',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
