import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify cron job authentication.
 *
 * Accepts:
 * - `Authorization: Bearer {CRON_SECRET}` (Vercel Cron sends this automatically)
 * - `x-api-key: {CRON_SECRET}` (fallback for curl / self-hosted)
 */
export function verifyCronAuth(request: NextRequest): { authorized: boolean; error?: NextResponse } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 }),
    };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true };
  }

  const apiKey = request.headers.get('x-api-key');
  if (apiKey === cronSecret) {
    return { authorized: true };
  }

  return {
    authorized: false,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}
