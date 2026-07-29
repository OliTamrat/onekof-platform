import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resolveUserOrganization } from '@/lib/api-organization';
import { testWebhookEndpoint } from '@/lib/integrations/webhooks';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the organization from the REQUEST (subdomain), not from the
    // user's first membership. See docs/architecture/API_AUTHORIZATION_AUDIT.md F2.
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    const { endpointId } = await req.json();
    if (!endpointId) {
      return NextResponse.json({ error: 'Missing endpointId' }, { status: 400 });
    }

    const result = await testWebhookEndpoint(ctx.organizationId, endpointId);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Webhook test error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
