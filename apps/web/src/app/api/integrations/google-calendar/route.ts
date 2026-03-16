import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleCalendarOAuthUrl, disconnectGoogleCalendar, updateGoogleCalendarConfig } from '@/lib/integrations/google-calendar';
import { getConnection } from '@/lib/integrations/store';
import { randomBytes } from 'crypto';

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
        provider: 'google-calendar',
        nonce: randomBytes(16).toString('hex'),
        redirectUrl: req.nextUrl.searchParams.get('redirect') || '/dashboard/settings/integrations',
      })).toString('base64url');

      return NextResponse.json({ url: getGoogleCalendarOAuthUrl(state) });
    }

    const connection = await getConnection(org.id, 'google-calendar');
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
    console.error('Google Calendar GET error:', error);
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
    await updateGoogleCalendarConfig(org.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Calendar PUT error:', error);
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

    await disconnectGoogleCalendar(org.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Calendar DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
