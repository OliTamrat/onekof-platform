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
 * Which build is actually serving this request.
 *
 * Exists because of a real incident: the dashboard work was reviewed against
 * a feature branch while production served an older master, and the only way
 * to discover that was to compare screenshots against source. One URL that
 * names the running commit turns that investigation into a single request —
 * check /api/health, compare `commit` to the branch head, done.
 *
 * Two deployment shapes, two sources:
 *  - Vercel injects VERCEL_GIT_COMMIT_SHA (requires "Automatically expose
 *    System Environment Variables", on by default for new projects).
 *  - The Docker image bakes GIT_COMMIT_SHA in via the BUILD_SHA build arg
 *    that the docker-build workflow passes.
 * Null means neither was present — a local dev server, or a build produced
 * outside both pipelines — and is reported as-is rather than faked, because
 * "unknown build" is itself the finding.
 */
function deploymentIdentity() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null;
  return {
    commit,
    commitShort: commit ? commit.slice(0, 7) : null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    platform: process.env.VERCEL_ENV
      ? `vercel:${process.env.VERCEL_ENV}`
      : process.env.GIT_COMMIT_SHA
        ? 'docker'
        : null,
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
      deployment: deploymentIdentity(),
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
        // Reported on failure as well — an unhealthy deployment is precisely
        // when "which build is this?" matters most, and identity comes from
        // env vars, not from the database that just failed.
        deployment: deploymentIdentity(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
