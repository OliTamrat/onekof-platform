'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

interface RealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
}

type EventHandler = (payload: Record<string, unknown>) => void;

export function useRealtime() {
  const { data: session } = useSession();
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!session?.user || eventSourceRef.current) return;

    const eventSource = new EventSource('/api/realtime');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    eventSource.addEventListener('presence', (e) => {
      const data = JSON.parse(e.data);
      setOnlineUsers(data.onlineUsers || []);
    });

    // Listen for all event types by using onmessage
    eventSource.onmessage = (e) => {
      try {
        const event: RealtimeEvent = JSON.parse(e.data);
        const handlers = handlersRef.current.get(event.type);
        if (handlers) {
          handlers.forEach((handler) => handler(event.payload));
        }
      } catch {
        // Ignore parse errors for heartbeats
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      // Exponential backoff reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [session]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback((eventType: string, handler: EventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);

    // Also register with EventSource for named events
    if (eventSourceRef.current) {
      eventSourceRef.current.addEventListener(eventType, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          handler(data);
        } catch {
          // Ignore
        }
      });
    }

    return () => {
      handlersRef.current.get(eventType)?.delete(handler);
    };
  }, []);

  const publish = useCallback(async (type: string, payload: Record<string, unknown>, targetUserIds?: string[]) => {
    await fetch('/api/realtime/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, targetUserIds }),
    });
  }, []);

  return { isConnected, onlineUsers, subscribe, publish };
}
