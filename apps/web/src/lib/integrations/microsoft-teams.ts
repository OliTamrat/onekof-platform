import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { TeamsConfig, TeamsNotificationConfig } from './types';

const TEAMS_CLIENT_ID = (process.env.MICROSOFT_TEAMS_CLIENT_ID || '').trim();
const TEAMS_CLIENT_SECRET = (process.env.MICROSOFT_TEAMS_CLIENT_SECRET || '').trim();
const TEAMS_REDIRECT_URI = (process.env.MICROSOFT_TEAMS_REDIRECT_URI || `${(process.env.NEXTAUTH_URL || '').trim()}/api/integrations/microsoft-teams/callback`).trim();
const TEAMS_TENANT = (process.env.MICROSOFT_TEAMS_TENANT || 'common').trim();

const TEAMS_SCOPES = [
  'https://graph.microsoft.com/Team.ReadBasic.All',
  'https://graph.microsoft.com/Channel.ReadBasic.All',
  'https://graph.microsoft.com/ChannelMessage.Send',
  'https://graph.microsoft.com/User.Read',
  'offline_access',
].join(' ');

export function getTeamsOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: TEAMS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: TEAMS_REDIRECT_URI,
    scope: TEAMS_SCOPES,
    response_mode: 'query',
    state,
  });
  return `https://login.microsoftonline.com/${TEAMS_TENANT}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeTeamsCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const response = await fetch(`https://login.microsoftonline.com/${TEAMS_TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TEAMS_CLIENT_ID,
      client_secret: TEAMS_CLIENT_SECRET,
      code,
      redirect_uri: TEAMS_REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: TEAMS_SCOPES,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Teams OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in,
  };
}

