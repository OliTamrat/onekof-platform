import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { verifyCronAuth } from '@/lib/cron-auth';
import { sendUsageLimitWarningEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/usage-enforcement
 *
 * Daily cron job (08:00 UTC) that checks plan limit usage:
 * - Counts current members and projects for each paid org
 * - Compares against plan limits (maxMembers, maxProjects)
 * - Sends warning email if over limit (soft enforcement — doesn't block)
 */
export async function POST(request: NextRequest) {
  const { authorized, error } = verifyCronAuth(request);
  if (!authorized) return error!;

  const now = new Date();
  const results = {
    checked: 0,
    violations: [] as Array<{ orgId: string; orgName: string; issues: string[] }>,
    errors: [] as string[],
  };

  try {
    const paidOrgs = await prisma.organization.findMany({
      where: {
        plan: { not: 'FREE' },
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
        members: {
          where: { role: 'OWNER' },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    results.checked = paidOrgs.length;

    for (const org of paidOrgs) {
      try {
        const violations: Array<{ type: string; current: number; max: number }> = [];

        if (org._count.members > org.maxMembers) {
          violations.push({
            type: 'Team Members',
            current: org._count.members,
            max: org.maxMembers,
          });
        }

        if (org._count.projects > org.maxProjects) {
          violations.push({
            type: 'Projects',
            current: org._count.projects,
            max: org.maxProjects,
          });
        }

        if (violations.length > 0) {
          const owner = org.members[0]?.user;
          if (owner?.email) {
            await sendUsageLimitWarningEmail(owner.email, org.name, violations);
          }

          results.violations.push({
            orgId: org.id,
            orgName: org.name,
            issues: violations.map((v) => `${v.type}: ${v.current}/${v.max}`),
          });
        }
      } catch (err) {
        results.errors.push(`Usage check failed for org ${org.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Usage query failed: ${err}`);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
