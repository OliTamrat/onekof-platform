import { NextRequest, NextResponse } from 'next/server';
import { connectGitHub } from '@/lib/integrations/github';
import type { OAuthState } from '@/lib/integrations/types';

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

    await connectGitHub(state.organizationId, state.userId, code);

    const redirectUrl = state.redirectUrl || '/dashboard/settings/integrations';
    return NextResponse.redirect(
      new URL(`${redirectUrl}?connected=github`, req.nextUrl.origin)
    );
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/integrations?error=${encodeURIComponent(error instanceof Error ? error.message : 'connection_failed')}`, req.nextUrl.origin)
    );
  }
}