export async function refreshTeamsToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const response = await fetch(`https://login.microsoftonline.com/${TEAMS_TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TEAMS_CLIENT_ID,
      client_secret: TEAMS_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: TEAMS_SCOPES,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Teams token refresh error: ${data.error}`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

async function getValidAccessToken(organizationId: string): Promise<string> {
  const connection = await getConnection(organizationId, 'microsoft-teams');
  if (!connection) throw new Error('Teams not connected');

  if (connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date()) {
    if (!connection.refreshToken) throw new Error('No refresh token — re-authorization required');

    const refreshed = await refreshTeamsToken(connection.refreshToken);
    await upsertConnection(organizationId, 'microsoft-teams', {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
    return refreshed.accessToken;
  }

  return connection.accessToken;
}

export async function fetchTeamsUser(accessToken: string): Promise<{
  id: string;
  displayName: string;
  mail: string;
}> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch Teams user');
  const data = await response.json();

  return {
    id: data.id,
    displayName: data.displayName,
    mail: data.mail || data.userPrincipalName,
  };
}

export async function fetchTeamsJoinedTeams(accessToken: string): Promise<Array<{ id: string; displayName: string }>> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch Teams');
  const data = await response.json();

  return (data.value || []).map((t: any) => ({
    id: t.id,
    displayName: t.displayName,
  }));
}

export async function fetchTeamsChannels(accessToken: string, teamId: string): Promise<Array<{ id: string; displayName: string }>> {
  const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch channels');
  const data = await response.json();

  return (data.value || []).map((ch: any) => ({
    id: ch.id,
    displayName: ch.displayName,
  }));
}

export async function sendTeamsMessage(
  accessToken: string,
  teamId: string,
  channelId: string,
  content: string
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        body: { contentType: 'html', content },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Teams message error: ${err.error?.message || 'Unknown error'}`);
  }
}

export async function connectTeams(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeTeamsCode(code);
  const user = await fetchTeamsUser(oauthResult.accessToken);

  let teams: Array<{ id: string; displayName: string }> = [];
  try {
    teams = await fetchTeamsJoinedTeams(oauthResult.accessToken);
  } catch {
    // Non-fatal
  }

  const firstTeam = teams[0];
  let channels: Array<{ id: string; displayName: string }> = [];
  if (firstTeam) {
    try {
      channels = await fetchTeamsChannels(oauthResult.accessToken, firstTeam.id);
    } catch {
      // Non-fatal
    }
  }

  const config: TeamsConfig = {
    tenantId: TEAMS_TENANT,
    teamId: firstTeam?.id || '',
    teamName: firstTeam?.displayName || '',
    defaultChannelId: channels[0]?.id || null,
    defaultChannelName: channels[0]?.displayName || null,
    channels: channels.map(ch => ({ ...ch })),
    notifications: {
      taskCreated: true,
      taskCompleted: true,
      taskAssigned: true,
      commentAdded: true,
      projectUpdated: true,
    },
  };

  const connection = await upsertConnection(organizationId, 'microsoft-teams', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: oauthResult.refreshToken,
    tokenExpiresAt: new Date(Date.now() + oauthResult.expiresIn * 1000),
    externalAccountId: user.id,
    externalAccountName: user.displayName,
    scopes: TEAMS_SCOPES.split(' '),
    metadata: {
      userId: user.id,
      displayName: user.displayName,
      mail: user.mail,
      teams: teams.slice(0, 10),
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'teams.connected',
    direction: 'outbound',
    status: 'success',
    payload: { displayName: user.displayName, teamCount: teams.length },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectTeams(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'microsoft-teams');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'teams.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'microsoft-teams');
}

export async function updateTeamsConfig(
  organizationId: string,
  updates: Partial<TeamsConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'microsoft-teams');
  if (!connection) throw new Error('Teams not connected');

  const currentConfig = connection.configuration as TeamsConfig;
  await upsertConnection(organizationId, 'microsoft-teams', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function updateTeamsNotifications(
  organizationId: string,
  notifications: Partial<TeamsNotificationConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'microsoft-teams');
  if (!connection) throw new Error('Teams not connected');

  const currentConfig = connection.configuration as TeamsConfig;
  await upsertConnection(organizationId, 'microsoft-teams', {
    configuration: {
      ...currentConfig,
      notifications: { ...currentConfig.notifications, ...notifications },
    },
  });
}

export async function sendTeamsNotification(
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
  const connection = await getConnection(organizationId, 'microsoft-teams');
  if (!connection || connection.status !== 'connected') return;

  const config = connection.configuration as TeamsConfig;

  const notifKey = {
    'task.created': 'taskCreated',
    'task.completed': 'taskCompleted',
    'task.assigned': 'taskAssigned',
    'comment.added': 'commentAdded',
    'project.updated': 'projectUpdated',
  }[event.type] as keyof TeamsNotificationConfig | undefined;

  if (notifKey && !config.notifications[notifKey]) return;

  const targetChannel = event.channelId || config.defaultChannelId;
  if (!targetChannel || !config.teamId) return;

  const emoji = {
    'task.created': '&#x2728;',
    'task.completed': '&#x2705;',
    'task.assigned': '&#x1F464;',
    'comment.added': '&#x1F4AC;',
    'project.updated': '&#x1F680;',
  }[event.type] || '&#x1F514;';

  const content = `${emoji} <b>${event.userName}</b> — <a href="${event.url}">${event.taskKey}: ${event.taskTitle}</a> (${event.projectName})`;

  try {
    const accessToken = await getValidAccessToken(organizationId);
    await sendTeamsMessage(accessToken, config.teamId, targetChannel, content);
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: `teams.notification.${event.type}`,
      direction: 'outbound',
      status: 'success',
      payload: { channel: targetChannel, taskKey: event.taskKey },
      response: null,
      error: null,
    });
  } catch (err) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: `teams.notification.${event.type}`,
      direction: 'outbound',
      status: 'failed',
      payload: { channel: targetChannel, taskKey: event.taskKey },
      response: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

export async function testTeamsConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(organizationId);
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
