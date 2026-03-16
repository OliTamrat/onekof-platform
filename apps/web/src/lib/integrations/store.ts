import { prisma } from '@onekof/database';
import { encrypt, decrypt } from './encryption';
import type { IntegrationProvider, IntegrationStatus, IntegrationConnection, IntegrationConfig, IntegrationEvent } from './types';

// Store integration connections in the Organization.settings JSON field
// under the key "integrationConnections" to avoid schema migrations.

interface StoredConnection {
  id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  externalAccountId: string | null;
  externalAccountName: string | null;
  accessToken: string; // encrypted
  refreshToken: string | null; // encrypted
  tokenExpiresAt: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
  connectedBy: string;
  connectedAt: string;
  updatedAt: string;
}

interface StoredEvent {
  id: string;
  connectionId: string;
  type: string;
  direction: 'inbound' | 'outbound';
  status: 'success' | 'failed' | 'pending';
  payload: Record<string, unknown>;
  response: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
}

function generateId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getOrgSettings(organizationId: string): Promise<Record<string, unknown>> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  if (!org) throw new Error('Organization not found');
  return (typeof org.settings === 'object' && org.settings !== null ? org.settings : {}) as Record<string, unknown>;
}

async function updateOrgSettings(organizationId: string, settings: Record<string, unknown>): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { settings: settings as any },
  });
}

function deserializeConnection(stored: StoredConnection, organizationId: string): IntegrationConnection {
  return {
    id: stored.id,
    organizationId,
    provider: stored.provider,
    status: stored.status,
    externalAccountId: stored.externalAccountId,
    externalAccountName: stored.externalAccountName,
    accessToken: stored.accessToken ? decrypt(stored.accessToken) : '',
    refreshToken: stored.refreshToken ? decrypt(stored.refreshToken) : null,
    tokenExpiresAt: stored.tokenExpiresAt ? new Date(stored.tokenExpiresAt) : null,
    scopes: stored.scopes,
    metadata: stored.metadata,
    configuration: stored.configuration as unknown as IntegrationConfig,
    connectedBy: stored.connectedBy,
    connectedAt: new Date(stored.connectedAt),
    updatedAt: new Date(stored.updatedAt),
  };
}

function serializeConnection(conn: Partial<IntegrationConnection> & { id: string; provider: IntegrationProvider }): StoredConnection {
  return {
    id: conn.id,
    provider: conn.provider,
    status: conn.status || 'pending',
    externalAccountId: conn.externalAccountId || null,
    externalAccountName: conn.externalAccountName || null,
    accessToken: conn.accessToken ? encrypt(conn.accessToken) : '',
    refreshToken: conn.refreshToken ? encrypt(conn.refreshToken) : null,
    tokenExpiresAt: conn.tokenExpiresAt?.toISOString() || null,
    scopes: conn.scopes || [],
    metadata: conn.metadata || {},
    configuration: (conn.configuration || {}) as Record<string, unknown>,
    connectedBy: conn.connectedBy || '',
    connectedAt: conn.connectedAt?.toISOString() || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getConnections(organizationId: string): Promise<IntegrationConnection[]> {
  const settings = await getOrgSettings(organizationId);
  const connections = (settings.integrationConnections || []) as StoredConnection[];
  return connections.map(c => deserializeConnection(c, organizationId));
}

export async function getConnection(organizationId: string, provider: IntegrationProvider): Promise<IntegrationConnection | null> {
  const connections = await getConnections(organizationId);
  return connections.find(c => c.provider === provider) || null;
}

export async function upsertConnection(
  organizationId: string,
  provider: IntegrationProvider,
  data: Partial<IntegrationConnection>
): Promise<IntegrationConnection> {
  const settings = await getOrgSettings(organizationId);
  const connections = (settings.integrationConnections || []) as StoredConnection[];

  const existingIdx = connections.findIndex(c => c.provider === provider);
  const id = existingIdx >= 0 ? connections[existingIdx].id : generateId();

  const serialized = serializeConnection({
    ...(existingIdx >= 0 ? deserializeConnection(connections[existingIdx], organizationId) : {}),
    ...data,
    id,
    provider,
  });

  if (existingIdx >= 0) {
    connections[existingIdx] = serialized;
  } else {
    connections.push(serialized);
  }

  settings.integrationConnections = connections;
  await updateOrgSettings(organizationId, settings);

  return deserializeConnection(serialized, organizationId);
}

export async function deleteConnection(organizationId: string, provider: IntegrationProvider): Promise<void> {
  const settings = await getOrgSettings(organizationId);
  const connections = (settings.integrationConnections || []) as StoredConnection[];
  settings.integrationConnections = connections.filter(c => c.provider !== provider);
  await updateOrgSettings(organizationId, settings);
}

export async function logEvent(
  organizationId: string,
  event: Omit<IntegrationEvent, 'id' | 'createdAt'>
): Promise<void> {
  const settings = await getOrgSettings(organizationId);
  const events = (settings.integrationEvents || []) as StoredEvent[];

  events.unshift({
    id: generateId(),
    connectionId: event.connectionId,
    type: event.type,
    direction: event.direction,
    status: event.status,
    payload: event.payload,
    response: event.response,
    error: event.error,
    createdAt: new Date().toISOString(),
  });

  // Keep only last 100 events per org
  settings.integrationEvents = events.slice(0, 100);
  await updateOrgSettings(organizationId, settings);
}

export async function getEvents(organizationId: string, connectionId?: string): Promise<IntegrationEvent[]> {
  const settings = await getOrgSettings(organizationId);
  const events = (settings.integrationEvents || []) as StoredEvent[];
  const filtered = connectionId ? events.filter(e => e.connectionId === connectionId) : events;
  return filtered.map(e => ({
    ...e,
    createdAt: new Date(e.createdAt),
  }));
}
