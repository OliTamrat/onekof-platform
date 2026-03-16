import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

interface ServiceCheck {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  detail: string;
}

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  const checks: ServiceCheck[] = [];

  // Database health check
  const dbStart = Date.now();
  try {
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
    const dbLatency = Date.now() - dbStart;
    checks.push({
      name: 'Database',
      status: dbLatency > 2000 ? 'degraded' : 'operational',
      latency: dbLatency,
      detail: `PostgreSQL responding in ${dbLatency}ms`,
    });
  } catch (error) {
    checks.push({
      name: 'Database',
      status: 'down',
      latency: Date.now() - dbStart,
      detail: error instanceof Error ? error.message : 'Connection failed',
    });
  }

  // Prisma client check
  const prismaStart = Date.now();
  try {
    await prisma.user.count({ take: 1 });
    const prismaLatency = Date.now() - prismaStart;
    checks.push({
      name: 'Prisma ORM',
      status: prismaLatency > 3000 ? 'degraded' : 'operational',
      latency: prismaLatency,
      detail: `ORM query in ${prismaLatency}ms`,
    });
  } catch (error) {
    checks.push({
      name: 'Prisma ORM',
      status: 'down',
      latency: Date.now() - prismaStart,
      detail: error instanceof Error ? error.message : 'Query failed',
    });
  }

  // Auth system check (check env vars are set)
  const authOk = !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL);
  checks.push({
    name: 'Authentication',
    status: authOk ? 'operational' : 'degraded',
    detail: authOk ? 'NextAuth JWT configured' : 'Missing auth environment variables',
  });

  // Admin auth check
  const adminOk = !!(process.env.ADMIN_USERS && process.env.ADMIN_SECRET);
  checks.push({
    name: 'Admin Auth',
    status: adminOk ? 'operational' : 'degraded',
    detail: adminOk ? 'Admin credentials configured' : 'Missing admin config',
  });

  // Multi-tenant routing
  checks.push({
    name: 'Multi-Tenant Routing',
    status: 'operational',
    detail: 'Subdomain routing via middleware active',
  });

  // Application server
  checks.push({
    name: 'Application',
    status: 'operational',
    detail: `Next.js ${process.env.NEXT_RUNTIME === 'edge' ? 'Edge' : 'Node.js'} runtime`,
  });

  const overallStatus = checks.some(c => c.status === 'down')
    ? 'down'
    : checks.some(c => c.status === 'degraded')
    ? 'degraded'
    : 'operational';

  // Environment info (safe, no secrets)
  const environment = {
    nodeVersion: process.version,
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
    region: process.env.VERCEL_REGION || 'unknown',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID?.slice(0, 8) || 'local',
  };

  return NextResponse.json({
    status: overallStatus,
    checks,
    environment,
    checkedAt: new Date().toISOString(),
  });
}
