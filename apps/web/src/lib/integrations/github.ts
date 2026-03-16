import { createHmac } from 'crypto';
import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { GitHubConfig, GitHubRepo } from './types';

const GITHUB_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET || '';
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

const GITHUB_SCOPES = 'repo,read:org,read:user';

export function getGitHubOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: GITHUB_SCOPES,
    state,
    allow_signup: 'false',
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGitHubCode(code: string): Promise<{
  accessToken: string;
  tokenType: string;
  scope: string;
}> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

export async function fetchGitHubUser(accessToken: string): Promise<{
  login: string;
  id: number;
  type: string;
  name: string | null;
  avatarUrl: string;
}> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch GitHub user');
  const data = await response.json();

  return {
    login: data.login,
    id: data.id,
    type: data.type,
    name: data.name,
    avatarUrl: data.avatar_url,
  };
}

export async function fetchGitHubRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (page <= 5) { // Max 500 repos
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) break;
    const data = await response.json();
    if (data.length === 0) break;

    repos.push(...data.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      name: r.name,
      private: r.private,
    })));

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

export async function createGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
): Promise<number> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['push', 'pull_request', 'issues', 'issue_comment'],
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
        insecure_ssl: '0',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`GitHub webhook creation failed: ${err.message}`);
  }

  const data = await response.json();
  return data.id;
}

export function verifyGitHubWebhookSignature(
  payload: string,
  signature: string,
  secret?: string
): boolean {
  const hmac = createHmac('sha256', secret || GITHUB_WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;
  return digest === signature;
}

export async function connectGitHub(
  organizationId: string,
  userId: string,
  code: string
) {
  const oauthResult = await exchangeGitHubCode(code);
  const user = await fetchGitHubUser(oauthResult.accessToken);

  let repos: GitHubRepo[] = [];
  try {
    repos = await fetchGitHubRepos(oauthResult.accessToken);
  } catch {
    // Non-fatal
  }

  const webhookSecret = createHmac('sha256', `${organizationId}-${Date.now()}`)
    .update(GITHUB_WEBHOOK_SECRET || 'onekof-github')
    .digest('hex')
    .slice(0, 32);

  const config: GitHubConfig = {
    installationId: null,
    accountLogin: user.login,
    accountType: user.type as 'User' | 'Organization',
    repositories: repos.slice(0, 50), // Store top 50
    webhookSecret,
    autoLinkPRs: true,
    autoCloseOnMerge: true,
    branchFormat: 'onekof/{task-key}',
  };

  const connection = await upsertConnection(organizationId, 'github', {
    status: 'connected',
    accessToken: oauthResult.accessToken,
    refreshToken: null,
    tokenExpiresAt: null,
    externalAccountId: String(user.id),
    externalAccountName: user.login,
    scopes: oauthResult.scope.split(','),
    metadata: {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      accountType: user.type,
    },
    configuration: config,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'github.connected',
    direction: 'outbound',
    status: 'success',
    payload: { login: user.login, repoCount: repos.length },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectGitHub(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'github');
  if (connection) {
    // Revoke token
    try {
      await fetch(`https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString('base64')}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: connection.accessToken }),
      });
    } catch {
      // Best effort
    }

    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'github.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'github');
}

export async function updateGitHubConfig(
  organizationId: string,
  updates: Partial<GitHubConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'github');
  if (!connection) throw new Error('GitHub not connected');

  const currentConfig = connection.configuration as GitHubConfig;
  await upsertConnection(organizationId, 'github', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function refreshGitHubRepos(organizationId: string): Promise<GitHubRepo[]> {
  const connection = await getConnection(organizationId, 'github');
  if (!connection) throw new Error('GitHub not connected');

  const repos = await fetchGitHubRepos(connection.accessToken);
  const currentConfig = connection.configuration as GitHubConfig;

  // Preserve project mappings
  const existingMappings = new Map(currentConfig.repositories.map(r => [r.id, r.projectId]));
  const updatedRepos = repos.slice(0, 50).map(r => ({
    ...r,
    projectId: existingMappings.get(r.id),
  }));

  await upsertConnection(organizationId, 'github', {
    configuration: { ...currentConfig, repositories: updatedRepos },
  });

  return updatedRepos;
}

export async function handleGitHubWebhook(
  organizationId: string,
  event: string,
  payload: Record<string, any>
): Promise<void> {
  const connection = await getConnection(organizationId, 'github');
  if (!connection) return;

  const config = connection.configuration as GitHubConfig;

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: `github.webhook.${event}`,
    direction: 'inbound',
    status: 'success',
    payload: {
      action: payload.action,
      repository: payload.repository?.full_name,
      sender: payload.sender?.login,
    },
    response: null,
    error: null,
  });

  // PR → Task linking
  if (event === 'pull_request' && config.autoLinkPRs) {
    const prTitle = payload.pull_request?.title || '';
    const prBody = payload.pull_request?.body || '';
    const taskKeyMatch = (prTitle + ' ' + prBody).match(/\b([A-Z]+-\d+)\b/);

    if (taskKeyMatch) {
      await logEvent(organizationId, {
        connectionId: connection.id,
        type: 'github.pr_linked',
        direction: 'inbound',
        status: 'success',
        payload: {
          taskKey: taskKeyMatch[1],
          prNumber: payload.pull_request?.number,
          prUrl: payload.pull_request?.html_url,
          action: payload.action,
        },
        response: null,
        error: null,
      });
    }

    // Auto-close task on PR merge
    if (payload.action === 'closed' && payload.pull_request?.merged && config.autoCloseOnMerge && taskKeyMatch) {
      await logEvent(organizationId, {
        connectionId: connection.id,
        type: 'github.task_auto_closed',
        direction: 'inbound',
        status: 'success',
        payload: {
          taskKey: taskKeyMatch[1],
          prNumber: payload.pull_request?.number,
          mergedBy: payload.pull_request?.merged_by?.login,
        },
        response: null,
        error: null,
      });
    }
  }
}

export async function testGitHubConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  const connection = await getConnection(organizationId, 'github');
  if (!connection) return { success: false, error: 'Not connected' };

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
