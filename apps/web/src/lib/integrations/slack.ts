import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { SlackConfig, SlackNotificationConfig } from './types';

const SLACK_CLIENT_ID = (process.env.SLACK_CLIENT_ID || '').trim();
const SLACK_CLIENT_SECRET = (process.env.SLACK_CLIENT_SECRET || '').trim();
const SLACK_REDIRECT_URI = (process.env.SLACK_REDIRECT_URI || `${(process.env.NEXTAUTH_URL || '').trim()}/api/integrations/slack/callback`).trim();

const SLACK_SCOPES = [
  'channels:read',
  'chat:write',
  'chat:write.public',
  'groups:read',
  'team:read',
  'users:read',
  'incoming-webhook',
].join(',');

export function getSlackOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: SLACK_SCOPES,
    redirect_uri: SLACK_REDIRECT_URI,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<{
  accessToken: string;
  teamId: string;
  teamName: string;
  botUserId: string;
  authedUserId: string;
  incomingWebhook?: { channel: string; channelId: string; url: string };
}> {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
      redirect_uri: SLACK_REDIRECT_URI,
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  return {
    accessToken: data.access_token,
    teamId: data.team.id,
    teamName: data.team.name,
    botUserId: data.bot_user_id,
    authedUserId: data.authed_user?.id,
    incomingWebhook: data.incoming_webhook ? {
      channel: data.incoming_webhook.channel,
      channelId: data.incoming_webhook.channel_id,
      url: data.incoming_webhook.url,
    } : undefined,
  };
}

export async function fetchSlackChannels(accessToken: string): Promise<Array<{ id: string; name: string; isPrivate: boolean }>> {
  const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (!data.ok) throw new Error(`Slack API error: ${data.error}`);

  return (data.channels || []).map((ch: any) => ({
    id: ch.id,
    name: ch.name,
    isPrivate: ch.is_private,
  }));
}

export async function sendSlackMessage(
  accessToken: string,
  channelId: string,
  text: string,
  blocks?: Record<string, unknown>[]
): Promise<void> {
  const body: Record<string, unknown> = { channel: channelId, text };
  if (blocks) body.blocks = blocks;

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data.ok) throw new Error(`Slack message error: ${data.error}`);
}

export function buildTaskNotificationBlocks(event: {
  type: string;
  taskTitle: string;
  taskKey: string;
  projectName: string;
  userName: string;
  url: string;
}): Record<string, unknown>[] {
  const emoji = {
    'task.created': ':sparkles:',
    'task.completed': ':white_check_mark:',
    'task.assigned': ':bust_in_silhouette:',
    'comment.added': ':speech_balloon:',
    'project.updated': ':rocket:',
  }[event.type] || ':bell:';

  const actionText = {
    'task.created': 'created a new task',
    'task.completed': 'completed a task',
    'task.assigned': 'was assigned a task',
    'comment.added': 'commented on a task',
    'project.updated': 'updated a project',
  }[event.type] || 'updated';

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${event.userName}* ${actionText}`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Task:*\n<${event.url}|${event.taskKey}: ${event.taskTitle}>` },
        { type: 'mrkdwn', text: `*Project:*\n${event.projectName}` },
      ],
    },
    { type: 'divider' },
  ];
}

export async function connectSlack(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeSlackCode(code);

  let channels: Array<{ id: string; name: string; isPrivate: boolean }> = [];
  try {
    channels = await fetchSlackChannels(oauthResult.accessToken);
  } catch {
    // Non-fatal — channels can be fetched later
  }

  const defaultChannel = oauthResult.incomingWebhook?.channelId || null;
  const defaultChannelName = oauthResult.incomingWebhook?.channel || null;

  const config: SlackConfig = {
    teamId: oauthResult.teamId,
    teamName: oauthResult.teamName,
    defaultChannelId: defaultChannel,
    defaultChannelName: defaultChannelName,
    channels: channels.map(ch => ({ ...ch })),
    notifications: {
      taskCreated: true,
      taskCompleted: true,
      taskAssigned: true,
      commentAdded: true,
      projectUpdated: true,
      dailyDigest: false,
      digestTime: '09:00',
    },
  };

  const connection = await upsertConnection(organizationId, 'slack', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: null,
    tokenExpiresAt: null,
    externalAccountId: oauthResult.teamId,
    externalAccountName: oauthResult.teamName,
    scopes: SLACK_SCOPES.split(','),
    metadata: {
      botUserId: oauthResult.botUserId,
      authedUserId: oauthResult.authedUserId,
      webhookUrl: oauthResult.incomingWebhook?.url || null,
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'slack.connected',
    direction: 'outbound',
    status: 'success',
    payload: { teamId: oauthResult.teamId, teamName: oauthResult.teamName },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectSlack(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'slack');
  if (connection) {
    // Revoke token
    try {
      await fetch('https://slack.com/api/auth.revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${connection.accessToken}`,
        },
      });
    } catch {
      // Best effort revocation
    }

    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'slack.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'slack');
}

export async function updateSlackConfig(
  organizationId: string,
  updates: Partial<SlackConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'slack');
  if (!connection) throw new Error('Slack not connected');

  const currentConfig = connection.configuration as SlackConfig;
  const newConfig: SlackConfig = { ...currentConfig, ...updates };

  await upsertConnection(organizationId, 'slack', {
    configuration: newConfig,
  });
}

export async function updateSlackNotifications(
  organizationId: string,
  notifications: Partial<SlackNotificationConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'slack');
  if (!connection) throw new Error('Slack not connected');

  const currentConfig = connection.configuration as SlackConfig;
  const newConfig: SlackConfig = {
    ...currentConfig,
    notifications: { ...currentConfig.notifications, ...notifications },
  };

  await upsertConnection(organizationId, 'slack', {
    configuration: newConfig,
  });
}

export async function sendSlackNotification(
  organizationId: string,
  event: {
    type: string;
    taskTitle: string;
    taskKey: string;
    projectName: string;
    userName: string;
    url: string;
    channelId?: string;
  }
): Promise<void> {
  const connection = await getConnection(organizationId, 'slack');
  if (!connection || connection.status !== 'connected') return;

  const config = connection.configuration as SlackConfig;

  // Check if this notification type is enabled
  const notifKey = {
    'task.created': 'taskCreated',
    'task.completed': 'taskCompleted',
    'task.assigned': 'taskAssigned',
    'comment.added': 'commentAdded',
    'project.updated': 'projectUpdated',
  }[event.type] as keyof SlackNotificationConfig | undefined;

  if (notifKey && !config.notifications[notifKey]) return;

  const targetChannel = event.channelId || config.defaultChannelId;
  if (!targetChannel) return;

  const blocks = buildTaskNotificationBlocks(event);

  try {
    await sendSlackMessage(connection.accessToken, targetChannel, `${event.userName} ${event.type}: ${event.taskTitle}`, blocks);
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: `slack.notification.${event.type}`,
      direction: 'outbound',
      status: 'success',
      payload: { channel: targetChannel, taskKey: event.taskKey },
      response: null,
      error: null,
    });
  } catch (err) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: `slack.notification.${event.type}`,
      direction: 'outbound',
      status: 'failed',
      payload: { channel: targetChannel, taskKey: event.taskKey },
      response: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

export async function testSlackConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  const connection = await getConnection(organizationId, 'slack');
  if (!connection) return { success: false, error: 'Not connected' };

  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${connection.accessToken}` },
    });
    const data = await response.json();
    if (!data.ok) return { success: false, error: data.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
