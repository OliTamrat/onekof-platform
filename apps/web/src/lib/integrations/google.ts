import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { GoogleConfig, GoogleCalendar } from './types';

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const GOOGLE_REDIRECT_URI = (process.env.GOOGLE_INTEGRATION_REDIRECT_URI || `${(process.env.NEXTAUTH_URL || '').trim()}/api/integrations/google/callback`).trim();

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export function getGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  idToken?: string;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in,
    idToken: data.id_token,
  };
}

export async function refreshGoogleToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Google token refresh error: ${data.error}`);

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

async function getValidAccessToken(organizationId: string): Promise<string> {
  const connection = await getConnection(organizationId, 'google');
  if (!connection) throw new Error('Google not connected');

  if (connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date()) {
    if (!connection.refreshToken) throw new Error('No refresh token — re-authorization required');

    const refreshed = await refreshGoogleToken(connection.refreshToken);
    await upsertConnection(organizationId, 'google', {
      accessToken: refreshed.accessToken,
      tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
    return refreshed.accessToken;
  }

  return connection.accessToken;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  email: string;
  name: string;
  picture: string;
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch Google user info');
  const data = await response.json();

  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

export async function fetchGoogleCalendars(accessToken: string): Promise<GoogleCalendar[]> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch calendars');
  const data = await response.json();

  return (data.items || []).map((cal: any) => ({
    id: cal.id,
    summary: cal.summary || cal.id,
    primary: cal.primary || false,
  }));
}

export async function createCalendarEvent(
  organizationId: string,
  calendarId: string,
  event: {
    summary: string;
    description?: string;
    start: Date;
    end?: Date;
    attendees?: string[];
  }
): Promise<{ id: string; htmlLink: string }> {
  const accessToken = await getValidAccessToken(organizationId);

  const endDate = event.end || new Date(event.start.getTime() + 60 * 60 * 1000);

  const body: Record<string, unknown> = {
    summary: event.summary,
    description: event.description || '',
    start: { dateTime: event.start.toISOString(), timeZone: 'Africa/Addis_Ababa' },
    end: { dateTime: endDate.toISOString(), timeZone: 'Africa/Addis_Ababa' },
  };

  if (event.attendees?.length) {
    body.attendees = event.attendees.map(email => ({ email }));
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Calendar event creation failed: ${err.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  const connection = await getConnection(organizationId, 'google');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'google.calendar.event_created',
      direction: 'outbound',
      status: 'success',
      payload: { calendarId, summary: event.summary, eventId: data.id },
      response: null,
      error: null,
    });
  }

  return { id: data.id, htmlLink: data.htmlLink };
}

export async function syncTaskDeadlineToCalendar(
  organizationId: string,
  task: {
    title: string;
    key: string;
    description?: string;
    dueDate: Date;
    assigneeEmails?: string[];
    projectName: string;
  }
): Promise<{ id: string; htmlLink: string } | null> {
  const connection = await getConnection(organizationId, 'google');
  if (!connection || connection.status !== 'connected') return null;

  const config = connection.configuration as GoogleConfig;
  if (!config.calendarSync) return null;

  const targetCalendar = config.selectedCalendars.find(c => c.primary) || config.selectedCalendars[0];
  if (!targetCalendar) return null;

  return createCalendarEvent(organizationId, targetCalendar.id, {
    summary: `[${task.key}] ${task.title}`,
    description: `Project: ${task.projectName}\n${task.description || ''}\n\nManaged by Onekof`,
    start: task.dueDate,
    attendees: task.assigneeEmails,
  });
}

export async function uploadFileToDrive(
  organizationId: string,
  file: {
    name: string;
    mimeType: string;
    content: Buffer | string;
    folderId?: string;
  }
): Promise<{ id: string; webViewLink: string }> {
  const accessToken = await getValidAccessToken(organizationId);

  const metadata = JSON.stringify({
    name: file.name,
    mimeType: file.mimeType,
    ...(file.folderId ? { parents: [file.folderId] } : {}),
  });

  const boundary = 'onekof_multipart_boundary';
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    `Content-Type: ${file.mimeType}`,
    '',
    typeof file.content === 'string' ? file.content : file.content.toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Drive upload failed: ${err.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return { id: data.id, webViewLink: data.webViewLink };
}

export async function connectGoogle(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeGoogleCode(code);
  const userInfo = await fetchGoogleUserInfo(oauthResult.accessToken);

  let calendars: GoogleCalendar[] = [];
  try {
    calendars = await fetchGoogleCalendars(oauthResult.accessToken);
  } catch {
    // Non-fatal
  }

  const config: GoogleConfig = {
    email: userInfo.email,
    calendarSync: true,
    driveSync: true,
    selectedCalendars: calendars.slice(0, 10),
    syncDirection: 'two_way',
  };

  const connection = await upsertConnection(organizationId, 'google', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: oauthResult.refreshToken,
    tokenExpiresAt: new Date(Date.now() + oauthResult.expiresIn * 1000),
    externalAccountId: userInfo.email,
    externalAccountName: userInfo.name,
    scopes: GOOGLE_SCOPES.split(' '),
    metadata: {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'google.connected',
    direction: 'outbound',
    status: 'success',
    payload: { email: userInfo.email, calendarCount: calendars.length },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectGoogle(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'google');
  if (connection) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch {
      // Best effort
    }

    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'google.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'google');
}

export async function updateGoogleConfig(
  organizationId: string,
  updates: Partial<GoogleConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'google');
  if (!connection) throw new Error('Google not connected');

  const currentConfig = connection.configuration as GoogleConfig;
  await upsertConnection(organizationId, 'google', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function testGoogleConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(organizationId);
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
