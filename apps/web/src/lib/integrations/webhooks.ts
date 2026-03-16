import { createHmac, randomBytes } from 'crypto';
import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { WebhooksConfig, WebhookEndpoint } from './types';

export async function connectWebhooks(
  organizationId: string,
  userId: string
) {
  const config: WebhooksConfig = {
    endpoints: [],
  };

  const connection = await upsertConnection(organizationId, 'webhooks', {
    status: 'connected',
    accessToken: '',
    refreshToken: null,
    tokenExpiresAt: null,
    externalAccountId: organizationId,
    externalAccountName: 'Webhooks',
    scopes: [],
    metadata: {},
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'webhooks.connected',
    direction: 'outbound',
    status: 'success',
    payload: {},
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectWebhooks(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'webhooks.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'webhooks');
}

export async function addWebhookEndpoint(
  organizationId: string,
  endpoint: { name: string; url: string; events: string[] }
): Promise<WebhookEndpoint> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (!connection) throw new Error('Webhooks not enabled');

  const config = connection.configuration as WebhooksConfig;
  const secret = randomBytes(32).toString('hex');

  const newEndpoint: WebhookEndpoint = {
    id: `wh_${Date.now()}_${randomBytes(4).toString('hex')}`,
    name: endpoint.name,
    url: endpoint.url,
    secret,
    events: endpoint.events,
    active: true,
    createdAt: new Date().toISOString(),
    lastDeliveryAt: null,
    lastDeliveryStatus: null,
  };

  config.endpoints.push(newEndpoint);
  await upsertConnection(organizationId, 'webhooks', { configuration: config });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'webhooks.endpoint_added',
    direction: 'outbound',
    status: 'success',
    payload: { endpointId: newEndpoint.id, name: newEndpoint.name, url: newEndpoint.url },
    response: null,
    error: null,
  });

  return newEndpoint;
}

export async function removeWebhookEndpoint(
  organizationId: string,
  endpointId: string
): Promise<void> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (!connection) throw new Error('Webhooks not enabled');

  const config = connection.configuration as WebhooksConfig;
  config.endpoints = config.endpoints.filter(e => e.id !== endpointId);
  await upsertConnection(organizationId, 'webhooks', { configuration: config });
}

export async function updateWebhookEndpoint(
  organizationId: string,
  endpointId: string,
  updates: Partial<Pick<WebhookEndpoint, 'name' | 'url' | 'events' | 'active'>>
): Promise<void> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (!connection) throw new Error('Webhooks not enabled');

  const config = connection.configuration as WebhooksConfig;
  const idx = config.endpoints.findIndex(e => e.id === endpointId);
  if (idx < 0) throw new Error('Endpoint not found');

  config.endpoints[idx] = { ...config.endpoints[idx], ...updates };
  await upsertConnection(organizationId, 'webhooks', { configuration: config });
}

function signPayload(payload: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
}

export async function deliverWebhook(
  organizationId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (!connection || connection.status !== 'connected') return;

  const config = connection.configuration as WebhooksConfig;
  const matchingEndpoints = config.endpoints.filter(
    e => e.active && (e.events.includes('*') || e.events.includes(eventType))
  );

  for (const endpoint of matchingEndpoints) {
    const body = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = signPayload(body, endpoint.secret);
    let success = false;

    // Retry with backoff: 0s, 2s, 4s
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 2000));

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Onekof-Signature': signature,
            'X-Onekof-Event': eventType,
            'X-Onekof-Delivery': `${Date.now()}`,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok || response.status < 500) {
          success = true;
          break;
        }
      } catch {
        if (attempt === 2) break;
      }
    }

    // Update delivery status
    endpoint.lastDeliveryAt = new Date().toISOString();
    endpoint.lastDeliveryStatus = success ? 'success' : 'failed';

    await logEvent(organizationId, {
      connectionId: connection.id,
      type: `webhooks.delivery.${eventType}`,
      direction: 'outbound',
      status: success ? 'success' : 'failed',
      payload: { endpointId: endpoint.id, url: endpoint.url },
      response: null,
      error: success ? null : 'Delivery failed after 3 attempts',
    });
  }

  await upsertConnection(organizationId, 'webhooks', { configuration: config });
}

export async function testWebhookEndpoint(
  organizationId: string,
  endpointId: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  const connection = await getConnection(organizationId, 'webhooks');
  if (!connection) return { success: false, error: 'Webhooks not enabled' };

  const config = connection.configuration as WebhooksConfig;
  const endpoint = config.endpoints.find(e => e.id === endpointId);
  if (!endpoint) return { success: false, error: 'Endpoint not found' };

  const body = JSON.stringify({
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test webhook from Onekof' },
  });

  const signature = signPayload(body, endpoint.secret);

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Onekof-Signature': signature,
        'X-Onekof-Event': 'webhook.test',
        'X-Onekof-Delivery': `${Date.now()}`,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    return { success: response.ok, statusCode: response.status };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
