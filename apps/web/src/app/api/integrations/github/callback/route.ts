import { NextRequest, NextResponse } from 'next/server';
import { connectGitHub } from '@/lib/integrations/github';
import type { OAuthState } from '@/lib/integrations/types';
import { sanitizeRedirectUrl } from '@/lib/validation/schemas';
import { verifyOAuthState, stateMembershipValid } from '@/lib/integrations/oauth-state';
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

    // The state parameter is attacker-controlled: base64url is an encoding,
    // not a signature. Before this was signed, forging an organizationId here
    // connected the caller's own workspace to somebody else's tenant, after
    // which that tenant's notifications flowed to the attacker.
    const verified = verifyOAuthState(stateParam);
    if (!verified.ok) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_state', req.nextUrl.origin)
      );
    }
    const state: OAuthState = verified.state;

    // Signing proves we minted this state, not that the grant is still live.
    // Someone removed from the organization between the redirect out and the
    // redirect back must not be able to complete the connection.
    if (!(await stateMembershipValid(state))) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_state', req.nextUrl.origin)
      );
    }

    await connectGitHub(state.organizationId, state.userId, code);

    const redirectUrl = sanitizeRedirectUrl(state.redirectUrl, '/dashboard/settings/integrations');
    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=github`, req.nextUrl.origin)
    );
  } catch (error) {
    logger.error('GitHub callback error', { error: error instanceof Error ? error.message : error });
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?error=connection_failed', req.nextUrl.origin)
    );
  }
}
