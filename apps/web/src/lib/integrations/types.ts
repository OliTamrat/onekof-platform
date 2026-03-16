export type IntegrationProvider = 'slack' | 'github' | 'google';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface IntegrationConnection {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  externalAccountId: string | null;
  externalAccountName: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  configuration: IntegrationConfig;
  connectedBy: string;
  connectedAt: Date;
  updatedAt: Date;
}

export interface SlackConfig {
  teamId: string;
  teamName: string;
  defaultChannelId: string | null;
  defaultChannelName: string | null;
  channels: SlackChannel[];
  notifications: SlackNotificationConfig;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  projectId?: string;
}

export interface SlackNotificationConfig {
  taskCreated: boolean;
  taskCompleted: boolean;
  taskAssigned: boolean;
  commentAdded: boolean;
  projectUpdated: boolean;
  dailyDigest: boolean;
  digestTime: string; // HH:mm format
}

export interface GitHubConfig {
  installationId: number | null;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  repositories: GitHubRepo[];
  webhookSecret: string;
  autoLinkPRs: boolean;
  autoCloseOnMerge: boolean;
  branchFormat: string; // e.g., "onekof/{task-key}"
}

export interface GitHubRepo {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  projectId?: string;
}

export interface GoogleConfig {
  email: string;
  calendarSync: boolean;
  driveSync: boolean;
  selectedCalendars: GoogleCalendar[];
  syncDirection: 'one_way' | 'two_way';
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary: boolean;
  projectId?: string;
}

export type IntegrationConfig = SlackConfig | GitHubConfig | GoogleConfig;

export interface IntegrationEvent {
  id: string;
  connectionId: string;
  type: string;
  direction: 'inbound' | 'outbound';
  status: 'success' | 'failed' | 'pending';
  payload: Record<string, unknown>;
  response: Record<string, unknown> | null;
  error: string | null;
  createdAt: Date;
}

export interface OAuthState {
  organizationId: string;
  userId: string;
  provider: IntegrationProvider;
  redirectUrl: string;
  nonce: string;
}
