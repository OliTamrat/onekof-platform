import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { realtimeManager } from '@/lib/realtime/manager';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, payload, targetUserIds } = body;

  if (!type) {
    return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
  }

  const event = {
    type,
    payload: {
      ...payload,
      sender: {
        email: session.user.email,
        name: session.user.name,
      },
      timestamp: new Date().toISOString(),
    },
  };

  if (targetUserIds && Array.isArray(targetUserIds)) {
    targetUserIds.forEach((userId: string) => {
      realtimeManager.sendToUser(userId, event);
    });
  } else {
    realtimeManager.broadcast(event, session.user.email);
  }

  return NextResponse.json({ success: true });
}
