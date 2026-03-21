import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testSlackConnection } from '@/lib/integrations/slack';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const result = await testSlackConnection(org.id);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Slack test error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
