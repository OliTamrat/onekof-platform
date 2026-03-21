import { NextRequest, NextResponse } from 'next/server';
import { connectGoogleCalendar } from '@/lib/integrations/google-calendar';
import type { OAuthState } from '@/lib/integrations/types';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const stateParam = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings/integrations?error=${encodeURIComponent(error)}`, req.nextUrl.origin)
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=missing_params', req.nextUrl.origin)
      );
    }

    let state: OAuthState;
    try {
      state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_state', req.nextUrl.origin)
      );
    }

    await connectGoogleCalendar(state.organizationId, state.userId, code);

    const redirectUrl = state.redirectUrl || '/dashboard/settings/integrations';
    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=google-calendar`, req.nextUrl.origin)
    );
  } catch (error) {
    logger.error('Google Calendar callback error', { error: error instanceof Error ? error.message : error });
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?error=connection_failed', req.nextUrl.origin)
    );
  }
}
