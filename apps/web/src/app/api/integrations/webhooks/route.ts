import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectWebhooks, disconnectWebhooks } from '@/lib/integrations/webhooks';
import { getConnection } from '@/lib/integrations/store';

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

    // Webhooks don't need OAuth — direct activation
    if (action === 'oauth_url') {
      // Auto-connect and redirect
      await connectWebhooks(org.id, session.user.id);
      return NextResponse.json({ url: '/dashboard/settings/integrations?connected=webhooks' });
    }

    const connection = await getConnection(org.id, 'webhooks');
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
    console.error('Webhooks GET error:', error);
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

    await disconnectWebhooks(org.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhooks DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
