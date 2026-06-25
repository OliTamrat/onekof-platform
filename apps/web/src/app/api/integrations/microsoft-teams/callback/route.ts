import { NextRequest, NextResponse } from 'next/server';
import { connectTeams } from '@/lib/integrations/microsoft-teams';
import type { OAuthState } from '@/lib/integrations/types';
import { sanitizeRedirectUrl } from '@/lib/validation/schemas';
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

    await connectTeams(state.organizationId, state.userId, code);

    const redirectUrl = sanitizeRedirectUrl(state.redirectUrl, '/dashboard/settings/integrations');
    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=microsoft-teams`, req.nextUrl.origin)
    );
  } catch (error) {
    logger.error('Teams callback error', { error: error instanceof Error ? error.message : error });
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?error=connection_failed', req.nextUrl.origin)
    );
  }
}
