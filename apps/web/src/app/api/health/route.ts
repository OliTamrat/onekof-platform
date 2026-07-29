import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getResidencyPosture, canStorePatientData } from '@/lib/compliance/residency';
import { isBlindIndexConfigured } from '@/lib/security/blind-index';

export const dynamic = 'force-dynamic';

/**
 * Can this deployment actually serve patient features, and if not, why not?
 *
 * `isBlindIndexConfigured()` was written for exactly this and nothing called
 * it. The consequence: on a sovereign deployment with `BLIND_INDEX_KEY`
 * unset, the first thing an operator learns is a 500 from a nurse trying to
 * register a patient — because `blindIndex()` throws by design rather than
 * degrading to an unkeyed hash. A readiness signal turns that into something
 * checkable before anyone touches the ward.
 *
 * Deliberately reports rather than fails. A Tier 3 deployment is *correctly*
 * unable to hold patient data, so `ready: false` there is the expected state,
 * not an outage — the health check must not go red for behaving properly.
 * The `reason` is what distinguishes "not allowed to" from "misconfigured".
 *
 * No secret material is exposed: only whether a key of sufficient length
 * exists.
 */
function patientFeatureReadiness() {
  const posture = getResidencyPosture();
  const residencyAllows = canStorePatientData();
  const keyConfigured = isBlindIndexConfigured();

  return {
    ready: residencyAllows && keyConfigured,
    tier: posture.tier,
    location: posture.location,
    reason: residencyAllows
      ? keyConfigured
        ? null
        : 'BLIND_INDEX_KEY is not set (or is shorter than 32 characters) — patient writes will fail'
      : 'this deployment tier may not hold patient data',
  };
}

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
      patientFeatures: patientFeatureReadiness(),
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
