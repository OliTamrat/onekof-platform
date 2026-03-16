import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

function verifySlackSignature(body: string, timestamp: string, signature: string): boolean {
  if (!SLACK_SIGNING_SECRET) return false;
  const sigBasestring = `v0:${timestamp}:${body}`;
  const hmac = createHmac('sha256', SLACK_SIGNING_SECRET);
  const mySignature = `v0=${hmac.update(sigBasestring).digest('hex')}`;
  return mySignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const timestamp = req.headers.get('x-slack-request-timestamp') || '';
    const signature = req.headers.get('x-slack-signature') || '';

    // Verify request is from Slack
    if (SLACK_SIGNING_SECRET && !verifySlackSignature(body, timestamp, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Prevent replay attacks (5 min window)
    if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
      return NextResponse.json({ error: 'Request too old' }, { status: 403 });
    }

    const payload = JSON.parse(body);

    // URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle events
    if (payload.type === 'event_callback') {
      const event = payload.event;

      // Handle slash command mentions, app_mention, etc.
      if (event.type === 'app_mention') {
        // Future: respond to @onekof mentions in Slack
      }

      if (event.type === 'message' && event.channel_type === 'im') {
        // Future: handle DMs to the bot
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
