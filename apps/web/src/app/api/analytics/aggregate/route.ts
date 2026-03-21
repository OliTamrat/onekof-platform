import { NextRequest, NextResponse } from 'next/server';
import { aggregateMetricsForAllOrganizations, aggregateAllMetrics, type MetricsResult } from '@/lib/metrics-aggregation';
import logger from '@/lib/logger';

type MetricsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/**
 * POST /api/analytics/aggregate
 * Trigger metrics aggregation for all organizations or a specific organization
 *
 * This endpoint can be called by a cron job to periodically aggregate metrics
 *
 * Query params:
 * - period: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY (default: DAILY)
 * - organizationId: optional - aggregate for specific organization only
 * - apiKey: API key for authentication (should match CRON_SECRET env var)
 */
export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication for cron jobs
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || apiKey !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Get parameters
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'DAILY') as MetricsPeriod;
    const organizationId = searchParams.get('organizationId');

    let result;

    if (organizationId) {
      // Aggregate for specific organization
      result = await aggregateAllMetrics(organizationId, period);

      return NextResponse.json({
        success: true,
        message: `Aggregated ${period} metrics for organization ${organizationId}`,
        ...result,
      });
    } else {
      // Aggregate for all organizations
      const results = await aggregateMetricsForAllOrganizations(period);

      const summary = {
        totalOrganizations: results.length,
        successful: results.filter(r => r.successful > 0).length,
        failed: results.filter(r => r.failed > 0 || r.error).length,
      };

      return NextResponse.json({
        success: true,
        message: `Aggregated ${period} metrics for ${summary.totalOrganizations} organizations`,
        summary,
        results,
      });
    }
  } catch (error) {
    logger.error('Metrics aggregation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to aggregate metrics' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/aggregate
 * Get status/info about metrics aggregation
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Metrics Aggregation API',
    usage: {
      method: 'POST',
      description: 'Trigger metrics aggregation',
      queryParams: {
        period: 'DAILY | WEEKLY | MONTHLY | QUARTERLY | YEARLY (default: DAILY)',
        organizationId: '(optional) Specific organization ID to aggregate',
        apiKey: '(required) API key for authentication',
      },
      headers: {
        'x-api-key': '(alternative) API key for authentication',
      },
      example: {
        allOrganizations: '/api/analytics/aggregate?apiKey=YOUR_SECRET&period=DAILY',
        singleOrganization: '/api/analytics/aggregate?apiKey=YOUR_SECRET&period=DAILY&organizationId=org_123',
      },
    },
    cronSetup: {
      description: 'Set up a cron job to call this endpoint periodically',
      environment: {
        CRON_SECRET: 'Set this environment variable with a secure random string',
      },
      vercelCron: {
        description: 'Add to vercel.json',
        config: {
          crons: [
            {
              path: '/api/analytics/aggregate?apiKey=YOUR_SECRET&period=DAILY',
              schedule: '0 0 * * *', // Daily at midnight
            },
          ],
        },
      },
    },
  });
}
