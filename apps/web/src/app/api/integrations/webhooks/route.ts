import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resolveUserOrganization } from '@/lib/api-organization';
import { connectWebhooks, disconnectWebhooks } from '@/lib/integrations/webhooks';
import { getConnection } from '@/lib/integrations/store';
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

    // Webhooks don't need OAuth — direct activation
    if (action === 'oauth_url') {
      // Auto-connect and redirect
      await connectWebhooks(ctx.organizationId, session.user.id);
      return NextResponse.json({ url: '/dashboard/settings/integrations?connected=webhooks' });
    }

    const connection = await getConnection(ctx.organizationId, 'webhooks');
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
    logger.error('Webhooks GET error', { error: error instanceof Error ? error.message : error });
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

    await disconnectWebhooks(ctx.organizationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhooks DELETE error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
