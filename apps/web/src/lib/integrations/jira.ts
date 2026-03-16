import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { JiraConfig, JiraProject } from './types';

const JIRA_CLIENT_ID = (process.env.JIRA_CLIENT_ID || '').trim();
const JIRA_CLIENT_SECRET = (process.env.JIRA_CLIENT_SECRET || '').trim();
const JIRA_REDIRECT_URI = (process.env.JIRA_REDIRECT_URI || `${(process.env.NEXTAUTH_URL || '').trim()}/api/integrations/jira/callback`).trim();

const JIRA_SCOPES = [
  'read:jira-work',
  'read:jira-user',
  'offline_access',
].join(' ');

export function getJiraOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: JIRA_CLIENT_ID,
    scope: JIRA_SCOPES,
    redirect_uri: JIRA_REDIRECT_URI,
    state,
    response_type: 'code',
    prompt: 'consent',
  });
  return `https://auth.atlassian.com/authorize?${params.toString()}`;
}

export async function exchangeJiraCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: JIRA_CLIENT_ID,
      client_secret: JIRA_CLIENT_SECRET,
      code,
      redirect_uri: JIRA_REDIRECT_URI,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Jira OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in,
  };
}

async function refreshJiraToken(refreshTokenStr: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
}> {
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: JIRA_CLIENT_ID,
      client_secret: JIRA_CLIENT_SECRET,
      refresh_token: refreshTokenStr,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Jira token refresh error: ${data.error}`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshTokenStr,
    expiresIn: data.expires_in,
  };
}

async function getValidAccessToken(organizationId: string): Promise<string> {
  const connection = await getConnection(organizationId, 'jira');
  if (!connection) throw new Error('Jira not connected');

  if (connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date()) {
    if (!connection.refreshToken) throw new Error('No refresh token — re-authorization required');

    const refreshed = await refreshJiraToken(connection.refreshToken);
    await upsertConnection(organizationId, 'jira', {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
    return refreshed.accessToken;
  }

  return connection.accessToken;
}

export async function fetchJiraAccessibleResources(accessToken: string): Promise<Array<{
  id: string;
  url: string;
  name: string;
}>> {
  const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch Jira sites');
  return response.json();
}

export async function fetchJiraProjects(accessToken: string, cloudId: string): Promise<JiraProject[]> {
  const response = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?maxResults=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch Jira projects');
  const data = await response.json();

  return (data.values || []).map((p: any) => ({
    id: p.id,
    key: p.key,
    name: p.name,
    imported: false,
  }));
}

export async function fetchJiraIssues(
  accessToken: string,
  cloudId: string,
  projectKey: string,
  startAt = 0,
  maxResults = 50
): Promise<{
  issues: Array<{
    key: string;
    summary: string;
    description: string | null;
    status: string;
    priority: string;
    assignee: string | null;
    reporter: string | null;
    issueType: string;
    created: string;
    updated: string;
    dueDate: string | null;
    labels: string[];
    parentKey: string | null;
  }>;
  total: number;
}> {
  const jql = encodeURIComponent(`project = ${projectKey} ORDER BY created ASC`);
  const response = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}&fields=summary,description,status,priority,assignee,reporter,issuetype,created,updated,duedate,labels,parent`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch Jira issues');
  const data = await response.json();

  return {
    issues: (data.issues || []).map((issue: any) => ({
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description ? JSON.stringify(issue.fields.description) : null,
      status: issue.fields.status?.name || 'Unknown',
      priority: issue.fields.priority?.name || 'Medium',
      assignee: issue.fields.assignee?.displayName || null,
      reporter: issue.fields.reporter?.displayName || null,
      issueType: issue.fields.issuetype?.name || 'Task',
      created: issue.fields.created,
      updated: issue.fields.updated,
      dueDate: issue.fields.duedate || null,
      labels: issue.fields.labels || [],
      parentKey: issue.fields.parent?.key || null,
    })),
    total: data.total,
  };
}

export async function connectJira(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeJiraCode(code);

  const resources = await fetchJiraAccessibleResources(oauthResult.accessToken);
  const site = resources[0];
  if (!site) throw new Error('No Jira sites accessible');

  let projects: JiraProject[] = [];
  try {
    projects = await fetchJiraProjects(oauthResult.accessToken, site.id);
  } catch {
    // Non-fatal
  }

  const config: JiraConfig = {
    siteUrl: site.url,
    email: '',
    projects,
    importStatus: 'idle',
    lastImportAt: null,
    statusMapping: {
      'To Do': 'todo',
      'In Progress': 'in_progress',
      'Done': 'done',
      'Backlog': 'backlog',
    },
    userMapping: {},
  };

  const connection = await upsertConnection(organizationId, 'jira', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: oauthResult.refreshToken,
    tokenExpiresAt: new Date(Date.now() + oauthResult.expiresIn * 1000),
    externalAccountId: site.id,
    externalAccountName: site.name,
    scopes: JIRA_SCOPES.split(' '),
    metadata: {
      cloudId: site.id,
      siteUrl: site.url,
      siteName: site.name,
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'jira.connected',
    direction: 'outbound',
    status: 'success',
    payload: { siteName: site.name, projectCount: projects.length },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectJira(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'jira');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'jira.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'jira');
}

export async function updateJiraConfig(
  organizationId: string,
  updates: Partial<JiraConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'jira');
  if (!connection) throw new Error('Jira not connected');

  const currentConfig = connection.configuration as JiraConfig;
  await upsertConnection(organizationId, 'jira', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function refreshJiraProjects(organizationId: string): Promise<JiraProject[]> {
  const connection = await getConnection(organizationId, 'jira');
  if (!connection) throw new Error('Jira not connected');

  const cloudId = connection.metadata.cloudId as string;
  const accessToken = await getValidAccessToken(organizationId);
  const projects = await fetchJiraProjects(accessToken, cloudId);

  const currentConfig = connection.configuration as JiraConfig;
  const existingImported = new Set(currentConfig.projects.filter(p => p.imported).map(p => p.id));

  const updatedProjects = projects.map(p => ({
    ...p,
    imported: existingImported.has(p.id),
  }));

  await upsertConnection(organizationId, 'jira', {
    configuration: { ...currentConfig, projects: updatedProjects },
  });

  return updatedProjects;
}

export async function testJiraConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(organizationId);
    const resources = await fetchJiraAccessibleResources(accessToken);
    if (resources.length === 0) return { success: false, error: 'No accessible Jira sites' };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
