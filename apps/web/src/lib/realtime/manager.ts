export interface RealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
}

type ClientCallback = (event: RealtimeEvent) => void;

interface Client {
  id: string;
  userId: string;
  callback: ClientCallback;
  connectedAt: Date;
}

class RealtimeManager {
  private clients: Map<string, Client> = new Map();
  private counter = 0;

  addClient(userId: string, callback: ClientCallback): string {
    const clientId = `client_${++this.counter}_${Date.now()}`;
    this.clients.set(clientId, {
      id: clientId,
      userId,
      callback,
      connectedAt: new Date(),
    });
    this.broadcastPresence();
    return clientId;
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    this.broadcastPresence();
  }

  sendToUser(userId: string, event: RealtimeEvent): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        client.callback(event);
      }
    });
  }

  broadcast(event: RealtimeEvent, excludeUserId?: string): void {
    this.clients.forEach((client) => {
      if (client.userId !== excludeUserId) {
        client.callback(event);
      }
    });
  }

  getOnlineUsers(): string[] {
    const users = new Set<string>();
    this.clients.forEach((client) => users.add(client.userId));
    return Array.from(users);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  private broadcastPresence(): void {
    const onlineUsers = this.getOnlineUsers();
    this.broadcast({
      type: 'presence',
      payload: { onlineUsers, count: onlineUsers.length },
    });
  }
}

// Singleton instance per server process
export const realtimeManager = new RealtimeManager();
