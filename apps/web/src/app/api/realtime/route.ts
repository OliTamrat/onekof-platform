import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { realtimeManager } from '@/lib/realtime/manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.email;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const clientId = realtimeManager.addClient(userId, (event) => {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          realtimeManager.removeClient(clientId);
        }
      });

      // Send initial connection event
      const connectMsg = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          realtimeManager.removeClient(clientId);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        realtimeManager.removeClient(clientId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
