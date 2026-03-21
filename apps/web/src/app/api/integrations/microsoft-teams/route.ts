import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTeamsOAuthUrl, disconnectTeams, updateTeamsConfig, updateTeamsNotifications } from '@/lib/integrations/microsoft-teams';
import { getConnection } from '@/lib/integrations/store';
import { randomBytes } from 'crypto';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const action = req.nextUrl.searchParams.get('action');

    if (action === 'oauth_url') {
      const state = Buffer.from(JSON.stringify({
        organizationId: org.id,
        userId: session.user.id,
        provider: 'microsoft-teams',
        nonce: randomBytes(16).toString('hex'),
        redirectUrl: req.nextUrl.searchParams.get('redirect') || '/dashboard/settings/integrations',
      })).toString('base64url');

      return NextResponse.json({ url: getTeamsOAuthUrl(state) });
    }

    const connection = await getConnection(org.id, 'microsoft-teams');
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
    logger.error('Teams GET error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const body = await req.json();
    const { notifications, ...configUpdates } = body;

    if (notifications) {
      await updateTeamsNotifications(org.id, notifications);
    }

    if (Object.keys(configUpdates).length > 0) {
      await updateTeamsConfig(org.id, configUpdates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Teams PUT error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    await disconnectTeams(org.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Teams DELETE error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
