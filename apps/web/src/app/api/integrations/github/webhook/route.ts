import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhookSignature, handleGitHubWebhook } from '@/lib/integrations/github';
import { getConnections } from '@/lib/integrations/store';
import type { GitHubConfig } from '@/lib/integrations/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || '';
    const event = req.headers.get('x-github-event') || '';
    const deliveryId = req.headers.get('x-github-delivery') || '';

    if (!event) {
      return NextResponse.json({ error: 'Missing event header' }, { status: 400 });
    }

    // Ping event — acknowledge immediately
    if (event === 'ping') {
      return NextResponse.json({ ok: true, message: 'pong' });
    }

    const payload = JSON.parse(body);

    // Determine which organization this webhook belongs to based on the repo
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      return NextResponse.json({ error: 'No repository in payload' }, { status: 400 });
    }

    // Look up the organization ID from the webhook secret or repo mapping
    // For now, try to verify against all GitHub connections
    // In production, webhook URL would include org ID: /api/integrations/github/webhook?org=xxx
    const orgId = req.nextUrl.searchParams.get('org');

    if (orgId) {
      // Verify signature with org-specific secret
      const { getConnection } = await import('@/lib/integrations/store');
      const connection = await getConnection(orgId, 'github');
      if (connection) {
        const config = connection.configuration as GitHubConfig;
        if (!verifyGitHubWebhookSignature(body, signature, config.webhookSecret)) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        await handleGitHubWebhook(orgId, event, payload);
        return NextResponse.json({ ok: true, delivery: deliveryId });
      }
    }

    // Fallback: verify with global secret
    if (!verifyGitHubWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    return NextResponse.json({ ok: true, delivery: deliveryId });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
