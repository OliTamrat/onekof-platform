import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { GoogleCalendarConfig, GoogleCalendar } from './types';

// Reuse the same Google OAuth credentials
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const GOOGLE_CALENDAR_REDIRECT_URI = (process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${(process.env.NEXTAUTH_URL || '').trim()}/api/integrations/google-calendar/callback`).trim();

const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export function getGoogleCalendarOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALENDAR_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: GOOGLE_CALENDAR_REDIRECT_URI,
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
  };
}

async function refreshToken(refreshTokenStr: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshTokenStr,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Google token refresh error: ${data.error}`);
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

async function getValidAccessToken(organizationId: string): Promise<string> {
  const connection = await getConnection(organizationId, 'google-calendar');
  if (!connection) throw new Error('Google Calendar not connected');

  if (connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date()) {
    if (!connection.refreshToken) throw new Error('No refresh token — re-authorization required');

    const refreshed = await refreshToken(connection.refreshToken);
    await upsertConnection(organizationId, 'google-calendar', {
      accessToken: refreshed.accessToken,
      tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
    return refreshed.accessToken;
  }

  return connection.accessToken;
}

export async function fetchUserEmail(accessToken: string): Promise<{ email: string; name: string }> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  const data = await response.json();
  return { email: data.email, name: data.name };
}

export async function fetchCalendars(accessToken: string): Promise<GoogleCalendar[]> {
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

  const connection = await getConnection(organizationId, 'google-calendar');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'google-calendar.event_created',
      direction: 'outbound',
      status: 'success',
      payload: { calendarId, summary: event.summary, eventId: data.id },
      response: null,
      error: null,
    });
  }

  return { id: data.id, htmlLink: data.htmlLink };
}

export async function connectGoogleCalendar(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeGoogleCalendarCode(code);
  const userInfo = await fetchUserEmail(oauthResult.accessToken);

  let calendars: GoogleCalendar[] = [];
  try {
    calendars = await fetchCalendars(oauthResult.accessToken);
  } catch {
    // Non-fatal
  }

  const config: GoogleCalendarConfig = {
    email: userInfo.email,
    selectedCalendars: calendars.slice(0, 10),
    syncDirection: 'two_way',
    syncDeadlines: true,
    syncMilestones: true,
    defaultReminder: 30,
  };

  const connection = await upsertConnection(organizationId, 'google-calendar', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: oauthResult.refreshToken,
    tokenExpiresAt: new Date(Date.now() + oauthResult.expiresIn * 1000),
    externalAccountId: userInfo.email,
    externalAccountName: userInfo.name,
    scopes: GOOGLE_CALENDAR_SCOPES.split(' '),
    metadata: {
      email: userInfo.email,
      name: userInfo.name,
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'google-calendar.connected',
    direction: 'outbound',
    status: 'success',
    payload: { email: userInfo.email, calendarCount: calendars.length },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectGoogleCalendar(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'google-calendar');
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
      type: 'google-calendar.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'google-calendar');
}

export async function updateGoogleCalendarConfig(
  organizationId: string,
  updates: Partial<GoogleCalendarConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'google-calendar');
  if (!connection) throw new Error('Google Calendar not connected');

  const currentConfig = connection.configuration as GoogleCalendarConfig;
  await upsertConnection(organizationId, 'google-calendar', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function testGoogleCalendarConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(organizationId);
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
