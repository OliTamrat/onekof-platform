import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resolveUserOrganization } from '@/lib/api-organization';
import { getGoogleCalendarOAuthUrl, disconnectGoogleCalendar, updateGoogleCalendarConfig } from '@/lib/integrations/google-calendar';
import { getConnection } from '@/lib/integrations/store';
import { signOAuthState } from '@/lib/integrations/oauth-state';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the organization from the REQUEST (subdomain), not from the
    // user's first membership. See docs/architecture/API_AUTHORIZATION_AUDIT.md F2.
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    const action = req.nextUrl.searchParams.get('action');

    if (action === 'oauth_url') {
      const state = signOAuthState({
        organizationId: ctx.organizationId,
        userId: session.user.id,
        provider: 'google-calendar',
        redirectUrl: req.nextUrl.searchParams.get('redirect') || '/dashboard/settings/integrations',
      });

      return NextResponse.json({ url: getGoogleCalendarOAuthUrl(state) });
    }

    const connection = await getConnection(ctx.organizationId, 'google-calendar');
    return NextResponse.json({
      connected: !!connection && connection.status === 'connected',
      connection: connection ? {
        id: connection.id,
        status: connection.status,
        externalAccountName: connection.externalAccountName,
        configuration: connection.configuration,
        metadata: connection.metadata,
        connectedAt: connection.connectedAt,
      } : null,
    });
  } catch (error) {
    logger.error('Google Calendar GET error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the organization from the REQUEST (subdomain), not from the
    // user's first membership. See docs/architecture/API_AUTHORIZATION_AUDIT.md F2.
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    const body = await req.json();
    await updateGoogleCalendarConfig(ctx.organizationId, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Google Calendar PUT error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the organization from the REQUEST (subdomain), not from the
    // user's first membership. See docs/architecture/API_AUTHORIZATION_AUDIT.md F2.
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    await disconnectGoogleCalendar(ctx.organizationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Google Calendar DELETE error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
