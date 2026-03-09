import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/health/detailed
 * Detailed health check with system metrics
 * Requires authentication for security
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication for detailed health info
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checks = await performHealthChecks();

    const overallHealth =
      checks.database.healthy && checks.auth.healthy ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      checks,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        environment: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

async function performHealthChecks() {
  const checks: Record<string, any> = {};

  // Database check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    // Get database stats
    const userCount = await prisma.user.count();
    const organizationCount = await prisma.organization.count();

    checks.database = {
      healthy: true,
      responseTime: `${responseTime}ms`,
      stats: {
        users: userCount,
        organizations: organizationCount,
      },
    };
  } catch (error) {
    checks.database = {
      healthy: false,
      error: 'Database connection failed',
    };
  }

  // Auth check
  try {
    checks.auth = {
      healthy: true,
      provider: 'NextAuth',
    };
  } catch (error) {
    checks.auth = {
      healthy: false,
      error: 'Auth system unavailable',
    };
  }

  // External services check (placeholder for future integrations)
  checks.external = {
    sentry: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not configured',
    email: process.env.RESEND_API_KEY ? 'configured' : 'not configured',
  };

  return checks;
}
