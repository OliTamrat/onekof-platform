import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectEmail, disconnectEmail, updateEmailConfig, updateEmailNotifications } from '@/lib/integrations/email';
import { getConnection } from '@/lib/integrations/store';
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

    // Email doesn't need OAuth — direct activation
    if (action === 'oauth_url') {
      await connectEmail(org.id, session.user.id);
      return NextResponse.json({ url: '/dashboard/settings/integrations?connected=email' });
    }

    const connection = await getConnection(org.id, 'email');
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
    logger.error('Email GET error', { error: error instanceof Error ? error.message : error });
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
      await updateEmailNotifications(org.id, notifications);
    }

    if (Object.keys(configUpdates).length > 0) {
      await updateEmailConfig(org.id, configUpdates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Email PUT error', { error: error instanceof Error ? error.message : error });
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

    await disconnectEmail(org.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Email DELETE error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
