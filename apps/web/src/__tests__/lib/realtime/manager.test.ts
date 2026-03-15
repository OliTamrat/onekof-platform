import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create fresh instance for each test
function createRealtimeManager() {
  const clients = new Map<string, { id: string; userId: string; callback: (event: { type: string; payload: Record<string, unknown> }) => void }>();
  let counter = 0;

  return {
    addClient(userId: string, callback: (event: { type: string; payload: Record<string, unknown> }) => void) {
      const clientId = `client_${++counter}_${Date.now()}`;
      clients.set(clientId, { id: clientId, userId, callback });
      return clientId;
    },
    removeClient(clientId: string) {
      clients.delete(clientId);
    },
    sendToUser(userId: string, event: { type: string; payload: Record<string, unknown> }) {
      clients.forEach((client) => {
        if (client.userId === userId) client.callback(event);
      });
    },
    broadcast(event: { type: string; payload: Record<string, unknown> }, excludeUserId?: string) {
      clients.forEach((client) => {
        if (client.userId !== excludeUserId) client.callback(event);
      });
    },
    getOnlineUsers() {
      const users = new Set<string>();
      clients.forEach((client) => users.add(client.userId));
      return Array.from(users);
    },
    getClientCount() {
      return clients.size;
    },
  };
}

describe('RealtimeManager', () => {
  let manager: ReturnType<typeof createRealtimeManager>;

  beforeEach(() => {
    manager = createRealtimeManager();
  });

  it('adds and removes clients', () => {
    const callback = vi.fn();
    const clientId = manager.addClient('user1', callback);

    expect(manager.getClientCount()).toBe(1);
    expect(manager.getOnlineUsers()).toContain('user1');

    manager.removeClient(clientId);
    expect(manager.getClientCount()).toBe(0);
  });

  it('sends events to specific user', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    manager.addClient('user1', callback1);
    manager.addClient('user2', callback2);

    const event = { type: 'test', payload: { data: 'hello' } };
    manager.sendToUser('user1', event);

    expect(callback1).toHaveBeenCalledWith(event);
    expect(callback2).not.toHaveBeenCalled();
  });

  it('broadcasts to all clients except excluded user', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    manager.addClient('user1', callback1);
    manager.addClient('user2', callback2);
    manager.addClient('user3', callback3);

    const event = { type: 'update', payload: { message: 'broadcast' } };
    manager.broadcast(event, 'user1');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith(event);
    expect(callback3).toHaveBeenCalledWith(event);
  });

  it('broadcasts to all clients when no exclusion', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    manager.addClient('user1', callback1);
    manager.addClient('user2', callback2);

    const event = { type: 'global', payload: {} };
    manager.broadcast(event);

    expect(callback1).toHaveBeenCalledWith(event);
    expect(callback2).toHaveBeenCalledWith(event);
  });

  it('tracks unique online users', () => {
    const noop = vi.fn();
    manager.addClient('user1', noop);
    manager.addClient('user1', noop); // Same user, two tabs
    manager.addClient('user2', noop);

    expect(manager.getOnlineUsers()).toHaveLength(2);
    expect(manager.getClientCount()).toBe(3);
  });

  it('sends to all tabs of same user', () => {
    const tab1 = vi.fn();
    const tab2 = vi.fn();
    manager.addClient('user1', tab1);
    manager.addClient('user1', tab2);

    const event = { type: 'notification', payload: { text: 'hi' } };
    manager.sendToUser('user1', event);

    expect(tab1).toHaveBeenCalledWith(event);
    expect(tab2).toHaveBeenCalledWith(event);
  });
});
