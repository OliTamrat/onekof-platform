import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addWebhookEndpoint, removeWebhookEndpoint, updateWebhookEndpoint } from '@/lib/integrations/webhooks';
import { avatarUrlSchema } from '@/lib/validation/schemas';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const body = await req.json();
    const { name, url, events } = body;

    if (!name || !url || !events?.length) {
      return NextResponse.json({ error: 'Missing required fields: name, url, events' }, { status: 400 });
    }

    // 🔒 SECURITY: Validate webhook URL to prevent Blind SSRF
    const urlResult = avatarUrlSchema.safeParse(url);
    if (!urlResult.success) {
      return NextResponse.json(
        { error: 'Webhook URL must be a valid HTTPS URL from a public host' },
        { status: 400 }
      );
    }

    const endpoint = await addWebhookEndpoint(org.id, { name, url, events });
    return NextResponse.json({ endpoint });
  } catch (error) {
    logger.error('Webhook endpoint POST error', { error: error instanceof Error ? error.message : error });
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
    const { endpointId, ...updates } = body;

    if (!endpointId) {
      return NextResponse.json({ error: 'Missing endpointId' }, { status: 400 });
    }

    // 🔒 SECURITY: Validate webhook URL if being updated
    if (updates.url) {
      const urlResult = avatarUrlSchema.safeParse(updates.url);
      if (!urlResult.success) {
        return NextResponse.json(
          { error: 'Webhook URL must be a valid HTTPS URL from a public host' },
          { status: 400 }
        );
      }
    }

    await updateWebhookEndpoint(org.id, endpointId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook endpoint PUT error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const org = session.user.organizations?.[0];
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const endpointId = req.nextUrl.searchParams.get('id');
    if (!endpointId) {
      return NextResponse.json({ error: 'Missing endpoint id' }, { status: 400 });
    }

    await removeWebhookEndpoint(org.id, endpointId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook endpoint DELETE error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
