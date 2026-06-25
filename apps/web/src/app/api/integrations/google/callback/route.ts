import { NextRequest, NextResponse } from 'next/server';
import { connectGoogle } from '@/lib/integrations/google';
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

    await connectGoogle(state.organizationId, state.userId, code);

    const redirectUrl = sanitizeRedirectUrl(state.redirectUrl, '/dashboard/settings/integrations');
    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=google`, req.nextUrl.origin)
    );
  } catch (error) {
    logger.error('Google callback error', { error: error instanceof Error ? error.message : error });
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?error=connection_failed', req.nextUrl.origin)
    );
  }
}
