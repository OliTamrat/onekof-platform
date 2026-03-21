import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConnections, getEvents } from '@/lib/integrations/store';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 });
    }

    const connections = await getConnections(org.id);
    const events = await getEvents(org.id);

    // Strip sensitive tokens from response
    const safeConnections = connections.map(c => ({
      id: c.id,
      provider: c.provider,
      status: c.status,
      externalAccountId: c.externalAccountId,
      externalAccountName: c.externalAccountName,
      scopes: c.scopes,
      metadata: c.metadata,
      configuration: c.configuration,
      connectedBy: c.connectedBy,
      connectedAt: c.connectedAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      connections: safeConnections,
      recentEvents: events.slice(0, 20),
    });
  } catch (error) {
    logger.error('Integrations GET error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
