import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getJiraOAuthUrl, disconnectJira, updateJiraConfig, refreshJiraProjects } from '@/lib/integrations/jira';
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
        provider: 'jira',
        nonce: randomBytes(16).toString('hex'),
        redirectUrl: req.nextUrl.searchParams.get('redirect') || '/dashboard/settings/integrations',
      })).toString('base64url');

      return NextResponse.json({ url: getJiraOAuthUrl(state) });
    }

    if (action === 'refresh_projects') {
      const projects = await refreshJiraProjects(org.id);
      return NextResponse.json({ projects });
    }

    const connection = await getConnection(org.id, 'jira');
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
    console.error('Jira GET error:', error);
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
    await updateJiraConfig(org.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Jira PUT error:', error);
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

    await disconnectJira(org.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Jira DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
